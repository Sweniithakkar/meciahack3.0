import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Download, 
  Trash2, 
  Calendar, 
  Clock, 
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Eye,
  MessageSquare,
  MoreVertical,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { apiService } from '../services/apiService';

export default function MyDocumentsView({
  documentsList,
  currentDoc,
  onSelectDocument,
  onDeleteDocument,
  onNewDocument,
  onDownloadReport
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All'); // 'All' | 'High Risk' | 'Medium Risk' | 'Low Risk'

  const filteredDocs = (documentsList || []).filter(doc => {
    const nameMatch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      doc.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (doc.type || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!nameMatch) return false;

    const isHigh = doc.riskLevel === 'High' || doc.risk_classification === 'High Risk' || (doc.risk_level >= 8);
    const isMed = doc.riskLevel === 'Medium' || doc.risk_classification === 'Medium Risk' || (doc.risk_level >= 5 && doc.risk_level <= 7);
    const isLow = !isHigh && !isMed;

    if (riskFilter === 'High Risk') return isHigh;
    if (riskFilter === 'Medium Risk') return isMed;
    if (riskFilter === 'Low Risk') return isLow;

    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 animate-in fade-in duration-200 space-y-6">
      
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#D2DBEB]/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#01162B]">
              My Documents
            </h2>
            <span className="rounded-full bg-[#01162B] px-2.5 py-0.5 text-xs font-bold text-white">
              {documentsList?.length || 0} Files
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#00385A]/80 mt-1">
            Access your uploaded documents and analysis history.
          </p>
        </div>

        <button
          onClick={onNewDocument}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#01162B] hover:bg-[#00385A] px-5 py-2.5 text-xs font-bold text-white transition-all shadow-sm cursor-pointer self-start md:self-auto"
        >
          <Plus className="h-4 w-4 text-[#6A90B4]" />
          <span>+ Upload Document</span>
        </button>
      </div>

      {/* SEARCH BAR & RISK FILTERS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#D2DBEB]/80 shadow-2xs">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A2BF]" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#F8FAFC] border border-[#D2DBEB] focus:outline-hidden focus:ring-2 focus:ring-[#00385A] text-[#01162B]"
          />
        </div>

        {/* Filter Pills: All, High Risk, Medium Risk, Low Risk */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-[#6A90B4] uppercase tracking-wider mr-1 hidden lg:inline">Filter:</span>
          {['All', 'High Risk', 'Medium Risk', 'Low Risk'].map((filter) => (
            <button
              key={filter}
              onClick={() => setRiskFilter(filter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                riskFilter === filter
                  ? 'bg-[#01162B] text-white shadow-2xs'
                  : 'bg-[#F0F4F8] text-[#00385A] border border-[#D2DBEB] hover:bg-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

      </div>

      {/* GITHUB REPOSITORY STYLE FILE BROWSER LIST */}
      <div className="rounded-3xl bg-white border border-[#D2DBEB]/80 shadow-md overflow-hidden">
        
        {/* Table Header Bar */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-[#F0F4F8] border-b border-[#D2DBEB]/80 text-[11px] font-extrabold uppercase tracking-wider text-[#6A90B4]">
          <div className="col-span-5">Document Name</div>
          <div className="col-span-3">Type &amp; Analyzed Time</div>
          <div className="col-span-2">Risk Level</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* File Rows */}
        <div className="divide-y divide-[#D2DBEB]/60">
          {filteredDocs.map((doc) => {
            const isCurrent = currentDoc?.id === doc.id;
            const isHigh = doc.riskLevel === 'High' || doc.risk_classification === 'High Risk' || (doc.risk_level >= 8);
            const isMed = doc.riskLevel === 'Medium' || doc.risk_classification === 'Medium Risk' || (doc.risk_level >= 5 && doc.risk_level <= 7);

            return (
              <div
                key={doc.id}
                className={`flex flex-col md:grid md:grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-[#F8FAFC] ${
                  isCurrent ? 'bg-[#F0F4F8]/80 font-medium' : ''
                }`}
              >
                {/* Col 1: PDF Icon & Filename */}
                <div className="col-span-5 flex items-center gap-3 w-full min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#01162B] text-white shadow-xs">
                    <FileText className="h-5 w-5 text-[#6A90B4]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#01162B] truncate" title={doc.name}>
                        {doc.name}
                      </p>
                      {isCurrent && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6A90B4] truncate">
                      {doc.fileSize || '1.5 MB'} · PDF Document
                    </p>
                  </div>
                </div>

                {/* Col 2: Document Type & Time */}
                <div className="col-span-3 w-full">
                  <p className="text-xs font-semibold text-[#00385A]">
                    {doc.type}
                  </p>
                  <p className="text-[11px] text-[#94A2BF]">
                    Analyzed {doc.uploadDate || 'recently'}
                  </p>
                </div>

                {/* Col 3: Risk Level Badge */}
                <div className="col-span-2 w-full">
                  <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
                    isHigh
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : isMed
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${isHigh ? 'bg-red-600' : isMed ? 'bg-amber-600' : 'bg-emerald-600'}`} />
                    {doc.riskScore || `${doc.riskLevel || 'Low'} Risk`}
                  </span>
                </div>

                {/* Col 4: Actions (View, Chat, Download, Delete) */}
                <div className="col-span-2 flex items-center justify-end gap-1.5 w-full">
                  <button
                    onClick={() => onSelectDocument(doc.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#01162B] hover:bg-[#00385A] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    title="View Analysis"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectDocument(doc.id);
                      setTimeout(() => {
                        document.getElementById('legal-lens-assistant')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    className="p-1.5 text-[#00385A] hover:text-[#01162B] rounded-lg hover:bg-[#F0F4F8] transition-colors cursor-pointer"
                    title="Chat with AI"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onDownloadReport(doc)}
                    className="p-1.5 text-[#00385A] hover:text-[#01162B] rounded-lg hover:bg-[#F0F4F8] transition-colors cursor-pointer"
                    title="Download Report"
                  >
                    <Download className="h-4 w-4" />
                  </button>

                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const docName = doc.displayName || doc.name || 'document';
                      if (window.confirm(`Are you sure you want to delete "${docName}"? This action cannot be undone.`)) {
                        if (onDeleteDocument) {
                          await onDeleteDocument(doc.id);
                        } else {
                          const res = await apiService.deleteDocument(doc.id);
                          if (res && res.success) {
                            window.location.reload();
                          } else {
                            alert(`Failed to delete document: ${res?.error || 'Server error'}`);
                          }
                        }
                      }
                    }}
                    className="p-1.5 text-[#6A90B4] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredDocs.length === 0 && (
          <div className="p-12 text-center my-4">
            <FileText className="mx-auto h-12 w-12 text-[#94A2BF] mb-3" />
            <h3 className="text-base font-bold text-[#01162B]">No documents found</h3>
            <p className="text-xs text-[#00385A]/80 mt-1 max-w-sm mx-auto">
              No agreements matched your criteria. Upload your first legal document or adjust your search filters.
            </p>
            <button
              onClick={onNewDocument}
              className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#01162B] rounded-xl hover:bg-[#00385A] transition-colors cursor-pointer"
            >
              + Upload Document
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
