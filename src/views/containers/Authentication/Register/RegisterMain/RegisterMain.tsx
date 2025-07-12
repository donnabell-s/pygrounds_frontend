// views/Register.jsx
import { Outlet } from "react-router-dom";

const RegisterMain = () => {
  return (
    <div className="register-container">
      <h1>RegisterMain</h1>
      {/* Optionally: step progress bar or nav */}
      <Outlet /> {/* This renders the current step container */}
    </div>
  );
}

export default RegisterMain