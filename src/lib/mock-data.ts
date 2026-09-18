export type ChallengeStatus =
  | "Submitted"
  | "Assigned"
  | "Accepted by University"
  | "In Progress"
  | "Expert Verification Pending"
  | "Solved";
export type Priority = "Low" | "Medium" | "High" | "Critical";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  district: string;
  block: string;
  status: ChallengeStatus;
  priority: Priority;
  submittedOn: string;
  submitter: string;
  assignedTo?: string;
  department?: string;
  deadline?: string;
  aiCategory: string;
  aiConfidence: number;
  progress: number;
}

export const DISTRICTS = [
  "Ranchi",
  "Dhanbad",
  "Jamshedpur",
  "Bokaro",
  "Hazaribagh",
  "Deoghar",
  "Giridih",
  "Palamu",
  "Dumka",
  "Chaibasa",
];

export const CATEGORIES = [
  "Water",
  "Roads",
  "Education",
  "Health",
  "Sanitation",
  "Electricity",
  "Other",
];

export const UNIVERSITIES = [
  "BIT Sindri, Dhanbad",
  "NIT Jamshedpur",
  "RVM University, Ranchi",
  "Central University of Jharkhand",
  "Birla Institute of Technology, Mesra",
];

export const DEPARTMENTS = [
  "Civil Engineering",
  "Computer Science",
  "Environmental Science",
  "Public Health",
  "Electrical Engineering",
];

export const GOV_DEPARTMENTS = [
  "Urban Development",
  "Rural Development",
  "Drinking Water & Sanitation",
  "Health & Family Welfare",
  "Energy",
];

export const challenges: Challenge[] = [
  {
    id: "JH-2041",
    title: "Contaminated drinking water in Namkum block",
    description:
      "Hand pumps across 6 hamlets are drawing water with a strong iron smell. Nearly 400 households are affected and cases of stomach illness have risen sharply over the past month.",
    category: "Water",
    district: "Ranchi",
    block: "Namkum",
    status: "In Progress",
    priority: "Critical",
    submittedOn: "2026-08-02",
    submitter: "Anjali Mahto",
    assignedTo: "BIT Sindri, Dhanbad",
    department: "Environmental Science",
    deadline: "2026-10-15",
    aiCategory: "Water & Sanitation",
    aiConfidence: 94,
    progress: 60,
  },
  {
    id: "JH-2042",
    title: "Damaged approach road to Govindpur market",
    description:
      "The 3.2 km stretch connecting the village to Govindpur market has deep potholes making it impassable for goods vehicles during monsoon.",
    category: "Roads",
    district: "Dhanbad",
    block: "Govindpur",
    status: "Assigned",
    priority: "High",
    submittedOn: "2026-08-07",
    submitter: "Rakesh Kumar Singh",
    assignedTo: "NIT Jamshedpur",
    department: "Civil Engineering",
    deadline: "2026-11-01",
    aiCategory: "Transport Infrastructure",
    aiConfidence: 91,
    progress: 20,
  },
  {
    id: "JH-2043",
    title: "No science lab equipment in upgraded high school",
    description:
      "The school was upgraded two years ago but the physics and chemistry labs remain empty, affecting 240 students preparing for board exams.",
    category: "Education",
    district: "Hazaribagh",
    block: "Barhi",
    status: "Submitted",
    priority: "Medium",
    submittedOn: "2026-08-11",
    submitter: "Sunita Devi",
    aiCategory: "Education Infrastructure",
    aiConfidence: 88,
    progress: 0,
  },
  {
    id: "JH-2044",
    title: "Frequent power cuts affecting rural health centre",
    description:
      "The primary health centre loses power for 8-10 hours daily, spoiling the vaccine cold chain and halting night deliveries.",
    category: "Electricity",
    district: "Palamu",
    block: "Chainpur",
    status: "In Progress",
    priority: "Critical",
    submittedOn: "2026-07-21",
    submitter: "Dr. Imran Ansari",
    assignedTo: "Birla Institute of Technology, Mesra",
    department: "Electrical Engineering",
    deadline: "2026-09-30",
    aiCategory: "Energy Reliability",
    aiConfidence: 96,
    progress: 75,
  },
  {
    id: "JH-2045",
    title: "Open drainage overflow near Sakchi bazaar",
    description:
      "Blocked storm drains overflow into the vegetable market causing severe hygiene issues for vendors and shoppers.",
    category: "Sanitation",
    district: "Jamshedpur",
    block: "Sakchi",
    status: "Solved",
    priority: "High",
    submittedOn: "2026-05-14",
    submitter: "Pooja Sharma",
    assignedTo: "NIT Jamshedpur",
    department: "Civil Engineering",
    deadline: "2026-08-01",
    aiCategory: "Water & Sanitation",
    aiConfidence: 92,
    progress: 100,
  },
  {
    id: "JH-2046",
    title: "Shortage of ANM staff at sub-centre",
    description:
      "A single auxiliary nurse midwife serves 11 villages, leading to long delays in antenatal checkups.",
    category: "Health",
    district: "Dumka",
    block: "Jarmundi",
    status: "Submitted",
    priority: "High",
    submittedOn: "2026-08-16",
    submitter: "Meera Hansda",
    aiCategory: "Public Health Capacity",
    aiConfidence: 85,
    progress: 0,
  },
  {
    id: "JH-2047",
    title: "Dried-up community pond used by 12 villages",
    description:
      "The traditional pond that recharged local wells has silted up completely, worsening the summer water crisis.",
    category: "Water",
    district: "Giridih",
    block: "Bengabad",
    status: "Assigned",
    priority: "High",
    submittedOn: "2026-08-04",
    submitter: "Ramesh Yadav",
    assignedTo: "Central University of Jharkhand",
    department: "Environmental Science",
    deadline: "2026-12-10",
    aiCategory: "Water Conservation",
    aiConfidence: 90,
    progress: 15,
  },
  {
    id: "JH-2048",
    title: "Street lights non-functional in Sector 4",
    description:
      "Over 60 street lights have been dark for five months, raising safety concerns for women commuting after dusk.",
    category: "Electricity",
    district: "Bokaro",
    block: "Chas",
    status: "Solved",
    priority: "Medium",
    submittedOn: "2026-06-02",
    submitter: "Amit Verma",
    assignedTo: "BIT Sindri, Dhanbad",
    department: "Electrical Engineering",
    deadline: "2026-07-20",
    aiCategory: "Urban Lighting",
    aiConfidence: 93,
    progress: 100,
  },
  {
    id: "JH-2049",
    title: "Solid waste dumping beside primary school",
    description:
      "An informal dump site has grown next to the school boundary wall, causing respiratory complaints among children.",
    category: "Sanitation",
    district: "Deoghar",
    block: "Mohanpur",
    status: "Submitted",
    priority: "Critical",
    submittedOn: "2026-08-18",
    submitter: "Kavita Rani",
    aiCategory: "Waste Management",
    aiConfidence: 89,
    progress: 0,
  },
  {
    id: "JH-2050",
    title: "Digital classroom internet connectivity failure",
    description:
      "Smart classroom equipment provided under a state scheme is unused because the broadband link has never been activated.",
    category: "Education",
    district: "Chaibasa",
    block: "Tonto",
    status: "In Progress",
    priority: "Low",
    submittedOn: "2026-07-09",
    submitter: "Suresh Purty",
    assignedTo: "RVM University, Ranchi",
    department: "Computer Science",
    deadline: "2026-10-05",
    aiCategory: "Digital Education",
    aiConfidence: 87,
    progress: 45,
  },
];

