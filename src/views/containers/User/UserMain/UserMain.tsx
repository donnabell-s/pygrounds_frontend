import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import * as Components from "../../../components";

const UserMain = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Check if current path matches the logged in user's game start path
  const isGameRoute = location.pathname === `/${user?.id}/${location.pathname.split("/")[2]}/start`;

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F9FAFB] text-[#2D2D2D]">
      {isGameRoute ? <Components.GameHeader /> : <Components.Header />}

      <main className="flex flex-1">
        <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-10 lg:px-16 xl:px-25 mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UserMain;
