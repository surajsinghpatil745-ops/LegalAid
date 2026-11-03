export type DocumentCategory =
  | "fir"
  | "legal-notice"
  | "rental-agreement"
  | "court-summons"
  | "other";

export type DraftType = "rti" | "consumer-complaint" | "legal-notice";

export type RiskSeverity = "high" | "medium" | "low";

export interface DocumentCategoryOption {
  id: DocumentCategory;
  label: string;
  icon: string;
  description: string;
}

export interface DraftTypeOption {
  id: DraftType;
  label: string;
  icon: string;
  description: string;
  fields: DraftField[];
}

export interface DraftField {
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
  multiline?: boolean;
}

export const documentCategories: DocumentCategoryOption[] = [
  {
    id: "fir",
    label: "FIR Copy",
    icon: "📋",
    description: "First Information Report filed at a police station",
  },
  {
    id: "legal-notice",
    label: "Legal Notice",
    icon: "📨",
    description: "Formal notice sent before or during a legal dispute",
  },
  {
    id: "rental-agreement",
    label: "Rental Agreement",
    icon: "🏠",
    description: "Lease or rent agreement between landlord and tenant",
  },
  {
    id: "court-summons",
    label: "Court Summons",
    icon: "⚖️",
    description: "Court order requiring your appearance or response",
  },
  {
    id: "other",
    label: "Other Document",
    icon: "📄",
    description: "Any other legal document you need explained",
  },
];

export const draftTypes: DraftTypeOption[] = [
  {
    id: "rti",
    label: "RTI Application",
    icon: "🔍",
    description: "Right to Information request under RTI Act, 2005",
    fields: [
      { id: "applicantName", label: "Your Full Name", placeholder: "e.g. Rajesh Kumar", required: true },
      { id: "applicantAddress", label: "Your Address", placeholder: "Full postal address with PIN code", required: true, multiline: true },
      { id: "publicAuthority", label: "Public Authority / Department", placeholder: "e.g. Municipal Corporation of Delhi", required: true },
      { id: "informationSought", label: "Information You Want", placeholder: "Describe clearly what records or information you need", required: true, multiline: true },
      { id: "timePeriod", label: "Time Period (if applicable)", placeholder: "e.g. January 2023 to December 2024" },
    ],
  },
  {
    id: "consumer-complaint",
    label: "Consumer Complaint",
    icon: "🛒",
    description: "Complaint under Consumer Protection Act, 2019",
    fields: [
      { id: "complainantName", label: "Your Full Name", placeholder: "e.g. Priya Sharma", required: true },
      { id: "complainantAddress", label: "Your Address", placeholder: "Full address with contact number", required: true, multiline: true },
      { id: "oppositeParty", label: "Company / Seller Name", placeholder: "e.g. Flipkart India Pvt Ltd", required: true },
      { id: "oppositePartyAddress", label: "Company Address", placeholder: "Registered or service address of the company", multiline: true },
      { id: "productService", label: "Product or Service", placeholder: "e.g. Laptop, insurance policy, home loan", required: true },
      { id: "purchaseDate", label: "Date of Purchase / Service", placeholder: "e.g. 15 March 2025", required: true },
      { id: "amountPaid", label: "Amount Paid (₹)", placeholder: "e.g. 45,000", required: true },
      { id: "complaintDetails", label: "What Went Wrong", placeholder: "Describe the defect, deficiency, or unfair practice in detail", required: true, multiline: true },
      { id: "reliefSought", label: "Relief Sought", placeholder: "e.g. Full refund, replacement, compensation of ₹10,000", required: true, multiline: true },
    ],
  },
  {
    id: "legal-notice",
    label: "Legal Notice",
    icon: "✉️",
    description: "Formal notice before filing a civil or criminal case",
    fields: [
      { id: "senderName", label: "Your Full Name", placeholder: "Person sending the notice", required: true },
      { id: "senderAddress", label: "Your Address", placeholder: "Full address with contact details", required: true, multiline: true },
      { id: "recipientName", label: "Recipient Name", placeholder: "Person or company receiving the notice", required: true },
      { id: "recipientAddress", label: "Recipient Address", placeholder: "Full address of the recipient", required: true, multiline: true },
      { id: "subject", label: "Subject / Issue", placeholder: "e.g. Non-payment of rent, breach of contract, cheque bounce", required: true },
      { id: "facts", label: "Facts of the Case", placeholder: "Describe the problem in plain language — dates, amounts, what the other party did. IPC sections are added automatically.", required: true, multiline: true },
      { id: "legalGrounds", label: "Legal Grounds (auto-filled from IPC)", placeholder: "Leave blank — relevant IPC / NI Act / Contract Act sections are added from your problem. You may add extra grounds.", multiline: true },
      { id: "demand", label: "What You Demand", placeholder: "e.g. Pay ₹2,00,000 within 15 days or face legal action", required: true, multiline: true },
      { id: "deadlineDays", label: "Response Deadline (days)", placeholder: "e.g. 15 or 30", required: true },
    ],
  },
];

export function getDocumentCategoryLabel(id: DocumentCategory): string {
  return documentCategories.find((c) => c.id === id)?.label ?? "Document";
}

export function getDraftTypeLabel(id: DraftType): string {
  return draftTypes.find((d) => d.id === id)?.label ?? "Draft";
}
