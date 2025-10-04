import * as Components from "../../components";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { FiArrowRightCircle } from "react-icons/fi";
import { PATHS } from "../../../constants";
import Logo from "../../../assets/logo/Pygrounds_Logo.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); 
  const { user } = useAuth();
  const location = useLocation();

  const isLearner = user?.role === "learner";
  const isRegisterPage = location.pathname.startsWith("/register");

  return (
    <>
      <div className="sticky top-0 bg-[#FFFFFF] h-16 flex items-center shadow-sm px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 z-50">
        <div className="flex items-center gap-7">
          <Link to="/" className="flex items-center" aria-label="PyGrounds Home">
            <img
              src={Logo}
              alt="PyGrounds"
              className="h-8 md:h-11 w-auto"
            />
          </Link>

          {isLearner && (
            <div className="hidden md:flex gap-3">
              <Components.HeaderLink label="Home" route={`/${user.id}/${PATHS.USER_VIEW.HOME.path}`} />
              <Components.HeaderLink label="My Profile" route={`/${user.id}/${PATHS.USER_VIEW.USER_PROFILE.path.replace(':profileId', user.id.toString())}`} />
              <Components.HeaderLink label="Python Learn" route={`/${user.id}/${PATHS.USER_VIEW.PYTHON_LEARN.path}`} />
              <Components.HeaderLink label="Leaderboard" route={`/${user.id}/${PATHS.USER_VIEW.LEADERBOARD.path}`} />
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
            !isRegisterPage && (
              <div className="gap-2.5 flex">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-sm font-medium  px-2 py-1.5 rounded-md cursor-pointer hover:brightness-200"
                >
                  Login
                </button>
                <Link
                  to="/register"
                  className="text-sm font-medium text-[#7053D0]  border border-[#7053D0] px-3.5 py-1.5 rounded-full hover:border-[#482986] hover:text-[#482986]"
                >
                  Get Started
                </Link>
              </div>
            )
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && isLearner && (
        <div className="md:hidden fixed inset-0 bg-white z-40 mt-16 p-6 space-y-4">
          <Components.HeaderLink label="Home" route={`/${user.id}/${PATHS.USER_VIEW.HOME.path}`} mobile />
          <Components.HeaderLink label="My Profile" route={`/${user.id}/${PATHS.USER_VIEW.USER_PROFILE.path.replace(':profileId', user.id.toString())}`} mobile />
          <Components.HeaderLink label="Python Learn" route={`/${user.id}/${PATHS.USER_VIEW.PYTHON_LEARN.path}`} mobile />
          <Components.HeaderLink label="Leaderboard" route={`/${user.id}/${PATHS.USER_VIEW.LEADERBOARD.path}`} mobile />
          <div className="pt-4 border-t border-gray-200">
            <Components.ProfileDropdown mobile />
          </div>
        </div>
      )}

      {/* ✅ Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
          onClick={() => setShowLoginModal(false)} // Close when clicking the backdrop
        >
          <div
            className="bg-white rounded-2xl shadow-lg w-[90%] max-w-sm p-9 relative"
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside modal
          >
            <Components.Login onSuccess={() => setShowLoginModal(false)} />
          </div>
        </div>
      )}

    </>
  );
};

export default Header;
