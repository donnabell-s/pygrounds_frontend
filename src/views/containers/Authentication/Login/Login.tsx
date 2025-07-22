import { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(""); // changed from email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password); // pass username instead of email
      navigate("/user/home");
    } catch (err: any) {
      setError("Login failed. Please check your credentials.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-[#3776AB]">Login</h2>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2"
        />

        <button
          type="submit"
          className="w-full bg-[#3776AB] text-white py-2 px-4 rounded hover:bg-[#2d5f8a]"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
