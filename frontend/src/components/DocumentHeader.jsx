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
  Copy,
  ExternalLink,
  Globe
} from 'lucide-react';

export default function DocumentHeader({ 
  document, 
  onDownloadReport, 
  onOpenChat, 
  onCopyCitation,
  onReanalyze
}) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!document) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 sm:p-6 border border-[#D2DBEB]/80 shadow-xs mb-6">
      
      {/* Document Icon & Title Block */}
      <div className="flex items-start sm:items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#01162B] text-[#6A90B4] shadow-xs">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#01162B] tracking-tight">
              {document.name}
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              {document.status || 'Document analyzed'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#6A90B4]">
            <span className="font-medium text-[#00385A]">{document.type}</span>
            <span>·</span>
            <span>{document.pages} pages</span>
            <span>·</span>
            <span>{document.fileSize || '1.8 MB'}</span>
            <span>·</span>
            <span>Analysed in 1.4s</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        
        {/* Language Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#00385A] border border-[#D2DBEB] hover:bg-[#F0F4F8] transition-all focus:outline-hidden"
            title="Change analysis language"
          >
            <Globe className="h-3.5 w-3.5 text-[#6A90B4]" />
            <span>
              {document.selectedLanguage === 'gu' ? 'ગુજરાતી' : document.selectedLanguage === 'hi' ? 'हिन्दी' : 'English'}
            </span>
          </button>

          {langMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setLangMenuOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-[#D2DBEB] bg-white p-1.5 shadow-lg z-20 animate-in fade-in duration-150">
                <p className="px-2 py-1 text-[10px] font-bold text-[#6A90B4] uppercase tracking-wider">
                  Re-analyze in:
                </p>
                <button
                  onClick={() => {
                    setLangMenuOpen(false);
                    onReanalyze?.(document.id, 'en');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#00385A] rounded-lg hover:bg-[#F0F4F8] font-medium"
                >
                  <span>🇺🇸</span> English
                </button>
                <button
                  onClick={() => {
                    setLangMenuOpen(false);
                    onReanalyze?.(document.id, 'hi');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#00385A] rounded-lg hover:bg-[#F0F4F8] font-medium"
                >
                  <span>🇮🇳</span> हिन्दी (Hindi)
                </button>
                <button
                  onClick={() => {
                    setLangMenuOpen(false);
                    onReanalyze?.(document.id, 'gu');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#00385A] rounded-lg hover:bg-[#F0F4F8] font-medium"
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
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#00385A] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#01162B] transition-all focus:outline-hidden"
          title="Download printable executive legal summary report"
        >
          <Download className="h-3.5 w-3.5 text-[#6A90B4]" />
          <span>Download Report</span>
        </button>

        {/* Share Link Button */}
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#00385A] border border-[#D2DBEB] hover:bg-[#F0F4F8] transition-all focus:outline-hidden"
          title="Copy share link"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-bold">Copied</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5 text-[#6A90B4]" />
              <span className="hidden sm:inline">Share</span>
            </>
          )}
        </button>

        {/* More Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#D2DBEB] text-[#00385A] hover:bg-[#F0F4F8] transition-all focus:outline-hidden"
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setMenuOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#D2DBEB] bg-white p-1.5 shadow-lg z-20 animate-in fade-in duration-150">
                <button
                  onClick={() => {
                    onDownloadReport();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#00385A] rounded-lg hover:bg-[#F0F4F8] text-left"
                >
                  <Printer className="h-3.5 w-3.5 text-[#6A90B4]" />
                  Print Summary
                </button>
                <button
                  onClick={() => {
                    onOpenChat();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#00385A] rounded-lg hover:bg-[#F0F4F8] text-left"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#6A90B4]" />
                  Ask AI Questions
                </button>
              </div>
            </>
          )}
        </div>

      </div>

    </div>
  );
}

