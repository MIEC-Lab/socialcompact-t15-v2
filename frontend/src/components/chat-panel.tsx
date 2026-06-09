/*
 * Authorship: Chenle Chen (D) owns live chat/log process visualization.
 * Scope: Displays process-level event content on the results page.
 */

export type ChatMessage = {
  from: string;
  to: string;
  message: string;
};

type ChatPanelProps = {
  chats: ChatMessage[];
  title?: string;
};

export function ChatPanel({ chats, title = "Chats" }: ChatPanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
          {chats.length}
        </span>
      </div>

      {chats.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
          No chat messages recorded.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {chats.map((chat, index) => (
            <article
              key={`${chat.from}-${chat.to}-${index}`}
              className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
            >
              <p className="text-sm font-semibold text-cyan-200">
                {chat.from}{" "}
                <span className="font-normal text-slate-400">to</span>{" "}
                {chat.to}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {chat.message}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ChatPanel;
