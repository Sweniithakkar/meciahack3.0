import React from 'react';
import { 
  X, 
  Printer, 
  Scale, 
  ShieldCheck, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export default function ReportModal({ document, onClose }) {
  if (!document) return null;

  const handlePrint = () => {
    window.print();
  };

  const highRisks = (document.risks || []).filter(r => r.level === 'high');
  const otherRisks = (document.risks || []).filter(r => r.level !== 'high');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01162B]/70 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div 
        className="w-full max-w-3xl rounded-3xl bg-white border border-[#D2DBEB] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Controls Toolbar (Hidden in print) */}
        <div className="no-print flex items-center justify-between bg-[#01162B] px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-[#6A90B4]" />
            <h3 className="text-base font-bold text-white">
              Executive Legal Report Preview
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#6A90B4] hover:bg-[#557b9e] px-4 py-2 text-xs font-bold text-white transition-all shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#94A2BF] hover:text-white rounded-lg hover:bg-[#00385A] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-8 bg-white text-[#01162B]">
          
          {/* Certificate Header */}
          <div className="border-b-2 border-[#01162B] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="h-6 w-6 text-[#00385A]" />
                <h1 className="text-2xl font-black tracking-tight text-[#01162B]">
                  LEGAL LENS
                </h1>
              </div>
              <p className="text-xs font-semibold tracking-wider text-[#6A90B4] uppercase mt-0.5">
                Executive Document Analysis &amp; Risk Assessment
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-[#00385A]">
              <p className="font-bold">Report ID: LL-{document.id.toUpperCase()}</p>
              <p className="text-[11px] text-[#94A2BF]">Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Document Overview Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#F0F4F8] border border-[#D2DBEB]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A2BF]">Document</p>
              <p className="text-xs font-bold text-[#01162B] truncate">{document.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A2BF]">Type</p>
              <p className="text-xs font-bold text-[#01162B]">{document.type}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A2BF]">Page Count</p>
              <p className="text-xs font-bold text-[#01162B]">{document.pages} Pages</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A2BF]">Risk Assessment</p>
              <p className="text-xs font-bold text-red-700">{document.riskScore || 'High Attention'}</p>
            </div>
          </div>

          {/* Section 1: Executive Plain-Language Summary */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#01162B] mb-2 border-b border-[#D2DBEB] pb-1">
              1. Executive Plain-Language Summary
            </h2>
            <div className="rounded-xl bg-[#F8FAFC] p-4 border border-[#D2DBEB]/60 mb-3">
              <p className="text-xs font-semibold text-[#00385A] leading-relaxed">
                “{document.summaryHighlight?.takeaway}”
              </p>
            </div>
            <p className="text-xs text-[#00385A] leading-relaxed">
              {document.simpleSummary?.text}
            </p>
          </div>

          {/* Section 2: Critical Areas of Concern */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#01162B] mb-3 border-b border-[#D2DBEB] pb-1">
              2. Identified Potential Risks &amp; Liabilities
            </h2>
            <div className="space-y-3">
              {document.risks?.map((risk, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-[#D2DBEB] bg-white">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#01162B]">{idx + 1}. {risk.title}</span>
                    <span className="text-[10px] font-mono text-[#6A90B4]">Page {risk.page}</span>
                  </div>
                  <p className="text-xs text-[#00385A]/90 leading-relaxed mb-1.5">{risk.explanation}</p>
                  {risk.recommendation && (
                    <p className="text-[11px] font-semibold text-[#00385A] bg-[#F0F4F8] p-2 rounded-lg">
                      Recommendation: {risk.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Before You Sign Verification Summary */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#01162B] mb-3 border-b border-[#D2DBEB] pb-1">
              3. “Before You Sign” Checklist Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {document.checklist?.slice(0, 6).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-[#F8FAFC] border border-[#D2DBEB]/50">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-[#01162B]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Certification / Sign-off */}
          <div className="pt-6 border-t-2 border-[#01162B] grid grid-cols-2 gap-8 text-xs text-[#00385A]">
            <div>
              <p className="font-bold text-[#01162B]">Verified by Legal Lens AI Engine</p>
              <p className="text-[10px] text-[#94A2BF] mt-1">Algorithm Version 4.8 · RAG Verified</p>
            </div>
            <div className="border-t border-dashed border-[#94A2BF] pt-2 text-center">
              <p className="text-[11px] text-[#94A2BF]">Signatory Review Acknowledgement</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

