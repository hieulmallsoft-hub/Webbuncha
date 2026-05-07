import { useRef, useState } from "react";
import { sendChatMessage } from "../lib/api.js";

const initialMessages = [
  {
    role: "bot",
    text: "Chào bạn, mình có thể kiểm tra menu, giá món và giờ mở cửa cho bạn."
  }
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const toggleOpen = () => {
    setOpen((value) => {
      const next = !value;
      window.setTimeout(() => inputRef.current?.focus(), 0);
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) {
      return;
    }

    setMessages((current) => [...current, { role: "user", text }]);
    setInput("");
    setLoading(true);

    const response = await sendChatMessage(text);
    const reply = response.data?.data?.reply || response.data?.message || "Mình chưa trả lời được câu này. Bạn thử hỏi lại ngắn hơn nhé.";

    setMessages((current) => [...current, { role: "bot", text: reply }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[140] flex flex-col items-end gap-3">
      {open && (
        <section className="w-[min(360px,calc(100vw-2.5rem))] overflow-hidden rounded-lg border border-[#E8D8C8] bg-[#FFFDF8] shadow-2xl shadow-[#2D1A11]/25">
          <header className="flex items-center justify-between bg-[#2D1A11] px-4 py-3 text-[#FDF5E6]">
            <div>
              <h2 className="text-sm font-bold">Chat hỗ trợ</h2>
              <p className="text-[11px] text-[#FDF5E6]/65">Menu, giá món, giờ mở cửa, địa chỉ</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-md border border-white/15 text-lg leading-none transition hover:bg-white/10"
              aria-label="Đóng chat"
            >
              x
            </button>
          </header>

          <div className="flex max-h-[360px] min-h-[260px] flex-col gap-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[86%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "ml-auto bg-[#C84B31] text-white"
                    : "mr-auto bg-[#F3E7D8] text-[#3E2723]"
                }`}
              >
                {message.text}
              </div>
            ))}
            {loading && (
              <div className="mr-auto rounded-lg bg-[#F3E7D8] px-3 py-2 text-sm text-[#3E2723]/70">
                Đang kiểm tra...
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-[#E8D8C8] bg-white p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ví dụ: Còn bún chả không?"
              className="min-w-0 flex-1 rounded-md border border-[#E8D8C8] px-3 py-2 text-sm outline-none transition focus:border-[#C84B31]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-md bg-[#2D1A11] px-4 py-2 text-sm font-bold text-[#FDF5E6] transition hover:bg-[#C84B31] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Gửi
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={toggleOpen}
        className="flex h-14 items-center gap-2 rounded-full bg-[#C84B31] px-5 text-sm font-bold text-white shadow-xl shadow-[#2D1A11]/30 transition hover:bg-[#A03520]"
        aria-label="Mở chat hỗ trợ"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15">?</span>
        Chat
      </button>
    </div>
  );
}
