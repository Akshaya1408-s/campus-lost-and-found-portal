import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '../data/mockData';
import { ItemType, ItemCategory } from '../types';
import { formatFriendlyErrorMessage } from '../services/api';
import {
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Tag,
  MapPin,
  Calendar,
  Gift,
  HelpCircle,
  ArrowRight,
  Info
} from 'lucide-react';

// Sample presets for quick testing convenience in preview
const SAMPLE_PRESET_IMAGES = [
  { label: 'Keys with Keychain', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80' },
  { label: 'College ID Card', url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80' },
  { label: 'Gold Chain', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80' },
  { label: 'Apple iPad', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80' },
  { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Laptop Charger', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80' },
  { label: 'Student Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80' },
  { label: 'Wristwatch', url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Spectacles', url: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80' },
  { label: 'USB Flash Drive', url: 'https://images.unsplash.com/photo-1618410320928-25228d811631?auto=format&fit=crop&w=800&q=80' },
  { label: 'Water Bottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80' },
];

export const ReportItemPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isFirebaseUser, signInWithGoogle, authLoading } = useAuth();
  const { createItem } = useItems();

  const typeParam = searchParams.get('type') === 'found' ? 'found' : 'lost';
  const [type, setType] = useState<ItemType>(typeParam);
  const [googleSigningIn, setGoogleSigningIn] = useState(false);

  useEffect(() => {
    const t = searchParams.get('type');
    if (t === 'found' || t === 'lost') {
      setType(t);
    }
  }, [searchParams]);

  // Sync reporter contact info with authenticated user
  useEffect(() => {
    if (user) {
      if (user.name) setReporterName(user.name);
      if (user.email) setReporterEmail(user.email);
      if (user.studentId) setReporterStudentId(user.studentId);
      if (user.phone) setReporterPhone(user.phone);
    }
  }, [user]);

  const handleQuickGoogleSignIn = async () => {
    try {
      setGoogleSigningIn(true);
      const loggedIn = await signInWithGoogle();
      if (loggedIn) {
        setReporterName(loggedIn.name || '');
        setReporterEmail(loggedIn.email || '');
        setReporterStudentId(loggedIn.studentId || '');
        setErrors((prev) => {
          const rest = { ...prev };
          delete rest.submit;
          return rest;
        });
      }
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, submit: formatFriendlyErrorMessage(err) }));
    } finally {
      setGoogleSigningIn(false);
    }
  };

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Keys & Keychains');
  const [dateReported, setDateReported] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState(CAMPUS_LOCATIONS[0]);
  const [specificLocation, setSpecificLocation] = useState('');
  const [description, setDescription] = useState('');
  const [rewardOffered, setRewardOffered] = useState('');
  const [heldAtOffice, setHeldAtOffice] = useState(typeParam === 'found');
  const [lockerNumber, setLockerNumber] = useState('');
  const [secretDetails, setSecretDetails] = useState('');

  // Reporter Fields
  const [reporterName, setReporterName] = useState(user?.name || '');
  const [reporterEmail, setReporterEmail] = useState(user?.email || '');
  const [reporterPhone, setReporterPhone] = useState(user?.phone || '');
  const [reporterStudentId, setReporterStudentId] = useState(user?.studentId || '');

  // Image Upload State
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedItemRef, setSubmittedItemRef] = useState<string | null>(null);

  const handleTypeSwitch = (newType: ItemType) => {
    setType(newType);
    setSearchParams({ type: newType });
    if (newType === 'found') {
      setHeldAtOffice(true);
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'File exceeds 5MB limit.' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageUrl(reader.result as string);
        setErrors((prev) => {
          const rest = { ...prev };
          delete rest.image;
          return rest;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 4) {
      errs.title = 'Item title must be at least 4 characters.';
    }
    if (!description.trim() || description.trim().length < 15) {
      errs.description = 'Please describe the item in detail (at least 15 characters).';
    }
    if (!location.trim()) {
      errs.location = 'Please select a campus location.';
    }
    if (!dateReported) {
      errs.date = 'Date is required.';
    }
    if (!reporterName.trim()) {
      errs.reporterName = 'Reporter name is required.';
    }
    if (!reporterEmail.trim() || !reporterEmail.includes('@')) {
      errs.reporterEmail = 'Valid campus email is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseUser) {
      setErrors((prev) => ({
        ...prev,
        submit: 'Authentication Required: In compliance with university policy, you must sign in with your campus Google account above before submitting to Firestore.'
      }));
      return;
    }
    if (!validate()) return;

    try {
      setSubmitting(true);
      const created = await createItem({
        title: title.trim(),
        description: description.trim(),
        type,
        category,
        location,
        specificLocation: specificLocation.trim() ? specificLocation.trim() : null,
        dateReported,
        status: 'open',
        imageUrl: imageUrl.trim() ? imageUrl.trim() : null,
        rewardOffered: type === 'lost' && rewardOffered.trim() ? rewardOffered.trim() : null,
        reporterId: user!.id,
        reporterName: reporterName.trim() || user?.name || 'Campus Student',
        reporterEmail: reporterEmail.trim() || user?.email || '',
        reporterPhone: reporterPhone.trim() ? reporterPhone.trim() : null,
        reporterStudentId: reporterStudentId.trim() ? reporterStudentId.trim() : null,
        heldAtOffice: type === 'found' ? Boolean(heldAtOffice) : false,
        lockerNumber: type === 'found' && lockerNumber.trim() ? lockerNumber.trim() : null,
        secretDetails: type === 'found' && secretDetails.trim() ? secretDetails.trim() : null,
      });

      setSubmittedItemRef(created.referenceNo);
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, submit: formatFriendlyErrorMessage(err) }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Submission Success Dialog */}
      {submittedItemRef ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xl space-y-6 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
              Reference Tracking #{submittedItemRef}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading pt-2">
              {type === 'lost' ? 'Lost Item Report Published' : 'Found Item Registered in System'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Your report has been logged and published to the active Campus Directory.
              {type === 'found'
                ? ' If this item is in your possession, please hand it to Campus Safety Office Room 102 when possible.'
                : ' You will receive an instant email if someone files a matching found claim.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => navigate('/browse')}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
            >
              Browse Directory
            </button>
            <button
              onClick={() => {
                setSubmittedItemRef(null);
                setTitle('');
                setDescription('');
                setImagePreview(null);
                setImageUrl('');
                setRewardOffered('');
                setSpecificLocation('');
              }}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
            >
              Log Another Item
            </button>
          </div>
        </div>
      ) : (
        /* Report Form */
        <div className="space-y-8">
          {/* Form Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
              <button
                type="button"
                onClick={() => handleTypeSwitch('lost')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  type === 'lost'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                I Lost Something
              </button>
              <button
                type="button"
                onClick={() => handleTypeSwitch('found')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  type === 'found'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                I Found Something
              </button>
            </div>

            <h1 className="text-3xl font-black text-slate-900 font-heading">
              {type === 'lost' ? 'Report a Lost Possession' : 'Register a Found Belonging'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              {type === 'lost'
                ? 'Provide detailed descriptions to help fellow students and campus staff recognize your item.'
                : 'Help reunite a student with their gear. Enter safe identifying clues and drop-off information.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 space-y-8">
            {errors.submit && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Firebase Auth Status Card */}
            {!isFirebaseUser ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-950">Campus Authentication Required</h4>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      To publish a report into Cloud Firestore, you must sign in with your campus Google account.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleQuickGoogleSignIn}
                  disabled={googleSigningIn || authLoading}
                  className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
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
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>
                    Authenticated Reporter: <strong className="font-bold">{user?.name}</strong> ({user?.email})
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Firebase UID: {user?.id.slice(0, 8)}...
                </span>
              </div>
            )}

            {/* SECTION 1: Item Basic Details */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Tag className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  1. Item Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Item Name &amp; Key Details <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      type === 'lost'
                        ? 'e.g. Bunch of keys with blue keychain, student wallet, or gold chain'
                        : 'e.g. Black wireless headphones, Apple iPad Air, or spectacles'
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium ${
                      errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    } focus:outline-hidden focus:border-sky-500`}
                  />
                  {errors.title && <p className="text-rose-600 text-[11px] mt-1">{errors.title}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ItemCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:border-sky-500 bg-white"
                  >
                    {ITEM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date {type === 'lost' ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dateReported}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDateReported(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:border-sky-500 bg-white"
                  />
                  {errors.date && <p className="text-rose-600 text-[11px] mt-1">{errors.date}</p>}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Campus Location / Facility <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:border-sky-500 bg-white"
                  >
                    {CAMPUS_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specific Room / Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Specific Room, Desk or Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={specificLocation}
                    onChange={(e) => setSpecificLocation(e.target.value)}
                    placeholder="e.g. 2nd Floor Quiet Zone, Desk 14 near window"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detailed Physical Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide distinguishing features: color, model, scratches, engravings, keychain tags, stickers, or internal accessories..."
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium leading-relaxed ${
                      errors.description ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    } focus:outline-hidden focus:border-sky-500`}
                  />
                  {errors.description && <p className="text-rose-600 text-[11px] mt-1">{errors.description}</p>}
                </div>

                {/* Optional Reward for Lost Items */}
                {type === 'lost' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-amber-500" />
                      Optional Reward for Safe Return (Optional)
                    </label>
                    <input
                      type="text"
                      value={rewardOffered}
                      onChange={(e) => setRewardOffered(e.target.value)}
                      placeholder="e.g. $25 Campus Bookstore Gift Card or Free Coffee"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: Image Upload & Preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <ImageIcon className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  2. Photo Attachment (Live Preview)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                <div className="sm:col-span-2">
                  <label className="border-2 border-dashed border-slate-300 hover:border-sky-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50">
                    <Upload className="w-8 h-8 text-sky-600 mb-2" />
                    <span className="text-xs font-bold text-slate-800">
                      Upload photograph from device
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Supports JPG, PNG, WebP up to 5MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                      className="hidden"
                    />
                  </label>

                  {/* Preset quick picker */}
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                      Or select sample collegiate photo for testing:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_PRESET_IMAGES.map((sample) => (
                        <button
                          key={sample.label}
                          type="button"
                          onClick={() => {
                            setImageUrl(sample.url);
                            setImagePreview(sample.url);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-medium text-slate-700 transition-colors"
                        >
                          {sample.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview Box */}
                <div className="h-40 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 relative flex items-center justify-center">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Uploaded preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageUrl('');
                        }}
                        className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-lg hover:bg-slate-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-3 text-slate-400">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1 stroke-1" />
                      <span className="text-[11px]">No photo selected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: Found item security verification (for Found only) */}
            {type === 'found' && (
              <div className="space-y-4 bg-sky-50/60 p-5 rounded-2xl border border-sky-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-700" />
                  <h3 className="text-sm font-bold text-sky-950 uppercase tracking-wider">
                    3. Safe Custody &amp; Verification Clue
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="heldAtOffice"
                      checked={heldAtOffice}
                      onChange={(e) => setHeldAtOffice(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
                    />
                    <label htmlFor="heldAtOffice" className="font-semibold text-slate-800">
                      This item is deposited / surrendered at the Campus Safety Office
                    </label>
                  </div>

                  {heldAtOffice && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Vault Locker or Bin Code (Staff / Office Reference)
                      </label>
                      <input
                        type="text"
                        value={lockerNumber}
                        onChange={(e) => setLockerNumber(e.target.value)}
                        placeholder="e.g. Locker B-04 or Shelf 2"
                        className="w-full sm:w-64 px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-sky-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                      Private Verification Clue (Hidden from Public View)
                    </label>
                    <input
                      type="text"
                      value={secretDetails}
                      onChange={(e) => setSecretDetails(e.target.value)}
                      placeholder="e.g. Serial # ends in 4028, or blue sticker inside battery compartment"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-sky-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Only Campus Safety officers can see this clue to verify whoever submits an ownership claim.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: Reporter Contact Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Info className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {type === 'found' ? '4. Your Contact Details (Finder)' : '3. Your Contact Details (Owner)'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className={`w-full px-3 py-2 rounded-xl border ${
                      errors.reporterName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    } focus:outline-hidden focus:border-sky-500`}
                  />
                  {errors.reporterName && <p className="text-rose-600 text-[10px] mt-0.5">{errors.reporterName}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Student ID Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={reporterStudentId}
                    onChange={(e) => setReporterStudentId(e.target.value)}
                    placeholder="e.g. STU-88421"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    University Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    placeholder="alex.rivers@campus.edu"
                    className={`w-full px-3 py-2 rounded-xl border ${
                      errors.reporterEmail ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    } focus:outline-hidden focus:border-sky-500`}
                  />
                  {errors.reporterEmail && <p className="text-rose-600 text-[10px] mt-0.5">{errors.reporterEmail}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Contact Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] text-slate-500">
                By submitting, you certify under the University Student Code of Conduct that the information is truthful.
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 sm:flex-none px-7 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                    type === 'lost'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {submitting ? 'Publishing Report...' : type === 'lost' ? 'Publish Lost Item' : 'Publish Found Item'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
