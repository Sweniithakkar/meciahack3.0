import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Download, 
  ExternalLink, 
  Trash2, 
  Calendar, 
  Clock, 
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function MyDocumentsView({
  documentsList,
  currentDoc,
  onSelectDocument,
  onNewDocument,
  onDownloadReport
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Employment Contract', 'Rental Agreement', 'NDA Document'];

  const filteredDocs = (documentsList || []).filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || doc.type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-8 animate-in fade-in duration-200">
      
      {/* Top Header & Search Bar */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#01162B]">
            My Documents
          </h2>
          <p className="text-xs sm:text-sm text-[#00385A]/80 mt-1">
            Manage your legal document library, view historical AI analyses, and compare contract terms.
          </p>
        </div>

        {/* Upload New Document CTA */}
        <button
          onClick={onNewDocument}
          className="inline-flex items-center gap-2 rounded-xl bg-[#00385A] hover:bg-[#01162B] px-5 py-2.5 text-xs font-bold text-white transition-all shadow-xs self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Upload New Document</span>
        </button>
      </div>

      {/* Search & Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A2BF]" />
          <input
            type="text"
            placeholder="Search documents by name or keyword…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white border border-[#D2DBEB] focus:outline-hidden focus:ring-1 focus:ring-[#00385A] placeholder-[#94A2BF]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-[#01162B] text-white shadow-2xs'
                  : 'bg-white text-[#00385A] border border-[#D2DBEB] hover:bg-[#F0F4F8]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => {
          const isCurrent = currentDoc?.id === doc.id;
          const isHigh = doc.riskLevel === 'High';
          const isMed = doc.riskLevel === 'Medium';

          return (
            <div
              key={doc.id}
              className={`rounded-2xl bg-white p-5 border transition-all flex flex-col justify-between shadow-2xs hover:shadow-md ${
                isCurrent 
                  ? 'border-[#6A90B4] ring-2 ring-[#6A90B4]/20' 
                  : 'border-[#D2DBEB]/80 hover:border-[#6A90B4]'
              }`}
            >
              <div>
                {/* Header: File icon & Risk pill */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0F4F8] text-[#00385A] border border-[#D2DBEB]">
                    <FileText className="h-5 w-5 text-[#6A90B4]" />
                  </div>

                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      isHigh
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : isMed
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {doc.riskScore || `${doc.riskLevel} Risk`}
                  </span>
                </div>

                {/* Doc Name & Type */}
                <h3 className="text-base font-bold text-[#01162B] mb-1 truncate" title={doc.name}>
                  {doc.name}
                </h3>
                <p className="text-xs text-[#6A90B4] font-medium mb-3">
                  {doc.type}
                </p>

                {/* Summary snippet */}
                <p className="text-xs text-[#00385A]/80 line-clamp-2 leading-relaxed mb-4">
                  {doc.executiveSummary || doc.summaryHighlight?.takeaway || doc.simpleSummary?.text || 'Legal document analyzed by Legal Lens RAG Pipeline.'}
                </p>

                {/* Metadata details */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#94A2BF] pt-3 border-t border-[#D2DBEB]/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {doc.uploadDate || 'Just now'}
                  </span>
                  <span>·</span>
                  <span>{doc.fileSize || '1.5 MB'}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-[#D2DBEB]/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectDocument(doc.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#01162B] text-white shadow-2xs'
                      : 'bg-[#F0F4F8] text-[#00385A] hover:bg-[#00385A] hover:text-white'
                  }`}
                >
                  <span>{isCurrent ? 'Viewing Active' : 'Open Analysis'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDownloadReport(doc)}
                    className="p-1.5 text-[#6A90B4] hover:text-[#01162B] rounded-lg hover:bg-[#F0F4F8] transition-colors"
                    title="Download Report"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to delete ${doc.name}?`)) {
                        await apiService.deleteDocument(doc.id);
                        window.location.reload();
                      }
                    }}
                    className="p-1.5 text-[#6A90B4] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDocs.length === 0 && (
        <div className="rounded-3xl border border-[#D2DBEB] bg-white p-12 text-center my-8">
          <FileText className="mx-auto h-12 w-12 text-[#94A2BF] mb-3" />
          <h3 className="text-base font-bold text-[#01162B]">No documents found</h3>
          <p className="text-xs text-[#00385A]/80 mt-1 max-w-sm mx-auto">
            No agreements matched "{searchTerm}". Try a different keyword or upload a new file.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('All');
            }}
            className="mt-4 px-4 py-2 text-xs font-bold text-[#00385A] bg-[#F0F4F8] rounded-xl hover:bg-[#D2DBEB] transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

    </div>
  );
}

