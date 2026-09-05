/**
 * LEGAL LENS — Master Structured Mock Data
 * High-fidelity, document-aware dataset ready for future FastAPI endpoints
 */

export const SAMPLE_DOCUMENTS = [
  {
    id: 'doc-emp-001',
    name: 'Employment_Contract.pdf',
    displayName: 'Employment Agreement',
    type: 'Employment Contract',
    pages: 8,
    fileSize: '1.8 MB',
    uploadDate: 'Today, 2:15 PM',
    status: 'Document analyzed',
    riskScore: 'High Caution (74/100)',
    riskLevel: 'High',
    summaryHighlight: {
      headline: '90-Day Written Notice & ₹2,00,000 Liquidated Damages Bond',
      takeaway: 'Your agreement may require 90 days’ written notice before resignation and enforces a 2-year mandatory service bond with a financial penalty of ₹2,00,000 if terminated prematurely.',
      source: 'Employment Agreement · Page 3',
      pageRef: 'Page 3',
      estimatedReadTime: '18 mins full text · 2 mins summary'
    },
    simpleSummary: {
      text: 'This document is an employment contract between the employer and the employee. It describes the job role, compensation, work terms, obligations of both parties, termination conditions, and other important terms.',
      keyTakeaways: [
        'Full-time employment with ₹18,00,000 annual CTC and quarterly performance incentives.',
        'Strict 90-day (3 months) notice period with employer-only buyout discretion.',
        '24-month minimum service tenure backed by a ₹2,00,000 breach indemnity clause.',
        '100% intellectual property assignment for all creations made during employment term.'
      ]
    },
    clauses: [
      {
        id: 'cl-salary',
        title: 'Salary',
        category: 'Compensation',
        shortDesc: 'Explains the salary, bonuses and payment schedule.',
        detail: 'The Employee will receive an annual Gross CTC of ₹18,00,000 payable in equal monthly installments on the 30th of each calendar month via direct bank transfer, subject to statutory tax deductions (TDS, PF).',
        originalText: 'Clause 3.1: Compensation. The Company shall pay the Employee a total cost-to-company (CTC) remuneration package as set forth in Annexure A, payable in accordance with the standard monthly payroll practices.',
        page: 2,
        importance: 'Standard',
        risk: 'Low'
      },
      {
        id: 'cl-notice',
        title: 'Notice Period',
        category: 'Exit Terms',
        shortDesc: 'Employee must give 90 days’ notice before resignation.',
        detail: 'A mandatory 90-day written resignation period is required. The Company reserves the sole discretion to waive notice or accept salary in lieu, but this right is NOT available to the employee.',
        originalText: 'Clause 7.2: Voluntary Separation. The Employee must provide ninety (90) calendar days prior written notice to the Company upon tender of resignation. Company may, at its sole discretion, relieve the Employee earlier.',
        page: 3,
        importance: 'Critical',
        risk: 'High'
      },
      {
        id: 'cl-term',
        title: 'Termination',
        category: 'Exit Terms',
        shortDesc: 'Conditions under which employment can be terminated.',
        detail: 'The Company may terminate employment with immediate effect without notice or compensation in events of misconduct, breach of confidentiality, or failure to meet performance improvement criteria.',
        originalText: 'Clause 8.1: Termination for Cause. The Company may immediately terminate this Agreement with zero notice or severance if the Employee commits any material breach or engages in conduct detrimental to the Company.',
        page: 5,
        importance: 'High',
        risk: 'Medium'
      },
      {
        id: 'cl-conf',
        title: 'Confidentiality',
        category: 'IP & Legal',
        shortDesc: 'Employee must not share company confidential information.',
        detail: 'Extensive non-disclosure obligation covering all proprietary code, customer lists, financial records, and operational secrets. This obligation survives indefinitely after termination.',
        originalText: 'Clause 9.3: Non-Disclosure. The Employee shall hold in strict trust and confidence all Proprietary Information and shall not disclose or reproduce such data during or at any time following separation.',
        page: 6,
        importance: 'Standard',
        risk: 'Low'
      },
      {
        id: 'cl-penalty',
        title: 'Penalty',
        category: 'Liabilities',
        shortDesc: 'Penalty of ₹2,00,000 in case of breach of terms.',
        detail: 'If the employee leaves before completing the 24-month minimum service period, they agree to pay the Company ₹2,00,000 as liquidated damages for recruitment and training overhead.',
        originalText: 'Clause 11.4: Liquidated Damages. In the event of voluntary separation prior to twenty-four (24) months, Employee agrees to pay Company a liquidated damages sum of INR 2,00,000.',
        page: 7,
        importance: 'Critical',
        risk: 'High'
      },
      {
        id: 'cl-bond',
        title: 'Bond',
        category: 'Tenure',
        shortDesc: 'Employee must serve minimum 2 years.',
        detail: 'A continuous service obligation of 24 months starting from the date of joining. Leaves and sabbaticals will extend the bond period proportionally.',
        originalText: 'Clause 11.1: Minimum Tenure Commitment. The Employee commits to remain in the active service of the Company for a minimum unbroken period of twenty-four (24) consecutive months.',
        page: 8,
        importance: 'Critical',
        risk: 'High'
      },
      {
        id: 'cl-ip',
        title: 'Intellectual Property',
        category: 'IP & Legal',
        shortDesc: 'All work products and inventions belong exclusively to employer.',
        detail: 'Comprehensive assignment of all inventions, software developments, algorithms, and documentation created during working hours or using company infrastructure.',
        originalText: 'Clause 10.2: Inventions Assignment. All Works, inventions, copyrightable assets, and patents created during the term of employment are deemed Works for Hire and belong exclusively to the Company.',
        page: 4,
        importance: 'Important',
        risk: 'Medium'
      },
      {
        id: 'cl-noncompete',
        title: 'Non-Compete',
        category: 'Post-Employment',
        shortDesc: '12-month post-employment restriction against competing firms.',
        detail: 'Restricts the employee for 12 months after separation from working with direct competitors or soliciting any existing company clients or staff.',
        originalText: 'Clause 12.1: Restrictive Covenants. For a period of twelve (12) months following termination, Employee shall not directly engage with any competing entity operating within the same market sector.',
        page: 7,
        importance: 'High',
        risk: 'Medium'
      }
    ],
    risks: [
      {
        id: 'risk-1',
        severity: 'High Attention',
        level: 'high',
        title: '90 days’ notice period may be difficult to meet.',
        explanation: 'The 90-day notice period is significantly longer than the standard industry average (30 days). The employer has unilateral discretion to waive or enforce it, which could make transitioning to a new job difficult.',
        recommendation: 'Request reducing notice period to 30 or 60 days, or make the buyout option mutually applicable.',
        page: 3,
        clauseRef: 'Clause 7.2'
      },
      {
        id: 'risk-2',
        severity: 'Medium Attention',
        level: 'medium',
        title: 'Penalty clause is very high. Review carefully.',
        explanation: 'Enforces an unconditional ₹2,00,000 penalty if you resign before completing 24 months. Under Indian Contract Act, excessive penalties may be challenged, but could cause friction during exit.',
        recommendation: 'Seek removal of the bond or replace with a pro-rata reimbursement of actual documented training costs.',
        page: 7,
        clauseRef: 'Clause 11.4'
      },
      {
        id: 'risk-3',
        severity: 'Low Attention',
        level: 'low',
        title: 'Confidentiality clause is standard.',
        explanation: 'Standard confidentiality clause that continues in perpetuity. Normal practice is 3 to 5 years post-separation, except for genuine trade secrets.',
        recommendation: 'Verify that trade secret protection is clearly separated from general business know-how.',
        page: 6,
        clauseRef: 'Clause 9.3'
      }
    ],
    checklist: [
      {
        id: 'chk-1',
        group: 'needsAttention',
        text: 'Review the 90-day notice period.',
        detail: 'Ensure you understand that notice buyout is only at employer discretion.',
        defaultChecked: true,
        page: 3
      },
      {
        id: 'chk-2',
        group: 'needsAttention',
        text: 'Understand the penalty clause.',
        detail: 'Clarify what happens to training expense deductions if leaving early.',
        defaultChecked: true,
        page: 7
      },
      {
        id: 'chk-3',
        group: 'needsAttention',
        text: 'Check termination conditions.',
        detail: 'Confirm whether a 30-day cure period exists for performance disputes.',
        defaultChecked: false,
        page: 5
      },
      {
        id: 'chk-4',
        group: 'reviewCarefully',
        text: 'Verify employment bond conditions.',
        detail: 'Verify 24-month lock-in and ₹2,00,000 liquidated damages scope.',
        defaultChecked: true,
        page: 8
      },
      {
        id: 'chk-5',
        group: 'reviewCarefully',
        text: 'Clarify roles and responsibilities.',
        detail: 'Check standard 45-hour work week expectations and overtime policy.',
        defaultChecked: false,
        page: 2
      },
      {
        id: 'chk-6',
        group: 'reviewCarefully',
        text: 'Check salary and bonus structure.',
        detail: 'Review the fixed vs performance incentive ratio in Annexure A.',
        defaultChecked: false,
        page: 2
      },
      {
        id: 'chk-7',
        group: 'goodToCheck',
        text: 'Understand confidentiality obligations.',
        detail: 'Check whether side projects created on personal time are protected.',
        defaultChecked: false,
        page: 6
      },
      {
        id: 'chk-8',
        group: 'goodToCheck',
        text: 'Check leaves and working hours.',
        detail: 'Confirm 24 annual paid leaves and carry-forward limits.',
        defaultChecked: false,
        page: 4
      },
      {
        id: 'chk-9',
        group: 'goodToCheck',
        text: 'Review dispute resolution process.',
        detail: 'Governing jurisdiction is designated in Bangalore / Karnataka courts.',
        defaultChecked: false,
        page: 8
      }
    ],
    suggestedQuestions: [
      {
        id: 'sq-1',
        question: 'Can the notice period be reduced?',
        answer: 'Based on the analysed document (Clause 7.2, Page 3), the 90-day notice period is mandatory. The company reserves the unilateral right to waive or buy out notice, but the employee cannot demand an early buyout as a matter of right. Negotiating a bilateral 30-day notice before signing is recommended.',
        source: 'Employment Agreement · Clause 7.2, Page 3'
      },
      {
        id: 'sq-2',
        question: 'When does the penalty apply?',
        answer: 'Under Clause 11.4 (Page 7), the penalty of ₹2,00,000 applies if you voluntarily resign or leave employment before completing twenty-four (24) months from your official start date.',
        source: 'Employment Agreement · Clause 11.4, Page 7'
      },
      {
        id: 'sq-3',
        question: 'What happens if I leave before the bond period?',
        answer: 'Leaving before the 2-year tenure triggers Clauses 11.1 & 11.4. The employer is contractually authorized to claim ₹2,00,000 as liquidated damages for recruitment and training overhead.',
        source: 'Employment Agreement · Clauses 11.1 & 11.4, Pages 7-8'
      },
      {
        id: 'sq-4',
        question: 'Explain this document simply.',
        answer: 'This is a full-time employment agreement offering ₹18 LPA. The key terms are: 2-year lock-in with ₹2L early exit penalty, a 90-day notice period, complete IP assignment to the employer, and standard confidentiality.',
        source: 'Employment Agreement · Executive Summary'
      },
      {
        id: 'sq-5',
        question: 'What should I be careful about?',
        answer: 'The top 3 critical areas to watch are: 1) The rigid 90-day notice period, 2) The ₹2,00,000 penalty for exiting before 2 years, and 3) The 12-month post-employment non-compete clause.',
        source: 'Employment Agreement · Risk Analysis Report'
      }
    ]
  },
  {
    id: 'doc-rent-002',
    name: 'Rental_Agreement.pdf',
    displayName: 'Residential Tenancy Agreement',
    type: 'Rental Agreement',
    pages: 5,
    fileSize: '1.2 MB',
    uploadDate: 'Yesterday, 11:30 AM',
    status: 'Document analyzed',
    riskScore: 'Moderate Caution (48/100)',
    riskLevel: 'Medium',
    summaryHighlight: {
      headline: '11-Month Lock-in Period & 10% Mandatory Annual Rent Escalation',
      takeaway: 'This agreement specifies an 11-month lock-in where early vacating forfeits your ₹1,60,000 deposit, alongside a mandatory one-month rent deduction for repainting upon exit.',
      source: 'Rental Agreement · Page 2',
      pageRef: 'Page 2',
      estimatedReadTime: '12 mins full text · 1.5 mins summary'
    },
    simpleSummary: {
      text: 'A residential lease deed for a 2BHK apartment between Landlord and Tenant. It defines the monthly rent of ₹32,000, a security deposit of ₹1,60,000 (5 months), maintenance responsibilities, and vacating protocols.',
      keyTakeaways: [
        'Monthly rent of ₹32,000 payable in advance by the 5th of each month.',
        'Interest-free security deposit of ₹1,60,000 refundable within 30 days of vacating.',
        'Mandatory 11-month lock-in period with forfeiture of deposit for early exit.',
        'Deduction of one full month rent (₹32,000) for repainting and cleaning.'
      ]
    },
    clauses: [
      {
        id: 'cl-rent',
        title: 'Monthly Rent',
        category: 'Financial',
        shortDesc: '₹32,000 per month payable by 5th with late penalty.',
        detail: 'Rent must be transferred by the 5th of every English calendar month. Late payments beyond 5 days attract 18% annual interest calculated daily.',
        originalText: 'Clause 2.1: Rent. Lessee shall pay INR 32,000 per month on or before the 5th day of every calendar month.',
        page: 1,
        importance: 'Standard',
        risk: 'Low'
      },
      {
        id: 'cl-lockin',
        title: 'Lock-In Period',
        category: 'Tenure',
        shortDesc: '11-month lock-in with forfeiture of deposit on early exit.',
        detail: 'Neither party can terminate the agreement during the initial 11 months. Tenant vacating early will forfeit the entire ₹1,60,000 security deposit.',
        originalText: 'Clause 5.2: Lock-in. Both parties agree to a mandatory lock-in period of 11 months from commencement.',
        page: 2,
        importance: 'Critical',
        risk: 'High'
      },
      {
        id: 'cl-deposit',
        title: 'Security Deposit',
        category: 'Financial',
        shortDesc: '₹1,60,000 refundable minus one month painting charges.',
        detail: 'Deposit is refunded after handover of physical possession minus one month painting charges (₹32,000) and any unpaid utility bills.',
        originalText: 'Clause 3.3: Deposit Refund. Security deposit shall be returned within 30 days after deducting one month rent towards painting.',
        page: 3,
        importance: 'High',
        risk: 'Medium'
      },
      {
        id: 'cl-sublet',
        title: 'Subletting Terms',
        category: 'Occupancy',
        shortDesc: 'Strict prohibition on subletting or commercial use.',
        detail: 'The tenant cannot sublet any room or permit guests to stay longer than 15 consecutive days without written consent of the lessor.',
        originalText: 'Clause 7.1: Assignment. The Lessee shall not assign, sublet, or part with possession of the Demised Premises.',
        page: 4,
        importance: 'Standard',
        risk: 'Low'
      }
    ],
    risks: [
      {
        id: 'rent-risk-1',
        severity: 'High Attention',
        level: 'high',
        title: 'Deposit forfeiture during lock-in period.',
        explanation: 'If job relocation forces you to move before 11 months, you lose the entire ₹1,60,000 deposit regardless of finding a replacement tenant.',
        recommendation: 'Add a diplomatic relocation clause allowing termination with 1 month notice in case of job transfer.',
        page: 2,
        clauseRef: 'Clause 5.2'
      },
      {
        id: 'rent-risk-2',
        severity: 'Medium Attention',
        level: 'medium',
        title: 'Flat painting deduction of one month rent.',
        explanation: 'Clause 3.3 imposes a flat ₹32,000 painting fee regardless of actual wall condition or tenancy duration.',
        recommendation: 'Negotiate deduction based on actual itemized receipts or wear-and-tear exceptions.',
        page: 3,
        clauseRef: 'Clause 3.3'
      },
      {
        id: 'rent-risk-3',
        severity: 'Low Attention',
        level: 'low',
        title: 'Annual 10% rent escalation is standard.',
        explanation: 'Standard 10% rent increase upon completion of 11-month lease term.',
        recommendation: 'Normal residential rate in metropolitan locations.',
        page: 1,
        clauseRef: 'Clause 2.3'
      }
    ],
    checklist: [
      {
        id: 'chk-r1',
        group: 'needsAttention',
        text: 'Verify 11-month lock-in terms and deposit refund clause.',
        detail: 'Clarify job transfer exceptions for the lock-in period.',
        defaultChecked: true,
        page: 2
      },
      {
        id: 'chk-r2',
        group: 'reviewCarefully',
        text: 'Review painting charges and maintenance bill sharing.',
        detail: 'Check society maintenance charges (whether included in ₹32,000).',
        defaultChecked: false,
        page: 3
      },
      {
        id: 'chk-r3',
        group: 'goodToCheck',
        text: 'Document existing property fixture condition with photos.',
        detail: 'Record pre-existing scratches, electrical, and plumbing status.',
        defaultChecked: false,
        page: 5
      }
    ],
    suggestedQuestions: [
      {
        id: 'sq-r1',
        question: 'What happens if I need to vacate before 11 months?',
        answer: 'Based on the analysed document (Clause 5.2, Page 2), vacating before 11 months allows the landlord to forfeit your full ₹1,60,000 security deposit. We suggest negotiating a replacement tenant clause.',
        source: 'Rental Agreement · Clause 5.2, Page 2'
      },
      {
        id: 'sq-r2',
        question: 'How much is deducted for painting when moving out?',
        answer: 'Clause 3.3 specifies a fixed deduction of one full month rent (₹32,000) for repainting upon termination of the tenancy.',
        source: 'Rental Agreement · Clause 3.3, Page 3'
      },
      {
        id: 'sq-r3',
        question: 'What is the security deposit refund timeline?',
        answer: 'Under Clause 3.3, the landlord must return the remaining security deposit within 30 days of receiving vacant physical possession.',
        source: 'Rental Agreement · Clause 3.3, Page 3'
      }
    ]
  },
  {
    id: 'doc-nda-003',
    name: 'NDA.pdf',
    displayName: 'Mutual Non-Disclosure Agreement',
    type: 'NDA Document',
    pages: 4,
    fileSize: '850 KB',
    uploadDate: 'Aug 20, 2026',
    status: 'Document analyzed',
    riskScore: 'Low Caution (22/100)',
    riskLevel: 'Low',
    summaryHighlight: {
      headline: 'Mutual Confidentiality with 3-Year Expiration & Standard Exclusions',
      takeaway: 'A balanced, bilateral NDA protecting both parties confidential information with a defined 3-year lifespan and standard exceptions for prior public knowledge.',
      source: 'NDA Document · Page 2',
      pageRef: 'Page 2',
      estimatedReadTime: '8 mins full text · 1 min summary'
    },
    simpleSummary: {
      text: 'A bilateral non-disclosure agreement to protect trade secrets, technical architecture, and customer lists during exploratory business partnership discussions.',
      keyTakeaways: [
        'Mutual obligations applied equally to both parties.',
        'Confidentiality duration limited to 3 years from disclosure date.',
        'Clear exclusions for publicly known information and court subpoenas.'
      ]
    },
    clauses: [
      {
        id: 'cl-nda-scope',
        title: 'Definition of Confidential Information',
        category: 'Scope',
        shortDesc: 'Clearly defines proprietary technical data, algorithms, and business plans.',
        detail: 'Includes all written, oral, or electronic data marked Confidential or reasonably understood to be proprietary.',
        originalText: 'Clause 1.1: Confidential Information encompasses all proprietary technical, financial, and operational assets.',
        page: 1,
        importance: 'Standard',
        risk: 'Low'
      },
      {
        id: 'cl-nda-term',
        title: 'Term & Expiration',
        category: 'Tenure',
        shortDesc: '3-year confidentiality protection from the date of final disclosure.',
        detail: 'All protection obligations expire exactly 36 months after initial disclosure.',
        originalText: 'Clause 4.1: The obligations herein shall endure for a period of three (3) years from disclosure date.',
        page: 2,
        importance: 'Standard',
        risk: 'Low'
      },
      {
        id: 'cl-nda-inj',
        title: 'Injunctive Relief',
        category: 'Legal Remedy',
        shortDesc: 'Immediate court injunction available in case of threatened breach.',
        detail: 'Parties agree that monetary damages alone may be inadequate for proprietary leaks, authorizing equitable relief.',
        originalText: 'Clause 5.2: Injunctive Relief. Disclosing Party may seek temporary or permanent injunctions without bond.',
        page: 3,
        importance: 'Standard',
        risk: 'Low'
      }
    ],
    risks: [
      {
        id: 'nda-risk-1',
        severity: 'Low Attention',
        level: 'low',
        title: 'Governing jurisdiction is out of state.',
        explanation: 'Jurisdiction is set in Delaware courts. If a dispute arises, proceedings will take place out of state.',
        recommendation: 'Request local neutral state jurisdiction if necessary.',
        page: 4,
        clauseRef: 'Clause 7.1'
      }
    ],
    checklist: [
      {
        id: 'chk-n1',
        group: 'goodToCheck',
        text: 'Confirm reciprocal mutual wording protects both parties equally.',
        detail: 'Ensure disclosures by your team are equally covered.',
        defaultChecked: true,
        page: 1
      },
      {
        id: 'chk-n2',
        group: 'goodToCheck',
        text: 'Verify 3-year confidentiality sunset period is in place.',
        detail: 'Verify trade secret vs general technical information duration.',
        defaultChecked: true,
        page: 2
      }
    ],
    suggestedQuestions: [
      {
        id: 'sq-n1',
        question: 'How long does this NDA remain in effect?',
        answer: 'Under Clause 4.1 (Page 2), all confidentiality obligations remain active for exactly three (3) years from the disclosure date.',
        source: 'NDA Document · Clause 4.1, Page 2'
      },
      {
        id: 'sq-n2',
        question: 'Does this NDA protect both parties equally?',
        answer: 'Yes, this is a reciprocal Mutual NDA that applies identical non-disclosure standards to both disclosing and receiving parties.',
        source: 'NDA Document · Clause 1.1, Page 1'
      }
    ]
  },
  {
    id: 'doc-offer-004',
    name: 'Offer_Letter.pdf',
    displayName: 'Executive Offer Letter',
    type: 'Employment Contract',
    pages: 6,
    fileSize: '1.4 MB',
    uploadDate: 'Aug 18, 2026',
    status: 'Document analyzed',
    riskScore: 'Moderate Caution (52/100)',
    riskLevel: 'Medium',
    summaryHighlight: {
      headline: '6-Month Probation Period & 4-Year ESOP Vesting with 1-Year Cliff',
      takeaway: 'Contains standard compensation with stock options vesting across 4 years and a 6-month probation period during which notice is only 15 days.',
      source: 'Offer Letter · Page 3',
      pageRef: 'Page 3',
      estimatedReadTime: '14 mins full text · 1.5 mins summary'
    },
    simpleSummary: {
      text: 'Formal offer of employment for Senior Software Architect role, outlining equity vesting schedule, annual bonus milestones, and initial probation evaluation terms.',
      keyTakeaways: [
        'Base salary of ₹30,00,000 + ₹5,00,000 annual performance bonus.',
        '2,000 Stock Options (ESOPs) vesting over 48 months with 12-month cliff.',
        '6-month probation period with 15-day exit notice.'
      ]
    },
    clauses: [
      {
        id: 'cl-off-comp',
        title: 'Base Compensation & Bonus',
        category: 'Compensation',
        shortDesc: '₹30 LPA fixed + ₹5 LPA discretionary performance bonus.',
        detail: 'Disbursed monthly. Variable component evaluated annually based on company performance milestones.',
        originalText: 'Clause 3.1: Remuneration. Base compensation is INR 30,00,000 per annum plus performance bonus.',
        page: 2,
        importance: 'High',
        risk: 'Low'
      },
      {
        id: 'cl-off-esop',
        title: 'Stock Options (ESOP)',
        category: 'Equity',
        shortDesc: '2,000 ESOPs with 25% vesting after 1 year, balance monthly.',
        detail: 'Standard 4-year schedule with a 1-year cliff. Unvested options expire upon separation.',
        originalText: 'Clause 4.2: Equity Grant. Subject to Board approval, Employee will receive 2,000 Options.',
        page: 3,
        importance: 'High',
        risk: 'Low'
      }
    ],
    risks: [
      {
        id: 'off-risk-1',
        severity: 'Medium Attention',
        level: 'medium',
        title: 'Discretionary bonus criteria lacks objective KPI.',
        explanation: 'Bonus payout is at sole discretion of management without clear objective KPI benchmarks.',
        recommendation: 'Request defined written performance metrics for bonus entitlement.',
        page: 2,
        clauseRef: 'Clause 3.2'
      }
    ],
    checklist: [
      {
        id: 'chk-o1',
        group: 'reviewCarefully',
        text: 'Verify ESOP grant price and 1-year cliff conditions.',
        detail: 'Ensure exercise window after exit is at least 90 days.',
        defaultChecked: true,
        page: 3
      }
    ],
    suggestedQuestions: [
      {
        id: 'sq-o1',
        question: 'What is the probation period and notice during probation?',
        answer: 'Clause 2.4 states probation is 6 months, during which either party can terminate with just 15 days written notice.',
        source: 'Offer Letter · Clause 2.4, Page 2'
      }
    ]
  }
];

export const SUPPORTED_CATEGORIES = [
  { id: 'emp', name: 'Employment Contracts', icon: 'Briefcase', count: '14 templates', desc: 'Job offers, service bonds, contractor agreements' },
  { id: 'rent', name: 'Rental Agreements', icon: 'Home', count: '8 templates', desc: 'Residential leases, commercial deeds, lock-ins' },
  { id: 'nda', name: 'NDA Documents', icon: 'ShieldCheck', count: '6 templates', desc: 'Mutual NDAs, proprietary IP protection' },
  { id: 'notice', name: 'Legal Notices', icon: 'AlertCircle', count: '10 templates', desc: 'Eviction, cease & desist, contract breach' },
  { id: 'other', name: 'Other Legal Documents', icon: 'FileText', count: '25+ types', desc: 'SaaS MSAs, privacy policies, terms of service' }
];

export const SAMPLE_PROMPT_CHIPS = [
  'What is my notice period?',
  'What are the penalties?',
  'Explain this document simply.',
  'What should I be careful about?',
  'Can I terminate this agreement early?'
];