export const categoryChartData = CATEGORIES.map((c) => ({
  name: c,
  value: challenges.filter((ch) => ch.category === c).length || 1,
}));

export const districtChartData = [
  { district: "Ranchi", count: 312 },
  { district: "Dhanbad", count: 248 },
  { district: "Jamshedpur", count: 201 },
  { district: "Bokaro", count: 164 },
  { district: "Hazaribagh", count: 122 },
];

export const submissionTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  submissions: Math.round(18 + Math.sin(i / 3) * 8 + (i % 5) * 2),
}));

export const users = [
  { name: "Anjali Mahto", role: "Citizen", org: "Ranchi", status: "Active" },
  { name: "R. K. Prasad", role: "Gov Officer", org: "Urban Development", status: "Active" },
  { name: "Dr. S. Banerjee", role: "University", org: "BIT Sindri, Dhanbad", status: "Pending" },
  { name: "Priya Toppo", role: "University", org: "NIT Jamshedpur", status: "Active" },
  { name: "Admin Desk", role: "Admin", org: "IT Cell, Ranchi", status: "Active" },
  { name: "Mohan Oraon", role: "Citizen", org: "Gumla", status: "Suspended" },
];

export const activityFeed = [
  { text: "Progress note added to JH-2041 by Dr. S. Banerjee", time: "2 hours ago" },
  { text: "JH-2047 accepted by Environmental Science department", time: "Yesterday" },
  { text: "Field testing started for JH-2044", time: "2 days ago" },
  { text: "JH-2048 marked as complete", time: "5 days ago" },
];

// ---------------------------------------------------------------------------
// Industry / tender layer (shaped for a future Supabase migration: every record
// is a flat row with an explicit challenge_id foreign key)
// ---------------------------------------------------------------------------

export const UNIVERSITY_TYPES = [
  "State University",
  "Central University",
  "Private University",
  "Deemed University",
  "Engineering College",
];

export const INDUSTRY_SECTORS = [
  "Construction & Infrastructure",
  "Water Technology",
  "Renewable Energy",
  "Healthcare",
  "Information Technology",
  "Waste Management",
];

