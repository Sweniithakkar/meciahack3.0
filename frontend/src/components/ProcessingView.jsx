import React from 'react';
import { 
  FileText, 
  Loader2, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  ShieldAlert, 
  CheckSquare, 
  Scale 
} from 'lucide-react';

export default function ProcessingView({ currentStage, fileName, onCancel }) {
  const steps = [
    { title: 'Uploading PDF to sandbox', desc: 'Secure ephemeral isolation & integrity hash check' },
    { title: 'Running OCR & text extraction', desc: 'Parsing digital typography & table structure' },
    { title: 'Classifying legal clauses & obligations', desc: 'Identifying salary, notice, termination, IP terms' },
    { title: 'Detecting potential risks & penalties', desc: 'Comparing against standard contractual benchmarks' },
    { title: 'Formulating plain-language insights', desc: 'Synthesizing Before You Sign checklist & highlights' }
  ];

  // Calculate active step index based on progress
  const progress = currentStage?.progress || 20;
  const activeIndex = progress >= 100 ? 4 : progress >= 80 ? 3 : progress >= 55 ? 2 : progress >= 35 ? 1 : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="rounded-3xl border border-[#D2DBEB] bg-white p-8 sm:p-12 shadow-xl text-center relative overflow-hidden">
        
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#6A90B4]/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#F3D8B8]/20 blur-2xl pointer-events-none" />

        {/* Central pulsing icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#01162B] text-white shadow-lg mb-6 relative">
          <Scale className="h-9 w-9 text-[#6A90B4] animate-pulse" />
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#6A90B4] text-white">
            <Loader2 className="h-4 w-4 animate-spin text-[#01162B]" />
          </div>
        </div>

        {/* Title and Active Status */}
        <h2 className="text-2xl font-bold text-[#01162B] tracking-tight">
          Analyzing your document…
        </h2>

        <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#F0F4F8] px-3.5 py-1.5 border border-[#D2DBEB]">
          <FileText className="h-4 w-4 text-[#6A90B4]" />
          <span className="text-xs font-semibold text-[#00385A] truncate max-w-xs">
            {fileName || 'Legal_Document.pdf'}
          </span>
        </div>

        {/* Progress Bar with animated fill */}
        <div className="mt-8">
          <div className="flex items-center justify-between text-xs font-bold text-[#00385A] mb-2">
            <span>{currentStage?.name || 'Processing legal text...'}</span>
            <span className="text-[#01162B] font-mono">{progress}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[#E2E8F0] overflow-hidden p-0.5 border border-[#D2DBEB]/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00385A] via-[#6A90B4] to-[#01162B] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Multi-stage Checklist Progression */}
        <div className="mt-8 space-y-3 text-left border-t border-[#D2DBEB]/60 pt-6">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex || progress === 100;
            const isCurrent = idx === activeIndex && progress < 100;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 rounded-xl p-2.5 transition-all ${
                  isCurrent 
                    ? 'bg-[#F0F4F8] border border-[#6A90B4]/40 scale-[1.01]' 
                    : isCompleted 
                    ? 'opacity-80' 
                    : 'opacity-40'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 text-[#00385A] animate-spin" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-[#CBD5E1]" />
                  )}
                </div>
                <div>
                  <p className={`text-xs font-bold ${isCurrent ? 'text-[#01162B]' : 'text-[#00385A]'}`}>
                    {step.title}
                  </p>
                  <p className="text-[11px] text-[#6A90B4]">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cancel button */}
        <div className="mt-8">
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-[#94A2BF] hover:text-[#01162B] transition-colors focus:outline-hidden"
          >
            Cancel Analysis
          </button>
        </div>

      </div>
    </div>
  );
}

