import type { DocumentCategory } from "@/data/document-types";

export const sampleDocuments: Record<DocumentCategory, { label: string; text: string }> = {
  fir: {
    label: "Sample FIR (theft case)",
    text: `FIRST INFORMATION REPORT
Police Station: Kalkaji, New Delhi
FIR No.: 0452/2025
Date: 12/03/2025

Complainant: Mr. Anil Verma, resident of E-42, Kalkaji, New Delhi.

Subject: Theft of mobile phone and wallet.

Brief facts: On 11/03/2025 at approximately 9:30 PM, while returning from Nehru Place metro station, the complainant's Samsung Galaxy S23 (IMEI: 356789012345678) and brown leather wallet containing ₹8,500 cash, Aadhaar card, and two debit cards were stolen by unknown persons near Gate No. 3.

Sections applied: 379 IPC (Theft), 34 IPC (Common intention).

Investigating Officer: SI Rajesh Kumar, Mobile: 9876543210.

The complainant states he did not authorize anyone to take his belongings. A search is underway.`,
  },

  "legal-notice": {
    label: "Sample legal notice (cheque bounce)",
    text: `LEGAL NOTICE

Date: 01/06/2025
From: M/s Sharma Enterprises, 14, Connaught Place, New Delhi - 110001
To: Mr. Vikram Singh, 22-B, Lajpat Nagar, New Delhi - 110024

Subject: Legal notice for recovery of ₹2,50,000 under Section 138 of the Negotiable Instruments Act, 1881.

Dear Sir,

1. You borrowed ₹2,50,000 from my client on 15/01/2025 for business purposes and issued Cheque No. 884521 dated 20/05/2025 drawn on HDFC Bank, South Extension branch for the said amount.

2. The cheque was presented on 25/05/2025 and was dishonoured with remark "Funds Insufficient".

3. You are hereby called upon to pay the sum of ₹2,50,000 along with interest @ 18% p.a. within 15 (fifteen) days from receipt of this notice.

4. Failing which, my client shall be constrained to initiate criminal proceedings under Section 138 NI Act and civil suit for recovery without further reference to you.

Yours faithfully,
Adv. Priya Mehta (on behalf of M/s Sharma Enterprises)`,
  },

  "rental-agreement": {
    label: "Sample rental agreement (with risky clauses)",
    text: `RENT AGREEMENT

This agreement is made on 01/04/2025 between:
Landlord: Mr. Ramesh Gupta, Flat 301, Green Valley Apartments, Pune
Tenant: Ms. Sneha Patil, currently residing at Pune

Property: 2BHK, Flat 302, Green Valley Apartments, Baner, Pune - 411045
Monthly Rent: ₹22,000
Security Deposit: ₹1,50,000 (equal to ~7 months rent)
Period: 11 months commencing 01/04/2025

Special Terms:
1. Tenant shall pay 3 months rent as brokerage to the landlord's agent at signing.
2. Landlord may enter the premises at any time without prior notice for inspection.
3. Tenant shall vacate within 7 days if landlord wishes to sell the property.
4. No refund of deposit if tenant leaves before 24 months.
5. Rent shall increase by 25% every 6 months.
6. Tenant waives all rights under Maharashtra Rent Control Act.
7. Any dispute shall be subject to courts in Mumbai only (tenant currently in Pune).

Signed:
Landlord: Ramesh Gupta
Tenant: Sneha Patil`,
  },

  "court-summons": {
    label: "Sample court summons",
    text: `IN THE COURT OF METROPOLITAN MAGISTRATE, BANGALORE
Case No.: CC-7842/2025
Police Station: Koramangala

SUMMONS TO ACCUSED

To: Mr. Arjun Reddy, No. 55, 5th Block, Koramangala, Bangalore - 560034

Whereas a complaint has been filed against you under Sections 279 and 337 IPC (rash driving causing hurt), you are hereby required to appear in person before this Court on 18/07/2025 at 10:30 AM.

If you fail to appear, the Court may proceed ex-parte and issue a warrant for your arrest.

You are directed to bring:
- Copy of this summons
- Valid ID proof
- Any evidence in your defence

Date of issue: 20/06/2025
Issuing Officer: Court Manager, MM Court, Bangalore`,
  },

  other: {
    label: "Sample consumer warranty letter",
    text: `OnePlus Service Centre — Warranty Denial Letter
Date: 14/05/2026
Customer: Mr. Karan Malhotra, Mumbai

Re: OnePlus 12 — IMEI 867890123456789, purchased 15/02/2025 for ₹64,999

We regret to inform you that your warranty claim for screen damage has been rejected as our inspection found "physical damage caused by user negligence" which is excluded under Clause 14 of the warranty booklet.

No repair will be provided free of cost. You may pay ₹18,500 for out-of-warranty screen replacement.

Appeal: Write to service@oneplus.in within 7 days. No further correspondence will be entertained after this period.

OnePlus Authorised Service Centre, Andheri`,
  },
};

export function getSampleDocument(category: DocumentCategory) {
  return sampleDocuments[category];
}
