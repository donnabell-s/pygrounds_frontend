// src/views/containers/User/MyProfile/MyProfile.tsx
import * as Components from "../../../components";

const MyProfile = () => {
  return (
    <div className="flex flex-col gap-7 py-8">
      {/* Refresh button */}
      <div className="flex justify-end">
        <Components.RefreshButton />
      </div>

      {/* New profile header with default cover + avatar fallback */}
      <Components.ProfileHeader
        // You can pass custom URLs if/when you add uploads:
        // coverUrl="/assets/images/my-cover.jpg"
        // avatarUrl="/assets/images/my-avatar.png"
      />

      {/* Keep your existing blocks */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Components.ProgressBar />
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        <Components.AchievementList />
        <Components.ProficiencyList />
      </div>
    </div>
  );
};

export default MyProfile;
