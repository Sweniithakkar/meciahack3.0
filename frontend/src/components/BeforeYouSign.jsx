import React, { useState, useEffect } from 'react';
import {
  Check,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BeforeYouSign({
  checklist: initialChecklist,
  suggestedQuestions,
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
      setItems([
        { id: '1', group: 'needsAttention', text: 'Understand your obligations', checked: true },
        { id: '2', group: 'needsAttention', text: 'Check termination conditions', checked: true },
        { id: '3', group: 'needsAttention', text: 'Review payment/penalty clauses', checked: false },
        { id: '4', group: 'reviewCarefully', text: 'Check notice period', checked: true },
        { id: '5', group: 'reviewCarefully', text: 'Review dispute resolution', checked: false },
        { id: '6', group: 'goodToCheck', text: 'Confirm important dates', checked: false },
      ]);
    }
  }, [initialChecklist]);

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
      <div className={`rounded-3xl ${bgColor} p-6 border border-[#D2DBEB]/80 flex flex-col justify-start space-y-4 shadow-2xs`}>
        <div className="flex items-center gap-2 pb-2 border-b border-[#D2DBEB]/50">
          <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
          <h4 className="text-sm font-extrabold text-[#01162B] tracking-tight">
            {groupTitle}
          </h4>
        </div>

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
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#01162B] text-white shadow-2xs">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-md border-2 border-[#94A2BF] bg-white group-hover:border-[#01162B] transition-colors" />
                  )}
                </div>

                <div className="overflow-hidden min-w-0">
                  <p className={`text-xs leading-snug transition-all ${isChecked ? 'text-[#01162B] font-bold line-through opacity-80' : 'text-[#00385A] font-semibold'
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
    <section id="before-you-sign" className="pt-4 space-y-6">

      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#D2DBEB]/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#00385A]" />
            <h3 className="text-2xl font-extrabold tracking-tight text-[#01162B]">
              Know Before You Sign
            </h3>
          </div>
          <p className="text-xs text-[#6A90B4] mt-1 font-medium">
            A quick review of the most important things to understand before signing.
          </p>
        </div>

        {/* Dynamic Progress Indicator */}
        <div className="min-w-[240px]">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-[#01162B]">Checklist Progress</span>
            <span className="font-mono text-[#01162B]">{completedItems} / {totalItems} reviewed</span>
          </div>

          <div className="h-2.5 w-full rounded-full bg-[#E2E8F0] overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3-Column Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {renderGroup('Needs Attention', needsAttention, 'bg-red-500', 'bg-[#FFF8F8]')}
        {renderGroup('Review Carefully', reviewCarefully, 'bg-amber-500', 'bg-[#FFFDF6]')}
        {renderGroup('Good to Check', goodToCheck, 'bg-emerald-500', 'bg-[#F6FFF8]')}
      </div>

      {/* Recommended Questions Section */}
      {suggestedQuestions && suggestedQuestions.length > 0 && (
        <div id="suggested-questions" className="rounded-3xl bg-white border border-[#D2DBEB]/80 p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex-1 space-y-3">
            <h4 className="text-base font-extrabold text-[#01162B] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Important Questions Based On Your Document
            </h4>
            <div className="space-y-2">
              {suggestedQuestions.slice(0, 4).map((sq, idx) => {
                const qText = typeof sq === 'object' ? (sq.question || sq.text || String(sq)) : String(sq);
                return (
                  <button
                    key={idx}
                    onClick={() => onOpenChat && onOpenChat(qText)}
                    className="w-full text-left flex items-center gap-2.5 p-3 rounded-2xl bg-[#F0F4F8] hover:bg-[#01162B] hover:text-white text-xs font-bold text-[#00385A] transition-all cursor-pointer group"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#6A90B4] group-hover:bg-amber-400" />
                    <span className="flex-1">{qText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[11px] text-center text-[#94A2BF] leading-relaxed max-w-xl mx-auto">
        Legal Lens checklist is generated from document analysis for informational guidance and does not constitute formal legal counsel.
      </p>

    </section>
  );
}
