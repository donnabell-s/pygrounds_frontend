import React from 'react';
import * as Component from "../../../../components";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RegisterTermsAndConditions: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleNext = () => {
    // TODO: Implement next step when ready
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-5">Terms & Conditions</h1>
      {/* TODO: Add terms and conditions content here */}
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
          className="bg-[#3776AB] text-white px-4 py-2 rounded-md flex justify-center items-center gap-2 text-sm cursor-pointer"
        >
          Submit
          <FaArrowRight size={11} />
        </button>
      </div>
    </div>
  );
};

export default RegisterTermsAndConditions;
