import React, { useState } from 'react';
import { 
  FileText, 
  ChevronRight, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Scale, 
  Sparkles,
  Info,
  DollarSign,
  Clock,
  Briefcase,
  Lock,
  Flame,
  FileCode
} from 'lucide-react';

export default function ImportantClauses({ clauses, onSelectClause }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAll, setShowAll] = useState(false);

  if (!clauses || clauses.length === 0) return null;

  // Extract categories
  const categories = ['All', ...new Set(clauses.map(c => c.category))];

  // Filter clauses
  const filteredClauses = clauses.filter(c => {
    if (selectedCategory === 'All') return true;
    return c.category === selectedCategory;
  });

  const displayedClauses = showAll ? filteredClauses : filteredClauses.slice(0, 6);

  // Helper icon for clause
  const getClauseIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('salary') || t.includes('compensation')) return <DollarSign className="h-4 w-4" />;
    if (t.includes('notice')) return <Clock className="h-4 w-4" />;
    if (t.includes('termination')) return <AlertCircle className="h-4 w-4" />;
    if (t.includes('confidential')) return <Lock className="h-4 w-4" />;
    if (t.includes('penalty') || t.includes('damages')) return <Flame className="h-4 w-4 text-amber-400" />;
    if (t.includes('bond') || t.includes('lock')) return <ShieldCheck className="h-4 w-4 text-red-400" />;
    if (t.includes('intellectual') || t.includes('ip')) return <FileCode className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <section id="important-clauses" className="mb-10">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#00385A] text-[#6A90B4]">
              <Scale className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-xl font-extrabold tracking-tight text-[#01162B]">
              Important Clauses
            </h3>
          </div>
          <p className="text-xs text-[#6A90B4] mt-0.5">
            Key contractual provisions extracted and translated into plain English. Click any card to inspect legal text.
          </p>
        </div>

        {/* View All Toggle */}
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs font-bold text-[#00385A] hover:text-[#01162B] hover:underline self-start sm:self-center transition-all"
        >
          {showAll ? 'Show top clauses' : `View all (${clauses.length})`}
        </button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#01162B] text-white shadow-xs'
                : 'bg-white text-[#00385A] border border-[#D2DBEB] hover:bg-[#F0F4F8]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3-Column Clause Cards Grid with Mandatory Premium Hover Effect */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayedClauses.map((clause) => (
          <div
            key={clause.id}
            onClick={() => onSelectClause && onSelectClause(clause)}
            className="clause-card-hover group relative flex flex-col justify-between rounded-2xl bg-white p-5 border border-[#D2DBEB]/80 shadow-2xs cursor-pointer transition-all duration-300 select-none overflow-hidden"
          >
            {/* Top row: Icon, Title, Importance Tag */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="clause-icon flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0F4F8] text-[#00385A] transition-colors duration-300">
                  {getClauseIcon(clause.title)}
                </div>

                <div className="flex items-center gap-1.5">
                  {clause.risk === 'High' && (
                    <span className="clause-tag inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200 transition-colors">
                      High Impact
                    </span>
                  )}
                  {clause.risk === 'Medium' && (
                    <span className="clause-tag inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 transition-colors">
                      Caution
                    </span>
                  )}
                  {clause.risk === 'Low' && (
                    <span className="clause-tag inline-flex items-center rounded-md bg-[#F0F4F8] px-2 py-0.5 text-[10px] font-semibold text-[#00385A] border border-[#D2DBEB] transition-colors">
                      Standard
                    </span>
                  )}
                </div>
              </div>

              {/* Clause Title */}
              <h4 className="clause-title text-base font-bold text-[#01162B] transition-colors duration-300 mb-1.5">
                {clause.title}
              </h4>

              {/* Short explanation */}
              <p className="clause-desc text-xs text-[#00385A]/80 leading-relaxed transition-colors duration-300">
                {clause.shortDesc}
              </p>
            </div>

            {/* Bottom row: Page Number & Details Link */}
            <div className="mt-4 pt-3 border-t border-[#D2DBEB]/50 group-hover:border-[#6A90B4]/30 flex items-center justify-between transition-colors">
              <span className="clause-page text-xs font-mono font-medium text-[#6A90B4] transition-colors duration-300">
                Page {clause.page}
              </span>
              
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6A90B4] group-hover:text-white transition-colors">
                <span>Inspect</span>
                <ChevronRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
}

