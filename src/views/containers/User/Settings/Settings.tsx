import React from 'react';
import { MdCameraAlt, MdKeyboardArrowDown } from 'react-icons/md';
import defaultCover from '../../../../assets/images/default_cover.png'; // ⬅️ use your asset
import { useAuth } from '../../../../context/AuthContext';

interface FormInputProps {
  label: string;
  value: string | undefined;
  type?: string;
  isSelect?: boolean;
}

const initialsOf = (first?: string, last?: string) => {
  const a = (first || "").trim().charAt(0).toUpperCase();
  const b = (last || "").trim().charAt(0).toUpperCase();
  return (a + b).trim() || "?";
};

const Settings: React.FC = () => {
  const { user } = useAuth();
  const first = user?.first_name || "";
  const last = user?.last_name || "";
  return (
    <div className="w-full py-8 font-sans text-[#2B3674]">
      {/* Cover Image Section */}
      <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-md">
        <img 
          src={defaultCover}
          className="w-full h-full object-cover"
          alt="Cover"
        />
        <button className="absolute top-6 right-6 bg-white/20 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-white/30 transition-all">
          <MdCameraAlt /> Change Cover
        </button>
      </div>

      {/* Overlapping Content Container */}
      <div className="flex flex-col lg:flex-row gap-8 -mt-24 relative px-4 md:px-8 ">
        
        {/* Left Profile Summary Card */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              {user?.profile_picture ? (
                <img
                  src={user?.profile_picture}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-[#704EE7] text-white flex items-center justify-center text-4xl font-bold  border-4 border-white">
                  {initialsOf(first, last)}
                </div>
              )}
              <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full border-4 border-white">
                <MdCameraAlt size={16} />
              </button>
            </div>
            <h3 className="text-xl font-bold">{first} {last}</h3>
            <p className="text-gray-400 text-sm mb-6">@{user?.username}</p>

            <div className="w-full space-y-4 text-sm mb-4">
              <StatRow label="Account Created" value={user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'} color="text-blue-500" />
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="flex-1 bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
          {/* Horizontal Tabs */}
          <div className="flex border-b border-gray-100 px-8 py-4 gap-8 overflow-x-auto">
            <TabItem label="Account Settings" active />
          </div>

          {/* Form Content */}
          <div className="p-8 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormInput label="First Name" value={first} />
              <FormInput label="Last Name" value={last} />
              <FormInput label="Username" value={user?.username} />
              <FormInput label="Email address" value={user?.email} type="email" />
            </div>

            <button className="bg-[#4262FF] cursor-pointer text-white px-10 py-3 rounded-xl font-bold text-sm shadow-md shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
              Update
            </button>
          </div>
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
  <button className={`text-sm font-bold whitespace-nowrap pb-4 border-b-2 transition-all ${
    active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
  }`}>
    {label}
  </button>
);

const FormInput = ({ label, value, type = "text", isSelect }: FormInputProps) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">{label}</label>
    <div className="relative">
      <input 
        type={type} 
        defaultValue={value}
        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
      />
      {isSelect && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          <MdKeyboardArrowDown />
        </div>
      )}
    </div>
  </div>
);

export default Settings;