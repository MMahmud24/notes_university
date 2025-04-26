const API_BASE_URL = "https://notes-university.onrender.com";


export const signup = async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return res.json();
  };
  
  export const login = async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return res.json();
  };
  
  export const getMe = async (token) => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  };

export default API_BASE_URL;


