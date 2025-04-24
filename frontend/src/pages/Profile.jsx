import React, { useEffect, useState } from "react";
import API_BASE_URL from "../api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editField, setEditField] = useState(null);
  const [fieldValue, setFieldValue] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUser(data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUser();
  }, []);

  const handleProfileUpdate = async (field) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: fieldValue }),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setMessage("Profile updated!");
        setEditField(null);
        setFieldValue("");
      } else {
        setMessage(data.message || "Update failed");
      }
    } catch (err) {
      setMessage("Something went wrong.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err) {
      setMessage("Something went wrong.");
    }
  };

  if (!user) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">My Profile</h2>
      <div className="bg-white shadow p-6 rounded-lg space-y-6 mb-8">
        {/* NAME */}
        <div>
          <p>
            <strong>Name:</strong> {user.name}{" "}
            <button
              className="text-red-600 text-sm underline ml-2"
              onClick={() => {
                setEditField("name");
                setFieldValue(user.name);
              }}
            >
              Update
            </button>
          </p>
          {editField === "name" && (
            <div className="mt-2 flex space-x-2">
              <input
                type="text"
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                className="input input-bordered flex-1"
              />
              <button
                className="btn btn-primary"
                onClick={() => handleProfileUpdate("name")}
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* EMAIL */}
        <div>
          <p>
            <strong>Email:</strong> {user.email}{" "}
            <button
              className="text-red-600 text-sm underline ml-2"
              onClick={() => {
                setEditField("email");
                setFieldValue(user.email);
              }}
            >
              Update
            </button>
          </p>
          {editField === "email" && (
            <div className="mt-2 flex space-x-2">
              <input
                type="email"
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                className="input input-bordered flex-1"
              />
              <button
                className="btn btn-primary"
                onClick={() => handleProfileUpdate("email")}
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Change Password */}
      <h3 className="text-xl font-semibold mb-2">Change Password</h3>
      <form onSubmit={handlePasswordChange} className="space-y-4 bg-white p-6 shadow rounded-lg">
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="input input-bordered w-full"
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="input input-bordered w-full"
          required
        />
        <button type="submit" className="btn btn-primary w-full">
          Update Password
        </button>
        {message && <p className="text-center text-sm text-info">{message}</p>}
      </form>
    </div>
  );
};

export default Profile;
