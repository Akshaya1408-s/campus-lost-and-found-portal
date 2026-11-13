/**
 * Campus Lost & Found - Cloud Firestore & Firebase Auth Service Layer
 * 
 * Connected to Firebase Project:
 * - Authentication: Firebase Auth (Google Sign-In + Campus Session)
 * - Database: Google Cloud Firestore (Custom database ID configured)
 * - Security: Enforced via firestore.rules
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { signInWithPopup, signOut as fbSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { LostFoundItem, ItemClaim, FilterState, CampusStats, User } from '../types';
import { INITIAL_ITEMS, INITIAL_CLAIMS, DEMO_STUDENT_USER, DEMO_ADMIN_USER } from '../data/mockData';

const COLLECTIONS = {
  ITEMS: 'items',
  CLAIMS: 'claims',
  USERS: 'users',
};

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sanitizes an object before writing to Firestore:
 * - Omits any keys whose value is undefined
 * - Preserves null, strings, numbers, booleans, arrays, and objects
 */
export function cleanFirestorePayload<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) {
      continue;
    }
    if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      result[key] = cleanFirestorePayload(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

// ==========================================
// ITEM SERVICE (Cloud Firestore)
// ==========================================

export const ItemService = {
  /**
   * Fetches all items from Cloud Firestore, with optional search & filter logic.
   * Automatically initializes the database with sample items if currently empty.
   */
  async getItems(filters?: Partial<FilterState>): Promise<LostFoundItem[]> {
    const colRef = collection(db, COLLECTIONS.ITEMS);
    let snapshot;
    try {
      snapshot = await getDocs(colRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, COLLECTIONS.ITEMS);
    }

    // Auto-seed Firestore on first run if collection is completely empty
    if (snapshot.empty) {
      console.info('Firestore items collection is empty. Seeding initial campus items...');
      try {
        const batch = writeBatch(db);
        for (const item of INITIAL_ITEMS) {
          const itemDoc = doc(db, COLLECTIONS.ITEMS, item.id);
          batch.set(itemDoc, {
            ...item,
            reporterId: item.reporterStudentId || 'system-seed',
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString(),
          });
        }
        await batch.commit();
        snapshot = await getDocs(colRef);
      } catch (seedErr) {
        console.warn('Could not auto-seed items in Firestore:', seedErr);
      }
    }

    let items: LostFoundItem[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        id: docSnap.id,
        referenceNo: data.referenceNo || `LF-2026-${docSnap.id.slice(0, 4)}`,
        title: data.title || 'Untitled Belonging',
        description: data.description || '',
        type: data.type || 'lost',
        category: data.category || 'Other Small Personal Items',
        location: data.location || 'Campus Grounds',
        specificLocation: data.specificLocation,
        dateReported: data.dateReported || new Date().toISOString().split('T')[0],
        status: data.status || 'open',
        imageUrl: data.imageUrl,
        rewardOffered: data.rewardOffered,
        reporterId: data.reporterId,
        reporterName: data.reporterName || 'Campus Student',
        reporterEmail: data.reporterEmail || 'student@campus.edu',
        reporterPhone: data.reporterPhone,
        reporterStudentId: data.reporterStudentId,
        heldAtOffice: !!data.heldAtOffice,
        lockerNumber: data.lockerNumber,
        secretDetails: data.secretDetails,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    });

    // Apply Client-Side Filtering
    if (filters) {
      if (filters.type && filters.type !== 'all') {
        items = items.filter((i) => i.type === filters.type);
      }
      if (filters.category && filters.category !== 'all') {
        items = items.filter((i) => i.category === filters.category);
      }
      if (filters.status && filters.status !== 'all') {
        items = items.filter((i) => i.status === filters.status);
      }
      if (filters.location && filters.location !== 'all') {
        items = items.filter((i) => i.location === filters.location);
      }
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase();
        items = items.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.description.toLowerCase().includes(q) ||
            i.location.toLowerCase().includes(q) ||
            i.category.toLowerCase().includes(q) ||
            i.referenceNo.toLowerCase().includes(q)
        );
      }
      if (filters.sortBy) {
        if (filters.sortBy === 'newest') {
          items.sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime());
        } else if (filters.sortBy === 'oldest') {
          items.sort((a, b) => new Date(a.dateReported).getTime() - new Date(b.dateReported).getTime());
        } else if (filters.sortBy === 'title-asc') {
          items.sort((a, b) => a.title.localeCompare(b.title));
        }
      }
    } else {
      // Default: sort newest first
      items.sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime());
    }

    return items;
  },

  /**
   * Fetches a single item by Document ID from Cloud Firestore
   */
  async getItemById(id: string): Promise<LostFoundItem | null> {
    const docRef = doc(db, COLLECTIONS.ITEMS, id);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as LostFoundItem;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${COLLECTIONS.ITEMS}/${id}`);
    }
  },

  /**
   * Creates a new item in Cloud Firestore
   */
  async createItem(payload: Omit<LostFoundItem, 'id' | 'referenceNo' | 'createdAt' | 'updatedAt'>): Promise<LostFoundItem> {
    const currentFbUser = auth.currentUser;
    if (!currentFbUser) {
      throw new Error('Authentication required: Please sign in with your campus Google account before submitting a report.');
    }
    const realUid = currentFbUser.uid;
    const randomRef = `LF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = `item-${Date.now()}`;
    const now = new Date().toISOString();

    const rawItemData: Record<string, any> = {
      id: newId,
      referenceNo: randomRef,
      title: payload.title?.trim() || '',
      description: payload.description?.trim() || '',
      type: payload.type || 'lost',
      category: payload.category,
      location: payload.location,
      specificLocation: payload.specificLocation?.trim() ? payload.specificLocation.trim() : null,
      dateReported: payload.dateReported || now.split('T')[0],
      status: 'open',
      imageUrl: payload.imageUrl?.trim() ? payload.imageUrl.trim() : null,
      rewardOffered: payload.type === 'lost' && payload.rewardOffered?.trim() ? payload.rewardOffered.trim() : null,
      reporterId: realUid,
      reporterName: payload.reporterName?.trim() || currentFbUser.displayName || 'Campus Student',
      reporterEmail: currentFbUser.email || payload.reporterEmail?.trim() || 'student@campus.edu',
      reporterPhone: payload.reporterPhone?.trim() ? payload.reporterPhone.trim() : null,
      reporterStudentId: payload.reporterStudentId?.trim() ? payload.reporterStudentId.trim() : null,
      heldAtOffice: payload.type === 'found' ? (typeof payload.heldAtOffice === 'boolean' ? payload.heldAtOffice : false) : false,
      lockerNumber: payload.type === 'found' && payload.lockerNumber?.trim() ? payload.lockerNumber.trim() : null,
      secretDetails: payload.type === 'found' && payload.secretDetails?.trim() ? payload.secretDetails.trim() : null,
      createdAt: now,
      updatedAt: now,
    };

    const cleanedData = cleanFirestorePayload(rawItemData);
    const docRef = doc(db, COLLECTIONS.ITEMS, newId);
    try {
      await setDoc(docRef, cleanedData);
      return cleanedData as LostFoundItem;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${COLLECTIONS.ITEMS}/${newId}`);
    }
  },

  /**
   * Updates an existing item in Cloud Firestore
   */
  async updateItem(id: string, updates: Partial<LostFoundItem>): Promise<LostFoundItem> {
    const docRef = doc(db, COLLECTIONS.ITEMS, id);
    const sanitizedUpdates: Record<string, any> = {};

    for (const [key, val] of Object.entries(updates)) {
      if (val === undefined) {
        continue;
      }
      if (typeof val === 'string' && val.trim() === '') {
        sanitizedUpdates[key] = null;
      } else {
        sanitizedUpdates[key] = val;
      }
    }
    sanitizedUpdates.updatedAt = new Date().toISOString();

    const payload = cleanFirestorePayload(sanitizedUpdates);

    try {
      await updateDoc(docRef, payload);
      const updatedSnap = await getDoc(docRef);
      return { id: updatedSnap.id, ...updatedSnap.data() } as LostFoundItem;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTIONS.ITEMS}/${id}`);
    }
  },

  /**
   * Deletes an item from Cloud Firestore
   */
  async deleteItem(id: string): Promise<boolean> {
    const docRef = doc(db, COLLECTIONS.ITEMS, id);
    try {
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTIONS.ITEMS}/${id}`);
    }
  },

  /**
   * Resets database with sample listings in Firestore
   */
  async resetToDefault() {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.ITEMS));
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      for (const item of INITIAL_ITEMS) {
        batch.set(doc(db, COLLECTIONS.ITEMS, item.id), item);
      }
      await batch.commit();
    } catch (err) {
      console.warn('Could not reset items in Firestore:', err);
    }
  }
};

export function formatFriendlyErrorMessage(err: unknown): string {
  if (!err) return 'An unexpected error occurred. Please try again.';
  let raw = err instanceof Error ? err.message : String(err);
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.error) {
      raw = parsed.error;
    }
  } catch {
    // Not JSON
  }

  const lower = raw.toLowerCase();
  if (lower.includes('unsupported field value') || lower.includes('undefined')) {
    return 'One of the optional fields was formatted incorrectly. All fields have been safely validated.';
  }
  if (lower.includes('permission-denied') || lower.includes('permission_denied') || lower.includes('insufficient permissions')) {
    return 'Permission denied: Please ensure you are logged into your campus account to submit.';
  }
  if (lower.includes('offline') || lower.includes('network') || lower.includes('unavailable')) {
    return 'Network connection error: Unable to connect to the campus database.';
  }
  if (lower.includes('not-found') || lower.includes('not found')) {
    return 'The requested record was not found.';
  }
  return raw.length > 120 ? 'Action failed. Please check your input and try again.' : raw;
}

// ==========================================
// CLAIM SERVICE (Cloud Firestore)
// ==========================================

export const ClaimService = {
  /**
   * Retrieves all submitted claims from Cloud Firestore (Admin role)
   */
  async getAllClaims(): Promise<ItemClaim[]> {
    const colRef = collection(db, COLLECTIONS.CLAIMS);
    try {
      const snap = await getDocs(colRef);
      if (snap.empty) {
        // Auto-seed initial claims
        const batch = writeBatch(db);
        for (const claim of INITIAL_CLAIMS) {
          batch.set(doc(db, COLLECTIONS.CLAIMS, claim.id), claim);
        }
        await batch.commit();
        const reSnap = await getDocs(colRef);
        return reSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ItemClaim));
      }
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ItemClaim));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, COLLECTIONS.CLAIMS);
    }
  },

  /**
   * Retrieves claims filed by a specific student
   */
  async getMyClaims(userEmail: string, userId?: string): Promise<ItemClaim[]> {
    const colRef = collection(db, COLLECTIONS.CLAIMS);
    try {
      const snap = await getDocs(colRef);
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ItemClaim));
      return all.filter(
        (c) =>
          (userId && c.claimantId === userId) ||
          c.claimantEmail?.toLowerCase() === userEmail?.toLowerCase()
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, COLLECTIONS.CLAIMS);
    }
  },

  /**
   * Submits an ownership claim to Cloud Firestore
   */
  async submitClaim(payload: Omit<ItemClaim, 'id' | 'claimReferenceNo' | 'submittedAt' | 'status'>): Promise<ItemClaim> {
    const currentFbUser = auth.currentUser;
    if (!currentFbUser) {
      throw new Error('Authentication required: Please sign in with your campus Google account before filing an ownership claim.');
    }
    const realUid = currentFbUser.uid;
    const newId = `claim-${Date.now()}`;
    const claimRefNo = `CLM-2026-${Math.floor(100 + Math.random() * 900)}`;

    const claimData: Record<string, any> = {
      id: newId,
      claimReferenceNo: claimRefNo,
      itemId: payload.itemId,
      itemTitle: payload.itemTitle || '',
      itemType: payload.itemType || 'found',
      claimantId: realUid,
      claimantName: payload.claimantName?.trim() || currentFbUser.displayName || 'Campus Student',
      claimantEmail: currentFbUser.email || payload.claimantEmail?.trim() || '',
      claimantPhone: payload.claimantPhone?.trim() || '',
      claimantStudentId: payload.claimantStudentId?.trim() || '',
      proofDescription: payload.proofDescription?.trim() || '',
      secretIdentifier: payload.secretIdentifier?.trim() ? payload.secretIdentifier.trim() : null,
      supportingDocumentUrl: payload.supportingDocumentUrl?.trim() ? payload.supportingDocumentUrl.trim() : null,
      status: 'pending',
      adminNotes: null,
      reviewedAt: null,
      collectedAt: null,
      submittedAt: new Date().toISOString(),
    };

    const cleanedClaimData = cleanFirestorePayload(claimData);
    const docRef = doc(db, COLLECTIONS.CLAIMS, newId);
    try {
      await setDoc(docRef, cleanedClaimData);

      // Update associated item status to claim_pending
      try {
        const itemRef = doc(db, COLLECTIONS.ITEMS, payload.itemId);
        await updateDoc(itemRef, { status: 'claim_pending', updatedAt: new Date().toISOString() });
      } catch (itemErr) {
        console.warn('Could not update item status on claim creation:', itemErr);
      }

      return cleanedClaimData as ItemClaim;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${COLLECTIONS.CLAIMS}/${newId}`);
    }
  },

  /**
   * Updates claim status (Approve, Reject, Collect) in Cloud Firestore
   */
  async updateClaimStatus(
    claimId: string,
    status: ItemClaim['status'],
    adminNotes?: string
  ): Promise<ItemClaim> {
    const claimRef = doc(db, COLLECTIONS.CLAIMS, claimId);
    const now = new Date().toISOString();
    const updates: Record<string, any> = {
      status,
      reviewedAt: now,
    };
    if (status === 'collected') {
      updates.collectedAt = now;
    }
    if (adminNotes !== undefined && adminNotes !== null) {
      updates.adminNotes = adminNotes.trim() ? adminNotes.trim() : null;
    }

    const payload = cleanFirestorePayload(updates);

    try {
      await updateDoc(claimRef, payload);
      const snap = await getDoc(claimRef);
      const updated = { id: snap.id, ...snap.data() } as ItemClaim;

      // Update the item
      if (updated.itemId) {
        const itemRef = doc(db, COLLECTIONS.ITEMS, updated.itemId);
        if (status === 'collected' || status === 'approved') {
          await updateDoc(itemRef, {
            status: status === 'collected' ? 'claimed' : 'claim_pending',
            updatedAt: new Date().toISOString(),
          });
        } else if (status === 'rejected') {
          await updateDoc(itemRef, {
            status: 'open',
            updatedAt: new Date().toISOString(),
          });
        }
      }

      return updated;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTIONS.CLAIMS}/${claimId}`);
    }
  }
};

// ==========================================
// STATS SERVICE (Derived from Firestore)
// ==========================================

export const StatsService = {
  async getCampusStats(): Promise<CampusStats> {
    try {
      const items = await ItemService.getItems();
      const claims = await ClaimService.getAllClaims();

      const totalReported = items.length;
      const totalLost = items.filter((i) => i.type === 'lost').length;
      const totalFound = items.filter((i) => i.type === 'found').length;
      const itemsReunited = items.filter((i) => i.status === 'claimed').length;
      const activeClaims = claims.filter((c) => c.status === 'pending').length;

      const rate = totalReported > 0 ? Math.round((itemsReunited / Math.max(totalFound, 1)) * 100) : 0;

      return {
        totalReported,
        totalLost,
        totalFound,
        itemsReunited,
        activeClaims,
        recoveryRatePercent: Math.min(rate, 100),
      };
    } catch (err) {
      return {
        totalReported: 0,
        totalLost: 0,
        totalFound: 0,
        itemsReunited: 0,
        activeClaims: 0,
        recoveryRatePercent: 0,
      };
    }
  }
};

// ==========================================
// AUTH SERVICE (Firebase Authentication + Firestore Users)
// ==========================================

export const AuthService = {
  /**
   * Google Sign-In with Firebase Authentication
   */
  async signInWithGoogle(): Promise<User> {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;

      const userDocRef = doc(db, COLLECTIONS.USERS, fbUser.uid);
      const snap = await getDoc(userDocRef);

      const isAdminEmail = fbUser.email === 'lrsakshaya@gmail.com' ||
                           fbUser.email?.toLowerCase().includes('admin') ||
                           fbUser.email?.toLowerCase().includes('safety');

      let userProfile: User;

      if (!snap.exists()) {
        userProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Campus Student',
          email: fbUser.email || '',
          studentId: `STU-${fbUser.uid.slice(0, 5).toUpperCase()}`,
          department: 'Undergraduate Studies',
          role: isAdminEmail ? 'admin' : 'student',
          phone: fbUser.phoneNumber || undefined,
        };
        await setDoc(userDocRef, {
          ...userProfile,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        const existingData = snap.data();
        userProfile = {
          id: fbUser.uid,
          name: existingData.name || fbUser.displayName || 'Campus Student',
          email: existingData.email || fbUser.email || '',
          studentId: existingData.studentId || `STU-${fbUser.uid.slice(0, 5).toUpperCase()}`,
          department: existingData.department || 'Undergraduate Studies',
          role: isAdminEmail ? 'admin' : (existingData.role || 'student'),
          phone: existingData.phone,
        };
      }

      return userProfile;
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      throw err;
    }
  },

  /**
   * Campus Email / Password Sign-in
   */
  async login(email: string, pass: string): Promise<User> {
    const cleanEmail = email.trim();
    if (!cleanEmail || !pass) {
      throw new Error('Please enter both your university email and password.');
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const fbUser = cred.user;
      const userDocRef = doc(db, COLLECTIONS.USERS, fbUser.uid);
      const snap = await getDoc(userDocRef);

      const isAdminEmail = fbUser.email === 'lrsakshaya@gmail.com';
      let userProfile: User;

      if (!snap.exists()) {
        userProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || cleanEmail.split('@')[0],
          email: fbUser.email || cleanEmail,
          studentId: `STU-${fbUser.uid.slice(0, 5).toUpperCase()}`,
          department: 'Undergraduate Studies',
          role: isAdminEmail ? 'admin' : 'student',
        };
        await setDoc(userDocRef, {
          ...cleanFirestorePayload(userProfile),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        const d = snap.data();
        userProfile = {
          id: fbUser.uid,
          name: d.name || fbUser.displayName || 'Campus Student',
          email: d.email || fbUser.email || cleanEmail,
          studentId: d.studentId || `STU-${fbUser.uid.slice(0, 5).toUpperCase()}`,
          department: d.department || 'Undergraduate Studies',
          role: isAdminEmail ? 'admin' : (d.role || 'student'),
          phone: d.phone,
        };
      }

      return userProfile;
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password provider is not enabled in Firebase Console. Please use "Sign in with Google" to access your account.');
      }
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password. If you originally registered via Google, please use "Sign in with Google".');
      }
      if (err?.code === 'auth/invalid-email') {
        throw new Error('Please provide a valid university email address.');
      }
      throw err;
    }
  },

  /**
   * Register a new student profile in Firebase Auth & Cloud Firestore
   */
  async register(data: { name: string; email: string; studentId: string; department: string; password?: string }): Promise<User> {
    const cleanEmail = data.email.trim();
    if (!data.password || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
      const fbUser = cred.user;
      await updateProfile(fbUser, { displayName: data.name });

      const isAdminEmail = fbUser.email === 'lrsakshaya@gmail.com';
      const userProfile: User = {
        id: fbUser.uid,
        name: data.name.trim(),
        email: cleanEmail,
        studentId: data.studentId.trim(),
        department: data.department || 'Undergraduate Studies',
        role: isAdminEmail ? 'admin' : 'student',
      };

      const userRef = doc(db, COLLECTIONS.USERS, fbUser.uid);
      await setDoc(userRef, {
        ...cleanFirestorePayload(userProfile),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return userProfile;
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password registration is disabled in Firebase Console. Please click "Sign in with Google" to create your verified account instantly.');
      }
      if (err?.code === 'auth/email-already-in-use') {
        throw new Error('An account already exists for this email address. Please sign in or use Google Sign-In.');
      }
      if (err?.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      }
      throw err;
    }
  },

  async signOut() {
    try {
      await fbSignOut(auth);
    } catch (e) {
      // ignore
    }
  }
};
