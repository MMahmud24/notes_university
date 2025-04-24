import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import { AuthContext } from "../AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await login(form);
    if (data.token) {
      localStorage.setItem("token", data.token);
      setUser(data.user);
      alert("Login successful!");
      navigate("/");
    } else {
      alert(data.message || "Login failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-200 px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-2">Log In</h2>
        <p className="text-center text-gray-600 mb-6">Welcome back! Upload and view class notes with ease.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input input-bordered w-full mb-4"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input input-bordered w-full mb-4"
            required
          />
          <button type="submit" className="btn btn-primary w-full">Log In</button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="btn btn-outline w-full mt-4"
          >
            ← Back to Homepage
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
