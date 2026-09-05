import React, { useState } from 'react';
import { 
  Scale, 
  FileText, 
  ChevronDown, 
  User, 
  Sparkles, 
  ShieldCheck,
  FolderOpen,
  HelpCircle,
  RotateCcw,
  Lock,
  LogOut
} from 'lucide-react';

export default function Header({
  activeNav,
  onNavigate,
  currentDoc,
  hasUploadedDoc,
  documentsList,
  onSwitchDocument,
  onOpenChat,
  onReset,
  currentUser,
  onLogout
}) {
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', requiresDoc: false },
    { id: 'my-documents', label: 'My Documents', requiresDoc: false },
    { id: 'analysis', label: 'Analysis', requiresDoc: true },
    { id: 'before-you-sign', label: 'Before You Sign', requiresDoc: true }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D2DBEB]/80 bg-white/95 backdrop-blur-md transition-all shadow-xs">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-12">

        
        {/* Brand Logo & Tagline */}
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left group focus:outline-hidden"
          aria-label="Legal Lens Home"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#01162B] text-white shadow-md transition-transform group-hover:scale-105">
            <Scale className="h-5 w-5 text-[#6A90B4]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-[#01162B]">
                LEGAL LENS
              </span>
              <span className="rounded-full bg-[#6A90B4]/15 px-2 py-0.5 text-[10px] font-semibold text-[#00385A]">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium tracking-wide text-[#6A90B4]">
              Know Before You Sign.
            </p>
          </div>
        </button>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 rounded-full bg-[#F0F4F8] p-1 border border-[#D2DBEB]/60">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            const isDisabled = item.requiresDoc && !hasUploadedDoc;

            if (isDisabled) {
              return (
                <div
                  key={item.id}
                  className="relative group px-3.5 py-1.5 text-sm font-medium text-[#94A2BF] cursor-not-allowed flex items-center gap-1.5 opacity-60"
                  title="Upload a document first to unlock this section"
                >
                  <span>{item.label}</span>
                  <Lock className="h-3 w-3 text-[#94A2BF]" />
                  
                  {/* Tooltip */}
                  <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#01162B] px-2 py-0.5 text-[10px] font-semibold text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    Upload document first
                  </span>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#01162B] text-white shadow-xs'
                    : 'text-[#00385A] hover:bg-white hover:text-[#01162B]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Active Doc Badge & Profile Menu */}
        <div className="flex items-center gap-3">
          
          {/* Active document indicator (only when document is loaded) */}
          {hasUploadedDoc && currentDoc && (
            <div className="hidden lg:flex items-center gap-2 rounded-lg bg-[#F0F4F8] px-3 py-1.5 border border-[#D2DBEB]/70 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <FileText className="h-3.5 w-3.5 text-[#6A90B4]" />
              <span className="font-medium text-[#01162B] max-w-[140px] truncate" title={currentDoc.name}>
                {currentDoc.name}
              </span>
            </div>
          )}

          {/* Ask AI Quick Trigger */}
          {hasUploadedDoc && (
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 rounded-full bg-[#6A90B4]/15 px-3 py-1.5 text-xs font-semibold text-[#00385A] border border-[#6A90B4]/30 hover:bg-[#6A90B4]/25 transition-all focus:outline-hidden"
              title="Ask AI about this document"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#00385A]" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          )}

          {/* User Profile / Quick Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#01162B] text-white border border-[#6A90B4]/40 hover:ring-2 hover:ring-[#6A90B4]/50 transition-all focus:outline-hidden"
              aria-label="User Profile Menu"
              aria-expanded={profileOpen}
            >
              <User className="h-4 w-4 text-[#D2DBEB]" />
            </button>

            {profileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setProfileOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#D2DBEB] bg-white p-2 shadow-xl z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-[#D2DBEB]/60">
                    <p className="text-xs font-bold text-[#01162B]">{currentUser?.name || 'Legal Lens User'}</p>
                    <p className="text-[11px] text-[#6A90B4] truncate">{currentUser?.email || 'user@example.com'}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onNavigate('my-documents');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#00385A] rounded-lg hover:bg-[#F0F4F8] transition-colors text-left"
                    >
                      <FolderOpen className="h-3.5 w-3.5 text-[#6A90B4]" />
                      My Documents Library
                    </button>
                  </div>

                  <div className="border-t border-[#D2DBEB]/60 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left font-semibold"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Mobile sub-navigation bar */}
      <div className="flex md:hidden border-t border-[#D2DBEB]/60 bg-[#F8FAFC] px-4 py-2 justify-between">
        {navItems.map((item) => {
          const isDisabled = item.requiresDoc && !hasUploadedDoc;
          if (isDisabled) {
            return (
              <span
                key={item.id}
                className="text-xs font-medium px-2 py-1 text-[#94A2BF] opacity-50 cursor-not-allowed flex items-center gap-1"
              >
                {item.label}
                <Lock className="h-2.5 w-2.5" />
              </span>
            );
          }
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${
                activeNav === item.id
                  ? 'bg-[#01162B] text-white'
                  : 'text-[#00385A]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}


