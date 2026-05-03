import { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useAdaptive } from "../../../../context/AdaptiveContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth(); // ✅ get the user
  const { refresh } = useAdaptive();
  const navigate = useNavigate();

  const [username, setUsername] = useState(""); // backend expects username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    try {
      const loggedInUser = await login(username, password);
      const isAdmin = (loggedInUser as any).role === 'admin' || (loggedInUser as any).is_staff || (loggedInUser as any).is_superuser;
      if (isAdmin) {
        navigate(`/admin/${loggedInUser.id}`);
        return;
      }
      // Refresh adaptive data after successful login to ensure progress bar is updated
      await refresh();
      navigate(`/${loggedInUser.id}/home`);
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
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
