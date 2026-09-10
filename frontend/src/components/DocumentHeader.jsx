import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle, 
  Download, 
  Share2, 
  MoreVertical, 
  Sparkles, 
  Printer, 
  Check, 
  ArrowLeft,
  Globe
} from 'lucide-react';

export default function DocumentHeader({ 
  document, 
  onDownloadReport, 
  onOpenChat, 
  onReanalyze,
  onBackToDocuments
}) {
  const [copied, setCopied] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!document) return null;

  return (
    <div className="space-y-4 mb-6">
      
      {/* Back to Documents Link */}
      <button
        onClick={onBackToDocuments}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00385A] hover:text-[#01162B] transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>← Back to Documents</span>
      </button>

      {/* Main Top Document Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 border border-[#D2DBEB]/80 shadow-xs">
        
        {/* Document Icon & Title Block */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#01162B] text-white shadow-md">
            <FileText className="h-6 w-6 text-[#6A90B4]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#01162B] tracking-tight">
                {document.name}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                Analysis Complete
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#6A90B4]">
              <span className="font-semibold text-[#00385A]">{document.type}</span>
              <span>·</span>
              <span>{document.fileSize || '1.8 MB'}</span>
              <span>·</span>
              <span>RAG Verified</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Language Selector + Download Report */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          
          {/* Language Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#F0F4F8] px-3.5 py-2 text-xs font-bold text-[#00385A] border border-[#D2DBEB] hover:bg-[#E2EAF2] transition-all cursor-pointer"
              title="Change analysis language"
            >
              <Globe className="h-3.5 w-3.5 text-[#6A90B4]" />
              <span>
                [{document.selectedLanguage === 'gu' ? 'ગુજરાતી' : document.selectedLanguage === 'hi' ? 'हिन्दी' : 'English'}]
              </span>
            </button>

            {langMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLangMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-[#D2DBEB] bg-white p-1.5 shadow-lg z-20 animate-in fade-in duration-150">
                  <p className="px-2 py-1 text-[10px] font-bold text-[#6A90B4] uppercase tracking-wider">
                    Re-analyze in:
                  </p>
                  <button
                    onClick={() => {
                      setLangMenuOpen(false);
                      onReanalyze?.(document.id, 'en');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#00385A] rounded-xl hover:bg-[#F0F4F8] font-bold text-left cursor-pointer"
                  >
                    <span>🇺🇸</span> English
                  </button>
                  <button
                    onClick={() => {
                      setLangMenuOpen(false);
                      onReanalyze?.(document.id, 'hi');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#00385A] rounded-lg hover:bg-[#F0F4F8] font-bold text-left cursor-pointer"
                  >
                    <span>🇮🇳</span> हिन्दी (Hindi)
                  </button>
                  <button
                    onClick={() => {
                      setLangMenuOpen(false);
                      onReanalyze?.(document.id, 'gu');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#00385A] rounded-lg hover:bg-[#F0F4F8] font-bold text-left cursor-pointer"
                  >
                    <span>🇮🇳</span> ગુજરાતી (Gujarati)
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Download Report Button */}
          <button
            onClick={onDownloadReport}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#01162B] hover:bg-[#00385A] px-4 py-2 text-xs font-bold text-white shadow-2xs transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-[#6A90B4]" />
            <span>Download Report</span>
          </button>

        </div>

      </div>

    </div>
  );
}
