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
  LogOut,
  Bell,
  CheckCircle2
} from 'lucide-react';

export default function Header({
  activeNav,
  onNavigate,
  currentDoc,
  hasUploadedDoc,
  documentsList,
  onSwitchDocument,
  onOpenChat,
  isChatOpen,
  onReset,
  currentUser,
  onLogout
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', requiresDoc: false },
    { id: 'my-documents', label: 'My Documents', requiresDoc: false },
    { id: 'analysis', label: 'Analysis', requiresDoc: true },
    { id: 'before-you-sign', label: 'Before You Sign', requiresDoc: true }
  ];

  if (currentUser && currentUser.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Console', requiresDoc: false });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D2DBEB]/80 bg-white/95 backdrop-blur-md transition-all shadow-xs">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-12">

        {/* Left: BRAND LOGO + SCALES ICON + TAGLINE */}
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left group focus:outline-hidden cursor-pointer"
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

        {/* Center: NAVIGATION LINKS (Home, My Documents, Analysis, Before You Sign) */}
        <nav className="hidden md:flex items-center gap-1 rounded-full bg-[#F0F4F8] p-1 border border-[#D2DBEB]/60">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            const isDisabled = item.requiresDoc && !hasUploadedDoc;

            if (isDisabled) {
              return (
                <div
                  key={item.id}
                  className="relative group px-3.5 py-1.5 text-xs font-semibold text-[#94A2BF] cursor-not-allowed flex items-center gap-1.5 opacity-60"
                  title="Upload a document first to unlock this section"
                >
                  <span>{item.label}</span>
                  <Lock className="h-3 w-3 text-[#94A2BF]" />
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
                className={`relative rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
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

        {/* Right: CURRENT DOC INDICATOR + ASK AI + NOTIFICATIONS + USER AVATAR & DROPDOWN */}
        <div className="flex items-center gap-3">
          
          {/* Current Document Indicator */}
          {hasUploadedDoc && currentDoc && (
            <div className="hidden lg:flex items-center gap-2 rounded-xl bg-[#F0F4F8] px-3 py-1.5 border border-[#D2DBEB] text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <FileText className="h-3.5 w-3.5 text-[#6A90B4]" />
              <span className="font-semibold text-[#01162B] max-w-[130px] truncate" title={currentDoc.name}>
                {currentDoc.name}
              </span>
            </div>
          )}

          {/* Ask AI Quick Trigger */}
          {hasUploadedDoc && (
            <button
              onClick={onOpenChat}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                isChatOpen
                  ? 'bg-amber-400 text-[#01162B] ring-2 ring-amber-300 shadow-md scale-105'
                  : 'bg-[#01162B] text-white hover:bg-[#00385A]'
              }`}
              title="Ask AI about this document"
            >
              <Sparkles className={`h-3.5 w-3.5 ${isChatOpen ? 'text-[#01162B]' : 'text-amber-400'}`} />
              <span className="hidden sm:inline">✦ Ask AI</span>
            </button>
          )}

          {/* Notification Icon */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F4F8] border border-[#D2DBEB] text-[#00385A] hover:bg-[#E2EAF2] transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 text-[#00385A]" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600" />
            </button>

            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[#D2DBEB] bg-white p-3 shadow-xl z-20 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#D2DBEB]/60">
                    <span className="text-xs font-extrabold text-[#01162B]">Notifications</span>
                    <span className="text-[10px] font-bold text-[#6A90B4]">2 New</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-xl bg-[#F0F4F8] flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#01162B]">RAG Analysis Complete</p>
                        <p className="text-[11px] text-[#6A90B4]">Grounded analysis extracted 12 clauses.</p>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-[#F0F4F8] flex items-start gap-2">
                      <Scale className="h-4 w-4 text-[#00385A] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#01162B]">Risk Level Calculated</p>
                        <p className="text-[11px] text-[#6A90B4]">Document passed security verification.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile / Avatar with Name & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-full bg-[#01162B] p-1 pr-3 text-white border border-[#6A90B4]/40 hover:ring-2 hover:ring-[#6A90B4]/50 transition-all cursor-pointer"
              aria-label="User Profile Menu"
              aria-expanded={profileOpen}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00385A] text-white font-bold text-xs">
                {(currentUser?.name || 'User').charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-white max-w-[100px] truncate">
                {currentUser?.name || 'User'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[#94A2BF]" />
            </button>

            {profileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setProfileOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#D2DBEB] bg-white p-2 shadow-xl z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2.5 border-b border-[#D2DBEB]/60 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#01162B] truncate">{currentUser?.name || 'Legal Lens User'}</p>
                      <p className="text-[11px] text-[#6A90B4] truncate">{currentUser?.email || 'user@example.com'}</p>
                    </div>
                    {currentUser?.role === 'admin' && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded-full uppercase border border-amber-200 ml-2">
                        Admin
                      </span>
                    )}
                  </div>

                  <div className="py-1 space-y-0.5">
                    {currentUser?.role === 'admin' && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50/50 hover:bg-amber-100/60 rounded-xl transition-colors text-left"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                        Admin Console
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onNavigate('my-documents');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#00385A] rounded-xl hover:bg-[#F0F4F8] transition-colors text-left"
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
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 rounded-xl hover:bg-red-50 transition-colors text-left font-semibold"
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

      {/* Mobile Sub-Navigation */}
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
              className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
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
