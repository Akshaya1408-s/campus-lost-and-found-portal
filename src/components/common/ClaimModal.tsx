import React, { useState, useEffect } from 'react';
import { LostFoundItem, ItemClaim } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useItems } from '../../context/ItemsContext';
import { formatFriendlyErrorMessage } from '../../services/api';
import {
  X,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';

interface ClaimModalProps {
  item: LostFoundItem | null;
  onClose: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({ item, onClose }) => {
  const { user, isFirebaseUser, signInWithGoogle, authLoading } = useAuth();
  const { submitClaim } = useItems();

  const [claimantName, setClaimantName] = useState(user?.name || '');
  const [claimantEmail, setClaimantEmail] = useState(user?.email || '');
  const [claimantPhone, setClaimantPhone] = useState(user?.phone || '');
  const [claimantStudentId, setClaimantStudentId] = useState(user?.studentId || '');
  const [proofDescription, setProofDescription] = useState('');
  const [secretIdentifier, setSecretIdentifier] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [googleSigningIn, setGoogleSigningIn] = useState(false);
  const [submittedClaim, setSubmittedClaim] = useState<ItemClaim | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      if (user.name) setClaimantName(user.name);
      if (user.email) setClaimantEmail(user.email);
      if (user.studentId) setClaimantStudentId(user.studentId);
      if (user.phone) setClaimantPhone(user.phone);
    }
  }, [user]);

  if (!item) return null;

  const handleQuickGoogleSignIn = async () => {
    try {
      setGoogleSigningIn(true);
      const loggedIn = await signInWithGoogle();
      if (loggedIn) {
        setClaimantName(loggedIn.name || '');
        setClaimantEmail(loggedIn.email || '');
        setClaimantStudentId(loggedIn.studentId || '');
        setErrors((prev) => {
          const rest = { ...prev };
          delete rest.general;
          return rest;
        });
      }
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, general: formatFriendlyErrorMessage(err) }));
    } finally {
      setGoogleSigningIn(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, document: 'Image size exceeds 5MB limit.' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setDocumentUrl(reader.result as string);
        setErrors((prev) => {
          const rest = { ...prev };
          delete rest.document;
          return rest;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!claimantName.trim()) errs.name = 'Full name is required.';
    if (!claimantEmail.trim() || !claimantEmail.includes('@')) errs.email = 'Valid campus email is required.';
    if (!claimantStudentId.trim()) errs.studentId = 'Student ID number is required.';
    if (!claimantPhone.trim()) errs.phone = 'Contact phone number is required.';
    if (!proofDescription.trim() || proofDescription.trim().length < 25) {
      errs.proof = 'Please provide a detailed proof description (at least 25 characters). Describe distinctive marks, contents, or serial numbers.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseUser) {
      setErrors((prev) => ({
        ...prev,
        general: 'Authentication Required: Please sign in with your campus Google account to file an ownership claim.'
      }));
      return;
    }
    if (!validate()) return;

    try {
      setSubmitting(true);
      const claim = await submitClaim({
        itemId: item.id,
        itemTitle: item.title,
        itemType: item.type,
        claimantId: user!.id,
        claimantName: claimantName.trim() || user?.name || 'Campus Student',
        claimantEmail: claimantEmail.trim() || user?.email || '',
        claimantPhone: claimantPhone.trim(),
        claimantStudentId: claimantStudentId.trim(),
        proofDescription: proofDescription.trim(),
        secretIdentifier: secretIdentifier.trim() ? secretIdentifier.trim() : null,
        supportingDocumentUrl: documentUrl.trim() ? documentUrl.trim() : null,
      });
      setSubmittedClaim(claim);
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, general: formatFriendlyErrorMessage(err) }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-sky-500/20 text-sky-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Claim Ownership Verification
              </h3>
              <p className="text-xs text-slate-400">
                Item: {item.title} ({item.referenceNo})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {submittedClaim ? (
            /* Success State */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 font-bold">
                  Claim ID: {submittedClaim.claimReferenceNo}
                </span>
                <h4 className="text-xl font-bold text-slate-900 mt-3">
                  Claim Successfully Submitted!
                </h4>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                  Your verification details have been routed to the <strong>Campus Safety &amp; Lost Item Office</strong>.
                  An officer will review your proof against physical records.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sky-600" /> Next Steps for Collection:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
                  <li>Check your student email for approval notification.</li>
                  <li>Visit Campus Safety (Student Services Building, Room 102).</li>
                  <li>Bring your Student ID card ({submittedClaim.claimantStudentId}) to release the item.</li>
                </ol>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Return to Portal
                </button>
              </div>
            </div>
          ) : (
            /* Claim Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.general && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.general}</span>
                </div>
              )}

              {/* Auth Prompt if not logged in */}
              {!isFirebaseUser ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h5 className="font-bold text-amber-900">Sign In to Submit Claim</h5>
                    <p className="text-[11px] text-amber-800">
                      You must be signed in with your campus Google account to file an ownership claim.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickGoogleSignIn}
                    disabled={googleSigningIn || authLoading}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{googleSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
                  </button>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-emerald-900 font-medium">
                    Filing claim as: <strong className="font-bold">{user?.name}</strong> ({user?.email})
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Verified ID
                  </span>
                </div>
              )}

              {/* Item Snapshot summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                  <p className="text-[11px] text-slate-500">
                    Found at: {item.location} • {item.dateReported}
                  </p>
                </div>
              </div>

              {/* Claimant Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={claimantName}
                    onChange={(e) => setClaimantName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className={`w-full px-3 py-2 rounded-xl border ${
                      errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    } focus:outline-hidden focus:border-sky-500`}
                  />
                  {errors.name && <p className="text-rose-600 text-[10px] mt-0.5">{errors.name}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Student ID Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={claimantStudentId}
                    onChange={(e) => setClaimantStudentId(e.target.value)}
                    placeholder="e.g. STU-88421"
                    className={`w-full px-3 py-2 rounded-xl border ${
                      errors.studentId ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    } focus:outline-hidden focus:border-sky-500`}
                  />
                  {errors.studentId && <p className="text-rose-600 text-[10px] mt-0.5">{errors.studentId}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Campus Email (@university.edu) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={claimantEmail}
                    onChange={(e) => setClaimantEmail(e.target.value)}
                    placeholder="alex.rivers@campus.edu"
                    className={`w-full px-3 py-2 rounded-xl border ${
                      errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    } focus:outline-hidden focus:border-sky-500`}
                  />
                  {errors.email && <p className="text-rose-600 text-[10px] mt-0.5">{errors.email}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={claimantPhone}
                    onChange={(e) => setClaimantPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className={`w-full px-3 py-2 rounded-xl border ${
                      errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    } focus:outline-hidden focus:border-sky-500`}
                  />
                  {errors.phone && <p className="text-rose-600 text-[10px] mt-0.5">{errors.phone}</p>}
                </div>
              </div>

              {/* Proof Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proof of Ownership Description <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Describe unpublicized identifiers: scratches, lock-screen image, stickers, case color, files stored inside, or contents of the bag.
                </p>
                <textarea
                  rows={3}
                  value={proofDescription}
                  onChange={(e) => setProofDescription(e.target.value)}
                  placeholder="e.g. The device has a small scratch on the bottom right corner, a blue sticker of an astronaut, and my wallpaper is a photo of Yosemite valley..."
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    errors.proof ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  } focus:outline-hidden focus:border-sky-500 leading-relaxed`}
                />
                {errors.proof && <p className="text-rose-600 text-[11px] mt-0.5">{errors.proof}</p>}
              </div>

              {/* Secret Identifier / Serial Number (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  Exact Serial Number, IMEI, or Password Clue (Optional)
                </label>
                <input
                  type="text"
                  value={secretIdentifier}
                  onChange={(e) => setSecretIdentifier(e.target.value)}
                  placeholder="e.g. Serial: C02X12... or locker combination"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-sky-500 font-mono"
                />
              </div>

              {/* Supporting Document / Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supporting Photo or Proof Document (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-sky-400 rounded-xl p-3 text-center cursor-pointer transition-colors bg-slate-50/50">
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                      <Upload className="w-4 h-4 text-sky-600" />
                      <span>{imagePreview ? 'Replace receipt / photo' : 'Attach purchase receipt or photo with item'}</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setDocumentUrl('');
                        }}
                        className="absolute top-0.5 right-0.5 bg-slate-900/70 text-white rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                >
                  {submitting ? 'Submitting...' : 'Submit Claim Verification'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
