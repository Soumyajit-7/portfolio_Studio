import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Loader2, MessageSquare, Send, X } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface ChatbotWidgetProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

const STARTER_PROMPTS = [
  'How did Choreos Labs start?',
  'What happened at the IISCO steel plant?',
  'Is he free in Trier from Nov 2026?',
];

export function ChatbotWidget({ isOpen, onToggle }: ChatbotWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Hey — I'm Soumyajit's AI stand-in. While he's either debugging Docker, chasing mountain trails, or running track intervals, ask me anything about Choreos Labs, his computer vision work, M.Sc. at Universität Trier, or booking a project.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const updatedHistory: ChatMessage[] = [...messages, { role: 'user', text: trimmed }];
    setMessages(updatedHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.filter((_, idx) => idx > 0), // Exclude initial static greeting so user starts turn 1 cleanly
        }),
      });

      const raw = await res.text();
      let data: { reply?: string; error?: string } = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error('Server returned an unexpected response.');
      }
      if (!res.ok || !data.reply) {
        throw new Error(data.error || 'Chat request failed.');
      }

      setMessages((prev) => [...prev, { role: 'model', text: data.reply as string }]);
    } catch (error: unknown) {
      const errText =
        error instanceof Error ? error.message : 'Unable to reach Soumyajit AI stand-in.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `My neural wires crossed for a second: ${errText}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => onToggle(true)}
          aria-label="Open Soumyajit AI Stand-In"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-zinc-900 dark:bg-blue-600 text-white text-xs font-semibold shadow-lg hover:bg-zinc-800 dark:hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask Soumyajit’s AI</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-[390px] h-[520px] max-h-[82vh] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
            <div>
              <p className="font-display text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Soumyajit’s AI Stand-In
              </p>
              <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                Choreos Labs · Applied AI · Trier Availability
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggle(false)}
              aria-label="Close chat"
              className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl px-3.5 py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 inline-flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={scrollEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {STARTER_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void sendMessage(q)}
                  className="text-[11px] px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-blue-500 cursor-pointer text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Choreos Labs, projects, or Trier..."
              className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
