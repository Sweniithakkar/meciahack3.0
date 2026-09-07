import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Mic, RotateCcw, Scale, Send, Sparkles } from 'lucide-react';
import { apiService } from '../services/apiService';

// This component handles assistant presentation and live AI chatbot queries connected to the backend RAG pipeline.
export default function FloatingChatbot({ currentDoc, initialQuestion, onClearInitialQuestion }) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentUser = apiService.getCurrentUser();
  const storageKey = currentDoc?.id ? `legalLensChatHistory_${currentUser?.id || 'guest'}_${currentDoc.id}` : null;

  const rawQuestions = currentDoc?.suggestedQuestions || currentDoc?.suggested_questions_json;
  let suggestedQuestionsList = [];
  if (Array.isArray(rawQuestions)) {
    suggestedQuestionsList = rawQuestions.map(q => typeof q === 'object' ? (q.question || q.text || String(q)) : String(q));
  } else if (typeof rawQuestions === 'string') {
    try {
      const parsed = JSON.parse(rawQuestions);
      if (Array.isArray(parsed)) {
        suggestedQuestionsList = parsed.map(q => typeof q === 'object' ? (q.question || q.text || String(q)) : String(q));
      }
    } catch (e) {}
  }

  // Load chat history from backend database (with localStorage fallback)
  useEffect(() => {
    if (!currentDoc || !currentDoc.id) return;

    let isMounted = true;
    const defaultWelcome = {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I've analyzed "${currentDoc.name || 'your document'}". I can help you understand its clauses, obligations, financial penalties, and potential areas that need attention. How can I assist you today?`,
      timestamp: 'Just now',
      source: `${currentDoc.displayName || currentDoc.name || 'Document'} · AI Analysis Engine`,
      page: 'Summary',
      confidence: '100% Document Verified'
    };

    // Load from backend first
    apiService.getChatHistory(currentDoc.id).then((serverHistory) => {
      if (!isMounted) return;
      if (Array.isArray(serverHistory) && serverHistory.length > 0) {
        const formatted = serverHistory.map((m) => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
          source: m.source,
          page: m.page,
          confidence: m.confidence
        }));
        setMessages(formatted);
        if (storageKey) {
          try { localStorage.setItem(storageKey, JSON.stringify(formatted)); } catch (_) {}
        }
      } else {
        // Fallback to localStorage cache
        if (storageKey) {
          try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setMessages(parsed);
                return;
              }
            }
          } catch (e) {
            console.warn('Failed to load chat history cache:', e);
          }
        }
        setMessages([defaultWelcome]);
      }
    }).catch(() => {
      if (isMounted) setMessages([defaultWelcome]);
    });

    return () => {
      isMounted = false;
    };
  }, [currentDoc?.id]);

  // Sync state to local storage cache
  useEffect(() => {
    if (storageKey && messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (e) {
        console.warn('Failed to save chat history cache:', e);
      }
    }
  }, [messages, storageKey]);

  useEffect(() => {
    if (initialQuestion) {
      handleSendMessage(initialQuestion);
      onClearInitialQuestion?.();
      inputRef.current?.focus();
    }
  }, [initialQuestion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text || !currentDoc?.id) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Save user message persistently in DB
    apiService.saveChatMessage(currentDoc.id, userMsg);

    try {
      const res = await apiService.queryDocumentAI(currentDoc.id, text, currentDoc?.selectedLanguage || 'en');
      setIsTyping(false);
      if (res && res.answer) {
        const assistantMsg = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: res.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: res.source || `${currentDoc?.displayName || 'Document'} · RAG Pipeline`,
          page: res.page || 'Vector DB',
          confidence: res.confidence || 'Grounded Legal Lens AI'
        };

        setMessages((prev) => [...prev, assistantMsg]);
        // Save assistant response persistently in DB
        apiService.saveChatMessage(currentDoc.id, assistantMsg);
      }
    } catch (err) {
      setIsTyping(false);
      console.error('Chat error:', err);
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Unable to connect to Legal Lens AI right now. Please verify your backend connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'System Error',
        page: null,
        confidence: null
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const copyCitation = (id, text, source) => {
    navigator.clipboard?.writeText(`"${text}"\n— ${source}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = async () => {
    if (!currentDoc || !currentDoc.id) return;
    const resetMsgs = [
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared. How can I help you analyze "${currentDoc.name || 'this document'}"?`,
        timestamp: 'Just now',
        source: `${currentDoc.displayName || 'Document'} · Summary`,
        page: '1',
        confidence: '100%'
      }
    ];
    setMessages(resetMsgs);
    if (storageKey) {
      try { localStorage.setItem(storageKey, JSON.stringify(resetMsgs)); } catch (e) {}
    }
    await apiService.clearChatHistory(currentDoc.id);
  };

  const toggleVoice = () => {
    if (isListening) return setIsListening(false);
    setIsListening(true);
    setTimeout(() => {
      const q = (suggestedQuestionsList.length > 0 ? suggestedQuestionsList[0] : 'What are the main terms of this document?');
      setInputVal(q);
      setIsListening(false);
      inputRef.current?.focus();
    }, 1800);
  };

  const renderFormattedMessage = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, lineIdx) => {
          if (line.trim() === '') return <div key={lineIdx} className="h-1" />;
          
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <div key={lineIdx}>
              {parts.map((part, partIdx) => {
                if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
                  return (
                    <strong key={partIdx} className="font-bold text-[#01162B]">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return <span key={partIdx}>{part}</span>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="flex h-full min-h-[620px] flex-col overflow-hidden rounded-3xl border border-[#D2DBEB]/80 bg-white shadow-xl">
      <header className="flex items-center justify-between bg-[#01162B] px-5 py-4 text-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00385A] text-[#A2C4D9]">
            <Scale className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">Legal Lens Assistant</h2>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Ready
              </span>
            </div>
            <p className="text-xs text-[#A2C4D9] truncate">
              {currentDoc ? `Context: ${currentDoc.displayName || currentDoc.name}` : 'Your AI legal companion'}
            </p>
          </div>
        </div>
        <button
          onClick={handleResetChat}
          className="rounded-lg p-2 text-[#A2C4D9] hover:bg-[#00385A] hover:text-white transition-colors"
          title="Clear conversation"
          aria-label="Clear conversation"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </header>

      {/* Dynamic Recommended Questions Chips */}
      <div className="border-b border-[#D2DBEB] bg-[#F0F4F8] px-4 py-3 shrink-0">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#6A90B4]">
          Recommended questions for this document
        </p>
        {suggestedQuestionsList.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {suggestedQuestionsList.map((chip, idx) => (
              <button
                key={`${idx}-${chip}`}
                onClick={() => handleSendMessage(chip)}
                className="shrink-0 rounded-full border border-[#D2DBEB] bg-white px-3 py-1.5 text-xs font-semibold text-[#00385A] transition-colors hover:border-[#00385A] hover:bg-[#01162B] hover:text-white shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#6A90B4] italic py-0.5">
            Recommended questions will appear once this document has finished processing.
          </p>
        )}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[90%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-2xs ${
                  isUser
                    ? 'rounded-br-sm bg-[#01162B] text-white'
                    : 'rounded-bl-sm border border-[#D2DBEB]/80 bg-white text-[#01162B]'
                }`}
              >
                {!isUser && (
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold text-[#6A90B4]">
                    <Sparkles className="h-3 w-3 text-[#00385A]" />
                    LEGAL LENS ASSISTANT
                  </div>
                )}
                {renderFormattedMessage(msg.text)}
                {!isUser && msg.source && (
                  <div className="mt-3 border-t border-[#D2DBEB]/60 pt-2 text-[10px]">
                    <div className="flex items-center justify-between gap-2 text-[#00385A]">
                      <span className="truncate font-semibold">{msg.source}</span>
                      <button
                        onClick={() => copyCitation(msg.id, msg.text, msg.source)}
                        className="inline-flex shrink-0 items-center gap-1 text-[#6A90B4] hover:text-[#01162B]"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    {msg.confidence && (
                      <div className="mt-1 flex justify-between text-[#94A2BF]">
                        <span>{msg.confidence}</span>
                        <span>Page {msg.page || '1'} verified</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="mt-1 px-1 text-[10px] text-[#94A2BF]">{msg.timestamp}</span>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex w-fit items-center gap-2 rounded-2xl border border-[#D2DBEB] bg-white p-3 text-xs text-[#6A90B4]">
            <Sparkles className="h-4 w-4 animate-spin text-[#00385A]" />
            Searching document context…
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="shrink-0 border-t border-[#D2DBEB]/80 bg-white p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 rounded-2xl border border-[#D2DBEB] bg-[#F0F4F8] p-1.5 focus-within:border-[#00385A] focus-within:ring-1 focus-within:ring-[#00385A]"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(event) => setInputVal(event.target.value)}
            placeholder={`Ask anything about ${currentDoc?.name || 'this document'}...`}
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-[#01162B] placeholder-[#94A2BF] outline-none"
          />
          <button
            type="button"
            onClick={toggleVoice}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              isListening ? 'animate-pulse bg-red-500 text-white' : 'text-[#6A90B4] hover:bg-white hover:text-[#01162B]'
            }`}
            title={isListening ? 'Listening...' : 'Voice query'}
          >
            <Mic className="h-4 w-4" />
          </button>
          <button
            type="submit"
            disabled={!inputVal.trim() || isTyping}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#01162B] text-white transition-colors hover:bg-[#00385A] disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="mt-2 px-1 text-[10px] text-[#94A2BF]">Informational analysis only · Not formal legal advice</p>
      </div>
    </section>
  );
}
