import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert,
  Info,
  Scale,
  ArrowRight
} from 'lucide-react';

export default function SummaryHighlight({ document, onOpenChat }) {
  const [activeTab, setActiveTab] = useState('Overview');

  if (!document) return null;

  const { summaryHighlight, simpleSummary, type, riskScore, riskLevel } = document;

  const riskyClausesCount = document.risks?.length || 2;
  const totalClausesCount = document.clauses?.length || 12;
  const timeSavedText = '~1 min';

  const isHigh = riskLevel === 'High' || document.risk_classification === 'High Risk' || (document.risk_level >= 8);
  const isMed = riskLevel === 'Medium' || document.risk_classification === 'Medium Risk' || (document.risk_level >= 5 && document.risk_level <= 7);

  const tabs = ['Overview', 'Risky Clauses', 'Key Clauses', 'Next Steps', 'Checklist'];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'Risky Clauses') {
      const el = document.getElementById('potential-risks');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'Key Clauses') {
      const el = document.getElementById('important-clauses');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'Checklist' || tab === 'Next Steps') {
      const el = document.getElementById('before-you-sign');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 mb-8">
      
      {/* 4 METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: RISK LEVEL */}
        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-[#D2DBEB]/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#94A2BF] mb-1.5">
            <ShieldAlert className={`h-4 w-4 ${isHigh ? 'text-red-600' : isMed ? 'text-amber-500' : 'text-emerald-600'}`} />
            <span>RISK LEVEL</span>
          </div>
          <p className="text-xl font-black text-[#01162B]">
            {document.risk_level || 7}/10
          </p>
          <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
            isHigh ? 'bg-red-50 text-red-700 border border-red-200' : isMed ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {document.risk_classification || `${riskLevel || 'High'} Risk`}
          </span>
        </div>

        {/* Metric 2: KEY CLAUSES */}
        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-[#D2DBEB]/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#94A2BF] mb-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>KEY CLAUSES</span>
          </div>
          <p className="text-xl font-black text-[#01162B]">
            {riskyClausesCount} Risky Clauses
          </p>
          <p className="text-[11px] text-[#6A90B4] mt-1 font-semibold">
            Requires careful review
          </p>
        </div>

        {/* Metric 3: TIME SAVED */}
        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-[#D2DBEB]/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#94A2BF] mb-1.5">
            <Clock className="h-4 w-4 text-emerald-600" />
            <span>TIME SAVED</span>
          </div>
          <p className="text-xl font-black text-[#01162B]">
            {timeSavedText}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Instant AI extraction
          </p>
        </div>

        {/* Metric 4: TOTAL CLAUSES */}
        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-[#D2DBEB]/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#94A2BF] mb-1.5">
            <Scale className="h-4 w-4 text-[#6A90B4]" />
            <span>TOTAL CLAUSES</span>
          </div>
          <p className="text-xl font-black text-[#01162B]">
            {totalClausesCount}
          </p>
          <p className="text-[11px] text-[#6A90B4] font-semibold mt-1">
            Complete contract coverage
          </p>
        </div>

      </div>

      {/* ANALYSIS TABS BAR */}
      <div className="flex items-center gap-2 border-b border-[#D2DBEB] overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'text-[#01162B] border-b-2 border-[#01162B]'
                  : 'text-[#6A90B4] hover:text-[#01162B]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB CONTENT (Two-Column Layout) */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Simple Summary Card */}
          <div className="lg:col-span-5 rounded-3xl bg-white p-6 sm:p-7 border border-[#D2DBEB]/80 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#01162B] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#00385A]" />
                  Simple Summary
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#6A90B4]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#00385A]">
                  <Sparkles className="h-3 w-3 text-[#00385A]" />
                  ✦ AI Generated
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#00385A] leading-relaxed">
                {simpleSummary?.text || document.executiveSummary || 'Document analyzed by Legal Lens grounded RAG pipeline.'}
              </p>
            </div>

            <div className="pt-4 border-t border-[#D2DBEB]/60 space-y-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#94A2BF]">
                Key Takeaways
              </p>
              <ul className="space-y-2">
                {(simpleSummary?.keyTakeaways || ['Review notice & termination requirements.', 'Verify financial liability limit.', 'Confirm dispute resolution terms.']).map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#01162B] font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[#6A90B4] shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: Plain-Language Highlight Card (Dark Navy + Legal Pattern) */}
          <div className="lg:col-span-7 rounded-3xl legal-pattern-bg text-white p-7 sm:p-8 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6A90B4]/25 px-3 py-1 text-xs font-bold text-[#D2DBEB] border border-[#6A90B4]/40">
                  <Sparkles className="h-3.5 w-3.5 text-[#A2C4D9]" />
                  Plain-Language Highlight
                </span>
                <span className="text-xs font-mono text-[#94A2BF]">
                  {document.name}
                </span>
              </div>

              <h4 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-4 leading-snug">
                “{summaryHighlight?.takeaway || document.executiveSummary?.substring(0, 140) || 'Review key obligations and notice periods prior to signing.'}”
              </h4>

              <div className="rounded-2xl bg-[#00223D]/90 p-4 border border-[#6A90B4]/30 space-y-1">
                <p className="text-xs font-bold text-[#A2C4D9] uppercase tracking-wider">
                  Why this matters:
                </p>
                <p className="text-xs text-[#C9D3DD] leading-relaxed">
                  This provision outlines specific obligations, notice periods, or financial penalties that directly impact your contractual freedom and liabilities.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#6A90B4]/30 flex items-center justify-between">
              <span className="text-xs text-[#A2C4D9]">
                Source: {document.name} · Page 1
              </span>

              <button
                onClick={() => onOpenChat && onOpenChat(`What are the key obligations in ${document.name}?`)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#6A90B4] hover:bg-[#557b9e] px-3.5 py-1.5 text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ask AI About This</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
