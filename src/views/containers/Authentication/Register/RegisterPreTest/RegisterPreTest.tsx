import React from 'react';
import * as Component from "../../../../components";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RegisterPreTest: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Navigate to the previous step (or use a specific route)
    navigate(-1);
  };

  const handleNext = () => {
    // Navigate to the next step; adjust the path as needed
    navigate('/register/terms-and-conditions');
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1.5">
        Let’s See What You Already Know!
      </h1>
      <span className="mb-5 block">
        This quick test helps us match you with the right challenges based on your current Python skills.
      </span>
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
          Next
          <FaArrowRight size={11} />
        </button>
      </div>
    </div>
  );
};

export default RegisterPreTest;
