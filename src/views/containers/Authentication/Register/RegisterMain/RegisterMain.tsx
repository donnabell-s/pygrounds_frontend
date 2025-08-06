// src/pages/register/RegisterMain.tsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import * as Component from "../../../../components";
import type { SignupData } from "../../../../../types/user";
import type { Dispatch, SetStateAction } from "react";

/** share these four values with nested routes via Outlet.context */
export type RegistrationContextType = {
  signupData: SignupData;
  setSignupData: Dispatch<SetStateAction<SignupData>>;
  preTestAnswers: Record<string, any>;
  setPreTestAnswers: Dispatch<SetStateAction<Record<string, any>>>;
};

const defaultSignup: SignupData = {
  username:   "",
  first_name: "",
  last_name:  "",
  email:      "",
  password:   "",
  password2:  "",
};

const RegisterMain: React.FC = () => {
  const [signupData,    setSignupData]    = useState<SignupData>(defaultSignup);
  const [preTestAnswers, setPreTestAnswers] = useState<Record<string, any>>({});

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-[#E4ECF7] to-[#FFFBEC] text-[#2D2D2D]">
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
