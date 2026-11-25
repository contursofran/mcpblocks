// In-memory sample data. Replace with your CRM / database.
export const STAGES = ["Lead", "Qualified", "Proposal", "Negotiation", "Won"] as const
export type Stage = (typeof STAGES)[number]

export type Deal = {
  id: string
  company: string
  contact: string
  email: string
  stage: Stage
  amount: number
  closeDate: string
  note: string
}

export const deals: Deal[] = [
  { id: "d1", company: "Northwind Traders", contact: "Sarah Chen", email: "sarah@northwind.example", stage: "Proposal", amount: 48000, closeDate: "Dec 12", note: "Waiting on legal review of the MSA." },
  { id: "d2", company: "Globex Corp", contact: "Marcus Johnson", email: "marcus@globex.example", stage: "Negotiation", amount: 120000, closeDate: "Dec 20", note: "Asked for a 10% multi-year discount." },
  { id: "d3", company: "Initech", contact: "Emily Rodriguez", email: "emily@initech.example", stage: "Qualified", amount: 22500, closeDate: "Jan 15", note: "Pilot with two teams starts in January." },
  { id: "d4", company: "Umbrella Labs", contact: "Priya Patel", email: "priya@umbrella.example", stage: "Lead", amount: 9800, closeDate: "Feb 2", note: "Inbound from the webinar." },
]

export const trend = {
  labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
  series: [
    { name: "Pipeline ($k)", values: [180, 205, 190, 240, 262, 300] },
    { name: "Closed won ($k)", values: [42, 55, 38, 70, 64, 91] },
  ],
}

export const nextStage = (s: Stage): Stage | null => STAGES[STAGES.indexOf(s) + 1] ?? null