export type PaymentStatus = "Pending" | "Released";

export interface Bid {
  id: string;
  challengeId: string;
  company: string;
  sector: string;
  budget: number;
  timelineWeeks: number;
  universityPartner: string;
  solutionSummary: string;
  paymentStatus: PaymentStatus;
  proofOfWork: boolean;
}

export const bids: Bid[] = [
  {
    id: "BID-101",
    challengeId: "JH-2041",
    company: "Aqua Terra Systems Pvt Ltd",
    sector: "Water Technology",
    budget: 1850000,
    timelineWeeks: 14,
    universityPartner: "BIT Sindri, Dhanbad",
    solutionSummary:
      "Community-scale iron removal plants at 6 hamlets with IoT quality sensors; BIT Sindri provides water testing protocol and monthly audits.",
    paymentStatus: "Pending",
    proofOfWork: true,
  },
  {
    id: "BID-102",
    challengeId: "JH-2041",
    company: "Nirmal Infra Solutions",
    sector: "Construction & Infrastructure",
    budget: 2250000,
    timelineWeeks: 10,
    universityPartner: "Central University of Jharkhand",
    solutionSummary:
      "Pipeline replacement plus two overhead tanks; university team handles hydro-geological survey and community training.",
    paymentStatus: "Pending",
    proofOfWork: false,
  },
  {
    id: "BID-103",
    challengeId: "JH-2042",
    company: "Chotanagpur Roadways Engineering",
    sector: "Construction & Infrastructure",
    budget: 3400000,
    timelineWeeks: 20,
    universityPartner: "NIT Jamshedpur",
    solutionSummary:
      "Full 3.2 km rigid pavement with side drains; NIT Jamshedpur validates soil bearing capacity and material mix design.",
    paymentStatus: "Released",
    proofOfWork: true,
  },
  {
    id: "BID-104",
    challengeId: "JH-2044",
    company: "SolarKrit Energy",
    sector: "Renewable Energy",
    budget: 980000,
    timelineWeeks: 8,
    universityPartner: "Birla Institute of Technology, Mesra",
    solutionSummary:
      "12 kW rooftop solar with battery backup sized for the vaccine cold chain; BIT Mesra certifies load calculations.",
    paymentStatus: "Released",
    proofOfWork: false,
  },
];

export function bidsFor(challengeId: string) {
  return bids.filter((b) => b.challengeId === challengeId);
}

export interface Tender {
  id: string;
  challengeId: string;
  title: string;
  district: string;
  category: string;
  estimatedBudget: number;
  closingDate: string;
  universityPartner: string;
}

export const openTenders: Tender[] = [
  {
    id: "TEN-501",
    challengeId: "JH-2043",
    title: "Science lab equipment supply for upgraded high school",
    district: "Hazaribagh",
    category: "Education",
    estimatedBudget: 1200000,
    closingDate: "2026-09-28",
    universityPartner: "RVM University, Ranchi",
  },
  {
    id: "TEN-502",
    challengeId: "JH-2047",
    title: "Desilting and recharge works for community pond",
    district: "Giridih",
    category: "Water",
    estimatedBudget: 2600000,
    closingDate: "2026-10-06",
    universityPartner: "Central University of Jharkhand",
  },
  {
    id: "TEN-503",
    challengeId: "JH-2049",
    title: "Solid waste clearance and segregation unit near school",
    district: "Deoghar",
    category: "Sanitation",
    estimatedBudget: 780000,
    closingDate: "2026-09-20",
    universityPartner: "BIT Sindri, Dhanbad",
  },
];

export interface IndustryProject {
  id: string;
  challengeId: string;
  title: string;
  district: string;
  stage: string;
  progress: number;
  budget: number;
  paymentStatus: PaymentStatus;
  proofUploaded: boolean;
  deadline: string;
}

export const industryProjects: IndustryProject[] = [
  {
    id: "PRJ-901",
    challengeId: "JH-2041",
    title: "Iron removal plants, Namkum block",
    district: "Ranchi",
    stage: "Field Testing",
    progress: 60,
    budget: 1850000,
    paymentStatus: "Pending",
    proofUploaded: true,
    deadline: "2026-10-15",
  },
  {
    id: "PRJ-902",
    challengeId: "JH-2044",
    title: "Solar backup for Chainpur health centre",
    district: "Palamu",
    stage: "Deployment",
    progress: 80,
    budget: 980000,
    paymentStatus: "Released",
    proofUploaded: false,
    deadline: "2026-09-30",
  },
  {
    id: "PRJ-903",
    challengeId: "JH-2042",
    title: "Govindpur approach road rebuild",
    district: "Dhanbad",
    stage: "Prototype",
    progress: 25,
    budget: 3400000,
    paymentStatus: "Pending",
    proofUploaded: false,
    deadline: "2026-11-01",
  },
];

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
