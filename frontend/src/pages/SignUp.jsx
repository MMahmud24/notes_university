import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api";
import { AuthContext } from "../AuthContext";

const SignUp = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await signup(form);
    if (data.token) {
      localStorage.setItem("token", data.token);
      setUser(data.user);
      alert("Signup successful!");
      navigate("/");
    } else {
      alert(data.message || "Signup failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-200 px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-2">Create Account</h2>
        <p className="text-center text-gray-600 mb-6">Join the community and start sharing notes today.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input input-bordered w-full mb-4"
            required
          />
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
          <button type="submit" className="btn btn-secondary w-full">Sign Up</button>
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

export default SignUp;
