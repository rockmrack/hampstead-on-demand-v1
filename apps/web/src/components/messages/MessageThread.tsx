"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  body: string;
  createdAt: string | Date;
  sender: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
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
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/requests/${requestId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newMessage.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      setNewMessage("");
      router.refresh(); // Refresh to show new message
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
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
                  <p
                    className={`text-sm whitespace-pre-wrap ${
                      isOwnMessage ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {message.body}
                  </p>
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
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end">
          <Button
            onClick={handleSend}
            disabled={isSending || !newMessage.trim()}
          >
            {isSending ? "Sending..." : "Send message"}
          </Button>
        </div>
      </div>
    </div>
  );
}
