import React, { useState } from 'react';
import { 
  X, 
  Scale, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  FileCode,
  ArrowRight
} from 'lucide-react';

export default function ClauseDetailModal({ 
  clause, 
  onClose, 
  onOpenChat 
}) {
  const [copied, setCopied] = useState(false);

  if (!clause) return null;

  const handleCopyText = () => {
    navigator.clipboard?.writeText(clause.originalText || clause.detail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHigh = clause.risk === 'High';
  const isMed = clause.risk === 'Medium';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01162B]/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div 
        className="w-full max-w-2xl rounded-3xl bg-white border border-[#D2DBEB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between bg-[#01162B] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00385A] text-[#6A90B4]">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {clause.title}
                </h3>
                <span className="rounded-md bg-[#6A90B4]/20 px-2 py-0.5 text-[10px] font-bold text-[#D2DBEB]">
                  {clause.category}
                </span>
              </div>
              <p className="text-xs text-[#6A90B4]">
                Page {clause.page} · Legal Clause Inspection
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#94A2BF] hover:text-white rounded-lg hover:bg-[#00385A] transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Plain English Translation Box */}
          <div className="rounded-2xl bg-[#F0F4F8] p-4 border border-[#D2DBEB]/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#00385A] uppercase tracking-wider mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#6A90B4]" />
              <span>Plain-Language Explanation</span>
            </div>
            <p className="text-xs sm:text-sm text-[#01162B] leading-relaxed">
              {clause.detail}
            </p>
          </div>

          {/* Original Legal Contract Snippet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#94A2BF]">
                <FileCode className="h-3.5 w-3.5 text-[#6A90B4]" />
                <span>Original Contract Text (Page {clause.page})</span>
              </div>

              <button
                onClick={handleCopyText}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6A90B4] hover:text-[#01162B] transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-2xl bg-[#01162B] text-[#D2DBEB] p-4 text-xs font-mono leading-relaxed border border-[#00385A]">
              {clause.originalText || clause.shortDesc}
            </div>
          </div>

          {/* Impact & Risk Analysis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#D2DBEB] p-3 bg-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A2BF] mb-1">
                Risk Classification
              </p>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold ${
                isHigh ? 'bg-red-50 text-red-700 border border-red-200' :
                isMed ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {clause.risk} Impact Clause
              </span>
            </div>

            <div className="rounded-xl border border-[#D2DBEB] p-3 bg-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A2BF] mb-1">
                Standard Enforceability
              </p>
              <span className="text-xs font-semibold text-[#00385A]">
                {clause.importance === 'Critical' ? 'Strict Mandatory Terms' : 'Standard Industry Terms'}
              </span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-[#F8FAFC] border-t border-[#D2DBEB] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              if (onOpenChat) {
                onOpenChat(`Explain the implications of "${clause.title}" and how I can negotiate it.`);
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#00385A] hover:bg-[#01162B] px-5 py-2 text-xs font-bold text-white transition-all shadow-xs"
          >
            <Sparkles className="h-4 w-4 text-[#6A90B4]" />
            <span>Ask AI About This Clause</span>
          </button>

          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#94A2BF] hover:text-[#01162B] transition-colors"
          >
            Done Inspecting
          </button>
        </div>

      </div>

    </div>
  );
}

