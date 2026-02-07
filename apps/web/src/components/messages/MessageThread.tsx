"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Attachment = {
  url: string;
  contentType?: string | null;
  size?: number | null;
  name?: string | null;
};

const MAX_ATTACHMENT_FILES = 10;
const MAX_ATTACHMENT_BYTES = 50 * 1024 * 1024;

interface Message {
  id: string;
  body: string;
  attachments?: unknown;
  createdAt: string | Date;
  sender: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
}

function isAttachment(value: unknown): value is Attachment {
  return typeof value === "object" && value !== null && "url" in value;
}

interface MessageThreadProps {
  requestId: string;
  messages: Message[];
  currentUserId: string;
}

function formatMessageTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function MessageThread({ requestId, messages, currentUserId }: MessageThreadProps) {
  const router = useRouter();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const allMessages = [...messages, ...optimisticMessages];

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  // Clear optimistic messages once server messages catch up
  useEffect(() => {
    if (optimisticMessages.length > 0 && messages.length > 0) {
      const latestServerTime = new Date(messages[messages.length - 1].createdAt).getTime();
      setOptimisticMessages((prev) =>
        prev.filter((m) => new Date(m.createdAt).getTime() > latestServerTime)
      );
    }
  }, [messages, optimisticMessages.length]);

  const canSend = newMessage.trim().length > 0 || files.length > 0;

  const handlePickFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    if (picked.length === 0) return;
    setFiles((prev) => [...prev, ...picked].slice(0, MAX_ATTACHMENT_FILES));
    event.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  /** Upload a single file via the Edge upload endpoint (zero cold start) */
  const uploadOneFile = useCallback(async (file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/uploads/edge", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || `Upload failed (${res.status})`);
    }
    const data = await res.json();
    return {
      url: data.url,
      contentType: data.contentType ?? file.type ?? null,
      size: file.size,
      name: file.name,
    };
  }, []);

  const handleSend = async () => {
    if (!canSend) return;

    const messageBody = newMessage.trim();
    const filesToUpload = [...files];

    // Immediately clear inputs + show optimistic message
    setNewMessage("");
    setFiles([]);
    setIsSending(true);
    setError(null);

    // Show optimistic bubble right away (before upload finishes)
    const optimisticId = `optimistic-${Date.now()}`;
    if (messageBody) {
      setOptimisticMessages((prev) => [
        ...prev,
        {
          id: optimisticId,
          body: messageBody + (filesToUpload.length > 0 ? `\n\n📎 Uploading ${filesToUpload.length} file(s)…` : ""),
          createdAt: new Date().toISOString(),
          sender: { id: currentUserId, name: "You", email: null, role: "ADMIN" },
        },
      ]);
    }

    try {
      let attachments: Attachment[] = [];

      if (filesToUpload.length > 0) {
        const tooLarge = filesToUpload.filter((file) => file.size > MAX_ATTACHMENT_BYTES);
        if (tooLarge.length > 0) {
          throw new Error(`Each file must be under ${Math.round(MAX_ATTACHMENT_BYTES / (1024 * 1024))}MB.`);
        }

        setIsUploading(true);
        // Upload all files in parallel
        attachments = await Promise.all(filesToUpload.map(uploadOneFile));
      }

      const response = await fetch(`/api/requests/${requestId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: messageBody, attachments }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      // Remove optimistic message & refresh from server
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      router.refresh();
    } catch (err) {
      // Remove optimistic message on error so user can retry
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setNewMessage(messageBody);
      setFiles(filesToUpload);
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  const isAdmin = (role: string) => role === "ADMIN" || role === "OPS_STAFF";

  return (
    <div className="space-y-4">
      {/* Messages list */}
      {allMessages.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">
          No messages yet. Send a message to start the conversation.
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto" id="message-scroll-container">
          {allMessages.map((message) => {
            const isOwnMessage = message.sender.id === currentUserId;
            const senderIsAdmin = isAdmin(message.sender.role);
            const isOptimistic = message.id.startsWith("optimistic-");

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} ${isOptimistic ? "opacity-60" : ""}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? "bg-gray-900 text-white"
                      : senderIsAdmin
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-medium ${
                        isOwnMessage ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {isOwnMessage
                        ? "You"
                        : senderIsAdmin
                        ? "Hampstead Team"
                        : message.sender.name || message.sender.email}
                    </span>
                    <span
                      className={`text-xs ${
                        isOwnMessage ? "text-gray-400" : "text-gray-400"
                      }`}
                    >
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                  {message.body && (
                    <p
                      className={`text-sm whitespace-pre-wrap ${
                        isOwnMessage ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {message.body}
                    </p>
                  )}
                  {Array.isArray(message.attachments) && message.attachments.some(isAttachment) && (
                    <div className="mt-3 space-y-2">
                      {message.attachments.filter(isAttachment).map((attachment, index) => {
                        const contentType = attachment.contentType || "";
                        const isImage = contentType.startsWith("image/");
                        const isVideo = contentType.startsWith("video/");
                        const isPdf = contentType === "application/pdf" || (attachment.name || "").endsWith(".pdf");

                        return (
                          <div key={`${attachment.url}-${index}`}>
                            {isImage ? (
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noreferrer"
                                className="block"
                              >
                                <img
                                  src={attachment.url}
                                  alt={attachment.name || "Uploaded image"}
                                  className="max-h-64 max-w-full rounded border border-gray-200"
                                />
                              </a>
                            ) : isVideo ? (
                              <video
                                controls
                                className="max-h-64 w-full rounded border border-gray-200"
                              >
                                <source src={attachment.url} type={contentType || undefined} />
                                Your browser does not support the video tag.
                              </video>
                            ) : isPdf ? (
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                                  isOwnMessage
                                    ? "border-gray-600 text-gray-200 hover:bg-gray-800"
                                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                <span className="truncate">{attachment.name || "View PDF"}</span>
                              </a>
                            ) : (
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-blue-700 underline"
                              >
                                {attachment.name || "Download file"}
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Message input */}
      <div className="space-y-2">
        <Textarea
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          rows={3}
          disabled={isSending}
        />
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,application/pdf,.pdf"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />
          <Button variant="outline" size="sm" type="button" onClick={handlePickFiles}>
            Add file
          </Button>
          <span className="text-xs text-gray-500">
            Photos, videos or PDFs — up to 10 files
          </span>
        </div>
        {files.length > 0 && (
          <div className="space-y-1">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="text-xs text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end">
          <Button
            onClick={handleSend}
            disabled={isSending || isUploading || !canSend}
          >
            {isSending || isUploading ? "Sending..." : "Send message"}
          </Button>
        </div>
      </div>
    </div>
  );
}
