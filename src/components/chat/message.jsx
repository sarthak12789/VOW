import React, { useEffect, useRef, useState } from "react";
import MessageReactions from "./rection.jsx";

const MessageList = ({ messages, username, currentUserId, onDeleteMessage }) => {
  const bottomRef = useRef(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [menuState, setMenuState] = useState({ open: false, x: 0, y: 0, messageId: null });

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addReaction = (msgIndex, emoji) => {
    setMessageReactions((prev) => {
      const reactions = prev[msgIndex] || [];
      const existing = reactions.find((r) => r.emoji === emoji);
      const updated = existing
        ? reactions.map((r) =>
            r.emoji === emoji ? { ...r, count: r.count + 1 } : r
          )
        : [...reactions, { emoji, count: 1 }];
      return { ...prev, [msgIndex]: updated };
    });
  };

  const handleReactionClick = (msgIndex, emoji) => {
    setMessageReactions((prev) => {
      const reactions = prev[msgIndex] || [];
      const updated = reactions
        .map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1 } : r))
        .filter((r) => r.count > 0);
      return { ...prev, [msgIndex]: updated };
    });
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-6 p-4">
      {messages.map((msg, index) => {
        const isSentByUser = msg.sender === username;
        const reactions = messageReactions[index] || [];
        const allowDelete = currentUserId && (msg.sender?._id === currentUserId);

        return (
         <div
           key={msg._id || index}
           className="flex w-full group relative"
           onContextMenu={(e) => {
             e.preventDefault();
             if (!allowDelete || !msg._id) return; // Only show for own messages with id
             // Position menu within viewport
             const rect = e.currentTarget.getBoundingClientRect();
             const x = e.clientX - rect.left;
             const y = e.clientY - rect.top;
             setMenuState({ open: true, x, y, messageId: msg._id });
           }}
         >
  <div
    className={`flex items-start space-x-3 w-full ${
      isSentByUser ? "flex-row space-x-reverse" : ""
    }`}
  >
    {/* Avatar */}
    <div className="relative w-10 h-10 shrink-0">
      <img
  src={msg.sender?.avatar || "https://api.dicebear.com/9.x/adventurer/svg?seed=Default"}
  alt="avatar"
  className="w-10 h-10 rounded-full object-cover"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = "https://api.dicebear.com/9.x/adventurer/svg?seed=Default";
  }}
/>
    </div>

  {/* Message Bubble + Reactions */}
  <div className="flex flex-col space-y-2 w-full relative min-w-0">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-semibold text-[#0E1219]">
          {typeof msg.sender === "string"
            ? msg.sender
            : msg.sender?.username || "Fullname"}
        </p>
        <span className="text-xs text-gray-500">
          {msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Invalid Date"}
        </span>
      </div>

      <MessageReactions
        msgIndex={index}
        reactions={reactions}
        onAddReaction={addReaction}
        onRemoveReaction={handleReactionClick}
      >
        {msg.content && (
          <div>
            <p className="text-sm max-w-full text-[#333] leading-relaxed whitespace-pre-wrap" style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}>
              {msg.content}
            </p>
          </div>
        )}
        {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            {msg.attachments.map((att) => {
              const isImage = att.mimeType && att.mimeType.startsWith("image/");
              return (
                <div
                  key={att.fileId || att.url}
                  className="group border border-[#BFA2E1] rounded-md p-2 bg-[#EFE7F6] max-w-xs"
                >
                  {isImage && att.url ? (
                    <img
                      src={att.url}
                      alt={att.name}
                      className="rounded max-h-48 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center text-xs bg-[#5C0EA4] text-white rounded">
                        {att.name?.split('.').pop()?.slice(0,4)?.toUpperCase() || 'FILE'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium truncate" title={att.name}>{att.name}</p>
                        {att.size && (
                          <p className="text-[10px] text-[#707070]">{(att.size/1024).toFixed(1)} KB</p>
                        )}
                      </div>
                    </div>
                  )}
                  {att.url && (
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-[11px] text-[#5C0EA4] underline hover:opacity-80"
                    >
                      Open
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </MessageReactions>
      {menuState.open && menuState.messageId === (msg._id) && (
        <div
          className="absolute z-20 bg-white border border-[#D1D5DB] rounded-md shadow-md text-sm min-w-[110px]"
          style={{ top: menuState.y, left: menuState.x }}
        >
          <button
            type="button"
            className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600"
            onClick={() => {
              const id = menuState.messageId;
              setMenuState(s => ({ ...s, open: false }));
              if (onDeleteMessage && id) onDeleteMessage(id);
            }}
          >Delete</button>
          <button
            type="button"
            className="w-full text-left px-3 py-2 hover:bg-gray-50"
            onClick={() => setMenuState(s => ({ ...s, open: false }))}
          >Cancel</button>
        </div>
      )}
    </div>
  </div>
</div>
        );
      })}

      <div ref={bottomRef} />
      {menuState.open && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setMenuState(s => ({ ...s, open: false }))}
        />
      )}
    </div>
  );
};

export default MessageList;
