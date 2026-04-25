

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../main.css";

const MAX_MESSAGE_LENGTH = 4000;

const promptSuggestions = [
  {
    label: "Make study plan",
    text: "Create a 7-day study plan for my upcoming exam."
  },
  {
    label: "Explain topic",
    text: "Explain this topic in simple exam-friendly language: "
  },
  {
    label: "Practice questions",
    text: "Give me 10 practice questions with answers for: "
  },
  {
    label: "Revision strategy",
    text: "Help me revise faster. I have limited time before my exam."
  }
];

const normalizeChat = (chat = {}) => ({
  _id: chat._id,
  title: chat.title || "New Chat",
  messages: Array.isArray(chat.messages) ? chat.messages : [],
  messageCount: chat.messageCount ?? chat.messages?.length ?? 0,
  preview: chat.preview || "",
  lastMessageAt: chat.lastMessageAt || null,
  createdAt: chat.createdAt || null,
  updatedAt: chat.updatedAt || null
});

const getTimeValue = (chat) => {
  return new Date(
    chat.lastMessageAt || chat.updatedAt || chat.createdAt || 0
  ).getTime();
};

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getPreview = (session) => {
  if (session.preview) return session.preview;

  const lastMessage = [...(session.messages || [])].reverse().find(Boolean);

  if (!lastMessage?.content) return "No messages yet";

  const clean = lastMessage.content.replace(/\s+/g, " ").trim();

  return clean.length > 56 ? `${clean.slice(0, 56)}...` : clean;
};

const buildExportText = (session) => {
  const lines = [
    session.title || "AI Exam Mentor Chat",
    `Exported: ${new Date().toLocaleString()}`,
    ""
  ];

  (session.messages || []).forEach((item) => {
    const speaker = item.role === "user" ? "You" : "AI";
    lines.push(`${speaker}: ${item.content}`);
    lines.push("");
  });

  return lines.join("\n");
};

