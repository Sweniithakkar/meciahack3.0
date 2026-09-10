import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Mic, RotateCcw, Scale, Send, Sparkles, FileText, ChevronRight, X } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function FloatingChatbot({ currentDoc, initialQuestion, onClearInitialQuestion, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

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

  // Load chat history from backend database
  useEffect(() => {
    if (!currentDoc || !currentDoc.id) return;

    let isMounted = true;
    const defaultWelcome = {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm your Legal Lens Assistant. I've analyzed "${currentDoc.name || 'your document'}". I can answer your questions, explain obligations, and clarify any legal terms with direct source citations.`,
      timestamp: 'Just now',
      source: `${currentDoc.displayName || currentDoc.name || 'Document'} · AI Analysis Engine`,
      page: 'Summary',
      confidence: '100% Document Grounded'
    };

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
          } catch (e) {}
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

  useEffect(() => {
    if (storageKey && messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (e) {}
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

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
    };
  }, []);

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
          source: res.source || `${currentDoc?.displayName || 'Document'} · RAG Engine`,
          page: res.page || 'Page 1',
          confidence: res.confidence || 'Grounded Legal Lens AI'
        };

        setMessages((prev) => [...prev, assistantMsg]);
        apiService.saveChatMessage(currentDoc.id, assistantMsg);
      }
    } catch (err) {
      setIsTyping(false);
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Unable to process question. Please check server connection.',
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
        text: `Chat cleared. Ask anything about "${currentDoc.name || 'this document'}".`,
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
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please type your question.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      const langCode = currentDoc?.selectedLanguage || 'en';
      if (langCode === 'hi') recognition.lang = 'hi-IN';
      else if (langCode === 'gu') recognition.lang = 'gu-IN';
      else recognition.lang = 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) setInputVal(currentTranscript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => {
        setIsListening(false);
        inputRef.current?.focus();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
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
      
      {/* HEADER: Legal Lens Assistant ● Ready, Context */}
      <header className="flex items-center justify-between bg-[#01162B] px-5 py-4 text-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#00385A] text-[#A2C4D9] shadow-xs">
            <Scale className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold tracking-tight">Legal Lens Assistant</h2>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ready
              </span>
            </div>
            <p className="text-xs text-[#A2C4D9] truncate">
              Context: {currentDoc ? (currentDoc.name || currentDoc.displayName) : 'No Document Selected'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleResetChat}
            className="rounded-xl p-2 text-[#A2C4D9] hover:bg-[#00385A] hover:text-white transition-colors cursor-pointer"
            title="Clear conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-[#A2C4D9] hover:bg-[#00385A] hover:text-white transition-colors cursor-pointer ml-1"
              title="Close Assistant"
              aria-label="Close Assistant"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          )}
        </div>
      </header>

      {/* CHAT MESSAGES BODY */}
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[90%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                  isUser
                    ? 'rounded-br-xs bg-[#01162B] text-white'
                    : 'rounded-bl-xs border border-[#D2DBEB]/80 bg-white text-[#01162B]'
                }`}
              >
                {!isUser && (
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold text-[#6A90B4]">
                    <Sparkles className="h-3 w-3 text-[#00385A]" />
                    LEGAL LENS ASSISTANT
                  </div>
                )}

                {renderFormattedMessage(msg.text)}

                {/* Source Citation Badge */}
                {!isUser && msg.source && (
                  <div className="mt-3 border-t border-[#D2DBEB]/60 pt-2 text-[10px]">
                    <div className="flex items-center justify-between gap-2 text-[#00385A] font-medium">
                      <span className="truncate">Source: {msg.source}</span>
                      <button
                        onClick={() => copyCitation(msg.id, msg.text, msg.source)}
                        className="inline-flex shrink-0 items-center gap-1 text-[#6A90B4] hover:text-[#01162B] font-bold cursor-pointer"
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
                  </div>
                )}
              </div>
              <span className="mt-1 px-1 text-[10px] text-[#94A2BF] font-mono">{msg.timestamp}</span>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex w-fit items-center gap-2 rounded-2xl border border-[#D2DBEB] bg-white p-3 text-xs font-semibold text-[#6A90B4]">
            <Sparkles className="h-4 w-4 animate-spin text-[#00385A]" />
            Searching document context...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* RECOMMENDED QUESTIONS DISPLAYED ABOVE CHAT INPUT */}
      <div className="border-t border-b border-[#D2DBEB] bg-[#F0F4F8] px-4 py-3 shrink-0">
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-[#6A90B4] flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-500" />
          Recommended Questions for {currentDoc?.name || 'Document'}
        </p>

        {suggestedQuestionsList.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {suggestedQuestionsList.map((chip, idx) => (
              <button
                key={`${idx}-${chip}`}
                onClick={() => handleSendMessage(chip)}
                className="shrink-0 rounded-xl border border-[#D2DBEB] bg-white px-3 py-1.5 text-xs font-bold text-[#00385A] transition-all hover:border-[#01162B] hover:bg-[#01162B] hover:text-white shadow-2xs cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#6A90B4] font-medium">
            Recommended questions are ready for this agreement.
          </p>
        )}
      </div>

      {/* CHAT INPUT AREA */}
      <div className="shrink-0 bg-white p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 rounded-2xl border border-[#D2DBEB] bg-[#F0F4F8] p-1.5 focus-within:border-[#01162B] focus-within:ring-2 focus-within:ring-[#01162B]/20"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(event) => setInputVal(event.target.value)}
            placeholder={isListening ? 'Listening...' : `Ask anything about ${currentDoc?.name || 'this document'}...`}
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-[#01162B] font-medium placeholder-[#94A2BF] outline-none"
          />

          {/* Voice Input Button 🎤 */}
          <button
            type="button"
            onClick={toggleVoice}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer ${
              isListening
                ? 'animate-pulse bg-red-500 text-white shadow-md'
                : 'text-[#6A90B4] hover:bg-white hover:text-[#01162B]'
            }`}
            title={isListening ? 'Listening... Click to stop' : 'Voice input (Web Speech API)'}
          >
            <Mic className="h-4 w-4" />
          </button>

          {/* Send Button ➤ */}
          <button
            type="submit"
            disabled={!inputVal.trim() || isTyping}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#01162B] text-white transition-colors hover:bg-[#00385A] disabled:opacity-40 cursor-pointer"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-2 px-1 text-[10px] text-[#94A2BF] font-medium">
          Legal Lens AI Assistant · Grounded Document Analysis
        </p>
      </div>

    </section>
  );
}
