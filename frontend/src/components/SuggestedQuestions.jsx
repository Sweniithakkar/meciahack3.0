import React from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  MessageSquare, 
  ChevronRight, 
  FileCheck2,
  FileQuestion
} from 'lucide-react';

export default function SuggestedQuestions({ 
  suggestedQuestions, 
  onSelectQuestion 
}) {
  if (!suggestedQuestions || suggestedQuestions.length === 0) return null;

  return (
    <section id="suggested-questions" className="mb-12">
      <div className="rounded-3xl bg-gradient-to-r from-white via-[#F0F4F8] to-white p-6 sm:p-8 border border-[#D2DBEB]/90 shadow-sm">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Heading & Questions List */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#00385A] text-[#6A90B4]">
                  <HelpCircle className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-lg font-extrabold tracking-tight text-[#01162B]">
                  Questions You May Want to Ask
                </h3>
              </div>
              <p className="text-xs text-[#00385A]/80">
                Click any AI-recommended question to ask the document-aware assistant:
              </p>
            </div>

            {/* Clickable Question Cards */}
            <div className="space-y-2">
              {suggestedQuestions.map((sq) => (
                <button
                  key={sq.id}
                  onClick={() => onSelectQuestion(sq.question)}
                  className="w-full flex items-center justify-between gap-3 text-left p-3 rounded-xl bg-white border border-[#D2DBEB] hover:border-[#6A90B4] hover:bg-[#F0F4F8] transition-all text-xs font-semibold text-[#01162B] group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#6A90B4] group-hover:bg-[#00385A]" />
                    <span className="group-hover:text-[#00385A] transition-colors">{sq.question}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6A90B4] group-hover:text-[#01162B] shrink-0">
                    <Sparkles className="h-3 w-3" />
                    <span>Ask AI</span>
                    <ChevronRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Graphic / Illustration Box */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center rounded-2xl bg-white p-6 border border-[#D2DBEB] shadow-2xs text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#01162B] text-white shadow-md mb-3">
              <FileQuestion className="h-8 w-8 text-[#6A90B4]" />
            </div>

            <h4 className="text-sm font-bold text-[#01162B]">
              Document-Aware Intelligence
            </h4>
            <p className="text-[11px] text-[#00385A]/80 mt-1 leading-relaxed">
              Every answer is verified against your uploaded contract with exact clause numbers and page citations.
            </p>

            <button
              onClick={() => onSelectQuestion('Explain this document simply.')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#00385A] hover:bg-[#01162B] px-4 py-2 text-xs font-bold text-white transition-all shadow-xs"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Open AI Assistant</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}

