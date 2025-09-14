import { useState, useEffect } from "react";

export default function useUser() {
  const [user, setUser] = useState({
    id: null,
    isAdmin: null,
    token: localStorage.getItem("token") || null,
  });

  const [loading, setLoading] = useState(true);

  const unsetUser = () => {
    localStorage.removeItem("token");
    setUser({ id: null, isAdmin: null, token: null });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setLoading(false);

    fetch(`${process.env.REACT_APP_API_URL}/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setUser({
            id: data.data._id,
            isAdmin: data.data.isAdmin,
            token,
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch user:", err);
        setLoading(false);
      });
  }, []);

  return { user, setUser, unsetUser, loading };
}
