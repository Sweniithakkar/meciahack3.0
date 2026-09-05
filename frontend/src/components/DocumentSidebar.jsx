import React from 'react';
import { 
  Scale, 
  Plus, 
  FileText, 
  LogOut, 
  ChevronRight
} from 'lucide-react';

export default function DocumentSidebar({
  currentDoc,
  documentsList,
  onSelectDocument,
  onNewDocument,
  onReset
}) {
  return (
    <aside className="w-full md:w-56 lg:w-56 shrink-0 bg-[#01162B] text-white p-4 sm:p-5 flex flex-col justify-between self-stretch">
      <div className="flex-1 flex flex-col">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00385A] text-[#6A90B4] shadow-xs">
            <Scale className="h-5 w-5 text-[#6A90B4]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white leading-tight">
              LEGAL LENS
            </h1>
          </div>
        </div>

        {/* New Document Action Button (Vibrant Blue as in screenshot) */}
        <div className="mb-6">
          <button
            onClick={onNewDocument}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] py-2.5 px-4 text-xs font-bold text-white shadow-md transition-all focus:outline-hidden active:scale-98"
          >
            <Plus className="h-4 w-4" />
            <span>New Document</span>
          </button>
        </div>

        {/* Current Document Section */}
        <div className="space-y-2 mb-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A2BF]">
            Current Document
          </p>
          
          {currentDoc && (
            <div className="flex items-center gap-3 rounded-xl bg-[#00385A]/90 p-3 border border-[#6A90B4]/40 shadow-xs">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#01162B] text-white shrink-0">
                <FileText className="h-4 w-4 text-[#D2DBEB]" />
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-semibold text-white truncate" title={currentDoc.name}>
                  {currentDoc.name}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Document History List */}
        <div className="space-y-2 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A2BF]">
            Document History
          </p>

          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {documentsList && documentsList.map((doc) => {
              const isSelected = currentDoc?.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => onSelectDocument(doc.id)}
                  className={`w-full flex items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-colors group ${
                    isSelected
                      ? 'bg-[#00385A] text-white font-semibold'
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

      {/* Logout / Exit at Bottom */}
      <div className="pt-6 border-t border-[#00385A]/80 mt-auto">
        <button
          onClick={onReset}
          className="w-full flex items-center gap-2 text-xs font-medium text-[#94A2BF] hover:text-white transition-colors py-1 focus:outline-hidden"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
}



