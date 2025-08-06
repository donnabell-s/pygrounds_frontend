import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

type LoginProps = {
  onSuccess?: () => void; // Optional callback for modal closing
};

const Login = ({ onSuccess }: LoginProps) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loggedInUser = await login(username, password);
      if (onSuccess) onSuccess(); // ✅ close modal if in modal
      navigate(`/${loggedInUser.id}/home`);
    } catch (err: any) {
      setError("Login failed. Please check your credentials.");
      console.error(err);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="bg-white rounded-lg w-full max-w-sm space-y-4"
    >

      <div className="flex flex-col justify-center items-center mb-8">
        <h2 className="text-2xl font-bold text-center text-[#7E5CE3]">Sign In</h2>
        <span className="text-sm">Enter valid username & password to continue</span>
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <input
        type="text"
        placeholder="Username"
        value={username}
        required
        onChange={(e) => setUsername(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        required
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2"
      />

      <button
        type="submit"
        className="w-full bg-[#7E5CE3] text-white py-2 px-4 rounded-full hover:brightness-110 mt-4 cursor-pointer"
      >
        Login
      </button>
      <span className="text-sm w-full flex justify-center">Not registered yet?
        <Link to="/register" className="ml-1 cursor-pointer text-[#7E5CE3] hover:brightness-110">
          Create an Account
        </Link>
      </span>
    </form>
  );
};

export default Login;
