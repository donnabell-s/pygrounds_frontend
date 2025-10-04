// src/views/components/Profile/ProfileHeader.tsx
import React from "react";
import { useAuth } from "../../../context/AuthContext";
import { FiEdit2 } from "react-icons/fi";
import defaultCover from "../../../assets/images/default_cover.png"; // ⬅️ use your asset

interface ProfileHeaderProps {
  coverUrl?: string | null;
  avatarUrl?: string | null;
  user?: any; // User to display (if not provided, uses current user)
  showEditButton?: boolean; // Whether to show the edit button
}

const initialsOf = (first?: string, last?: string) => {
  const a = (first || "").trim().charAt(0).toUpperCase();
  const b = (last || "").trim().charAt(0).toUpperCase();
  return (a + b).trim() || "?";
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  coverUrl, 
  avatarUrl, 
  user: propUser, 
  showEditButton = true 
}) => {
  const { user: authUser } = useAuth();
  
  // Use the passed user or fall back to current user
  const user = propUser || authUser;

  console.log("ProfileHeader - user data:", user);

  const first = user?.first_name || "";
  const last = user?.last_name || "";
  const username = user?.username ? `@${user.username}` : "";

  return (
    <section className="w-full bg-white rounded-2xl overflow-hidden shadow-md">
      {/* Cover */}
      <div className="relative z-0 h-32 sm:h-41 md:h-48 w-full">{/* use Tailwind sizes */}
        <img
          src={coverUrl || defaultCover}
          alt="Profile cover"
          className="block h-full w-full object-cover"
        />
      </div>

      {/* Avatar + Info */}
      <div className="px-4 sm:px-6 md:px-8 pb-5">
        <div className="relative z-10 -mt-10 sm:-mt-12 md:-mt-14 flex items-start gap-4 w-full">
          {/* Avatar */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile avatar"
              className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 rounded-full ring-4 ring-white object-cover shadow"
            />
          ) : (
            <div className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 rounded-full ring-4 ring-white bg-[#704EE7] text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shadow">
              {initialsOf(first, last)}
            </div>
          )}

          {/* Name + Username + Button (same row, button on far right) */}
          <div className="flex-1 min-w-0 flex items-start justify-between pt-17">{/* pt-4 for breathing room */}
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#0F172A] leading-tight truncate">
                {first || last ? `${first} ${last}`.trim() : "Your Name"}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-[#6B7280]">{username || "@username"}</span>
              </div>
            </div>

            {showEditButton && (
              <button
                type="button"
                className="ml-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#7054D0] text-white text-sm font-medium shadow hover:opacity-95 w-auto"
                title="Edit profile (coming soon)"
              >
                <FiEdit2 />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;
