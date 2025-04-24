import React, { useEffect, useState } from "react";
import API_BASE_URL from "../api";

const SavedNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedNotes = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/auth/saved-notes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setNotes(data);
      } catch (err) {
        console.error("Failed to fetch saved notes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedNotes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-6">Saved Notes</h1>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : notes.length === 0 ? (
          <p className="text-center text-lg text-gray-600">You haven’t saved any notes yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notes.map((note) => (
              <div key={note._id} className="card bg-white rounded-xl shadow-md p-4">
                <iframe
                  src={`http://localhost:5001${note.noteURL}`}
                  title={note._id}
                  width="100%"
                  height="300px"
                  className="rounded border"
                />
                <p className="text-sm text-blue-900 font-medium">
                    Name: {note.fileName}
                </p>
                <div className="mt-3 text-right">
                  <a
                    href={`http://localhost:5001${note.noteURL}`}
                    className="btn btn-outline btn-sm"
                    download
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedNotes;