const downloadTextFile = (filename, content) => {
  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

function ChatBot() {
  const navigate = useNavigate();
  const endRef = useRef(null);

  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");

  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);

  const replaceSession = useCallback((nextChat) => {
    const normalized = normalizeChat(nextChat);

    setSessions((prev) => {
      const exists = prev.some((chat) => chat._id === normalized._id);
      const updated = exists
        ? prev.map((chat) => (chat._id === normalized._id ? normalized : chat))
        : [normalized, ...prev];

      return updated.sort((a, b) => getTimeValue(b) - getTimeValue(a));
    });

    return normalized;
  }, []);

  const loadChats = useCallback(async () => {
    try {
      setPageLoading(true);
      setError("");

      const res = await api.get("/chat");

      if (res.data.success) {
        const chats = (res.data.chats || []).map(normalizeChat);

        setSessions(chats);
        setActive((prev) =>
          prev && chats.some((chat) => chat._id === prev)
            ? prev
            : chats[0]?._id || null
        );
      }
    } catch (err) {
      console.error("Load chat error:", err);
      setError(err.response?.data?.message || "Failed to load chats");
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, active, loading]);

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return sessions;

    return sessions.filter((session) => {
      const title = String(session.title || "").toLowerCase();
      const preview = getPreview(session).toLowerCase();

      return title.includes(query) || preview.includes(query);
    });
  }, [sessions, search]);

  const currentSession = useMemo(() => {
    return sessions.find((session) => session._id === active) || null;
  }, [sessions, active]);

  const currentChat = currentSession?.messages || [];

  const createChat = async () => {
    const res = await api.post("/chat/new", {});

    if (!res.data.success) {
      throw new Error("Failed to create chat");
    }

    const newSession = replaceSession(res.data.chat);
    setActive(newSession._id);

    return newSession;
  };

  const newChat = async () => {
    try {
      setError("");
      await createChat();
    } catch (err) {
      console.error("New chat error:", err);
      setError(err.response?.data?.message || "Failed to create chat");
    }
  };

  const deleteChat = async (id) => {
    if (!id) return;

    const shouldDelete = window.confirm("Delete this chat?");

    if (!shouldDelete) return;

    try {
      setActionLoading(id);
      setError("");

      await api.delete(`/chat/${id}`);

      setSessions((prev) => {
        const updated = prev.filter((chat) => chat._id !== id);

        if (active === id) {
          setActive(updated[0]?._id || null);
        }

        return updated;
      });
    } catch (err) {
      console.error("Delete chat error:", err);
      setError(err.response?.data?.message || "Delete failed");
    } finally {
      setActionLoading("");
    }
  };

  const renameChat = async (session) => {
    const nextTitle = window.prompt("Rename chat", session.title || "New Chat");

    if (nextTitle === null) return;

    const title = nextTitle.trim();

    if (!title) return;

    try {
      setActionLoading(session._id);
      setError("");

      const res = await api.patch(`/chat/${session._id}/title`, {
        title
      });

      if (res.data.success) {
        replaceSession(res.data.chat);
      }
    } catch (err) {
      console.error("Rename chat error:", err);
      setError(err.response?.data?.message || "Rename failed");
    } finally {
      setActionLoading("");
    }
  };

  const clearChatMessages = async (session) => {
    if (!session?._id) return;

    const shouldClear = window.confirm("Clear all messages in this chat?");

    if (!shouldClear) return;

    try {
      setActionLoading(session._id);
      setError("");

      const res = await api.delete(`/chat/${session._id}/messages`);

      if (res.data.success) {
        replaceSession(res.data.chat);
      }
    } catch (err) {
      console.error("Clear chat error:", err);
      setError(err.response?.data?.message || "Clear failed");
    } finally {
      setActionLoading("");
    }
  };

  const copyText = async (text, id = "chat") => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);

      setTimeout(() => {
        setCopiedId("");
      }, 1600);
    } catch {
      setError("Could not copy text.");
    }
  };

  const copyCurrentChat = () => {
    if (!currentSession) return;
    copyText(buildExportText(currentSession), "full-chat");
  };

  const exportCurrentChat = () => {
    if (!currentSession) return;

    const safeTitle = (currentSession.title || "chat")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();

    downloadTextFile(
      `${safeTitle || "ai-mentor-chat"}.txt`,
      buildExportText(currentSession)
    );
  };

  const sendMessage = async () => {
    const currentMessage = message.trim();

    if (!currentMessage || loading) return;

    setLoading(true);
    setMessage("");
    setError("");

    let chatId = active;
    const now = new Date().toISOString();
    const tempId = `temp_${Date.now()}`;

    try {
      if (!chatId) {
        const newSession = await createChat();
        chatId = newSession._id;
      }

      const userMsg = {
        _id: tempId,
        role: "user",
        content: currentMessage,
        createdAt: now,
        pending: true
      };

      setSessions((prev) =>
        prev.map((session) =>
          session._id === chatId
            ? {
                ...session,
                messages: [...(session.messages || []), userMsg],
                updatedAt: now,
                lastMessageAt: now
              }
            : session
        )
      );

      const res = await api.post("/chat/message", {
        chatId,
        message: currentMessage
      });

      if (res.data.success && res.data.chat) {
        replaceSession(res.data.chat);
      }

      setActive(chatId);
    } catch (err) {
      console.error("Chat error:", err);

      const errorMsg = {
        _id: `error_${Date.now()}`,
        role: "ai",
        content: err.response?.data?.message || "Server error. Please try again.",
        createdAt: new Date().toISOString(),
        isError: true
      };

      if (chatId) {
        setSessions((prev) =>
          prev.map((session) =>
            session._id === chatId
              ? {
                  ...session,
                  messages: [...(session.messages || []), errorMsg],
                  updatedAt: new Date().toISOString()
                }
              : session
          )
        );
      } else {
        setError(errorMsg.content);
      }
    } finally {
      setLoading(false);
    }
  };

  const showSuggestions = !error && currentChat.length === 0 && !loading;

  return (
    <div className="cb-app">
      <aside className="cb-side">
        <div className="cb-side-head">
          <h3>AI Mentor</h3>
          <small>{sessions.length} chats</small>
        </div>

        <button
          className="cb-new"
          onClick={newChat}
          disabled={loading || Boolean(actionLoading)}
        >
          + New Chat
        </button>

        <input
          className="cb-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chats..."
        />

        <div className="cb-history">
          {pageLoading && (
            <p className="cb-empty">
              Loading chats...
            </p>
          )}

          {!pageLoading && sessions.length === 0 && (
            <p className="cb-empty">
              No chats yet
            </p>
          )}

          {!pageLoading && sessions.length > 0 && filteredSessions.length === 0 && (
            <p className="cb-empty">
              No matching chats
            </p>
          )}

          {filteredSessions.map((session) => (
            <div
              key={session._id}
              className={active === session._id ? "cb-item active" : "cb-item"}
              onClick={() => setActive(session._id)}
            >
              <button
                type="button"
                className="cb-item-main"
              >
                <span>{session.title || "New Chat"}</span>
                <small>{getPreview(session)}</small>
                <em>{formatTime(session.lastMessageAt || session.updatedAt)}</em>
              </button>

              <div className="cb-item-actions">
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    renameChat(session);
                  }}
                  title="Rename chat"
                  type="button"
                  disabled={actionLoading === session._id}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(session._id);
                  }}
                  title="Delete chat"
                  type="button"
                  disabled={actionLoading === session._id}
                >
                  X
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="cb-main">
        <header className="cb-top">
          <div className="cb-brand-block">
            <span>AI Exam Mentor</span>
            <small>Study help, planning, revision, and practice</small>
          </div>

          <div className="cb-top-actions">
            <button
              type="button"
              onClick={copyCurrentChat}
              disabled={!currentSession || currentChat.length === 0}
            >
              {copiedId === "full-chat" ? "Copied" : "Copy Chat"}
            </button>

            <button
              type="button"
              onClick={exportCurrentChat}
              disabled={!currentSession || currentChat.length === 0}
            >
              Export
            </button>

            <button
              type="button"
              onClick={() => clearChatMessages(currentSession)}
              disabled={!currentSession || currentChat.length === 0 || Boolean(actionLoading)}
            >
              Clear
            </button>

            <button onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
          </div>
        </header>

        <section className="cb-body">
          {error && (
            <div className="cb-welcome cb-error-box">
              <h2>Something went wrong</h2>
              <p>{error}</p>
            </div>
          )}

          {!error && active === null && (
            <div className="cb-welcome">
              <h2>Start New Chat</h2>
              <p>Type a question below or choose a starter.</p>
            </div>
          )}

          {showSuggestions && (
            <div className="cb-prompt-grid">
              {promptSuggestions.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="cb-prompt-chip"
                  onClick={() => setMessage(item.text)}
                  disabled={loading}
                >
                  <strong>{item.label}</strong>
                  <span>{item.text}</span>
                </button>
              ))}
            </div>
          )}

          {currentChat.map((chat, index) => {
            const messageId = chat._id || `${chat.role}-${index}`;

            return (
              <div
                key={messageId}
                className={chat.role === "user" ? "cb-row user" : "cb-row bot"}
              >
                <div className="cb-avatar">
                  {chat.role === "user" ? "You" : "AI"}
                </div>

                <div className={chat.isError ? "cb-bubble error" : "cb-bubble"}>
                  <div className="cb-bubble-text">
                    {chat.content}
                  </div>

                  <div className="cb-message-meta">
                    <span>{formatTime(chat.createdAt)}</span>

                    <button
                      type="button"
                      className="cb-copy-btn"
                      onClick={() => copyText(chat.content, messageId)}
                    >
                      {copiedId === messageId ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="cb-row bot">
              <div className="cb-avatar">AI</div>

              <div className="cb-bubble typing">
                Thinking...
              </div>
            </div>
          )}

          <div ref={endRef}></div>
        </section>

        <footer className="cb-bottom">
          <div className="cb-input-wrap">
            <textarea
              className="cb-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about your exam, topic, study plan, revision..."
              disabled={loading}
              maxLength={MAX_MESSAGE_LENGTH}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <div className="cb-input-meta">
              <span>Enter to send, Shift + Enter for new line</span>
              <span>{message.length}/{MAX_MESSAGE_LENGTH}</span>
            </div>
          </div>

          <button
            className="cb-send"
            onClick={sendMessage}
            disabled={loading || !message.trim()}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </footer>
      </main>
    </div>
  );
}

export default ChatBot;
