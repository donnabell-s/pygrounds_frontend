// src/pages/register/RegisterTermsAndConditions.tsx
import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../../../../../context/AuthContext";
import { useGame } from "../../../../../context/GameContext";
import type { RegistrationContextType } from "../RegisterMain/RegisterMain";

const RegisterTermsAndConditions: React.FC = () => {
  const navigate = useNavigate();
  const { signupData, preTestAnswers } =
    useOutletContext<RegistrationContextType>();
  const { register } = useAuth();
  const { submitPreAssessmentAnswers } = useGame();

  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => navigate(-1);

  // console.log("Current preTestAnswers in context:", preTestAnswers);

  // const handleSubmit = async () => {
  //   if (!agreed || loading) return;
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     // 1. Register & auto-login
  //     const createdUser = await register({
  //       username: signupData.username,
  //       password: signupData.password,
  //       password2: signupData.password2,
  //       email:    signupData.email,
  //       first_name: signupData.first_name,
  //       last_name:  signupData.last_name,
  //     });

  //     // 2. Submit pre-assessment answers
  //     if (Object.keys(preTestAnswers).length > 0) {
  //       await submitPreAssessmentAnswers(preTestAnswers);
  //     }

  //     // 3. Navigate onward
  //     navigate(`/${createdUser.id}/home`);
  //   } catch (e) {
  //     setError((e as Error).message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    if (!agreed || loading) return;
    setLoading(true);
    setError(null);

    try {
      // Register & auto-login
      const createdUser = await register({
        username: signupData.username,
        password: signupData.password,
        password2: signupData.password2,
        email: signupData.email,
        first_name: signupData.first_name,
        last_name: signupData.last_name,
      });

      // Format preTestAnswers for backend
      const formattedAnswers = {
        answers: Object.entries(preTestAnswers).map(([id, answer]) => ({
          question_id: parseInt(id, 10),
          user_answer: answer,
        })),
      };

      // Submit pre-assessment answers
      if (Object.keys(preTestAnswers).length > 0) {
        await submitPreAssessmentAnswers(formattedAnswers);
      }

      // Navigate onward
      navigate(`/${createdUser.id}/home`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <h1 className="text-2xl font-semibold mb-5">Terms &amp; Conditions</h1>

      <div className="max-h-64 overflow-y-auto border rounded-md p-4 mb-4">
        <p>
          By using this platform, you agree to our Terms and Conditions and Privacy Policy.
          We are committed to safeguarding your data and ensuring transparency in how your
          information is used.
        </p>
      </div>

      <div className="flex items-start gap-2 mb-4">
        <input
          type="checkbox"
          id="agree"
          checked={agreed}
          onChange={() => setAgreed((prev) => !prev)}
          className="mt-1 bg-[#704EE7]"
        />
        <label htmlFor="agree" className="text-sm leading-tight">
          I agree to the{" "}
          <span className="text-[#704EE7] font-semibold">Terms and Conditions</span>{" "}
          and{" "}
          <span className="text-[#704EE7] font-semibold">Privacy Policy</span>.
        </label>
      </div>

      {error && (
        <p className="text-red-600 mb-4">Error: {error}</p>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={handleBack}
          disabled={loading}
          className="border border-[#D1D5DB] px-4 py-2 rounded-md flex items-center gap-2 text-sm cursor-pointer"
        >
          <FaArrowLeft size={11} />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!agreed || loading}
          className={`
            px-4 py-2 rounded-md flex items-center gap-2 text-sm transition cursor-pointer
            ${agreed && !loading
              ? "bg-[#704EE7] text-white hover:brightness-110"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {loading ? "Submitting…" : "Submit"}
          <FaArrowRight size={11} />
        </button>
      </div>
    </div>
  );
};

export default RegisterTermsAndConditions;
