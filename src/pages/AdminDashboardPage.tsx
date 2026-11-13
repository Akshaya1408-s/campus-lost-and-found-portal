import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';
import { LostFoundItem, ItemClaim } from '../types';
import { Badge } from '../components/common/Badge';
import { ItemDetailModal } from '../components/common/ItemDetailModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Search,
  SlidersHorizontal,
  FileText,
  User,
  Phone,
  Mail,
  Lock,
  Archive,
  RefreshCw,
  Eye,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin, signInWithGoogle, authLoading } = useAuth();
  const { items, claims, updateClaimStatus, updateItem, refreshData, addToast } = useItems();

  const [activeSection, setActiveSection] = useState<'claims' | 'inventory'>('claims');
  const [claimFilter, setClaimFilter] = useState<string>('pending');
  const [claimSearch, setClaimSearch] = useState<string>('');

  // Selected claim for detail review modal
  const [reviewingClaim, setReviewingClaim] = useState<ItemClaim | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState<string>('');
  const [viewItem, setViewItem] = useState<LostFoundItem | null>(null);

  // Status update confirmation
  const [confirmAction, setConfirmAction] = useState<{
    claimId: string;
    newStatus: ItemClaim['status'];
    label: string;
    description: string;
  } | null>(null);

  // Claims filtering
  const filteredClaims = claims.filter((claim) => {
    if (claimFilter !== 'all' && claim.status !== claimFilter) return false;
    if (claimSearch.trim()) {
      const q = claimSearch.toLowerCase();
      const matchName = claim.claimantName.toLowerCase().includes(q);
      const matchId = claim.claimantStudentId.toLowerCase().includes(q);
      const matchItem = claim.itemTitle.toLowerCase().includes(q);
      const matchRef = claim.claimReferenceNo.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchItem && !matchRef) return false;
    }
    return true;
  });

  const handleOpenReview = (claim: ItemClaim) => {
    setReviewingClaim(claim);
    setAdminNoteInput(claim.adminNotes || '');
  };

  const handleExecuteClaimStatus = async () => {
    if (confirmAction) {
      await updateClaimStatus(confirmAction.claimId, confirmAction.newStatus, adminNoteInput.trim() || undefined);
      setConfirmAction(null);
      setReviewingClaim(null);
    }
  };

  const handleQuickItemStatus = async (itemId: string, status: LostFoundItem['status']) => {
    await updateItem(itemId, { status });
  };

  // Metrics
  const pendingCount = claims.filter((c) => c.status === 'pending').length;
  const approvedCount = claims.filter((c) => c.status === 'approved').length;
  const collectedCount = claims.filter((c) => c.status === 'collected').length;
  const inVaultCount = items.filter((i) => i.heldAtOffice).length;

  if (!isAdmin && !authLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-md">
          <Shield className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 font-heading">Campus Safety Admin Access Required</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            This console is restricted to verified campus officers and safety administrators. To review ownership claims, update statuses, or manage custody vaults, sign in with an authorized administrator account (<span className="font-mono text-slate-900 font-bold">lrsakshaya@gmail.com</span>).
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => signInWithGoogle()}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign in as Admin with Google</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white font-heading">
                Campus Safety Officer Console
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono border border-amber-400/30 font-bold">
                Admin Privilege
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Officer: {user?.name || 'Officer Raymond Vance'} • Station: Student Services Center (Suite 102)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshData()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Records
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Pending Claim Reviews</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 font-heading mt-2">
            {pendingCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Requires evidence check</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Approved (Awaiting Pickup)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 font-heading mt-2">
            {approvedCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Ready at front desk</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Successfully Reunited</span>
            <PackageCheck className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-3xl font-black text-sky-600 font-heading mt-2">
            {collectedCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Returned to students</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Physical Vault Inventory</span>
            <Archive className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-purple-600 font-heading mt-2">
            {inVaultCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">In campus safe lockers</div>
        </div>
      </div>

      {/* Section Switcher Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveSection('claims')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeSection === 'claims'
              ? 'border-sky-600 text-sky-900 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Ownership Claims Verification ({claims.length})
        </button>
        <button
          onClick={() => setActiveSection('inventory')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeSection === 'inventory'
              ? 'border-sky-600 text-sky-900 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          Campus Inventory &amp; Vault Custody ({items.length})
        </button>
      </div>

      {/* ========================================================
          SECTION 1: OWNERSHIP CLAIMS MANAGEMENT
          ======================================================== */}
      {activeSection === 'claims' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={claimSearch}
                onChange={(e) => setClaimSearch(e.target.value)}
                placeholder="Search claimant name, student ID, claim reference..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-sky-500 font-medium"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setClaimFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  claimFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({claims.length})
              </button>
              <button
                onClick={() => setClaimFilter('pending')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  claimFilter === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700 hover:bg-amber-100'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setClaimFilter('approved')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  claimFilter === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setClaimFilter('collected')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  claimFilter === 'collected' ? 'bg-purple-600 text-white shadow-xs' : 'text-purple-700 hover:bg-purple-100'
                }`}
              >
                Collected ({collectedCount})
              </button>
              <button
                onClick={() => setClaimFilter('rejected')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  claimFilter === 'rejected' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>

          {/* Claims Table / List */}
          {filteredClaims.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Claim Ref &amp; Date</th>
                      <th className="px-5 py-3">Item Claimed</th>
                      <th className="px-5 py-3">Student Claimant</th>
                      <th className="px-5 py-3">Proof Summary</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {claim.claimReferenceNo}
                          </span>
                          <div className="text-[11px] text-slate-600 mt-1">
                            {new Date(claim.submittedAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900 max-w-[220px] truncate">
                            {claim.itemTitle}
                          </div>
                          <div className="text-[11px] text-slate-600">Item ID: {claim.itemId}</div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-800">{claim.claimantName}</div>
                          <div className="font-mono text-[11px] text-slate-600">{claim.claimantStudentId}</div>
                          <div className="text-[11px] text-slate-600">{claim.claimantEmail}</div>
                        </td>

                        <td className="px-5 py-4 max-w-xs">
                          <p className="line-clamp-2 text-slate-700 italic">
                            "{claim.proofDescription}"
                          </p>
                          {claim.secretIdentifier && (
                            <div className="text-[10px] text-sky-800 font-mono mt-0.5">
                              Key: {claim.secretIdentifier}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <Badge status={claim.status} />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleOpenReview(claim)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors shadow-2xs inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300" />
              <h4 className="text-sm font-bold text-slate-700">No claims match the filter criteria</h4>
              <p className="text-xs text-slate-500">All submissions in this queue have been processed.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SECTION 2: CAMPUS INVENTORY & VAULT CUSTODY
          ======================================================== */}
      {activeSection === 'inventory' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Official Campus Lost &amp; Found Inventory Directory
              </h3>
              <p className="text-xs text-slate-500">
                Update custody locations, vault lockers, and item statuses.
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Total Records: {items.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3">Reference No</th>
                  <th className="px-5 py-3">Item Title &amp; Category</th>
                  <th className="px-5 py-3">Campus Location</th>
                  <th className="px-5 py-3">Vault / Locker</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      {item.referenceNo}
                      <div className="text-[10px] text-slate-600 font-sans mt-0.5">
                        {item.dateReported}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant={item.type === 'lost' ? 'lost' : 'found'} size="sm" />
                        <span className="text-slate-600 text-[11px]">{item.category}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">{item.location}</div>
                      {item.specificLocation && (
                        <div className="text-[11px] text-slate-600 italic">{item.specificLocation}</div>
                      )}
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-700">
                      {item.heldAtOffice ? (
                        <span className="text-sky-800 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                          {item.lockerNumber || 'Locker Assigned'}
                        </span>
                      ) : (
                        <span className="text-slate-600">Not in Vault</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={item.status}
                        onChange={(e) => handleQuickItemStatus(item.id, e.target.value as any)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-300 bg-white focus:outline-hidden"
                      >
                        <option value="open">Open / Active</option>
                        <option value="claim_pending">Claim Pending</option>
                        <option value="claimed">Reunited / Claimed</option>
                        <option value="closed">Closed / Archived</option>
                      </select>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setViewItem(item)}
                        className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          CLAIM DETAIL & DECISION MODAL
          ======================================================== */}
      {reviewingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-slate-800 text-amber-300 px-2 py-0.5 rounded">
                  {reviewingClaim.claimReferenceNo}
                </span>
                <span className="text-sm font-bold text-white">Officer Claim Review</span>
              </div>
              <button
                onClick={() => setReviewingClaim(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Target Item summary */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-600">
                  Target Belonging Under Claim
                </span>
                <h3 className="text-base font-bold text-slate-900">{reviewingClaim.itemTitle}</h3>
                <p className="text-slate-600">Item ID: {reviewingClaim.itemId}</p>
              </div>

              {/* Student Information */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-600 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Claimant Identity
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-600 block">Student Name:</span>
                    <strong className="text-slate-900 text-sm">{reviewingClaim.claimantName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Student ID:</span>
                    <strong className="text-slate-900 font-mono text-sm">{reviewingClaim.claimantStudentId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-600 block">University Email:</span>
                    <strong className="text-slate-900">{reviewingClaim.claimantEmail}</strong>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Contact Phone:</span>
                    <strong className="text-slate-900">{reviewingClaim.claimantPhone}</strong>
                  </div>
                </div>
              </div>

              {/* Submitted Proof */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-600">
                  Claimant's Proof of Ownership Statement
                </span>
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-slate-800 text-xs leading-relaxed">
                  "{reviewingClaim.proofDescription}"
                </div>
              </div>

              {/* Secret Clue */}
              {reviewingClaim.secretIdentifier && (
                <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sky-900">Submitted Secret Identifier / Serial Key:</strong>
                    <span className="font-mono text-sky-800">{reviewingClaim.secretIdentifier}</span>
                  </div>
                </div>
              )}

              {/* Supporting photo if provided */}
              {reviewingClaim.supportingDocumentUrl && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-600 block mb-1">
                    Attached Supporting Photo / Receipt
                  </span>
                  <div className="h-44 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={reviewingClaim.supportingDocumentUrl}
                      alt="Supporting document"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Officer Notes input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Officer Notes &amp; Verification Rationale:
                </label>
                <textarea
                  rows={2}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="e.g. Student presented physical student ID and serial number match. Ready for front-desk pickup."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setReviewingClaim(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100"
              >
                Close
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {reviewingClaim.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmAction({
                        claimId: reviewingClaim.id,
                        newStatus: 'rejected',
                        label: 'Reject Claim',
                        description: `Reject claim ${reviewingClaim.claimReferenceNo} by ${reviewingClaim.claimantName}? An explanatory notification will be sent.`,
                      })
                    }
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    Reject Claim
                  </button>
                )}

                {reviewingClaim.status !== 'approved' && reviewingClaim.status !== 'collected' && (
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmAction({
                        claimId: reviewingClaim.id,
                        newStatus: 'approved',
                        label: 'Approve for Pickup',
                        description: `Approve claim ${reviewingClaim.claimReferenceNo}? The student will be notified to collect the item from Room 102.`,
                      })
                    }
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    Approve for Pickup
                  </button>
                )}

                {reviewingClaim.status !== 'collected' && (
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmAction({
                        claimId: reviewingClaim.id,
                        newStatus: 'collected',
                        label: 'Record Physical Collection',
                        description: `Confirm that item "${reviewingClaim.itemTitle}" has been physically handed to student ${reviewingClaim.claimantName} (${reviewingClaim.claimantStudentId})?`,
                      })
                    }
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    Record Collection &amp; Handover
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        title={confirmAction?.label || 'Confirm Status Change'}
        message={confirmAction?.description || ''}
        confirmLabel="Confirm Action"
        variant={confirmAction?.newStatus === 'rejected' ? 'danger' : 'info'}
        onConfirm={handleExecuteClaimStatus}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={viewItem}
        onClose={() => setViewItem(null)}
        onClaim={() => {}}
      />
    </div>
  );
};
