import * as Components from "../../components";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext"; // ✅ make sure path is correct
import { Link } from "react-router-dom";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const isLearner = user?.role === "learner";

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-[#FFFFFF] h-16 flex items-center shadow-sm px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 z-50">
        <div className="flex items-center gap-7">
          <div className="font-bold text-2xl text-[#3776AB]">PyGrounds</div>

          {isLearner && (
            <div className="hidden md:flex gap-3">
              <Components.HeaderLink label="Home" route={`/user/home`} />
              <Components.HeaderLink label="My Profile" route={`/user/my-profile`} />
              <Components.HeaderLink label="Python Learn" route={`/user/python-learn`} />
              <Components.HeaderLink label="Leaderboard" route={`/user/leaderboard`} />
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-4">
          {isLearner ? (
            <>
              <div className="hidden md:block">
                <Components.ProfileDropdown />
              </div>
              <button
                className="md:hidden text-gray-500 hover:text-gray-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </>
          ) : (
            // Public header buttons if NOT logged in
            <div className="gap-2.5 flex">
              <Link to="/login" className="text-sm font-medium text-[#3776AB] border border-[#3776AB] px-3.5 py-1.5 rounded-md">
                Login
              </Link>
              <Link to="/register" className="text-sm font-medium text-white bg-[#3776AB] border border-[#3776AB] px-3.5 py-1.5 rounded-md">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu for Learner */}
      {mobileMenuOpen && isLearner && (
        <div className="md:hidden fixed inset-0 bg-white z-40 mt-16 p-6 space-y-4">
          <Components.HeaderLink label="Home" route={`/user/home`} mobile />
          <Components.HeaderLink label="My Profile" route={`/user/my-profile`} mobile />
          <Components.HeaderLink label="Python Learn" route={`/user/python-learn`} mobile />
          <Components.HeaderLink label="Leaderboard" route={`/user/leaderboard`} mobile />
          <div className="pt-4 border-t border-gray-200">
            <Components.ProfileDropdown mobile />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
