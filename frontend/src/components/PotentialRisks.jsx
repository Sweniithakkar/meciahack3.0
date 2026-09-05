import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  Info, 
  CheckCircle,
  HelpCircle,
  ArrowUpRight
} from 'lucide-react';

export default function PotentialRisks({ risks, onOpenChat }) {
  const [activeFilter, setActiveFilter] = useState('All');

  if (!risks || risks.length === 0) return null;

  const highCount = risks.filter(r => r.level === 'high').length;
  const medCount = risks.filter(r => r.level === 'medium').length;
  const lowCount = risks.filter(r => r.level === 'low').length;

  const filteredRisks = risks.filter(r => {
    if (activeFilter === 'High') return r.level === 'high';
    if (activeFilter === 'Medium') return r.level === 'medium';
    if (activeFilter === 'Low') return r.level === 'low';
    return true;
  });

  return (
    <section id="potential-risks" className="mb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            </span>
            <h3 className="text-xl font-extrabold tracking-tight text-[#01162B]">
              Potential Areas of Concern
            </h3>
          </div>
          <p className="text-xs text-[#6A90B4] mt-0.5">
            Clauses with elevated financial, career, or operational liabilities requiring careful review.
          </p>
        </div>

        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 bg-[#F0F4F8] p-1 rounded-xl border border-[#D2DBEB]/60 self-start sm:self-center">
          <button
            onClick={() => setActiveFilter('All')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeFilter === 'All'
                ? 'bg-white text-[#01162B] shadow-2xs'
                : 'text-[#00385A] hover:text-[#01162B]'
            }`}
          >
            All ({risks.length})
          </button>
          {highCount > 0 && (
            <button
              onClick={() => setActiveFilter('High')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === 'High'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-red-700 hover:bg-red-50'
              }`}
            >
              High ({highCount})
            </button>
          )}
          {medCount > 0 && (
            <button
              onClick={() => setActiveFilter('Medium')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === 'Medium'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              Medium ({medCount})
            </button>
          )}
          {lowCount > 0 && (
            <button
              onClick={() => setActiveFilter('Low')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === 'Low'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Low ({lowCount})
            </button>
          )}
        </div>
      </div>

      {/* Risk Cards Grid (3 Columns on Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredRisks.map((risk) => {
          const isHigh = risk.level === 'high';
          const isMed = risk.level === 'medium';
          const isLow = risk.level === 'low';

          return (
            <div
              key={risk.id}
              className={`clause-card-hover group relative flex flex-col justify-between rounded-2xl bg-white p-5 border shadow-2xs transition-all duration-300 ${
                isHigh
                  ? 'border-red-200 hover:border-red-400'
                  : isMed
                  ? 'border-amber-200 hover:border-amber-400'
                  : 'border-emerald-200 hover:border-emerald-400'
              }`}
            >
              <div>
                {/* Severity Badge & Clause Ref */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`clause-tag inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isHigh
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : isMed
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      isHigh ? 'bg-red-600' : isMed ? 'bg-amber-600' : 'bg-emerald-600'
                    }`} />
                    {risk.severity}
                  </span>

                  <span className="clause-page text-xs font-mono font-medium text-[#6A90B4]">
                    Page {risk.page}
                  </span>
                </div>

                {/* Risk Title */}
                <h4 className="clause-title text-base font-bold text-[#01162B] mb-2 leading-snug">
                  {risk.title}
                </h4>

                {/* Explanation */}
                <p className="clause-desc text-xs text-[#00385A]/80 leading-relaxed mb-3">
                  {risk.explanation}
                </p>

                {/* Recommendation box */}
                {risk.recommendation && (
                  <div className="rounded-xl bg-[#F0F4F8] p-2.5 border border-[#D2DBEB]/60 group-hover:bg-[#00385A]/60 group-hover:border-[#6A90B4]/40 transition-colors">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6A90B4] group-hover:text-[#A2C4D9] mb-0.5">
                      Suggested Action:
                    </p>
                    <p className="text-xs text-[#00385A] group-hover:text-[#D2DBEB] leading-snug">
                      {risk.recommendation}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer: Quick Action to Ask AI */}
              <div className="mt-4 pt-3 border-t border-[#D2DBEB]/50 group-hover:border-[#6A90B4]/30 flex items-center justify-between">
                <span className="text-[11px] text-[#94A2BF] group-hover:text-[#A2C4D9]">
                  {risk.clauseRef || 'Risk Analysis'}
                </span>

                <button
                  type="button"
                  onClick={() => onOpenChat && onOpenChat(`How should I negotiate or address: ${risk.title}?`)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6A90B4] group-hover:text-white transition-colors"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Ask AI</span>
                  <ArrowUpRight className="h-3 w-3 ml-0.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
}

