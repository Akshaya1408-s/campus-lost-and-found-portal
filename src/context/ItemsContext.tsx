import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LostFoundItem, ItemClaim, FilterState, CampusStats } from '../types';
import { ItemService, ClaimService, StatsService } from '../services/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface ItemsContextType {
  items: LostFoundItem[];
  claims: ItemClaim[];
  stats: CampusStats;
  loading: boolean;
  refreshData: () => Promise<void>;
  createItem: (item: Omit<LostFoundItem, 'id' | 'referenceNo' | 'createdAt' | 'updatedAt'>) => Promise<LostFoundItem>;
  updateItem: (id: string, updates: Partial<LostFoundItem>) => Promise<LostFoundItem>;
  deleteItem: (id: string) => Promise<boolean>;
  submitClaim: (claim: Omit<ItemClaim, 'id' | 'claimReferenceNo' | 'submittedAt' | 'status'>) => Promise<ItemClaim>;
  updateClaimStatus: (claimId: string, status: ItemClaim['status'], adminNotes?: string) => Promise<ItemClaim>;
  resetAllData: () => Promise<void>;
  
  // Toast notifications
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Selected item modal
  selectedItemForView: LostFoundItem | null;
  setSelectedItemForView: (item: LostFoundItem | null) => void;
  selectedItemForClaim: LostFoundItem | null;
  setSelectedItemForClaim: (item: LostFoundItem | null) => void;
}

const defaultStats: CampusStats = {
  totalReported: 0,
  totalLost: 0,
  totalFound: 0,
  itemsReunited: 0,
  activeClaims: 0,
  recoveryRatePercent: 0,
};

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const ItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [claims, setClaims] = useState<ItemClaim[]>([]);
  const [stats, setStats] = useState<CampusStats>(defaultStats);
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedItemForView, setSelectedItemForView] = useState<LostFoundItem | null>(null);
  const [selectedItemForClaim, setSelectedItemForClaim] = useState<LostFoundItem | null>(null);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedItems, fetchedClaims, fetchedStats] = await Promise.all([
        ItemService.getItems(),
        ClaimService.getAllClaims(),
        StatsService.getCampusStats(),
      ]);
      setItems(fetchedItems);
      setClaims(fetchedClaims);
      setStats(fetchedStats);
    } catch (err: any) {
      console.error('Failed to load items:', err);
      addToast({
        type: 'error',
        title: 'Data Load Error',
        message: err?.message || 'Could not fetch records.',
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const createItem = async (newItemData: Omit<LostFoundItem, 'id' | 'referenceNo' | 'createdAt' | 'updatedAt'>) => {
    const created = await ItemService.createItem(newItemData);
    await refreshData();
    addToast({
      type: 'success',
      title: 'Item Reported Successfully',
      message: `Reference ID: ${created.referenceNo} recorded in campus directory.`,
    });
    return created;
  };

  const updateItem = async (id: string, updates: Partial<LostFoundItem>) => {
    const updated = await ItemService.updateItem(id, updates);
    await refreshData();
    addToast({
      type: 'info',
      title: 'Item Updated',
      message: `Changes saved for ${updated.title}.`,
    });
    return updated;
  };

  const deleteItem = async (id: string) => {
    const success = await ItemService.deleteItem(id);
    if (success) {
      await refreshData();
      addToast({
        type: 'info',
        title: 'Item Removed',
        message: 'The item listing has been deleted.',
      });
    }
    return success;
  };

  const submitClaim = async (claimData: Omit<ItemClaim, 'id' | 'claimReferenceNo' | 'submittedAt' | 'status'>) => {
    const createdClaim = await ClaimService.submitClaim(claimData);
    await refreshData();
    addToast({
      type: 'success',
      title: 'Ownership Claim Submitted',
      message: `Your claim (${createdClaim.claimReferenceNo}) is pending verification by Campus Safety.`,
    });
    return createdClaim;
  };

  const updateClaimStatus = async (claimId: string, status: ItemClaim['status'], adminNotes?: string) => {
    const updated = await ClaimService.updateClaimStatus(claimId, status, adminNotes);
    await refreshData();
    addToast({
      type: status === 'approved' ? 'success' : status === 'rejected' ? 'warning' : 'info',
      title: `Claim ${status.toUpperCase()}`,
      message: `Claim ${updated.claimReferenceNo} status updated.`,
    });
    return updated;
  };

  const resetAllData = async () => {
    ItemService.resetToDefault();
    await refreshData();
    addToast({
      type: 'info',
      title: 'Mock Data Reset',
      message: 'Restored sample campus items and claims.',
    });
  };

  return (
    <ItemsContext.Provider
      value={{
        items,
        claims,
        stats,
        loading,
        refreshData,
        createItem,
        updateItem,
        deleteItem,
        submitClaim,
        updateClaimStatus,
        resetAllData,
        toasts,
        addToast,
        removeToast,
        selectedItemForView,
        setSelectedItemForView,
        selectedItemForClaim,
        setSelectedItemForClaim,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
};
