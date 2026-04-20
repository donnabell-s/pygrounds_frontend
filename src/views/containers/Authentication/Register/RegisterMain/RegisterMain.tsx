// src/pages/register/RegisterMain.tsx
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import * as Component from "../../../../components";
import type { SignupData } from "../../../../../types/user";
import type { Dispatch, SetStateAction } from "react";

/** share these four values with nested routes via Outlet.context */
export type RegistrationContextType = {
  signupData: SignupData;
  setSignupData: Dispatch<SetStateAction<SignupData>>;
  preTestAnswers: Record<string, { user_answer: string; time_taken: number }>;
  setPreTestAnswers: Dispatch<SetStateAction<Record<string, { user_answer: string; time_taken: number }>>>;
};

export const REG_SIGNUP_KEY = "reg_signup";
export const REG_PRETEST_KEY = "reg_pretest";

const defaultSignup: SignupData = {
  username:   "",
  first_name: "",
  last_name:  "",
  email:      "",
  password:   "",
  password2:  "",
};

function loadSession<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const RegisterMain: React.FC = () => {
  const [signupData, setSignupData] = useState<SignupData>(() =>
    loadSession(REG_SIGNUP_KEY, defaultSignup)
  );
  const [preTestAnswers, setPreTestAnswers] = useState<Record<string, { user_answer: string; time_taken: number }>>(() =>
    loadSession(REG_PRETEST_KEY, {})
  );

  useEffect(() => {
    sessionStorage.setItem(REG_SIGNUP_KEY, JSON.stringify(signupData));
  }, [signupData]);

  useEffect(() => {
    sessionStorage.setItem(REG_PRETEST_KEY, JSON.stringify(preTestAnswers));
  }, [preTestAnswers]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-[#7053D0]/10 to-[#EAE7FE]/40 text-[#2D2D2D]">
      <Component.Header />

      <main className="flex flex-1">
        <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-10 lg:px-16 xl:px-25 mx-auto">
          <div className="my-8 p-7 bg-white rounded-xl shadow-md">
            <Component.RegisterProgressTracker />

            {/* pass our 4 values to all nested <Route> components */}
            <Outlet
              context={{ signupData, setSignupData, preTestAnswers, setPreTestAnswers }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterMain;
