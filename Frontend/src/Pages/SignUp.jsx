import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:4444/api/signup", formData);

      console.log("SignUp success:", response.data);
      localStorage.setItem("token", response.data.token);
      alert("Account created!!!");
      navigate("/login");
    } catch (error) {
      console.error("SignUp error:", error.response?.data || error.message);
      alert("SignUp failed, please try again later");
    }
  };

  return (
    <div className="bg-neutral-900 w-full flex items-center justify-center min-h-screen">
      <div className="bg-zinc-100 shadow-lg rounded-lg p-8 max-w-md">
        <h2 className="font-bold text-2xl mb-4 text-center">SignUp</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            value={formData.name}
            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={formData.email}
            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            value={formData.password}
            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex justify-center items-center">
            <button
            className="w-full mt-6 cursor-pointer bg-black text-white font-semibold py-2 rounded-md shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
            type="submit"
          >
            SignUp
          </button>
          </div>
        </form>
                 <p class="mt-4 text-center text-sm text-gray-600">
  Already have an account?
  <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">
    Log in
  </a>
</p>
      </div>
    </div>
  );
};

export default SignUp;