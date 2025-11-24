import React from "react";
import { useLocation } from "react-router-dom";

const REGISTER_STEPS = [
  { path: "user-information", label: "User Information" },
  { path: "pre-test-assessment", label: "Topic Proficiency" },
  { path: "terms-and-conditions", label: "Terms & Conditions" },
];

const RegisterProgressTracker: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.split("/register/")[1] || "";

  const currentIndex = REGISTER_STEPS.findIndex((step) =>
    currentPath.startsWith(step.path)
  );
  const progressPercent = ((currentIndex + 1) / REGISTER_STEPS.length) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-2">
        {REGISTER_STEPS.map((step, index) => (
          <div
            key={step.path}
            className={`text-sm font-medium transition-colors duration-300 ${
              index === currentIndex
                ? "text-[#7053D0] "
                : "text-[#6B7280]"
            }`}
          >
            {index + 1}. {step.label}
          </div>
        ))}
      </div>

      <div className="w-full h-2 bg-[#E4ECF7] rounded-full overflow-hidden">
        <div
          className="h-2 bg-[#7053D0] rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

export default RegisterProgressTracker;
