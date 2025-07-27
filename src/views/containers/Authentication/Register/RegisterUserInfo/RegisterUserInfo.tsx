import * as Component from "../../../../components";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RegisterUserInfo: React.FC = () => {
  const navigate = useNavigate(); // ✅ Initialize navigate

  const handleNext = () => {
    navigate("/register/pre-test-assessment"); // ✅ Redirect to next step
  };

  return (
    <div>

      <h1 className="text-2xl font-semibold mb-5">User Information</h1>

      {/* 3-column grid for the first row */}
      <div className="grid grid-cols-3 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="text-md font-semibold">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            className="bg-[#F1F5FA] border border-[#E4ECF7] rounded-lg px-2.5 py-1.5"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="firstName" className="text-md font-semibold">First Name</label>
          <input
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            className="bg-[#F1F5FA] border border-[#E4ECF7] rounded-lg px-2.5 py-1.5"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="lastName" className="text-md font-semibold">Last Name</label>
          <input
            id="lastName"
            type="text"
            placeholder="Enter your last name"
            className="bg-[#F1F5FA] border border-[#E4ECF7] rounded-lg px-2.5 py-1.5"
          />
        </div>

        {/* Email spans the first two columns */}
        <div className="col-span-2 flex flex-col gap-1.5">
          <label htmlFor="email" className="text-md font-semibold">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email address"
            className="bg-[#F1F5FA] border border-[#E4ECF7] rounded-lg px-2.5 py-1.5"
          />
        </div>

        {/* Passwords box: explicitly placed on row 3, spanning cols 1–2 with two equal columns inside */}
        <div className="row-start-3 col-start-1 col-span-2 grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-md font-semibold">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="bg-[#F1F5FA] border border-[#E4ECF7] rounded-lg px-2.5 py-1.5"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-md font-semibold">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              className="bg-[#F1F5FA] border border-[#E4ECF7] rounded-lg px-2.5 py-1.5"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-end mt-6">
        <button className="bg-[#3776AB] text-white px-4 py-2 rounded-md flex justiify-center items-center gap-2 text-sm cursor-pointer" onClick={handleNext}>Next<FaArrowRight size={11} /></button>
      </div>
    </div>
  )
}


export default RegisterUserInfo