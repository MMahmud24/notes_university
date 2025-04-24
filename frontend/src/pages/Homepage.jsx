import React from "react";
import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

const Homepage = () => {
    const [university, setUniversity] = useState("");
    const navigate = useNavigate();
  
  
    const handleSearch = (event) => {
      event.preventDefault();
      if (university) {
        navigate(`/notes?universityId=${university}`);
      }
    };

    const [universities, setUniversities] = useState([]);

    useEffect(() => {
      const fetchUniversities = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/universities`);
          const data = await res.json();
          console.log("Fetched universities:", data);  
          setUniversities(data);
        } catch (err) {
          console.error("Failed to fetch universities:", err);
        }
      };
    
      fetchUniversities();
    }, []);

  return (
    <div className="homepage bg-base-200 min-h-screen">

      {/* Hero Section */}
      <div className="hero min-h-[50vh] bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
        <div className="hero-content text-center">
          <div>
            <h1 className="text-5xl font-bold">Find & Share Class Notes</h1>
            <p className="text-lg mt-4">Enter your university and start exploring!</p>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="mt-4">
            <select
              className="select select-bordered w-full max-w-md text-black"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            >
              <option value="">Select your university...</option>
              {universities.map((uni) => (
                <option key={uni._id} value={uni._id}>
                  {uni.name}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-accent ml-2">Search</button>
            </form>

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-white mb-2">Or select from popular universities:</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {universities.map((uni) => (
                  <button
                    key={uni._id}
                    className="btn btn-outline btn-info"
                    onClick={() => navigate(`/notes?universityId=${uni._id}`)}
                  >
                    {uni.name}
                  </button>
                ))}
              </div>
          </div>
            {/* Display search result */}
            {university && (
              <p className="mt-2 text-lg text-gray-300">
                Searching for: <span className="font-bold">{university}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contribution Section */}
      <div className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center text-primary">Contribute to the Community</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Card 1 */}
          <div className="card bg-white shadow-xl p-6 text-center">
            <h2 className="text-xl font-semibold">📂 Share & Upload Notes</h2>
            <p className="mt-2">Help others by uploading your class notes.</p>
          </div>

          {/* Card 2 */}
          <div className="card bg-white shadow-xl p-6 text-center">
            <h2 className="text-xl font-semibold">🔍 Search for Notes</h2>
            <p className="mt-2">Find resources for your university and classes.</p>
          </div>

          {/* Card 3 */}
          <div className="card bg-white shadow-xl p-6 text-center">
            <h2 className="text-xl font-semibold">📝 Review & Comment</h2>
            <p className="mt-2">Leave reviews and additional insights on notes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
