import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';
import { LostFoundItem, ItemClaim } from '../types';
import { Badge } from '../components/common/Badge';
import { ItemDetailModal } from '../components/common/ItemDetailModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  User,
  Package,
  ShieldCheck,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit,
  ExternalLink,
  MapPin,
  Calendar,
  FileText,
  Building
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { user, isFirebaseUser, signInWithGoogle, authLoading } = useAuth();
  const { items, claims, deleteItem, updateItem, addToast } = useItems();

  const [activeTab, setActiveTab] = useState<'reported' | 'claims'>('claims');
  const [viewItem, setViewItem] = useState<LostFoundItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<LostFoundItem | null>(null);

  // Filter items reported by this student
  const studentEmail = user?.email?.toLowerCase() || '';
  const myItems = items.filter(
    (item) =>
      (user?.id && item.reporterId === user.id) ||
      (studentEmail && item.reporterEmail?.toLowerCase() === studentEmail)
  );

  // Filter claims filed by this student
  const myClaims = claims.filter(
    (claim) =>
      (user?.id && claim.claimantId === user.id) ||
      (studentEmail && claim.claimantEmail?.toLowerCase() === studentEmail)
  );

  const handleDeleteItem = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const handleMarkItemResolved = async (item: LostFoundItem) => {
    await updateItem(item.id, { status: 'claimed' });
    addToast({
      type: 'success',
      title: 'Item Marked Reunited',
      message: `${item.title} has been updated to Reunited / Closed.`,
    });
  };

  if (!user && !authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-slate-900 text-sky-400 rounded-3xl flex items-center justify-center mx-auto shadow-md">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 font-heading">Student Portal Sign In Required</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Please sign in with your campus Google account to review your submitted reports, active ownership claims, and collection updates.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => signInWithGoogle()}
            className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign in with Google</span>
          </button>
          <Link
            to="/login"
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
          >
            Email Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-sky-400 flex items-center justify-center font-bold text-xl shadow-md shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                {user?.name || 'Student Portal'}
              </h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold border border-sky-200">
                Verified Student
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="font-mono">{user?.studentId || 'STU-88421'}</span>
              <span>•</span>
              <span>{user?.email || 'student@campus.edu'}</span>
              <span>•</span>
              <span>{user?.department || 'College of Engineering'}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link
            to="/report?type=lost"
            className="flex-1 md:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Report Lost
          </Link>
          <Link
            to="/report?type=found"
            className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Report Found
          </Link>
        </div>
      </div>

      {/* Stats Quick Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">My Reported Items</div>
          <div className="text-2xl font-black text-slate-900 font-heading mt-1">
            {myItems.length}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">My Ownership Claims</div>
          <div className="text-2xl font-black text-slate-900 font-heading mt-1">
            {myClaims.length}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Pending Claims</div>
          <div className="text-2xl font-black text-amber-600 font-heading mt-1">
            {myClaims.filter((c) => c.status === 'pending').length}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Approved / Reunited</div>
          <div className="text-2xl font-black text-emerald-600 font-heading mt-1">
            {myClaims.filter((c) => c.status === 'approved' || c.status === 'collected').length}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'claims'
              ? 'border-sky-600 text-sky-800 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          My Ownership Claims ({myClaims.length})
        </button>
        <button
          onClick={() => setActiveTab('reported')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'reported'
              ? 'border-sky-600 text-sky-800 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          My Reported Items ({myItems.length})
        </button>
      </div>

      {/* TAB 1: My Ownership Claims */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          {myClaims.length > 0 ? (
            <div className="space-y-4">
              {myClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                          {claim.claimReferenceNo}
                        </span>
                        <Badge status={claim.status} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {claim.itemTitle}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-600 text-left sm:text-right">
                      <div>Submitted: {new Date(claim.submittedAt).toLocaleDateString()}</div>
                      <div className="text-[11px] text-slate-600">ID: {claim.claimantStudentId}</div>
                    </div>
                  </div>

                  {/* Claim Status Timeline */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                    <div className="font-bold text-slate-700 mb-2">Claim Lifecycle Status:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className={`p-2.5 rounded-lg border ${
                        claim.status === 'pending'
                          ? 'bg-amber-50 border-amber-200 text-amber-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}>
                        <div className="text-[10px] text-slate-600 uppercase">Step 1</div>
                        <div className="font-bold mt-0.5">1. Safety Desk Review</div>
                        <div className="text-[11px] opacity-80 mt-0.5">
                          {claim.status === 'pending' ? 'Currently under inspection' : 'Verified'}
                        </div>
                      </div>

                      <div className={`p-2.5 rounded-lg border ${
                        claim.status === 'approved'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}>
                        <div className="text-[10px] text-slate-600 uppercase">Step 2</div>
                        <div className="font-bold mt-0.5">2. Ready for Pickup</div>
                        <div className="text-[11px] opacity-80 mt-0.5">
                          {claim.status === 'approved' ? 'Visit Safety Office Room 102' : claim.status === 'collected' ? 'Collected' : 'Pending review'}
                        </div>
                      </div>

                      <div className={`p-2.5 rounded-lg border ${
                        claim.status === 'collected'
                          ? 'bg-purple-50 border-purple-200 text-purple-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}>
                        <div className="text-[10px] text-slate-600 uppercase">Step 3</div>
                        <div className="font-bold mt-0.5">3. Handed to Owner</div>
                        <div className="text-[11px] opacity-80 mt-0.5">
                          {claim.status === 'collected' ? 'Possession restored' : 'Pending release'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Proof Details summary */}
                  <div className="text-xs space-y-1.5">
                    <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                      Your Submitted Proof of Ownership:
                    </span>
                    <p className="p-3 bg-slate-50/70 rounded-xl text-slate-700 italic border border-slate-100">
                      "{claim.proofDescription}"
                    </p>
                  </div>

                  {/* Admin notes if any */}
                  {claim.adminNotes && (
                    <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-950">
                      <strong className="block text-sky-900">Campus Safety Officer Note:</strong>
                      <span className="mt-0.5 block">{claim.adminNotes}</span>
                    </div>
                  )}

                  {claim.status === 'approved' && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>
                          <strong>Approved for Pickup:</strong> Bring your student ID card ({claim.claimantStudentId}) to Room 102 to retrieve this item.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No ownership claims submitted yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                If you lost an item that might have been found by someone, browse the directory and click "Claim Item" to verify your possession.
              </p>
              <div className="pt-2">
                <Link
                  to="/browse?type=found"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl inline-block"
                >
                  Browse Found Belongings
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: My Reported Items */}
      {activeTab === 'reported' && (
        <div className="space-y-4">
          {myItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-bold">
                        {item.referenceNo}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={item.type === 'lost' ? 'lost' : 'found'} size="sm" />
                        <Badge status={item.status} size="sm" />
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="text-xs text-slate-600 flex flex-wrap gap-3 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-700" />
                        {item.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                        {item.dateReported}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setViewItem(item)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      View Details
                    </button>

                    <div className="flex items-center gap-1.5">
                      {item.status !== 'claimed' && (
                        <button
                          onClick={() => handleMarkItemResolved(item)}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          Mark Reunited
                        </button>
                      )}

                      <button
                        onClick={() => setItemToDelete(item)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">You haven't reported any items yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Did you misplace a gadget, book, or bag? Or find something on campus? File a quick report to get started.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <Link
                  to="/report?type=lost"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
                >
                  Report Lost Item
                </Link>
                <Link
                  to="/report?type=found"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                >
                  Report Found Item
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={viewItem}
        onClose={() => setViewItem(null)}
        onClaim={() => {}}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Delete Item Report?"
        message={`Are you sure you want to permanently delete the listing "${itemToDelete?.title}" (${itemToDelete?.referenceNo})?`}
        confirmLabel="Yes, Delete Listing"
        variant="danger"
        onConfirm={handleDeleteItem}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
