import React, { useState, useEffect } from 'react';
import { MdCameraAlt, MdCheckCircle, MdError } from 'react-icons/md';
import defaultCover from '../../../../assets/images/default_cover.png';
import { useAuth } from '../../../../context/AuthContext';
import { userApi } from '../../../../api/userApi';

const formatDateJoined = (raw?: string): string => {
  if (!raw) return 'N/A';
  // Normalize Django's "2026-03-05 00:06:55.346425+08" to a valid ISO string
  const normalized = raw
    .replace(' ', 'T')                      // space → T
    .replace(/(\.\d+)?([+-]\d{2})$/, '$1$2:00'); // +08 → +08:00 (add :00 if missing)
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const initialsOf = (first?: string, last?: string) => {
  const a = (first || "").trim().charAt(0).toUpperCase();
  const b = (last || "").trim().charAt(0).toUpperCase();
  return (a + b).trim() || "?";
};

interface FormState {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
}

interface FieldErrors {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
}

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState<FormState>({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    username: user?.username ?? '',
    email: user?.email ?? '',
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync form when user loads from context (e.g. after fetchProfile resolves)
  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        username: user.username ?? '',
        email: user.email ?? '',
      });
    }
  }, [user?.id]);

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!form.first_name.trim()) errors.first_name = 'First name is required.';
    if (!form.last_name.trim()) errors.last_name = 'Last name is required.';
    if (!form.username.trim()) {
      errors.username = 'Username is required.';
    } else if (form.username.length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    }
    if (!form.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Enter a valid email address.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    setSubmitError(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setSubmitError(null);
    setSuccessMsg(null);

    try {
      const updated = await userApi.updateProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
      });

      if (updated) {
        updateUser({ ...user!, ...updated });
        setSuccessMsg('Profile updated successfully.');
      } else {
        setSubmitError('Update failed. Please try again.');
      }
    } catch (err: any) {
      const detail = err?.response?.data;
      if (detail && typeof detail === 'object') {
        const apiErrors: FieldErrors = {};
        if (detail.username) apiErrors.username = Array.isArray(detail.username) ? detail.username[0] : detail.username;
        if (detail.email) apiErrors.email = Array.isArray(detail.email) ? detail.email[0] : detail.email;
        if (detail.first_name) apiErrors.first_name = Array.isArray(detail.first_name) ? detail.first_name[0] : detail.first_name;
        if (detail.last_name) apiErrors.last_name = Array.isArray(detail.last_name) ? detail.last_name[0] : detail.last_name;
        if (Object.keys(apiErrors).length > 0) {
          setFieldErrors(apiErrors);
        } else {
          setSubmitError(detail.detail || detail.non_field_errors?.[0] || 'Update failed. Please try again.');
        }
      } else {
        setSubmitError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const first = form.first_name || user?.first_name || '';
  const last = form.last_name || user?.last_name || '';

  const accountCreated = formatDateJoined(user?.date_joined);

  return (
    <div className="w-full py-8 font-sans text-[#2B3674]">
      {/* Cover Image */}
      <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-md">
        <img src={defaultCover} className="w-full h-full object-cover" alt="Cover" />
        <button
          type="button"
          className="absolute top-6 right-6 bg-white/20 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-white/30 transition-all"
        >
          <MdCameraAlt /> Change Cover
        </button>
      </div>

      {/* Overlapping Content */}
      <div className="flex flex-col lg:flex-row gap-8 -mt-24 relative px-4 md:px-8">

        {/* Left Profile Card */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-[#704EE7] text-white flex items-center justify-center text-4xl font-bold border-4 border-white">
                  {initialsOf(first, last)}
                </div>
              )}
              <button
                type="button"
                className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full border-4 border-white"
              >
                <MdCameraAlt size={16} />
              </button>
            </div>

            <h3 className="text-xl font-bold">{first} {last}</h3>
            <p className="text-gray-400 text-sm mb-6">@{form.username || user?.username}</p>

            <div className="w-full space-y-4 text-sm mb-4">
              <StatRow label="Account Created" value={accountCreated} color="text-blue-500" />
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="flex-1 bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-8 py-4 gap-8 overflow-x-auto">
            <TabItem label="Account Settings" active />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="p-8 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormInput
                label="First Name"
                value={form.first_name}
                onChange={handleChange('first_name')}
                error={fieldErrors.first_name}
              />
              <FormInput
                label="Last Name"
                value={form.last_name}
                onChange={handleChange('last_name')}
                error={fieldErrors.last_name}
              />
              <FormInput
                label="Username"
                value={form.username}
                onChange={handleChange('username')}
                error={fieldErrors.username}
              />
              <FormInput
                label="Email Address"
                value={form.email}
                type="email"
                onChange={handleChange('email')}
                error={fieldErrors.email}
              />
            </div>

            {/* Feedback messages */}
            {submitError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <MdError size={18} className="shrink-0" />
                {submitError}
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <MdCheckCircle size={18} className="shrink-0" />
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#4262FF] cursor-pointer text-white px-10 py-3 rounded-xl font-bold text-sm shadow-md shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving…' : 'Update'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const StatRow = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
    <span className="text-gray-400 font-medium">{label}</span>
    <span className={`font-bold ${color}`}>{value}</span>
  </div>
);

const TabItem = ({ label, active }: { label: string; active?: boolean }) => (
  <button
    type="button"
    className={`text-sm font-bold whitespace-nowrap pb-4 border-b-2 transition-all ${
      active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
    }`}
  >
    {label}
  </button>
);

interface FormInputProps {
  label: string;
  value: string;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const FormInput = ({ label, value, type = 'text', onChange, error }: FormInputProps) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className={`w-full bg-white border rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 outline-none transition-all ${
        error
          ? 'border-red-400 focus:ring-red-100 focus:border-red-400'
          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-400'
      }`}
    />
    {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
  </div>
);

export default Settings;
