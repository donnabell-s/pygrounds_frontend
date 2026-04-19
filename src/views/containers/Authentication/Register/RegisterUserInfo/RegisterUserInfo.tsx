// src/pages/register/RegisterUserInfo.tsx
import React, { useMemo, useEffect, useRef, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate, useOutletContext } from "react-router-dom";
import type { RegistrationContextType } from "../RegisterMain/RegisterMain";
import { authApi } from "../../../../../api/authApi";

const RegisterUserInfo: React.FC = () => {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useOutletContext<RegistrationContextType>();

  const [usernameTaken, setUsernameTaken] = useState(false);
  const [emailTaken, setEmailTaken]       = useState(false);
  const [checking, setChecking]           = useState(false);

  // All required fields (including password2) must be non-blank
  const allFieldsFilled = useMemo(() => {
    return (
      signupData.username.trim() !== "" &&
      signupData.first_name.trim() !== "" &&
      signupData.last_name.trim() !== "" &&
      signupData.email.trim() !== "" &&
      signupData.password.trim() !== "" &&
      signupData.password2.trim() !== ""
    );
  }, [
    signupData.username,
    signupData.first_name,
    signupData.last_name,
    signupData.email,
    signupData.password,
    signupData.password2,
  ]);

  // Must match exactly
  const passwordsMatch = signupData.password === signupData.password2;

  const canProceed = allFieldsFilled && passwordsMatch && !usernameTaken && !emailTaken && !checking;

  // Debounce availability check for username and email
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const username = signupData.username.trim();
    const email    = signupData.email.trim();

    if (!username && !email) {
      setUsernameTaken(false);
      setEmailTaken(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        setChecking(true);
        const params: { username?: string; email?: string } = {};
        if (username) params.username = username;
        if (email)    params.email    = email;

        const result = await authApi.checkAvailability(params);
        setUsernameTaken(result.username_taken ?? false);
        setEmailTaken(result.email_taken ?? false);
      } catch {
        // silently ignore network errors — don't block the user
      } finally {
        setChecking(false);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [signupData.username, signupData.email]);

  const handleNext = () => {
    if (!canProceed) return;
    navigate("/register/pre-test-assessment");
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-5">User Information</h1>

      <div className="grid grid-cols-3 gap-5">
        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="text-md font-semibold">
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={signupData.username}
            onChange={(e) =>
              setSignupData((prev) => ({ ...prev, username: e.target.value }))
            }
            className={`bg-[#F1F5FA] border rounded-lg px-2.5 py-1.5 ${
              usernameTaken ? "border-red-500" : "border-[#E4ECF7]"
            }`}
          />
          {usernameTaken && (
            <p className="text-sm text-red-600 mt-1">Username is already taken</p>
          )}
        </div>

        {/* First Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="firstName" className="text-md font-semibold">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            value={signupData.first_name}
            onChange={(e) =>
              setSignupData((prev) => ({ ...prev, first_name: e.target.value }))
            }
            className="bg-[#F1F5FA] border border-[#E4ECF7] rounded-lg px-2.5 py-1.5"
          />
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lastName" className="text-md font-semibold">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            placeholder="Enter your last name"
            value={signupData.last_name}
            onChange={(e) =>
              setSignupData((prev) => ({ ...prev, last_name: e.target.value }))
            }
            className="bg-[#F1F5FA] border border-[#E4ECF7] rounded-lg px-2.5 py-1.5"
          />
        </div>

        {/* Email (span 2 cols) */}
        <div className="col-span-2 flex flex-col gap-1.5">
          <label htmlFor="email" className="text-md font-semibold">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={signupData.email}
            onChange={(e) =>
              setSignupData((prev) => ({ ...prev, email: e.target.value }))
            }
            className={`bg-[#F1F5FA] border rounded-lg px-2.5 py-1.5 ${
              emailTaken ? "border-red-500" : "border-[#E4ECF7]"
            }`}
          />
          {emailTaken && (
            <p className="text-sm text-red-600 mt-1">Email is already in use</p>
          )}
        </div>

        {/* Password & Password2 */}
        <div className="row-start-3 col-start-1 col-span-2 grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-md font-semibold">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={signupData.password}
              onChange={(e) =>
                setSignupData((prev) => ({ ...prev, password: e.target.value }))
              }
              className="bg-[#F1F5FA] border border-[#E4ECF7] rounded-lg px-2.5 py-1.5"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password2" className="text-md font-semibold">
              Confirm Password
            </label>
            <input
              id="password2"
              type="password"
              placeholder="Re-enter your password"
              value={signupData.password2}
              onChange={(e) =>
                setSignupData((prev) => ({ ...prev, password2: e.target.value }))
              }
              className="bg-[#F1F5FA] border border-[#E4ECF7] rounded-lg px-2.5 py-1.5"
            />
            {!passwordsMatch && signupData.password2.trim() !== "" && (
              <p className="text-sm text-red-600 mt-1">
                Passwords do not match
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`
            px-4 py-2 rounded-md flex items-center gap-2 text-sm transition cursor-pointer
            ${canProceed
              ? "bg-[#704EE7] text-white hover:brightness-110"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }
          `}
        >
          Next <FaArrowRight size={11} />
        </button>
      </div>
    </div>
  );
};

export default RegisterUserInfo;
