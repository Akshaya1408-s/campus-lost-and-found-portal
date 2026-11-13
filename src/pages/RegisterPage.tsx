import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Lock, Mail, User, BookOpen, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, signInWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science & Information Technology');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToCode, setAgreedToCode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required.';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid campus email is required.';
    if (!studentId.trim()) errs.studentId = 'Student ID is required (e.g. STU-12345).';
    if (!password || password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (!agreedToCode) errs.code = 'You must accept the University Honor Code.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setErrors({ general: err?.message || 'Google registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await register({
        name: name.trim(),
        email: email.trim(),
        studentId: studentId.trim(),
        department,
        password,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setErrors({ general: err?.message || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-sky-400 flex items-center justify-center mx-auto shadow-lg">
            <Compass className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            New Student Portal Registration
          </h1>
          <p className="text-xs text-slate-500">
            Create an authorized university profile to log items and receive notifications when lost belongings are turned in.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5">
          {/* Quick Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Register instantly with Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400 bg-white px-2">
              Or Register with University Email
            </div>
          </div>

          {errors.general && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl border ${
                    errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  } focus:outline-hidden focus:border-sky-500`}
                />
              </div>
              {errors.name && <p className="text-rose-600 text-[10px] mt-0.5">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Student ID */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Student ID Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. STU-99201"
                  className={`w-full px-3 py-2.5 rounded-xl border ${
                    errors.studentId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  } focus:outline-hidden focus:border-sky-500 font-mono`}
                />
                {errors.studentId && <p className="text-rose-600 text-[10px] mt-0.5">{errors.studentId}</p>}
              </div>

              {/* Campus Email */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  University Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="j.hayes@campus.edu"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border ${
                      errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    } focus:outline-hidden focus:border-sky-500`}
                  />
                </div>
                {errors.email && <p className="text-rose-600 text-[10px] mt-0.5">{errors.email}</p>}
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                College / Academic Department
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-sky-500 bg-white"
                >
                  <option value="Computer Science & Information Technology">Computer Science &amp; IT</option>
                  <option value="College of Engineering">College of Engineering</option>
                  <option value="College of Natural Sciences & Math">Natural Sciences &amp; Math</option>
                  <option value="School of Business & Economics">School of Business</option>
                  <option value="College of Arts & Humanities">College of Arts &amp; Humanities</option>
                  <option value="Health Sciences & Nursing">Health Sciences &amp; Nursing</option>
                </select>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 chars"
                  className={`w-full px-3 py-2.5 rounded-xl border ${
                    errors.password ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  } focus:outline-hidden focus:border-sky-500`}
                />
                {errors.password && <p className="text-rose-600 text-[10px] mt-0.5">{errors.password}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className={`w-full px-3 py-2.5 rounded-xl border ${
                    errors.confirmPassword ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  } focus:outline-hidden focus:border-sky-500`}
                />
                {errors.confirmPassword && <p className="text-rose-600 text-[10px] mt-0.5">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Honor Code Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToCode}
                  onChange={(e) => setAgreedToCode(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4 mt-0.5"
                />
                <span className="text-slate-600 leading-relaxed">
                  I agree to the <strong>University Honor Code</strong> and certify that all items reported and claims filed are truthful and under my lawful ownership.
                </span>
              </label>
              {errors.code && <p className="text-rose-600 text-[10px] mt-1">{errors.code}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
            >
              {loading ? 'Creating Profile...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have a university account?{' '}
            <Link to="/login" className="text-sky-600 font-bold hover:underline">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
