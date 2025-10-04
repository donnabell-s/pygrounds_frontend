// src/views/containers/User/UserProfile/UserProfile.tsx
import * as Components from "../../../components";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { useAuth } from "../../../../context/AuthContext";

const UserProfile = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const { user: currentUser } = useAuth();
  const { selectedUser, fetchUserProfile, clearSelectedUser, isLoading } = useUser();
  
  console.log("UserProfile - profileId:", profileId);
  console.log("UserProfile - currentUser:", currentUser);
  console.log("UserProfile - selectedUser:", selectedUser);
  
  // Determine if we're viewing our own profile or someone else's
  const isOwnProfile = !profileId || profileId === currentUser?.id.toString();
  const userToDisplay = isOwnProfile ? currentUser : selectedUser;
  
  console.log("UserProfile - isOwnProfile:", isOwnProfile);
  console.log("UserProfile - userToDisplay:", userToDisplay);

  useEffect(() => {
    if (!isOwnProfile && profileId) {
      // Avoid duplicate requests when effect re-runs without profileId changing
      if (lastFetchedId.current !== profileId) {
        lastFetchedId.current = profileId;
        fetchUserProfile(parseInt(profileId));
      }
    } else {
      // Viewing own profile — clear selected user and reset tracker
      clearSelectedUser();
      lastFetchedId.current = null;
    }
    // Note: don't clear selectedUser here on every effect re-run; only clear on unmount
  }, [profileId, isOwnProfile, fetchUserProfile, clearSelectedUser]);

  // Track last fetched profileId to avoid refetch loops
  const lastFetchedId = useRef<string | null>(null);

  // Clear selected user only when component unmounts
  useEffect(() => {
    return () => {
      clearSelectedUser();
      lastFetchedId.current = null;
    };
  }, [clearSelectedUser]);

  if (!isOwnProfile && isLoading) {
    return (
      <div className="flex flex-col gap-4 py-8">
        <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="flex gap-4">
          <div className="flex-1 h-64 rounded-2xl bg-gray-100 animate-pulse" />
          <div className="flex-1 h-64 rounded-2xl bg-gray-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!isOwnProfile && !selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-xl font-semibold text-gray-600 mb-2">User not found</h2>
        <p className="text-gray-500">The profile you're looking for doesn't exist or is not accessible.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7 py-8">
      {/* Profile header with conditional edit button */}
      <Components.ProfileHeader
        user={userToDisplay}
        showEditButton={isOwnProfile}
        // You can pass custom URLs if/when you add uploads:
        // coverUrl="/assets/images/my-cover.jpg"
        // avatarUrl="/assets/images/my-avatar.png"
      />



      {/* Progress bar - show for own profile or when viewing another user (uses passed user data) */}
      {(
        isOwnProfile || (!isOwnProfile && userToDisplay)
      ) && (
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Components.ProgressBar user={userToDisplay} />
        </div>
      )}

      {/* Achievements and Topic Proficiency — show the same UI for own and other users */}
      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex-1">
          <Components.AchievementList userId={userToDisplay?.id} />
        </div>
        <div className="flex-1">
          <Components.ProficiencyList user={userToDisplay} />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
