import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  Trash2,
  X,
  Maximize2,
  Minimize2,
  Plus,
  ShoppingBag,
  ChefHat,
  Clock,
  Coins,
  Store,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { notify } from '../../utils/alert';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  detectedDishes?: Product[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

const QUICK_PROMPTS = [
  { label: '🍲 Best-sellers & Favorites', prompt: 'What are the top bestsellers and crowd favorites at Lovely Eatery?' },
  { label: '💰 Combo Under ₱150', prompt: 'Can you recommend a delicious meal and drink combo under ₱150?' },
  { label: '⏱️ Quickest to Prepare', prompt: 'I am in a hurry, which meals take the shortest preparation time?' },
  { label: '🌿 Lighter or Veggie Options', prompt: 'What vegetable, lighter, or healthier dishes do you offer?' },
  { label: '📍 Hours & Ordering Info', prompt: 'What are Lovely Eatery opening hours, location in San Jose, and how does dine-in/delivery work?' },
];

export const AIChatStudioModal: React.FC<Props> = ({ isOpen, onClose, initialPrompt }) => {
  const { addToCart, formatPrice } = useCart();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load menu products for client-side quick "Add to Cart" recommendations
  useEffect(() => {
    async function fetchMenu() {
      try {
        const prods = await api.getMenu();
        setAllProducts(prods);
      } catch (err) {
        console.error('Failed to load menu for AI Studio', err);
      }
    }
    if (isOpen) {
      fetchMenu();
    }
  }, [isOpen]);

  // Handle initial prompt if passed
  useEffect(() => {
    if (isOpen && initialPrompt && messages.length === 0) {
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus textarea when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const detectDishesInText = (text: string): Product[] => {
    if (!allProducts.length) return [];
    const lower = text.toLowerCase();
    return allProducts
      .filter((p) => p.available && lower.includes(p.name.toLowerCase()))
      .slice(0, 3);
  };

  const handleSendMessage = async (promptToSend?: string) => {
    const text = (promptToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now() + '_user',
      role: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Pass previous turns for conversational continuity
      const history = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await api.askAI(text, history);
      const detected = detectDishesInText(res.reply);

      const aiMessage: ChatMessage = {
        id: 'msg_' + Date.now() + '_ai',
        role: 'model',
        text: res.reply,
        timestamp: new Date(),
        detectedDishes: detected.length > 0 ? detected : undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: 'msg_' + Date.now() + '_err',
        role: 'model',
        text: `Sorry, I ran into a hiccup answering that: ${(err as Error).message}. Please feel free to ask again or browse our menu tab!`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      notify.toast('Response copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      notify.error('Copy Failed', 'Could not access clipboard');
    }
  };

  const handleClearChat = async () => {
    if (messages.length === 0) return;
    const confirmed = await notify.confirm({
      title: 'Reset AI Conversation?',
      text: 'Are you sure you want to clear your chat history with Lovely AI?',
      confirmButtonText: 'Yes, clear chat',
      isDanger: false,
    });
    if (confirmed) {
      setMessages([]);
      notify.toast('Conversation reset', 'info');
    }
  };

  const handleQuickAdd = (product: Product) => {
    addToCart(product, 1);
    notify.toast(`Added ${product.name} to cart!`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="ai-chat-studio-wrapper"
        onClick={(e) => e.stopPropagation()}
        className={`w-full bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-200 border border-stone-200/80 ${
          isMaximized
            ? 'h-full max-w-full rounded-none sm:rounded-3xl'
            : 'max-w-2xl h-[88vh] max-h-[750px] rounded-3xl'
        }`}
      >
        {/* Header - Styled with gradient inspired by AI Chat Studio */}
        <header className="relative bg-gradient-to-r from-blue-700 via-sky-700 to-amber-600 text-white px-5 py-4 shrink-0 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-1.5">
                    AI Chat Studio
                  </h1>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
                    Gemini API
                  </span>
                </div>
                <p className="text-xs text-blue-100/90 font-medium">
                  Lovely Eatery Culinary Concierge & Recommendations
                </p>
              </div>
            </div>

            {/* Actions: Clear, Maximize, Close */}
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  id="clear-chat-btn"
                  onClick={handleClearChat}
                  className="p-2 rounded-xl text-blue-100 hover:text-white hover:bg-white/15 transition"
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                id="toggle-maximize-chat-btn"
                onClick={() => setIsMaximized(!isMaximized)}
                className="hidden sm:flex p-2 rounded-xl text-blue-100 hover:text-white hover:bg-white/15 transition"
                title={isMaximized ? 'Restore size' : 'Expand chat'}
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                id="close-ai-chat-btn"
                onClick={onClose}
                className="p-2 rounded-xl text-blue-100 hover:text-white hover:bg-white/15 transition"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Chat Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 bg-gradient-to-b from-stone-50/70 to-white">
          {messages.length === 0 ? (
            /* Welcome Message */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 space-y-4 my-auto">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shadow-sm animate-bounce-soft">
                <ChefHat className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h2 className="text-xl font-black text-stone-900 tracking-tight">
                  Welcome to Lovely AI Chat!
                </h2>
                <p className="text-sm text-stone-500 leading-relaxed">
                  I can suggest delicious meals from Lovely Eatery, craft budget combos, check
                  preparation times, or answer questions about our Antique kitchen.
                </p>
              </div>

              {/* Quick suggestion prompt chips */}
              <div className="w-full max-w-lg pt-2 space-y-2 text-left">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 text-center">
                  Quick Prompts to try:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {QUICK_PROMPTS.map((qp, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(qp.prompt)}
                      className="px-3.5 py-2 rounded-2xl bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-800 border border-stone-200 hover:border-amber-300 text-xs font-semibold shadow-2xs transition active:scale-95 text-left"
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Messages Area */
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* AI Avatar */}
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 sm:p-4 text-sm leading-relaxed shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-sky-700 text-white rounded-br-xs'
                        : 'bg-stone-100 text-stone-800 border border-stone-200/80 rounded-bl-xs'
                    }`}
                  >
                    {/* User Text */}
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                    ) : (
                      /* AI Markdown Output */
                      <div className="space-y-2">
                        <div className="markdown-body prose prose-sm max-w-none text-stone-800 leading-relaxed font-sans [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-2 [&>h3]:font-bold [&>h3]:text-stone-900 [&>h3]:mt-2 [&>h3]:mb-1 [&>strong]:text-stone-950 [&>strong]:font-bold [&>code]:bg-stone-200 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-xs">
                          <Markdown>{msg.text}</Markdown>
                        </div>

                        {/* Interactive Dish Cards (if AI mentions active dishes) */}
                        {msg.detectedDishes && msg.detectedDishes.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-stone-200/90 space-y-2">
                            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                              <Store className="w-3 h-3 text-amber-600" /> Mentioned in menu:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {msg.detectedDishes.map((p) => (
                                <div
                                  key={p.id}
                                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-stone-200 shadow-2xs"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-stone-900 truncate">
                                      {p.name}
                                    </p>
                                    <p className="text-[11px] font-semibold text-amber-700">
                                      {formatPrice(p.price)}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleQuickAdd(p)}
                                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs active:scale-95 shrink-0"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Add</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Footer Action: Copy Button */}
                        <div className="flex items-center justify-end pt-1">
                          <button
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-stone-400 hover:text-blue-600 transition px-2 py-1 rounded-md hover:bg-white/60"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-xs bg-stone-100 border border-stone-200/80 shadow-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 typing-dot-1" />
                    <span className="w-2 h-2 rounded-full bg-blue-600 typing-dot-2" />
                    <span className="w-2 h-2 rounded-full bg-blue-600 typing-dot-3" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Footer Form */}
        <footer className="p-3 sm:p-4 bg-white border-t border-stone-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                id="ai-chat-prompt-input"
                rows={1}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about Lovely Eatery..."
                className="flex-1 min-h-[44px] max-h-32 px-4 py-2.5 rounded-2xl border-2 border-stone-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 text-sm outline-none resize-none transition leading-relaxed"
                aria-label="Chat message input"
              />

              <button
                id="ai-chat-send-btn"
                type="submit"
                disabled={!inputPrompt.trim() || isLoading}
                className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-600 to-amber-600 hover:opacity-95 text-white flex items-center justify-center transition shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                title="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 ml-0.5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
              <span>Press <kbd className="font-mono bg-stone-100 px-1 py-0.5 rounded border border-stone-300 text-stone-600">Enter</kbd> to send, <kbd className="font-mono bg-stone-100 px-1 py-0.5 rounded border border-stone-300 text-stone-600">Shift + Enter</kbd> for new line</span>
              <span className="hidden sm:inline">Powered by Gemini 3.8 Flash</span>
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
};
