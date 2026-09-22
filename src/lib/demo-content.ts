import type { Profession, SiteContent } from "./types";

// Realistic sample content for live demos (PRD MKT-04). Uses picsum placeholders for imagery.
const img = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const base = (profession: Profession): Omit<SiteContent, "services"> & { services: SiteContent["services"] } => ({
  brand: { name: "", tagline: "" },
  about: { intro: "", full: "" },
  services: [],
  team: [],
  photos: { hero: img(profession + "-hero"), gallery: [1, 2, 3, 4, 5, 6].map((i) => img(`${profession}-g${i}`, 800, 600)) },
  contact: {
    phone: "+91 98200 12345",
    whatsapp: "+91 98200 12345",
    email: "hello@example.in",
    address: "Sector 17, Vashi, Navi Mumbai 400703",
    mapsLink: "https://maps.google.com/?q=Vashi+Navi+Mumbai",
    hours: "Mon–Sat 10:00–20:00",
  },
  social: { instagram: "https://instagram.com", facebook: "https://facebook.com", city: "Navi Mumbai" },
  faq: [],
});

export const DEMO_CONTENT: Record<Profession, SiteContent> = {
  dentist: {
    ...base("dentist"),
    brand: { name: "Parasnath Dental Clinic", tagline: "Gentle, modern dentistry for the whole family" },
    about: {
      intro: "A family dental clinic in Vashi offering painless treatments with digital X-rays, sterilised instruments and transparent pricing.",
      full:
        "Parasnath Dental Clinic was started in 2012 by Dr. Meera Shah with one chair and a simple promise: no patient should fear the dentist. Today our team of four doctors treats over 300 families a month across general, cosmetic and children's dentistry.\n\nWe follow strict sterilisation protocols, explain every treatment plan before we begin, and never push procedures you do not need.",
      foundedYear: "2012",
      teamSize: "4 doctors, 5 staff",
      mission: "Painless, honest dentistry that families can afford.",
    },
    services: [
      { name: "Root canal treatment", description: "Single-sitting RCT with rotary endodontics and digital imaging.", duration: "60–90 min" },
      { name: "Dental implants", description: "Permanent tooth replacement with Swiss and Korean implant systems.", duration: "2 visits" },
      { name: "Clear aligners", description: "Invisible teeth straightening with monthly reviews.", duration: "6–18 months" },
      { name: "Teeth whitening", description: "In-clinic whitening that lifts shade in a single sitting.", duration: "45 min" },
      { name: "Kids dentistry", description: "Fluoride, sealants and cavity care in a child-friendly room.", duration: "30 min" },
      { name: "Scaling & polishing", description: "Ultrasonic cleaning to remove plaque and stains.", duration: "30 min" },
    ],
    team: [
      { name: "Dr. Meera Shah", role: "Founder & Chief Dental Surgeon", qualification: "BDS, MDS (Endodontics)", bio: "14 years in practice; former lecturer at Nair Dental College.", photo: img("dr1", 600, 600) },
      { name: "Dr. Rohan Kulkarni", role: "Orthodontist", qualification: "BDS, MDS (Orthodontics)", bio: "Aligner and braces specialist with 600+ completed cases.", photo: img("dr2", 600, 600) },
      { name: "Dr. Ayesha Khan", role: "Paediatric Dentist", qualification: "BDS, MDS (Pedodontics)", bio: "Makes first visits fun for kids and calm for parents.", photo: img("dr3", 600, 600) },
    ],
    faq: [
      { q: "Is root canal painful?", a: "With modern anaesthesia and rotary tools, most patients feel only mild pressure. We complete most RCTs in one sitting." },
      { q: "Do you accept insurance?", a: "We provide itemised bills and treatment summaries you can submit to your insurer for reimbursement." },
      { q: "How do I book?", a: "Call, WhatsApp, or use the appointment form. We confirm within 30 minutes during clinic hours." },
    ],
    dentist: {
      registrationNumber: "MSDC A-12345",
      qualifications: "BDS, MDS",
      treatments: ["Root canal (RCT)", "Dental implants", "Clear aligners", "Teeth whitening", "Paediatric dentistry", "Scaling & polishing"],
      timings: "Mon–Sat: 10:00–13:30, 17:00–21:00\nSun: Closed",
      appointmentPreference: "WhatsApp",
      branches: [
        { name: "Vashi", address: "Shop 4, Sector 17, Vashi", phone: "+91 98200 12345", timings: "Mon–Sat 10–9" },
        { name: "Nerul", address: "Plot 21, Sector 19A, Nerul", phone: "+91 98200 54321", timings: "Mon–Sat 10–8" },
      ],
    },
  },
  lawyer: {
    ...base("lawyer"),
    brand: { name: "Deshmukh & Associates", tagline: "Advocates & Legal Consultants" },
    about: {
      intro: "A Navi Mumbai law chamber advising individuals and businesses on civil, property, family and commercial matters since 2009.",
      full:
        "Deshmukh & Associates was founded by Adv. Sameer Deshmukh in 2009. The chamber appears before the Bombay High Court, the District & Sessions Court at Thane, consumer forums and the RERA Authority.\n\nWe believe clients deserve plain-language advice, realistic timelines and complete confidentiality. This website is for information only and does not constitute solicitation or advertisement.",
      foundedYear: "2009",
      teamSize: "3 advocates, 2 juniors",
    },
    services: [
      { name: "Property & RERA", description: "Title due diligence, agreements, redevelopment and RERA complaints." },
      { name: "Civil litigation", description: "Recovery suits, injunctions, specific performance and appeals." },
      { name: "Family matters", description: "Divorce, maintenance, custody and domestic violence matters handled with discretion." },
      { name: "Commercial & startup", description: "Contracts, shareholder agreements, compliance and dispute resolution." },
      { name: "Cheque bounce (NI Act)", description: "Section 138 complaints and defence." },
    ],
    team: [
      { name: "Adv. Sameer Deshmukh", role: "Founding Partner", qualification: "B.A., LL.B., LL.M.", bio: "Enrolled 2009. Practises before the Bombay High Court and Thane courts.", photo: img("adv1", 600, 600) },
      { name: "Adv. Priya Nair", role: "Partner — Family & Civil", qualification: "B.L.S., LL.B.", bio: "Focuses on matrimonial and property matters.", photo: img("adv2", 600, 600) },
    ],
    faq: [
      { q: "Do you offer a first consultation?", a: "Yes. Consultations are by appointment, in person at the chamber or over video call." },
      { q: "Which courts do you appear in?", a: "Bombay High Court, District & Sessions Court Thane, Family Court, Consumer Forum and the RERA Authority." },
    ],
    lawyer: {
      enrolment: "MAH/2210/2009",
      practiceAreas: ["Property", "Civil", "Family & matrimonial", "Corporate & commercial", "Cheque bounce (NI Act)", "Real estate / RERA"],
      courts: ["Bombay High Court", "District & Sessions Court, Thane", "Family Court", "Consumer Forum", "RERA Authority"],
      languages: ["English", "Hindi", "Marathi"],
      chamberAddress: "Office 302, Persipolis, Sector 17, Vashi, Navi Mumbai 400703",
      consultationMode: "In person or video",
    },
  },
  institute: {
    ...base("institute"),
    brand: { name: "Apex Academy", tagline: "Coaching for JEE, NEET and Foundation" },
    about: {
      intro: "Apex Academy prepares students from Class 8 to 12 for JEE, NEET and board exams with small batches and weekly parent reports.",
      full:
        "Founded in 2015 by IIT alumni, Apex Academy runs classroom and hybrid batches from two centres in Navi Mumbai. Our batches are capped at 30 students so every doubt gets answered.\n\nEvery parent receives a fortnightly progress report with test scores, attendance and mentor notes.",
      foundedYear: "2015",
      teamSize: "18 faculty",
    },
    services: [
      { name: "JEE Main + Advanced", description: "2-year integrated programme for Class 11–12 with weekly tests.", duration: "2 years" },
      { name: "NEET", description: "Biology-heavy schedule with NCERT line-by-line coverage.", duration: "2 years" },
      { name: "Foundation (Class 8–10)", description: "Maths and science fundamentals with Olympiad exposure.", duration: "1 year" },
      { name: "Crash course", description: "90-day revision batch for droppers and repeaters.", duration: "3 months" },
    ],
    team: [
      { name: "Anil Verma", role: "Director — Physics", qualification: "B.Tech IIT Bombay", bio: "12 years teaching JEE Physics.", photo: img("fac1", 600, 600) },
      { name: "Sneha Iyer", role: "HOD — Biology", qualification: "M.Sc., B.Ed.", bio: "NEET Biology mentor; 9 years experience.", photo: img("fac2", 600, 600) },
    ],
    faq: [
      { q: "What is the batch size?", a: "Maximum 30 students per batch." },
      { q: "Do you provide study material?", a: "Yes — printed modules, daily practice sheets and an online test series are included in the fees." },
    ],
    institute: {
      courses: [
        { name: "JEE 2-year integrated", duration: "2 years", mode: "Classroom", eligibility: "Class 10 passed", fees: "₹1,20,000 / year" },
        { name: "NEET 2-year integrated", duration: "2 years", mode: "Hybrid", eligibility: "Class 10 passed", fees: "₹1,10,000 / year" },
        { name: "Foundation Class 9", duration: "1 year", mode: "Classroom", eligibility: "Class 8 passed", fees: "₹45,000 / year" },
        { name: "Crash course", duration: "3 months", mode: "Online", eligibility: "Class 12 appeared", fees: "₹25,000" },
      ],
      batches: [
        { course: "JEE 2-year integrated", startDate: "2026-10-05", timing: "Mon–Fri 4–7 pm" },
        { course: "NEET 2-year integrated", startDate: "2026-10-12", timing: "Mon–Fri 5–8 pm" },
        { course: "Crash course", startDate: "2026-11-01", timing: "Daily 7–10 am" },
      ],
      achievements: [
        { text: "42 students qualified JEE Advanced", year: "2026", source: "JEE Advanced result sheets (internal records)" },
        { text: "Top NEET score 688/720", year: "2026", source: "NTA scorecard" },
      ],
      affiliations: "Registered under Maharashtra Shops & Establishments Act",
      placementPartners: "",
    },
  },
  realestate: {
    ...base("realestate"),
    brand: { name: "Horizon Realty", tagline: "Homes and offices across Navi Mumbai" },
    about: {
      intro: "RERA-registered channel partner for ready and under-construction homes in Vashi, Nerul, Kharghar and Panvel.",
      full:
        "Horizon Realty has helped over 900 families and 120 businesses find the right property since 2014. We work directly with developers so you get launch pricing, verified RERA documents and honest possession timelines.\n\nEvery listing on this site shows its RERA registration number; verify it any time at maharera.mahaonline.gov.in.",
      foundedYear: "2014",
      teamSize: "12 consultants",
    },
    services: [
      { name: "New launch homes", description: "Pre-launch and launch inventory with developer pricing." },
      { name: "Resale & rentals", description: "Verified resale and rental homes with legal check." },
      { name: "Commercial spaces", description: "Offices and shops in Vashi, Belapur and Airoli." },
      { name: "Home loan assistance", description: "Tie-ups with 8 banks for fast sanction." },
    ],
    team: [{ name: "Vikram Patil", role: "Founder", qualification: "MahaRERA Agent", bio: "18 years in Navi Mumbai real estate.", photo: img("agent1", 600, 600) }],
    faq: [
      { q: "Is brokerage charged on new launches?", a: "No. On developer inventory our fee is paid by the developer." },
      { q: "Can I verify RERA numbers?", a: "Yes — every project shows its RERA number and a link to the MahaRERA website." },
    ],
    realestate: {
      rera: "A51700001234",
      agentDetails: "Horizon Realty LLP · MahaRERA Agent Registration A51700001234",
      listings: [
        { title: "Skyline Heights", type: "Apartment", bhk: "2 & 3 BHK", carpetArea: "720–1,150 sq ft", priceRange: "₹1.35 Cr – ₹2.1 Cr", location: "Sector 36, Kharghar", amenities: "Clubhouse, pool, gym, kids' play area", possession: "Dec 2027", reraNumber: "P52000012345", image: img("re1", 800, 600) },
        { title: "Palm Meadows", type: "Villa", bhk: "4 BHK", carpetArea: "2,400 sq ft", priceRange: "₹4.5 Cr onwards", location: "Panvel", amenities: "Private garden, solar, EV charging", possession: "Ready", reraNumber: "P52000067890", image: img("re2", 800, 600) },
        { title: "Trade Centre One", type: "Office", carpetArea: "450–3,000 sq ft", priceRange: "₹95 L – ₹6 Cr", location: "CBD Belapur", amenities: "Grade A, 24×7 power backup", possession: "Mar 2027", reraNumber: "P52000024680", image: img("re3", 800, 600) },
        { title: "Green Acres Plots", type: "Plot", carpetArea: "1,000–2,500 sq ft", priceRange: "₹28 L – ₹70 L", location: "Karjat", amenities: "Gated, tar roads, water", possession: "Ready", reraNumber: "P52000013579", image: img("re4", 800, 600) },
      ],
    },
  },
};

export function demoFor(profession: Profession): SiteContent {
  return JSON.parse(JSON.stringify(DEMO_CONTENT[profession]));
}
