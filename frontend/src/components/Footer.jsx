import React from 'react';
import { Scale, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#D2DBEB]/70 bg-[#F0F4F8]/70 pt-10 pb-8 text-xs text-[#00385A]">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">

        
        {/* Trust Badges Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-[#D2DBEB]/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-[#D2DBEB] text-[#00385A] shadow-2xs">
              <Lock className="h-4 w-4 text-[#6A90B4]" />
            </div>
            <div>
              <p className="font-bold text-[#01162B]">Zero Data Retention</p>
              <p className="text-[11px] text-[#6A90B4]">Uploaded files are processed ephemerally and never stored.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-[#D2DBEB] text-[#00385A] shadow-2xs">
              <ShieldCheck className="h-4 w-4 text-[#6A90B4]" />
            </div>
            <div>
              <p className="font-bold text-[#01162B]">256-Bit SSL Encryption</p>
              <p className="text-[11px] text-[#6A90B4]">Enterprise-grade document privacy & sandbox isolation.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-[#D2DBEB] text-[#00385A] shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-[#6A90B4]" />
            </div>
            <div>
              <p className="font-bold text-[#01162B]">Legal AI Verified</p>
              <p className="text-[11px] text-[#6A90B4]">Trained on standard contract law and jurisdictional frameworks.</p>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-8 rounded-xl bg-white p-4 border border-[#D2DBEB]/80 text-center">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <Scale className="h-4 w-4 text-[#6A90B4]" />
            <span className="font-bold text-xs text-[#01162B]">LEGAL DISCLAIMER</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#00385A] max-w-3xl mx-auto">
            Legal Lens is an automated AI-assisted document review software designed to provide informational analysis, plain-language translations, and risk indicators. 
            <strong> This tool does not constitute legal advice</strong>, nor does it create an attorney-client relationship. Users should always consult a qualified licensed legal professional prior to signing high-liability legal instruments.
          </p>
        </div>

        {/* Bottom copyright row */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#94A2BF]">
          <p>© {new Date().getFullYear()} LEGAL LENS Inc. All rights reserved. “Know Before You Sign.”</p>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:text-[#01162B] transition-colors">Privacy Notice</a>
            <span>·</span>
            <a href="#terms" className="hover:text-[#01162B] transition-colors">Terms of Service</a>
            <span>·</span>
            <a href="#security" className="hover:text-[#01162B] transition-colors">Security Architecture</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

