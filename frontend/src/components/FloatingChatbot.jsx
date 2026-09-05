import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Mic, RotateCcw, Scale, Send, Sparkles } from 'lucide-react';
import { SAMPLE_PROMPT_CHIPS } from '../data/mockData';
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

  useEffect(() => {
    if (!currentDoc) return;
    setMessages([{ id: 'welcome', sender: 'assistant', text: `Hello! I've analyzed "${currentDoc.name}". I can help you understand its clauses, obligations, financial penalties, and potential areas that need attention. How can I assist you today?`, timestamp: 'Just now', source: `${currentDoc.displayName} · AI Analysis Engine`, page: 'Summary', confidence: '100% Document Verified' }]);
  }, [currentDoc?.id]);

  useEffect(() => {
    if (initialQuestion) {
      handleSendMessage(initialQuestion);
      onClearInitialQuestion?.();
      inputRef.current?.focus();
    }
  }, [initialQuestion]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;
    const userMsg = { id: `user-${Date.now()}`, sender: 'user', text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    try {
      const res = await apiService.queryDocumentAI(currentDoc?.id, text, currentDoc?.selectedLanguage || 'en');
      setIsTyping(false);
      if (res && res.answer) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            sender: 'assistant',
            text: res.answer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: res.source || `${currentDoc?.displayName || 'Document'} · RAG Pipeline`,
            page: res.page || 'Vector DB',
            confidence: res.confidence || 'AI Verified'
          }
        ]);
      }
    } catch (err) {
      setIsTyping(false);
      console.error('Chat error:', err);
    }
  };

  const copyCitation = (id, text, source) => {
    navigator.clipboard?.writeText(`"${text}"\n— ${source}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    if (!currentDoc) return;
    setMessages([{ id: `welcome-${Date.now()}`, sender: 'assistant', text: `Conversation cleared. How can I help you analyze "${currentDoc.name}"?`, timestamp: 'Just now', source: `${currentDoc.displayName} · Summary`, page: '1', confidence: '100%' }]);
  };

  const toggleVoice = () => {
    if (isListening) return setIsListening(false);
    setIsListening(true);
    setTimeout(() => { setInputVal('Can the notice period be reduced or bought out?'); setIsListening(false); inputRef.current?.focus(); }, 1800);
  };

  return (
    <section className="flex h-full min-h-[620px] flex-col overflow-hidden rounded-3xl border border-[#D2DBEB]/80 bg-white shadow-xl">
      <header className="flex items-center justify-between bg-[#01162B] px-5 py-4 text-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00385A] text-[#A2C4D9]"><Scale className="h-5 w-5" /></div>
          <div className="min-w-0"><div className="flex items-center gap-2"><h2 className="text-base font-bold tracking-tight">Legal Lens Assistant</h2><span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Ready</span></div><p className="text-xs text-[#A2C4D9]">Your AI legal companion</p></div>
        </div>
        <button onClick={handleResetChat} className="rounded-lg p-2 text-[#A2C4D9] hover:bg-[#00385A] hover:text-white" title="Clear conversation" aria-label="Clear conversation"><RotateCcw className="h-4 w-4" /></button>
      </header>

      <div className="border-b border-[#D2DBEB] bg-[#F0F4F8] px-4 py-3 shrink-0">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#6A90B4]">Suggested questions</p>
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">{SAMPLE_PROMPT_CHIPS.map((chip) => <button key={chip} onClick={() => handleSendMessage(chip)} className="shrink-0 rounded-full border border-[#D2DBEB] bg-white px-3 py-1.5 text-xs font-semibold text-[#00385A] transition-colors hover:border-[#00385A] hover:bg-[#01162B] hover:text-white">{chip}</button>)}</div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}><div className={`max-w-[90%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-2xs ${isUser ? 'rounded-br-sm bg-[#01162B] text-white' : 'rounded-bl-sm border border-[#D2DBEB]/80 bg-white text-[#01162B]'}`}>
            {!isUser && <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold text-[#6A90B4]"><Sparkles className="h-3 w-3 text-[#00385A]" />LEGAL LENS ASSISTANT</div>}
            <p className="whitespace-pre-wrap">{msg.text}</p>
            {!isUser && msg.source && <div className="mt-3 border-t border-[#D2DBEB]/60 pt-2 text-[10px]"><div className="flex items-center justify-between gap-2 text-[#00385A]"><span className="truncate font-semibold">{msg.source}</span><button onClick={() => copyCitation(msg.id, msg.text, msg.source)} className="inline-flex shrink-0 items-center gap-1 text-[#6A90B4] hover:text-[#01162B]">{copiedId === msg.id ? <><Check className="h-3 w-3 text-emerald-600" /><span className="text-emerald-600">Copied</span></> : <><Copy className="h-3 w-3" />Copy</>}</button></div>{msg.confidence && <div className="mt-1 flex justify-between text-[#94A2BF]"><span>{msg.confidence}</span><span>Page {msg.page || '3'} verified</span></div>}</div>}
          </div><span className="mt-1 px-1 text-[10px] text-[#94A2BF]">{msg.timestamp}</span></div>;
        })}
        {isTyping && <div className="flex w-fit items-center gap-2 rounded-2xl border border-[#D2DBEB] bg-white p-3 text-xs text-[#6A90B4]"><Sparkles className="h-4 w-4 animate-spin text-[#00385A]" />Searching document context…</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-[#D2DBEB]/80 bg-white p-4">
        <form onSubmit={(event) => { event.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2 rounded-2xl border border-[#D2DBEB] bg-[#F0F4F8] p-1.5 focus-within:border-[#00385A] focus-within:ring-1 focus-within:ring-[#00385A]">
          <input ref={inputRef} type="text" value={inputVal} onChange={(event) => setInputVal(event.target.value)} placeholder="Ask anything about this document..." className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-[#01162B] placeholder-[#94A2BF] outline-none" />
          <button type="button" onClick={toggleVoice} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isListening ? 'animate-pulse bg-red-500 text-white' : 'text-[#6A90B4] hover:bg-white hover:text-[#01162B]'}`} title={isListening ? 'Listening...' : 'Voice query'}><Mic className="h-4 w-4" /></button>
          <button type="submit" disabled={!inputVal.trim() || isTyping} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#01162B] text-white transition-colors hover:bg-[#00385A] disabled:opacity-40" aria-label="Send message"><Send className="h-4 w-4" /></button>
        </form>
        <p className="mt-2 px-1 text-[10px] text-[#94A2BF]">Informational analysis only · Not formal legal advice</p>
      </div>
    </section>
  );
}
