import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";
import { AuthContext } from "../AuthContext";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

const Notes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const universityId = new URLSearchParams(location.search).get("universityId");

  const [classes, setClasses] = useState([]);
  const [classNotes, setClassNotes] = useState([]);
  const [file, setFile] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");

  const { user } = useContext(AuthContext);

  const [commentsByNote, setCommentsByNote] = useState({});
  const [commentTextMap, setCommentTextMap] = useState({});
  const [replyToMap, setReplyToMap] = useState({});

  const [expandedComments, setExpandedComments] = useState({});
  const [showRepliesMap, setShowRepliesMap] = useState({}); 

  const [commentErrors, setCommentErrors] = useState({});

  const [showAddClassInput, setShowAddClassInput] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  const [savedNoteIds, setSavedNoteIds] = useState([]);

useEffect(() => {
  const fetchSavedNotes = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`${API_BASE_URL}/auth/saved-notes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSavedNoteIds(data.map((note) => note._id));
  };

  fetchSavedNotes();
}, []);



useEffect(() => {
    const fetchClasses = async () => {
      if (!universityId) return;

      try {
        const res = await fetch(`${API_BASE_URL}/classes/${universityId}`);
        const data = await res.json();
        setClasses(data);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };

    fetchClasses();
  }, [universityId]);

  const fetchNotesForClass = async () => {
    if (!selectedClass) return;

    try {
      const res = await fetch(`${API_BASE_URL}/notes/${selectedClass}`);
      const data = await res.json();
      setClassNotes(data);
      data.forEach((note) => fetchCommentsForNote(note._id));
    } catch (err) {
      console.error("Error fetching notes for class:", err);
    }
  };

  useEffect(() => {
    fetchNotesForClass();
  }, [selectedClass]);

  const fetchCommentsForNote = async (noteId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/comments/${noteId}`);
      const data = await res.json();
      setCommentsByNote((prev) => ({ ...prev, [noteId]: data }));
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedClass) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ You must be logged in to upload notes.");
      return;
    }

    const formData = new FormData();
    formData.append("note", file);
    formData.append("university", universityId);
    formData.append("classId", selectedClass);

    try {
      const res = await fetch(`${API_BASE_URL}/notes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        alert("✅ Note uploaded!");
        setFile(null);
        fetchNotesForClass();
      } else {
        const data = await res.json();
        alert(`Upload failed: ${data.message}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Unexpected error occurred.");
    }
  };

  const handleClassChange = (e) => {
    const value = e.target.value;
    if (value === "add-new") {
      setShowAddClassInput(true);
    } else {
      setSelectedClass(value);
    }
  };

  const handleAddClass = async () => {
    if (!newClassName.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClassName,
          courseCode: newClassName, 
          university: universityId,
        }),
      });
  
      const data = await res.json();
      if (res.ok) {
        setClasses((prev) => [...prev, data]);
        setSelectedClass(data._id);
        setShowAddClassInput(false);
        setNewClassName("");
      } else {
        alert(data.message || "Failed to add class.");
      }
    } catch (err) {
      console.error("Add class error:", err);
    }
  };

  const handleDelete = async (noteId) => {
    const confirm = window.confirm("Are you sure you want to delete this note?");
    if (!confirm) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to delete a note.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("✅ Note deleted.");
        fetchNotesForClass();
      } else {
        const data = await res.json();
        alert(`❌ Delete failed: ${data.message}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Unexpected error.");
    }
  };

  const handleVote = async (noteId, voteType) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to vote.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/notes/${noteId}/vote`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ voteType }),
      });

      if (res.ok) {
        fetchNotesForClass();
      } else {
        const data = await res.json();
        alert(data.message || "Voting failed.");
      }
    } catch (err) {
      console.error("Vote error:", err);
      alert("Unexpected error.");
    }
  };
  const handleToggleSave = async (noteId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in to save notes");
  
    await fetch(`${API_BASE_URL}/auth/save-note`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ noteId }),
    });
  
    setSavedNoteIds((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };
  const handleSubmitComment = async (noteId) => {
    const token = localStorage.getItem("token");
    const text = commentTextMap[noteId];
    const replyTo = replyToMap[noteId];
  
    if (!token) {
      setCommentErrors((prev) => ({
        ...prev,
        [noteId]: "You must be logged in to post a comment.",
      }));
      return;
    }
  
    if (!text?.trim()) return;
  
    try {
      const res = await fetch(`${API_BASE_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          noteId,
          text,
          parentComment: replyTo?.commentId || null,
          repliedToUser: replyTo?.userId || null,
        }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setCommentTextMap((prev) => ({ ...prev, [noteId]: "" }));
        setReplyToMap((prev) => ({ ...prev, [noteId]: null }));
        setCommentErrors((prev) => ({ ...prev, [noteId]: null }));
        fetchCommentsForNote(noteId);
      } else {
        setCommentErrors((prev) => ({
          ...prev,
          [noteId]: data.message || "Comment failed.",
        }));
      }
    } catch (err) {
      console.error("Comment error:", err);
      setCommentErrors((prev) => ({
        ...prev,
        [noteId]: "Unexpected error occurred while posting comment.",
      }));
    }
  };
  

  const handleDeleteComment = async (commentId, noteId) => {
    const confirm = window.confirm("Are you sure you want to delete this comment?");
    if (!confirm) return;
  
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
      if (res.ok) {
        fetchCommentsForNote(noteId); // refresh comment list
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (err) {
      console.error("Comment delete error:", err);
      alert("Unexpected error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-900 mb-6">Class Notes</h1>

        {!universityId ? (
          <p className="text-center text-lg text-gray-700">No university selected.</p>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold text-blue-800 mb-4">Upload a Note</h2>
              <form onSubmit={handleUpload} className="flex flex-col md:flex-row items-center gap-4">
              <select
                value={selectedClass}
                onChange={(e) => handleClassChange(e)}
                required
                className="select select-bordered w-full md:w-1/3"
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
                <option value="add-new">Add Class</option>
              </select>
              {showAddClassInput && (
                <div className="w-full md:w-1/3">
                  <input
                    type="text"
                    placeholder="Enter new class name"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="input input-bordered w-full mb-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddClass}
                    className="btn btn-sm btn-accent w-full"
                  >
                    Add Class
                  </button>
                </div>
              )}
                <input
                  type="file"
                  required
                  className="file-input file-input-bordered w-full md:w-1/3"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <button type="submit" className="btn btn-primary w-full md:w-auto">Upload</button>
              </form>
            </div>

            {selectedClass && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-blue-800 text-center mb-6">
                  Notes for {classes.find(c => c._id === selectedClass)?.name}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {classNotes.map((note) => {
                    const allComments = commentsByNote[note._id] || [];
                    const topLevel = allComments.filter(c => !c.parentComment);
                    const showAll = expandedComments[note._id];
                    const visibleTop = showAll ? topLevel : topLevel.slice(0, 2);
                    note.isSaved = savedNoteIds.includes(note._id);

                    return (
                      <div key={note._id} className="card bg-white rounded-xl shadow-md p-4">
                        <iframe
                          src={`http://localhost:5001${note.noteURL}`}
                          title={note._id}
                          width="100%"
                          height="300px"
                          className="rounded border"
                        />

                        <p className="mt-2 text-sm text-gray-600">
                          File Name: {note.fileName}
                        </p>

                        <p className="mt-2 text-sm text-gray-600">
                          Uploaded by: <strong>{note.uploadedBy?.name || "Unknown"}</strong>
                        </p>

                        <p className="text-sm text-gray-500">
                          <strong>Date Uploaded:</strong>{" "}
                          {new Date(note.createdAt).toLocaleDateString("en-US")}
                        </p>

                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleVote(note._id, "up")}
                              className={`btn btn-sm ${
                                note.upvotes?.includes(user?._id)
                                  ? "border-green-600 text-green-600"
                                  : "btn-outline"
                              }`}
                              title="Upvote"
                            >
                              <FaThumbsUp className="mr-1" /> {note.upvotes?.length || 0}
                            </button>

                            <button
                              onClick={() => handleVote(note._id, "down")}
                              className={`btn btn-sm ${
                                note.downvotes?.includes(user?._id)
                                  ? "border-red-600 text-red-600"
                                  : "btn-outline"
                              }`}
                              title="Downvote"
                            >
                              <FaThumbsDown className="mr-1" /> {note.downvotes?.length || 0}
                            </button>
                          </div>

                          <div className="flex space-x-2">
                            <a
                              href={`http://localhost:5001${note.noteURL}`}
                              className="btn btn-outline btn-sm"
                              download
                            >
                              Download
                            </a>
                            <button
                              className={`btn btn-sm ${note.isSaved ? "btn-success" : "btn-outline"}`}
                              onClick={() => handleToggleSave(note._id)}
                            >
                              {note.isSaved ? "Saved" : "Save"}
                            </button>
                            {user?._id === note.uploadedBy?._id && (
                              <button
                                onClick={() => handleDelete(note._id)}
                                className="btn btn-error btn-sm"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Comments Section */}
                        <div className="mt-6 border-t pt-4">
                          <h4 className="text-md font-semibold mb-2 text-blue-900">Comments</h4>

                          {visibleTop.map((comment) => {
                            const replies = allComments.filter(c => c.parentComment === comment._id);
                            const showReplies = showRepliesMap[comment._id];

                            return (
                              <div key={comment._id} className="mb-4">
                                <p className="text-sm">
                                  <span className="font-semibold">{comment.author.name}</span>{" "}
                                  {comment.repliedToUser && (
                                    <span className="text-gray-500">
                                      replying to {comment.repliedToUser.name}
                                    </span>
                                  )}
                                  : {comment.text}
                                  {user?._id === comment.author._id && (
                                    <button
                                      className="text-red-500 text-xs ml-2"
                                      onClick={() => handleDeleteComment(comment._id, note._id)}
                                    >
                                      Delete
                                    </button>
                                  )}
                                </p>
                                <div className="flex items-center space-x-3 mt-1">
                                  <button
                                    className="text-blue-600 text-xs"
                                    onClick={() =>
                                      setReplyToMap((prev) => ({
                                        ...prev,
                                        [note._id]: {
                                          commentId: comment._id,
                                          userId: comment.author._id,
                                        },
                                      }))
                                    }
                                  >
                                    Reply
                                  </button>
                                  {replies.length > 0 && (
                                    <button
                                      className="text-blue-500 text-xs"
                                      onClick={() =>
                                        setShowRepliesMap((prev) => ({
                                          ...prev,
                                          [comment._id]: !prev[comment._id],
                                        }))
                                      }
                                    >
                                      {showReplies ? "Hide replies" : `View replies (${replies.length})`}
                                    </button>
                                  )}
                                </div>

                                {/* Replies */}
                                {showReplies && (
                                  <div className="mt-2 ml-6 border-l pl-3 space-y-2">
                                    {replies.map((reply) => (
                                      <div key={reply._id}>
                                        <p className="text-sm">
                                          <span className="font-semibold">{reply.author.name}</span>{" "}
                                          {reply.repliedToUser && (
                                            <span className="text-gray-500">
                                              replying to {reply.repliedToUser.name}
                                            </span>
                                          )}
                                          : {reply.text}
                                        </p>
                                        <button
                                          className="text-blue-600 text-xs mt-1"
                                          onClick={() =>
                                            setReplyToMap((prev) => ({
                                              ...prev,
                                              [note._id]: {
                                                commentId: reply._id,
                                                userId: reply.author._id,
                                              },
                                            }))
                                          }
                                        >
                                          Reply
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {topLevel.length > 2 && (
                            <button
                              onClick={() =>
                                setExpandedComments((prev) => ({
                                  ...prev,
                                  [note._id]: !prev[note._id],
                                }))
                              }
                              className="text-sm text-blue-600 underline"
                            >
                              {showAll ? "Hide comments" : `View more comments (${topLevel.length - 2} more)`}
                            </button>
                          )}

                          {/* Comment Box */}
                          <div className="mt-3">
                            {replyToMap[note._id] && (
                              <div className="text-sm mb-1 text-gray-600">
                                Replying to: <strong>{replyToMap[note._id].userId}</strong>{" "}
                                <button
                                  className="ml-2 text-red-600 text-xs"
                                  onClick={() =>
                                    setReplyToMap((prev) => ({ ...prev, [note._id]: null }))
                                  }
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                              {commentErrors[note._id] && (
                                <div className="bg-red-100 text-red-700 p-2 text-sm rounded mb-2">
                                  {commentErrors[note._id]}
                                </div>
                              )}
                              <textarea
                              value={commentTextMap[note._id] || ""}
                              onChange={(e) =>
                                setCommentTextMap((prev) => ({
                                  ...prev,
                                  [note._id]: e.target.value,
                                }))
                              }
                              placeholder="Write a comment..."
                              className="textarea textarea-bordered w-full mb-2"
                            />
                            <button
                              onClick={() => handleSubmitComment(note._id)}
                              className="btn btn-sm btn-primary"
                            >
                              Post Comment
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-center mt-10">
          <button onClick={() => navigate("/")} className="btn btn-outline btn-accent">
            ← Back to Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notes;
