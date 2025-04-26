import React, { useContext, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Notes from "./pages/Notes";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import SavedNotes from "./pages/SavedNotes";
import { AuthContext } from "./AuthContext";
import { FaBars } from "react-icons/fa";

function App() {
  const { user, logout } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex bg-base-200 min-h-screen">
        {/* Sidebar */}
        <div
          className={`bg-blue-900 text-white p-6 w-64 fixed top-0 left-0 h-full z-40 shadow-lg transform transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <h2 className="text-2xl font-bold mb-6">Menu</h2>
          <ul className="space-y-2 text-sm font-medium">
            <li>
              <Link
                to="/profile"
                className="block px-4 py-2 rounded-lg hover:bg-blue-800 hover:text-white transition duration-200"
              >
                Profile
              </Link>
            </li>
            <li>
              <Link
                to="/saved-notes"
                onClick={() => setIsSidebarOpen(false)}
                className="block px-4 py-2 rounded-lg hover:bg-blue-800 hover:text-white transition duration-200"
              >
                Saved Notes
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className="block px-4 py-2 rounded-lg hover:bg-blue-800 hover:text-white transition duration-200"
              >
                Settings
              </Link>
            </li>
          </ul>
        </div>

        {/* Page content that shifts */}
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : ""}`}>
          {/* Navbar */}
          <nav className="navbar bg-primary text-white shadow-lg px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-white text-xl"
                title="Toggle Menu"
              >
                <FaBars />
              </button>
              <Link to="/" className="text-2xl font-bold">Notes University</Link>
            </div>

            <div className="flex space-x-4 items-center ml-auto">
              {user ? (
                <>
                  <span className="text-sm text-white">Logged in as <strong>{user.name}</strong></span>
                  <button onClick={logout} className="btn btn-outline btn-accent btn-sm">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline btn-accent btn-sm">Log In</Link>
                  <Link to="/signup" className="btn btn-secondary btn-sm">Sign Up</Link>
                </>
              )}
            </div>
          </nav>

          {/* Route-based content */}
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/saved-notes" element={<SavedNotes />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
