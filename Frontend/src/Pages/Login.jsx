import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:4444/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        // Save token in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("userid" , data.user.id);
        alert("Login successful!");
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="flex items-center justify-center min-h-screen bg-neutral-900">
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-lg shadow-md w-96"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          type="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="mb-6">
        <input
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 cursor-pointer bg-black text-white font-semibold py-2 rounded-md shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {/* 👇 Now inside the card */}
      <p className="mt-4 text-center text-sm text-gray-600">
        Don’t have an account?
        <a
          href="/signup"
          className="font-medium text-blue-600 hover:text-blue-500 ml-1"
        >
          Sign up
        </a>
      </p>
    </form>
  </div>
);
}