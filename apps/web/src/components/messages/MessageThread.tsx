"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleSend = async () => {
    if (!canSend) return;

    setIsSending(true);
    setError(null);

    try {
      let attachments: Attachment[] = [];

      if (files.length > 0) {
        const tooLarge = files.filter((file) => file.size > MAX_ATTACHMENT_BYTES);
        if (tooLarge.length > 0) {
          throw new Error(`Each file must be under ${Math.round(MAX_ATTACHMENT_BYTES / (1024 * 1024))}MB.`);
        }

        setIsUploading(true);
        attachments = await Promise.all(
          files.map(async (file) => {
            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
            const pathname = `messages/${requestId}/${timestamp}-${safeName}`;
            const blob = await upload(pathname, file, {
              access: "public",
              handleUploadUrl: "/api/uploads",
            });

            return {
              url: blob.url,
              contentType: blob.contentType ?? null,
              size: file.size,
              name: file.name,
            } satisfies Attachment;
          })
        );
      }

      const response = await fetch(`/api/requests/${requestId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: newMessage.trim(),
          attachments,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      setNewMessage("");
      setFiles([]);
      router.refresh();
    } catch (err) {
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
      {messages.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">
          No messages yet. Send a message to start the conversation.
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((message) => {
            const isOwnMessage = message.sender.id === currentUserId;
            const senderIsAdmin = isAdmin(message.sender.role);

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
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
            accept="image/*,video/*"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />
          <Button variant="outline" size="sm" type="button" onClick={handlePickFiles}>
            Add photo or video
          </Button>
          <span className="text-xs text-gray-500">
            Up to 10 files
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
