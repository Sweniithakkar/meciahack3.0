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

  const filteredRisks = risks.filter(r => {
    const lvl = (r.level || r.severity || '').toLowerCase();
    if (activeFilter === 'High') return lvl.includes('high');
    if (activeFilter === 'Medium') return lvl.includes('medium') || lvl.includes('med');
    if (activeFilter === 'Low') return lvl.includes('low');
    return true;
  });

  return (
    <section id="potential-risks" className="mb-10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-red-500/15 text-red-600 border border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </span>
            <h3 className="text-xl font-extrabold tracking-tight text-[#01162B]">
              Risky Clauses
            </h3>
          </div>
          <p className="text-xs text-[#6A90B4] mt-0.5">
            Detailed breakdown of potential financial, operational, or exit risks found in your document.
          </p>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#F0F4F8] p-1 rounded-xl border border-[#D2DBEB]/60 self-start sm:self-center">
          {['All', 'High', 'Medium', 'Low'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-[#01162B] text-white shadow-2xs'
                  : 'text-[#00385A] hover:text-[#01162B]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* RISKY CLAUSES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredRisks.map((risk, idx) => {
          const lvl = (risk.level || risk.severity || '').toLowerCase();
          const isHigh = lvl.includes('high') || (risk.severity_score >= 8);
          const isMed = lvl.includes('medium') || lvl.includes('med') || (risk.severity_score >= 5);
          const severityScore = risk.severity_score || (isHigh ? '8/10' : isMed ? '5/10' : '2/10');

          return (
            <div
              key={risk.id || idx}
              className={`clause-card-hover group relative flex flex-col justify-between rounded-3xl bg-white p-6 border shadow-2xs transition-all duration-300 ${
                isHigh
                  ? 'border-red-200 hover:border-red-400'
                  : isMed
                  ? 'border-amber-200 hover:border-amber-400'
                  : 'border-emerald-200 hover:border-emerald-400'
              }`}
            >
              <div>
                {/* Risk Badge (🔴 High / 🟡 Medium / 🟢 Low) */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`clause-tag inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider ${
                      isHigh
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : isMed
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    <span>{isHigh ? '🔴 High Risk' : isMed ? '🟡 Medium Risk' : '🟢 Low Risk'}</span>
                  </span>

                  <span className="clause-page text-xs font-mono font-bold text-[#6A90B4]">
                    Severity: {severityScore}
                  </span>
                </div>

                {/* Clause Title */}
                <h4 className="clause-title text-base font-bold text-[#01162B] mb-2 leading-snug">
                  {risk.title || risk.clause_title || 'Contractual Liability Provision'}
                </h4>

                {/* Short Explanation */}
                <p className="clause-desc text-xs text-[#00385A]/80 leading-relaxed mb-3">
                  {risk.explanation || risk.description || 'This clause imposes specific requirements or obligations.'}
                </p>

                {/* Why It Matters */}
                <div className="rounded-2xl bg-[#F0F4F8] p-3 border border-[#D2DBEB]/60 group-hover:bg-[#00385A]/60 group-hover:border-[#6A90B4]/40 transition-colors mb-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#6A90B4] group-hover:text-[#A2C4D9] mb-0.5">
                    Why it matters:
                  </p>
                  <p className="text-xs text-[#00385A] group-hover:text-[#D2DBEB] leading-snug">
                    {risk.why_it_matters || risk.impact || 'Binds you to legal or financial terms that limit your flexibility.'}
                  </p>
                </div>

                {/* Suggested Action */}
                {risk.recommendation && (
                  <div className="rounded-2xl bg-amber-50/70 p-3 border border-amber-200 group-hover:bg-amber-900/30 transition-colors">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 group-hover:text-amber-200 mb-0.5">
                      Suggested action:
                    </p>
                    <p className="text-xs text-amber-900 group-hover:text-amber-100 leading-snug font-medium">
                      {risk.recommendation}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-[#D2DBEB]/50 group-hover:border-[#6A90B4]/30 flex items-center justify-between">
                <span className="text-[11px] text-[#94A2BF] group-hover:text-[#A2C4D9] font-mono">
                  {risk.clauseRef || `Page ${risk.page || '1'}`}
                </span>

                <button
                  type="button"
                  onClick={() => onOpenChat && onOpenChat(`How can I negotiate or modify: ${risk.title}?`)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6A90B4] group-hover:text-white transition-colors cursor-pointer"
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
