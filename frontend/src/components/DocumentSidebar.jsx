import React from 'react';
import { 
  Scale, 
  Home, 
  FolderOpen, 
  BarChart3, 
  MessageSquare, 
  Sparkles, 
  Settings, 
  Plus, 
  FileText, 
  ChevronRight, 
  LogOut 
} from 'lucide-react';

export default function DocumentSidebar({
  currentDoc,
  documentsList,
  onSelectDocument,
  onNewDocument,
  onReset,
  onOpenChat
}) {
  return (
    <aside className="w-full md:w-60 lg:w-60 shrink-0 bg-[#01162B] text-white p-4 sm:p-5 flex flex-col justify-between self-stretch border-r border-[#00385A]/60">
      <div className="flex-1 flex flex-col">
        
        {/* Logo Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-[#00385A]/70 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00385A] text-[#6A90B4] shadow-xs">
            <Scale className="h-5 w-5 text-[#6A90B4]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white leading-tight">
              Legal Lens
            </h1>
            <p className="text-[10px] text-[#6A90B4] font-medium">Contract Sandbox</p>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="mb-6">
          <button
            onClick={onNewDocument}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] py-2.5 px-4 text-xs font-bold text-white shadow-md transition-all focus:outline-hidden active:scale-98 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="space-y-1 mb-6">
          <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A2BF]">
            Navigation
          </p>

          <button
            onClick={() => onSelectDocument && currentDoc?.id && onSelectDocument(currentDoc.id)}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-white bg-[#00385A] border border-[#6A90B4]/40 shadow-xs cursor-pointer"
          >
            <BarChart3 className="h-4 w-4 text-[#6A90B4]" />
            <span>◉ Analysis</span>
          </button>

          <button
            onClick={() => onOpenChat ? onOpenChat() : null}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#C9D3DD] hover:bg-[#00385A]/40 hover:text-white transition-colors cursor-pointer"
          >
            <MessageSquare className="h-4 w-4 text-[#94A2BF]" />
            <span>◌ Chat</span>
          </button>

          <button
            onClick={() => onOpenChat ? onOpenChat() : null}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#C9D3DD] hover:bg-[#00385A]/40 hover:text-white transition-colors cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>✦ Recommended Questions</span>
          </button>
        </div>

        {/* Document History Drawer */}
        <div className="space-y-2 flex-1">
          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#94A2BF]">
            My Documents ({documentsList?.length || 0})
          </p>

          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
            {documentsList && documentsList.map((doc) => {
              const isSelected = currentDoc?.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => onSelectDocument(doc.id)}
                  className={`w-full flex items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition-all group cursor-pointer ${
                    isSelected
                      ? 'bg-[#00385A] text-white font-bold border border-[#6A90B4]/30'
                      : 'text-[#C9D3DD] hover:bg-[#00385A]/40 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className={`h-4 w-4 shrink-0 ${isSelected ? 'text-[#6A90B4]' : 'text-[#94A2BF] group-hover:text-white'}`} />
                    <span className="truncate">{doc.name}</span>
                  </div>
                  {isSelected && (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#6A90B4]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Settings Link */}
      <div className="pt-4 border-t border-[#00385A]/80 mt-auto flex items-center justify-between">
        <button
          onClick={() => alert('Legal Lens System Settings: Mode set to Grounded RAG 3.0.')}
          className="flex items-center gap-2 text-xs font-semibold text-[#94A2BF] hover:text-white transition-colors py-1 cursor-pointer"
        >
          <Settings className="h-4 w-4" />
          <span>⚙ Settings</span>
        </button>

        <button
          onClick={onReset}
          className="p-1 text-[#94A2BF] hover:text-white transition-colors cursor-pointer"
          title="Exit analysis"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

    </aside>
  );
}
