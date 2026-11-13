export type ItemType = 'lost' | 'found';

export type ItemStatus = 'open' | 'claim_pending' | 'claimed' | 'closed';

export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'collected';

export type ItemCategory = 
  | 'Keys & Keychains'
  | 'ID Cards & College ID Cards'
  | 'Wallets & Purses'
  | 'Gold Chains & Jewellery'
  | 'Watches'
  | 'Earphones & Headphones'
  | 'Mobile Phones'
  | 'Tablets & iPads'
  | 'Laptops & Chargers'
  | 'USB Drives & Hard Disks'
  | 'Spectacles & Sunglasses'
  | 'Books & Notebooks'
  | 'Pens & Pencil Cases'
  | 'Water Bottles'
  | 'Umbrellas'
  | 'Bags & Backpacks'
  | 'Calculators'
  | 'Other Small Personal Items';

export interface LostFoundItem {
  id: string;
  referenceNo: string; // e.g. LF-2026-1042
  title: string;
  description: string;
  type: ItemType;
  category: ItemCategory;
  location: string;
  specificLocation?: string | null;
  dateReported: string; // YYYY-MM-DD
  status: ItemStatus;
  imageUrl?: string | null;
  rewardOffered?: string | null;
  
  // Reporter info
  reporterId?: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string | null;
  reporterStudentId?: string | null;
  
  // Custody & Security info
  heldAtOffice?: boolean;
  lockerNumber?: string | null;
  secretDetails?: string | null; // Private verification clue
  
  createdAt: string;
  updatedAt: string;
}

export interface ItemClaim {
  id: string;
  claimReferenceNo: string;
  itemId: string;
  itemTitle: string;
  itemType: ItemType;
  claimantId?: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  claimantStudentId: string;
  proofDescription: string;
  secretIdentifier?: string | null; // e.g. Serial number or unique scratch
  supportingDocumentUrl?: string | null;
  status: ClaimStatus;
  adminNotes?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
  collectedAt?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  role: 'student' | 'admin';
  phone?: string;
}

export interface FilterState {
  searchQuery: string;
  type: 'all' | 'lost' | 'found';
  category: string;
  location: string;
  status: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
  sortBy: 'newest' | 'oldest' | 'title-asc';
}

export interface CampusStats {
  totalReported: number;
  totalLost: number;
  totalFound: number;
  itemsReunited: number;
  activeClaims: number;
  recoveryRatePercent: number;
}
