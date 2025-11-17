// src/pages/Messages.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Messages() {
  const { sellerId } = useParams(); // should be a user id from the URL
  const { user } = useAuth();       // { id, name, ... } from your AuthProvider
  const location = useLocation();

  // Optional: seller name passed via link state, e.g. Link to={`/messages/${seller.id}`} state={{ sellerName: seller.name }}
  const sellerName = location.state?.sellerName || "Seller";

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  // Load conversation from backend when page opens or sellerId changes
  useEffect(() => {
    async function loadThread() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `http://localhost:4000/api/messages/thread/${sellerId}`,
          {
            credentials: "include", // important for session cookies
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to load messages (${res.status})`);
        }

        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load messages");
      } finally {
        setLoading(false);
      }
    }

    if (sellerId) {
      loadThread();
    }
  }, [sellerId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const t = text.trim();
    if (!t || !user) return;

    try {
      setError("");

      const res = await fetch("http://localhost:4000/api/messages/send", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiver_id: Number(sellerId),
          listing_id: null,           // Or pass a real listing_id if you have it
          message_text: t,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to send message (${res.status})`);
      }

      const result = await res.json();

      // Optimistically add message to UI
      setMessages((prev) => [
        ...prev,
        {
          id: result.id,
          sender_id: user.id,
          receiver_id: Number(sellerId),
          listing_id: null,
          message_text: t,
          sent_at: new Date().toISOString(),
        },
      ]);

      setText("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send message");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/reviews"
              className="rounded-md border px-2 py-1 text-sm hover:bg-zinc-50"
            >
              ← Back
            </Link>
            <h1 className="text-lg font-bold">Chat with {sellerName}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-4">
        <div className="h-[65vh] overflow-y-auto rounded-2xl border bg-zinc-50 p-4">
          {loading && <div className="text-sm text-zinc-500">Loading messages…</div>}
          {error && !loading && (
            <div className="mb-2 text-sm text-red-600">{error}</div>
          )}

          {!loading &&
            messages.map((m) => {
              const mine = m.sender_id === user?.id;
              return (
                <div
                  key={m.id}
                  className={`mb-2 flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm
                    ${mine ? "bg-yellow-400 text-zinc-900" : "bg-white border"}`}
                  >
                    {m.message_text}
                    <div className="mt-1 text-[10px] text-zinc-500">
                      {new Date(m.sent_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

          <div ref={bottomRef} />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            className="flex-1 h-11 rounded-xl border px-3 outline-none"
          />
          <button
            onClick={send}
            className="h-11 rounded-xl bg-yellow-400 px-5 font-semibold text-zinc-900 hover:bg-yellow-500"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
