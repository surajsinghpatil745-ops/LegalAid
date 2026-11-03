export interface ScenarioStep {
  title: string;
  description: string;
}

export interface Scenario {
  slug: string;
  title: string;
  shortDescription: string;
  icon: string;
  category: string;
  urgency: "low" | "medium" | "high";
  isOffense: boolean;
  summary: string;
  yourRights: string[];
  steps: ScenarioStep[];
  fines: { label: string; amount: string }[];
  documents: string[];
  warnings: string[];
  laws: { act: string; section: string; description: string }[];
  whenToGetLawyer: string;
}

export const scenarios: Scenario[] = [
  {
    slug: "vehicle-towed-no-parking",
    title: "Bike or Car Towed from No-Parking Zone",
    shortDescription:
      "Your vehicle was picked up by traffic police. Learn how to get it back, avoid broker scams, and know your fines.",
    icon: "🛵",
    category: "Traffic",
    urgency: "medium",
    isOffense: true,
    summary:
      "Parking in a no-parking zone is a violation under the Motor Vehicles Act. Traffic police can tow or clamp your vehicle. You have the right to retrieve it by paying the prescribed fine — never through unofficial brokers.",
    yourRights: [
      "You must receive a towing challan or seizure memo with vehicle details, location, date, and officer name.",
      "You can only be charged official fines as per the Motor Vehicles Act — not arbitrary amounts.",
      "You are not required to use a broker or middleman to get your vehicle back.",
      "You can inspect your vehicle before accepting it back and note any damage.",
      "You can pay fines at the official traffic police office or designated online portals (Parivahan, state traffic websites).",
    ],
    steps: [
      {
        title: "Stay calm and collect the challan",
        description:
          "Ask the officer for a towing/seizure memo. Note the impound yard name and address. Take photos of your vehicle's condition.",
      },
      {
        title: "Go directly to the impound yard",
        description:
          "Visit the yard mentioned on the challan during working hours. Carry your RC, driving licence, and ID proof. Do not pay anyone outside the official counter.",
      },
      {
        title: "Pay only official fines",
        description:
          "Pay at the traffic police counter or through official online portals. Get a receipt. Typical towing + no-parking fine ranges from ₹500–₹2,000 depending on city and vehicle type.",
      },
      {
        title: "Collect your vehicle",
        description:
          "After payment, the yard will release your vehicle. Check for damage before leaving. If damaged during towing, file a complaint at the traffic police station.",
      },
      {
        title: "Avoid broker scams",
        description:
          "Brokers near impound yards may claim they can 'speed things up' for extra money. This is unnecessary and often fraudulent. Only deal with official traffic police staff.",
      },
    ],
    fines: [
      { label: "No-parking violation", amount: "₹500 – ₹1,500" },
      { label: "Towing charges", amount: "₹500 – ₹1,000" },
      { label: "Daily custody charges (if delayed)", amount: "₹50 – ₹200/day" },
    ],
    documents: [
      "Vehicle Registration Certificate (RC)",
      "Valid Driving Licence",
      "Government ID (Aadhaar/PAN/Voter ID)",
      "Insurance copy (recommended)",
      "Original towing challan/seizure memo",
    ],
    warnings: [
      "Never hand over your RC or original documents to a broker.",
      "Do not pay cash without an official receipt.",
      "Beware of fake 'agents' claiming court orders are needed.",
      "If asked for a bribe, note the officer's badge number and report to the traffic helpline.",
    ],
    laws: [
      {
        act: "Motor Vehicles Act, 1988",
        section: "Section 177",
        description: "General penalty for contravention of rules — fine up to ₹500 for first offence.",
      },
      {
        act: "Motor Vehicles Act, 1988",
        section: "Section 200",
        description: "Court may order release of vehicle upon payment of fine.",
      },
    ],
    whenToGetLawyer:
      "If your vehicle was towed without a challan, damaged during towing, or you're being charged excessive amounts, consult a lawyer specialising in motor vehicle law.",
  },
  {
    slug: "police-stop-midnight",
    title: "Stopped by Police at Night",
    shortDescription:
      "Police stopped you while walking at night. Know if it's an offense, whether they can arrest you, and what to do.",
    icon: "🌙",
    category: "Police Encounters",
    urgency: "high",
    isOffense: false,
    summary:
      "Simply walking on the street at night is NOT a crime in India. Police may question you under certain circumstances, but they cannot arrest you without reasonable grounds or a warrant (except in specific situations).",
    yourRights: [
      "You have the right to know why you are being stopped.",
      "You can ask for the officer's name and badge number.",
      "You are not obliged to go to the police station unless formally arrested.",
      "Women can only be searched by a female officer.",
      "You have the right to inform a family member or lawyer if detained.",
      "You can refuse to unlock your phone without a court order (except in specific terrorism/national security cases).",
    ],
    steps: [
      {
        title: "Stay calm and be polite",
        description:
          "Cooperate with basic questioning. Panicking or being aggressive can escalate the situation. You can say: 'May I know why I am being stopped?'",
      },
      {
        title: "Provide identification if asked",
        description:
          "You may show Aadhaar, voter ID, or driving licence. You are not legally required to carry ID at all times while walking, but cooperation helps.",
      },
      {
        title: "Know when they CANNOT arrest you",
        description:
          "Walking at night alone is not grounds for arrest. Police need reasonable suspicion of a cognizable offence, or a warrant, to arrest you.",
      },
      {
        title: "If asked to go to the station",
        description:
          "Ask if you are under arrest. If yes, demand to know the charges. If not, you can politely decline. If they insist, note their details and comply while asserting your rights.",
      },
      {
        title: "Document everything",
        description:
          "If you feel harassed, note badge numbers, time, location, and witness details. File a complaint at the police station or with the State Human Rights Commission.",
      },
    ],
    fines: [],
    documents: ["Any government-issued photo ID", "Proof of address if questioned about residence"],
    warnings: [
      "Do not run from police — it may create suspicion even if you've done nothing wrong.",
      "Do not offer bribes — this is illegal for both parties.",
      "If physically assaulted by police, seek medical help immediately and file an FIR.",
      "Section 41A CrPC requires police to issue a notice for questioning in many cases instead of arrest.",
    ],
    laws: [
      {
        act: "Code of Criminal Procedure, 1973",
        section: "Section 41",
        description: "Conditions under which police may arrest without warrant.",
      },
      {
        act: "Code of Criminal Procedure, 1973",
        section: "Section 41A",
        description: "Notice of appearance before police officer — arrest not automatic for many offences.",
      },
      {
        act: "Constitution of India",
        section: "Article 21",
        description: "Right to life and personal liberty — cannot be deprived except by procedure established by law.",
      },
    ],
    whenToGetLawyer:
      "If you were arrested without cause, detained overnight without charges, or faced harassment, contact a criminal lawyer immediately. Call the National Legal Services Authority (NALSA) helpline: 15100.",
  },
  {
    slug: "caught-in-fight",
    title: "Caught in a Fight by Police",
    shortDescription:
      "Police intervened in a fight involving you. Learn immediate steps, possible charges, punishments, and how to protect yourself.",
    icon: "⚖️",
    category: "Criminal",
    urgency: "high",
    isOffense: true,
    summary:
      "Being involved in a fight can lead to charges ranging from simple hurt to attempt to murder, depending on injuries and circumstances. What you do in the first hours is critical.",
    yourRights: [
      "Right to remain silent — you are not obliged to confess.",
      "Right to legal counsel from the moment of arrest.",
      "Right to be produced before a magistrate within 24 hours.",
      "Right to medical examination if injured.",
      "Right to inform a family member of your arrest.",
      "If you acted in self-defence, this is a valid legal defence.",
    ],
    steps: [
      {
        title: "Do not resist arrest",
        description:
          "Resisting can add charges under Section 224 IPC. Stay calm, ask what you are being charged with, and request a lawyer.",
      },
      {
        title: "Do not give a detailed statement without a lawyer",
        description:
          "You may provide your name and address, but avoid discussing the incident until your lawyer is present. Anything you say can be used against you.",
      },
      {
        title: "Seek medical attention if injured",
        description:
          "If you were hurt, insist on a medical examination at a government hospital. This creates an official record of injuries.",
      },
      {
        title: "Gather evidence if possible",
        description:
          "CCTV footage, witness phone numbers, and photos of injuries are valuable. Ask family to preserve this evidence quickly.",
      },
      {
        title: "Apply for bail",
        description:
          "Most fight-related offences are bailable. Your lawyer can file a bail application. For serious injuries, bail may be harder to obtain.",
      },
    ],
    fines: [
      { label: "Simple hurt (Section 323 IPC)", amount: "Up to ₹1,000 fine + 1 year imprisonment" },
      { label: "Voluntarily causing hurt (Section 323)", amount: "Varies by court" },
      { label: "Grievous hurt (Section 325 IPC)", amount: "Up to ₹1,000 fine + 7 years imprisonment" },
    ],
    documents: [
      "Any medical reports of injuries",
      "Witness contact details",
      "CCTV or video evidence",
      "Copy of FIR (ask police or court)",
      "Bail application documents (via lawyer)",
    ],
    warnings: [
      "Never sign any document you don't understand.",
      "Do not agree to 'compromise' at the police station without legal advice — it may still result in charges.",
      "Counter-FIR: if you were assaulted first, your lawyer can help you file a counter-complaint.",
      "Social media posts about the incident can harm your case — stay silent online.",
    ],
    laws: [
      {
        act: "Indian Penal Code, 1860",
        section: "Section 323",
        description: "Punishment for voluntarily causing hurt — up to 1 year imprisonment or ₹1,000 fine.",
      },
      {
        act: "Indian Penal Code, 1860",
        section: "Section 325",
        description: "Voluntarily causing grievous hurt — up to 7 years imprisonment.",
      },
      {
        act: "Indian Penal Code, 1860",
        section: "Section 96-106",
        description: "Right of private defence — self-defence is a valid legal argument.",
      },
    ],
    whenToGetLawyer:
      "You need a criminal defence lawyer immediately. Do not wait. Contact NALSA (15100) for free legal aid if you cannot afford a lawyer.",
  },
  {
    slug: "traffic-challan",
    title: "Received a Traffic Challan",
    shortDescription:
      "Got a traffic fine for speeding, signal jump, or no helmet? Understand the fine, how to pay, and how to contest it.",
    icon: "🚦",
    category: "Traffic",
    urgency: "low",
    isOffense: true,
    summary:
      "Traffic challans are issued under the Motor Vehicles Act. You can pay online or contest the challan in court if you believe it was wrongly issued.",
    yourRights: [
      "You can view all your challans on Parivahan or state traffic portals.",
      "You have the right to contest a challan in traffic court.",
      "E-challans must have clear photo/video evidence in many states.",
      "You cannot be forced to pay on the spot in most states (spot fines are limited).",
    ],
    steps: [
      {
        title: "Verify the challan",
        description:
          "Check on https://echallan.parivahan.gov.in or your state's traffic portal. Confirm vehicle number, date, and violation type.",
      },
      {
        title: "Pay online if valid",
        description:
          "Pay through official portals only. Keep the payment receipt. Paying does not mean you admit guilt if you plan to contest.",
      },
      {
        title: "Contest if wrongful",
        description:
          "File a complaint at the traffic court mentioned on the challan within the stipulated time (usually 30-60 days). Bring evidence.",
      },
      {
        title: "Check for compounding",
        description:
          "Some minor offences can be compounded (settled) at the traffic police office without court appearance.",
      },
    ],
    fines: [
      { label: "No helmet (two-wheeler)", amount: "₹1,000" },
      { label: "Signal jump", amount: "₹1,000 – ₹5,000" },
      { label: "Over-speeding", amount: "₹1,000 – ₹2,000" },
      { label: "Drunk driving", amount: "₹10,000 + imprisonment" },
      { label: "No seatbelt", amount: "₹1,000" },
    ],
    documents: ["Vehicle RC", "Driving Licence", "Challan copy", "Evidence for contest (photos, GPS logs)"],
    warnings: [
      "Unpaid challans can lead to licence suspension or vehicle registration hold.",
      "Do not pay bribes to avoid challans — this is a criminal offence.",
      "Fake challan SMS links exist — only use official government websites.",
    ],
    laws: [
      {
        act: "Motor Vehicles Act, 1988",
        section: "Section 183-194",
        description: "Penalties for various traffic violations.",
      },
    ],
    whenToGetLawyer:
      "If facing licence suspension, court summons, or a challan for a serious offence like drunk driving, consult a motor vehicle lawyer.",
  },
  {
    slug: "consumer-cheated",
    title: "Cheated by a Shop or Online Seller",
    shortDescription:
      "Bought a defective product or were cheated? Know your consumer rights and how to file a complaint.",
    icon: "🛒",
    category: "Consumer Rights",
    urgency: "medium",
    isOffense: true,
    summary:
      "The Consumer Protection Act, 2019 gives you the right to seek refund, replacement, or compensation for defective goods and deficient services.",
    yourRights: [
      "Right to be protected against defective products and poor services.",
      "Right to seek redressal through Consumer Commissions.",
      "Right to fair compensation for harm caused.",
      "E-commerce platforms are also liable under the Act.",
    ],
    steps: [
      {
        title: "Document the issue",
        description:
          "Keep bills, screenshots, emails, and photos/videos of the defect. This is your primary evidence.",
      },
      {
        title: "Send a written complaint to the seller",
        description:
          "Email or registered post giving them 15-30 days to resolve. Many cases settle at this stage.",
      },
      {
        title: "File on National Consumer Helpline",
        description:
          "Call 1800-11-4000 or file at https://consumerhelpline.gov.in. This creates an official record.",
      },
      {
        title: "File in Consumer Commission",
        description:
          "District Commission: claims up to ₹50 lakh. State Commission: ₹50 lakh to ₹2 crore. National Commission: above ₹2 crore.",
      },
    ],
    fines: [
      { label: "Compensation for defect", amount: "Refund + damages as ordered" },
      { label: "Mental agony compensation", amount: "At commission's discretion" },
      { label: "Legal costs", amount: "Often awarded to consumer if they win" },
    ],
    documents: ["Purchase invoice/bill", "Warranty card", "Communication with seller", "Photos/videos of defect", "Bank/payment proof"],
    warnings: [
      "Don't throw away the defective product until the case is resolved.",
      "Limitation period is 2 years from the cause of action.",
      "Avoid signing any 'no further claims' document without legal advice.",
    ],
    laws: [
      {
        act: "Consumer Protection Act, 2019",
        section: "Section 35",
        description: "Jurisdiction of District Consumer Disputes Redressal Commission.",
      },
    ],
    whenToGetLawyer:
      "For claims above ₹1 lakh or complex cases involving e-commerce fraud, consider a consumer law advocate.",
  },
  {
    slug: "arrested-what-to-do",
    title: "You or Someone You Know Was Arrested",
    shortDescription:
      "Immediate steps when an arrest happens — rights, bail, and how to get legal help fast.",
    icon: "🚨",
    category: "Criminal",
    urgency: "high",
    isOffense: false,
    summary:
      "An arrest is serious but you have strong constitutional protections. Acting quickly and correctly can make a significant difference.",
    yourRights: [
      "Right to be informed of grounds of arrest (Article 22, Constitution).",
      "Right to consult a lawyer of your choice.",
      "Right to be produced before nearest magistrate within 24 hours.",
      "Right against self-incrimination.",
      "Right to free legal aid if you cannot afford a lawyer (NALSA).",
    ],
    steps: [
      {
        title: "Contact a lawyer immediately",
        description:
          "Call a criminal lawyer or NALSA helpline 15100. Legal aid is free for those who qualify.",
      },
      {
        title: "Find out which police station",
        description:
          "Family should go to the station and ask for the FIR number, sections charged, and arrest memo.",
      },
      {
        title: "Apply for bail",
        description:
          "For bailable offences, bail is a right. For non-bailable offences, bail is at the court's discretion — your lawyer will file the application.",
      },
      {
        title: "Ensure 24-hour magistrate rule",
        description:
          "Police must produce the arrested person before a magistrate within 24 hours. If not, it is illegal detention.",
      },
    ],
    fines: [],
    documents: ["Arrest memo copy", "FIR copy", "Bail application", "Surety documents", "ID proofs of surety"],
    warnings: [
      "Do not attempt to bribe police for release — this worsens the situation.",
      "Do not give false surety information for bail.",
      "Illegal detention can be challenged through habeas corpus petition.",
    ],
    laws: [
      {
        act: "Constitution of India",
        section: "Article 22",
        description: "Protection against arrest and detention.",
      },
      {
        act: "Code of Criminal Procedure, 1973",
        section: "Section 50",
        description: "Person arrested to be informed of grounds and right to bail.",
      },
    ],
    whenToGetLawyer:
      "A criminal lawyer is essential from the very first moment. Contact NALSA at 15100 for free legal aid.",
  },
];

export function getScenarioBySlug(slug: string): Scenario | undefined {
  return scenarios.find((s) => s.slug === slug);
}
