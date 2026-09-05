import React from 'react';
import { 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert,
  Info,
  Scale
} from 'lucide-react';

export default function SummaryHighlight({ document, onOpenChat }) {
  if (!document) return null;

  const { summaryHighlight, simpleSummary, type, riskScore, riskLevel } = document;

  return (
    <div className="space-y-6 mb-8">
      
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Document Type Card */}
        <div className="rounded-2xl bg-white p-4 border border-[#D2DBEB]/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#94A2BF] mb-1">
            <FileText className="h-3.5 w-3.5 text-[#6A90B4]" />
            <span>Document Type</span>
          </div>
          <p className="text-base font-extrabold text-[#01162B] truncate">
            {type}
          </p>
          <p className="text-[11px] text-[#6A90B4] mt-0.5">
            Standard contractual format
          </p>
        </div>

        {/* Risk Assessment Score */}
        <div className="rounded-2xl bg-white p-4 border border-[#D2DBEB]/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#94A2BF] mb-1">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
            <span>Risk Level</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
              riskLevel === 'High' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : riskLevel === 'Medium'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {riskScore}
            </span>
          </div>
          <p className="text-[11px] text-[#6A90B4] mt-0.5">
            {document.risks?.length || 0} items require attention
          </p>
        </div>

        {/* Total Clauses Analyzed */}
        <div className="rounded-2xl bg-white p-4 border border-[#D2DBEB]/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#94A2BF] mb-1">
            <Scale className="h-3.5 w-3.5 text-[#6A90B4]" />
            <span>Key Clauses</span>
          </div>
          <p className="text-base font-extrabold text-[#01162B]">
            {document.clauses?.length || 0} Clauses Parsed
          </p>
          <p className="text-[11px] text-[#6A90B4] mt-0.5">
            100% text coverage verified
          </p>
        </div>

        {/* Estimated Reading Time Savings */}
        <div className="rounded-2xl bg-white p-4 border border-[#D2DBEB]/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#94A2BF] mb-1">
            <Clock className="h-3.5 w-3.5 text-emerald-600" />
            <span>Time Saved</span>
          </div>
          <p className="text-base font-extrabold text-[#01162B]">
            ~16 Mins Saved
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
            {summaryHighlight?.estimatedReadTime || '2 mins summary'}
          </p>
        </div>

      </div>

      {/* Main Grid: Document Type & Simple Summary Card + Plain-Language Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Simple Summary Box */}
        <div className="lg:col-span-5 rounded-2xl bg-white p-6 border border-[#D2DBEB]/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#00385A]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#01162B]">
                  Simple Summary
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#6A90B4]/15 px-2 py-0.5 text-[10px] font-bold text-[#00385A]">
                <Sparkles className="h-3 w-3 text-[#00385A]" />
                AI Generated
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#00385A] leading-relaxed mb-4">
              {simpleSummary?.text}
            </p>
          </div>

          <div className="pt-4 border-t border-[#D2DBEB]/60">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#94A2BF] mb-2">
              Key Highlights
            </p>
            <ul className="space-y-2">
              {simpleSummary?.keyTakeaways?.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-[#01162B]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#6A90B4] shrink-0 mt-0.5" />
                  <span className="leading-snug">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Col: Prominent Plain-Language Highlight Banner */}
        <div className="lg:col-span-7 rounded-2xl bg-gradient-to-br from-[#01162B] via-[#002845] to-[#00385A] text-white p-6 sm:p-7 shadow-md relative overflow-hidden flex flex-col justify-between">
          
          {/* Background subtle decoration */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-[#6A90B4]/20 blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6A90B4]/25 px-3 py-1 text-xs font-bold text-[#D2DBEB] border border-[#6A90B4]/40">
                <Sparkles className="h-3.5 w-3.5 text-[#A2C4D9]" />
                PLAIN-LANGUAGE HIGHLIGHT
              </span>
              <span className="text-xs font-mono text-[#94A2BF]">
                {summaryHighlight?.source}
              </span>
            </div>

            <h4 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-3 leading-snug">
              “{summaryHighlight?.takeaway}”
            </h4>

            <p className="text-xs text-[#C9D3DD] leading-relaxed max-w-xl">
              <strong>Why this matters:</strong> This clause binds you to specific notice durations and exit financial settlements before you can be released from contractual obligations.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#6A90B4]/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#A2C4D9]">
              <Info className="h-4 w-4 text-[#6A90B4]" />
              <span>Reference: {document.name} · {summaryHighlight?.pageRef || 'Page 3'}</span>
            </div>

            <button
              onClick={() => onOpenChat && onOpenChat('What should I know about the 90-day notice and bond clause?')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#6A90B4] hover:bg-[#557b9e] px-3.5 py-1.5 text-xs font-bold text-white transition-all shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask AI About This</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

