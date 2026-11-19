import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Loader2, MessageSquare, Send, X } from 'lucide-react';
import { UI_COPY } from '../data/translations';
import { useLanguage } from '../lib/i18n';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface ChatbotWidgetProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

export function ChatbotWidget({ isOpen, onToggle }: ChatbotWidgetProps) {
  const { lang } = useLanguage();
  const t = UI_COPY[lang].chatbot;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: t.greeting,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  // Keep the static opening greeting synced when user switches language before starting a thread
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'model') {
        return [{ role: 'model', text: UI_COPY[lang].chatbot.greeting }];
      }
      return prev;
    });
  }, [lang]);

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
          language: lang,
          messages: updatedHistory.filter((_, idx) => idx > 0), // Exclude initial static greeting so user starts turn 1 cleanly
        }),
      });

      const raw = await res.text();
      let data: { reply?: string; error?: string } = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(t.unexpectedError);
      }
      if (!res.ok || !data.reply) {
        throw new Error(data.error || t.requestFailed);
      }

      setMessages((prev) => [...prev, { role: 'model', text: data.reply as string }]);
    } catch (error: unknown) {
      const errText = error instanceof Error ? error.message : t.fallbackError;
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `${t.errorPrefix} ${errText}`,
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
          aria-label={t.openAria}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-zinc-900 dark:bg-blue-600 text-white text-xs font-semibold shadow-lg hover:bg-zinc-800 dark:hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t.openButton}</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-[390px] h-[520px] max-h-[82vh] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
            <div>
              <p className="font-display text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {t.title}
              </p>
              <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => onToggle(false)}
              aria-label={t.closeAria}
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
                  <span>{t.thinking}</span>
                </div>
              </div>
            )}
            <div ref={scrollEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {t.starters.map((q) => (
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
              placeholder={t.placeholder}
              className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label={t.sendAria}
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
