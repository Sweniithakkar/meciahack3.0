import React, { useState, useEffect } from 'react';
import {
  Check,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BeforeYouSign({
  checklist: initialChecklist,
  onOpenChat
}) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (initialChecklist && initialChecklist.length > 0) {
      setItems(initialChecklist.map((item, idx) => {
        if (typeof item === 'object' && item !== null) {
          return {
            id: item.id || `chk-${idx}`,
            group: item.group || (idx % 3 === 0 ? 'needsAttention' : idx % 3 === 1 ? 'reviewCarefully' : 'goodToCheck'),
            text: item.text || item.item || 'Verify clause terms',
            checked: item.checked || item.defaultChecked || false
          };
        }
        return {
          id: `chk-${idx}`,
          group: idx % 3 === 0 ? 'needsAttention' : idx % 3 === 1 ? 'reviewCarefully' : 'goodToCheck',
          text: String(item),
          checked: false
        };
      }));
    } else {
      // Default fallback items matching Screenshot 2
      setItems([
        { id: '1', group: 'needsAttention', text: 'Review the notice period terms.', checked: true },
        { id: '2', group: 'needsAttention', text: 'Understand the penalty clause.', checked: true },
        { id: '3', group: 'needsAttention', text: 'Check termination conditions.', checked: false },
        { id: '4', group: 'reviewCarefully', text: 'Verify liability and bond conditions.', checked: true },
        { id: '5', group: 'reviewCarefully', text: 'Clarify roles and responsibilities.', checked: false },
        { id: '6', group: 'reviewCarefully', text: 'Check financial/payment structure.', checked: false },
        { id: '7', group: 'goodToCheck', text: 'Understand confidentiality obligations.', checked: false },
        { id: '8', group: 'goodToCheck', text: 'Check renewal and lock-in period.', checked: false },
        { id: '9', group: 'goodToCheck', text: 'Review dispute resolution process.', checked: false },
      ]);
    }
  }, [initialChecklist]);

  // Groupings with fallback fallback matching
  let needsAttention = items.filter(i => i.group === 'needsAttention');
  let reviewCarefully = items.filter(i => i.group === 'reviewCarefully');
  let goodToCheck = items.filter(i => i.group === 'goodToCheck');

  if (needsAttention.length === 0 && items.length > 0) needsAttention = items.slice(0, Math.ceil(items.length / 3));
  if (reviewCarefully.length === 0 && items.length > 1) reviewCarefully = items.slice(Math.ceil(items.length / 3), Math.ceil((items.length * 2) / 3));
  if (goodToCheck.length === 0 && items.length > 2) goodToCheck = items.slice(Math.ceil((items.length * 2) / 3));

  const totalItems = items.length;
  const completedItems = items.filter(i => i.checked).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const toggleCheck = (id) => {
    const nextItems = items.map(item => {
      if (item.id === id) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });

    setItems(nextItems);

    // If reaching 100%, trigger subtle celebratory confetti
    const nextCompleted = nextItems.filter(i => i.checked).length;
    if (nextCompleted === totalItems && totalItems > 0) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#01162B', '#2563EB', '#10B981', '#F59E0B']
        });
      } catch (err) { }
    }
  };

  const renderGroup = (groupTitle, groupItems, dotColor, bgColor) => {
    return (
      <div className={`rounded-2xl ${bgColor} p-5 border border-[#E2EAF2] flex flex-col justify-start`}>
        {/* Group Header */}
        <div className="flex items-center gap-2 pb-3 mb-3">
          <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
          <h4 className="text-sm font-bold text-[#01162B] tracking-tight">
            {groupTitle}
          </h4>
        </div>

        {/* Group Items */}
        <div className="space-y-3">
          {groupItems.map((item) => {
            const isChecked = item.checked;
            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className="flex items-start gap-3 cursor-pointer select-none group"
              >
                <div className="mt-0.5 shrink-0">
                  {isChecked ? (
                    <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-[#2563EB] text-white shadow-2xs">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="h-4 w-4 rounded-sm border border-[#94A2BF] bg-white group-hover:border-[#2563EB] transition-colors" />
                  )}
                </div>

                <div className="overflow-hidden min-w-0">
                  <p className={`text-xs leading-snug transition-all ${isChecked ? 'text-[#01162B] font-medium' : 'text-[#4A5568]'
                    }`}>
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section id="before-you-sign" className="pt-2">

      {/* Header & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-extrabold tracking-tight text-[#01162B]">
            Before You Sign
          </h3>
          <p className="text-xs text-[#6A90B4] mt-1">
            A checklist of important things you should review before signing this document.
          </p>
        </div>

        {/* Live Dynamic Progress Box */}
        <div className="min-w-[220px]">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-[#01162B]">Progress</span>
            <span className="font-mono text-[#01162B]">{completedItems} / {totalItems} items reviewed</span>
          </div>

          <div className="h-2 w-full rounded-full bg-[#E2E8F0] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#22C55E] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3-Column Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {renderGroup('Needs Attention', needsAttention, 'bg-red-500', 'bg-[#FFF8F8]')}
        {renderGroup('Review Carefully', reviewCarefully, 'bg-amber-500', 'bg-[#FFFDF6]')}
        {renderGroup('Good to Check', goodToCheck, 'bg-emerald-500', 'bg-[#F6FFF8]')}
      </div>

      {/* Questions You May Want to Ask Box with Illustration */}
      <div className="rounded-2xl bg-[#F4F8FC] border border-[#DCE7F3] p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-6 shadow-2xs">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-[#01162B] mb-3">
            Questions You May Want to Ask
          </h4>
          <ul className="space-y-2 text-xs text-[#01162B]">
            <li
              onClick={() => onOpenChat && onOpenChat('Can the notice period be reduced?')}
              className="flex items-center gap-2 hover:text-[#2563EB] cursor-pointer transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#01162B]" />
              <span>Can the notice period be reduced?</span>
            </li>
            <li
              onClick={() => onOpenChat && onOpenChat('When does the penalty apply?')}
              className="flex items-center gap-2 hover:text-[#2563EB] cursor-pointer transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#01162B]" />
              <span>When does the penalty apply?</span>
            </li>
            <li
              onClick={() => onOpenChat && onOpenChat('What happens if I leave before the bond period?')}
              className="flex items-center gap-2 hover:text-[#2563EB] cursor-pointer transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#01162B]" />
              <span>What happens if I leave before the bond period?</span>
            </li>
          </ul>
        </div>

        {/* Clipboard & Pen Illustration SVG */}
        <div className="shrink-0 flex items-center justify-center w-28 h-28">
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="20" width="70" height="90" rx="10" fill="#E2E8F0" />
            <rect x="30" y="25" width="60" height="80" rx="6" fill="#FFFFFF" />
            <rect x="42" y="14" width="36" height="12" rx="4" fill="#64748B" />
            <circle cx="60" cy="20" r="3" fill="#FFFFFF" />
            {/* Checklist items lines */}
            <path d="M40 42L44 46L52 38" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="58" y="40" width="24" height="4" rx="2" fill="#94A2BF" />
            <path d="M40 60L44 64L52 56" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="58" y="58" width="24" height="4" rx="2" fill="#94A2BF" />
            <path d="M40 78L44 82L52 74" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="58" y="76" width="24" height="4" rx="2" fill="#94A2BF" />
            {/* Blue pen */}
            <path d="M85 65L98 95L90 98L78 72L85 65Z" fill="#2563EB" />
            <path d="M98 95L99 102L93 99L98 95Z" fill="#1E293B" />
          </svg>
        </div>
      </div>

      {/* Centered Legal Disclaimer matching screenshot */}
      <p className="text-[11px] text-center text-[#94A2BF] leading-relaxed max-w-xl mx-auto">
        This checklist is generated from the uploaded document and is for informational purposes only. It does not constitute legal advice.
      </p>

    </section>
  );
}


