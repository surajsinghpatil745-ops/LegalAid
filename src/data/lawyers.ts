export interface LawAgency {
  id: string;
  name: string;
  type: "government" | "ngo" | "private";
  category: string[];
  description: string;
  contact: string;
  website?: string;
  free: boolean;
  nationwide: boolean;
}

export const lawAgencies: LawAgency[] = [
  {
    id: "nalsa",
    name: "National Legal Services Authority (NALSA)",
    type: "government",
    category: ["Criminal", "Civil", "Family", "Consumer", "All"],
    description:
      "Free legal aid for eligible citizens. Provides lawyers at government expense for those who cannot afford representation.",
    contact: "15100 (Toll-free helpline)",
    website: "https://nalsa.gov.in",
    free: true,
    nationwide: true,
  },
  {
    id: "consumer-helpline",
    name: "National Consumer Helpline",
    type: "government",
    category: ["Consumer Rights"],
    description:
      "Government helpline for consumer complaints. Assists in resolving disputes with companies and sellers.",
    contact: "1800-11-4000",
    website: "https://consumerhelpline.gov.in",
    free: true,
    nationwide: true,
  },
  {
    id: "ncw",
    name: "National Commission for Women",
    type: "government",
    category: ["Women's Rights", "Domestic Violence", "Harassment"],
    description:
      "Assistance for women facing legal issues including domestic violence, workplace harassment, and dowry cases.",
    contact: "7827170170",
    website: "https://ncw.nic.in",
    free: true,
    nationwide: true,
  },
  {
    id: "nhrc",
    name: "National Human Rights Commission",
    type: "government",
    category: ["Police Encounters", "Human Rights", "Illegal Detention"],
    description:
      "For complaints against police misconduct, illegal detention, custodial violence, and human rights violations.",
    contact: "011-23385368",
    website: "https://nhrc.nic.in",
    free: true,
    nationwide: true,
  },
  {
    id: "traffic-helpline",
    name: "Traffic Police Helpline (varies by state)",
    type: "government",
    category: ["Traffic"],
    description:
      "Report traffic violations, towing issues, and corruption. Contact your city's traffic police helpline.",
    contact: "103 (in many cities) or local traffic police number",
    free: true,
    nationwide: true,
  },
  {
    id: "cybercrime",
    name: "National Cyber Crime Reporting Portal",
    type: "government",
    category: ["Cybercrime", "Fraud", "Online Harassment"],
    description:
      "Report cyber fraud, online harassment, and digital crimes. File complaints at the official portal.",
    contact: "1930 (Financial fraud helpline)",
    website: "https://cybercrime.gov.in",
    free: true,
    nationwide: true,
  },
  {
    id: "district-legal-services",
    name: "District Legal Services Authority (DLSA)",
    type: "government",
    category: ["Criminal", "Civil", "Family", "All"],
    description:
      "Free legal aid at district level. Visit your district court's legal services cell for immediate assistance.",
    contact: "Visit nearest District Court",
    website: "https://nalsa.gov.in",
    free: true,
    nationwide: true,
  },
  {
    id: "bar-council",
    name: "State Bar Council Advocate Directory",
    type: "private",
    category: ["Criminal", "Civil", "Corporate", "Family", "Consumer", "Traffic"],
    description:
      "Find verified advocates registered with your state's Bar Council. Always verify enrollment number.",
    contact: "Search your State Bar Council website",
    website: "https://www.barcouncilofindia.org",
    free: false,
    nationwide: true,
  },
];

export function getAgenciesForCategory(category: string): LawAgency[] {
  return lawAgencies.filter(
    (a) => a.category.includes(category) || a.category.includes("All")
  );
}
