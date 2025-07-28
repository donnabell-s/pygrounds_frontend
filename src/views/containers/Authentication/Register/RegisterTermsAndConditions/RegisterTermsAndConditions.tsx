import React, { useState } from 'react';
import * as Component from "../../../../components";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RegisterTermsAndConditions: React.FC = () => {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleNext = () => {
    if (!agreed) return;
    // This is where you will later collect all data and call the Register API
    navigate("/register/summary-or-confirm"); // adjust this path later
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-5">Terms & Conditions</h1>
      <div className="max-h-64 overflow-y-scroll border rounded-md p-4 mb-4">
        {/* Replace with your actual content */}
        <p>
          By using this platform, you agree to our Terms and Conditions and Privacy Policy. 
          We are committed to safeguarding your data and ensuring transparency in how your information is used.
        </p>
        {/* You can add more structured text or markdown rendering if needed */}
      </div>

      <div className="flex items-start gap-2 mb-6">
        <input
          type="checkbox"
          id="agree"
          checked={agreed}
          onChange={() => setAgreed(!agreed)}
          className="mt-1"
        />
        <label htmlFor="agree" className="text-sm leading-tight">
          I agree to the <span className="text-[#3776AB] font-semibold">Terms and Conditions</span> and <span className="text-[#3776AB] font-semibold">Privacy Policy</span>.
        </label>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handleBack}
          className="border border-[#D1D5DB] px-4 py-2 rounded-md flex justify-center items-center gap-2 text-sm cursor-pointer"
        >
          <FaArrowLeft size={11} />
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!agreed}
          className={`px-4 py-2 rounded-md flex justify-center items-center gap-2 text-sm cursor-pointer ${
            agreed ? 'bg-[#3776AB] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Submit
          <FaArrowRight size={11} />
        </button>
      </div>
    </div>
  );
};

export default RegisterTermsAndConditions;
