import type { Branch } from "@/types";

export const branches: Branch[] = [
  {
    id: "br-001",
    name: "Shree Vaari Chit Finance - T. Nagar",
    code: "SVCF-CHN",
    location: "Chennai",
    address: "24, Usman Road, T. Nagar, Chennai, Tamil Nadu 600017",
    managerName: "Karthik Subramaniam",
    phone: "+91 98400 12345",
    email: "tnagar.chennai@shreevaarichits.in",
    openingDate: "2015-04-01",
    status: "active",
    totalCustomers: 12,
    activeChitGroups: 3,
    monthlyCollection: 1842000,
    pendingAmount: 186000,
  },
  {
    id: "br-002",
    name: "Shree Vaari Chit Finance - R.S. Puram",
    code: "SVCF-CBE",
    location: "Coimbatore",
    address: "112, D.B. Road, R.S. Puram, Coimbatore, Tamil Nadu 641002",
    managerName: "Lakshmi Narayanan",
    phone: "+91 98430 56789",
    email: "rspuram.coimbatore@shreevaarichits.in",
    openingDate: "2017-08-15",
    status: "active",
    totalCustomers: 9,
    activeChitGroups: 2,
    monthlyCollection: 1215000,
    pendingAmount: 94000,
  },
  {
    id: "br-003",
    name: "Shree Vaari Chit Finance - Anna Nagar",
    code: "SVCF-MDU",
    location: "Madurai",
    address: "45, K.K. Nagar Main Road, Madurai, Tamil Nadu 625020",
    managerName: "Meenakshi Sundaram",
    phone: "+91 97890 23456",
    email: "annanagar.madurai@shreevaarichits.in",
    openingDate: "2020-01-10",
    status: "active",
    totalCustomers: 4,
    activeChitGroups: 0,
    monthlyCollection: 312000,
    pendingAmount: 28000,
  },
];

export function getBranchById(id: string): Branch | undefined {
  return branches.find((b) => b.id === id);
}
