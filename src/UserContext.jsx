import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';
import { setLogoutCallback } from './utils/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : { id: null, isAdmin: false, token: null };
  });

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Use useCallback so it's a stable reference
  const unsetUser = useCallback(() => {
    setUser({ id: null, isAdmin: false, token: null });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  // Register unsetUser with the API module so the 401 interceptor can call it
  useEffect(() => {
    setLogoutCallback(unsetUser);
  }, [unsetUser]);

  // --- Proactive JWT expiry auto-logout ---
  const logoutTimerRef = useRef(null);

  useEffect(() => {
    // Clear any existing timer first
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    const token = user?.token;
    if (!token) return;

    // Decode the JWT payload (no library needed — it's just base64)
    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));
      const expiresAt = payload.exp * 1000; // convert to ms
      const msUntilExpiry = expiresAt - Date.now();

      if (msUntilExpiry <= 0) {
        // Token already expired on mount (e.g. stale localStorage)
        unsetUser();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'warning',
          title: 'Session expired',
          text: 'Your session has expired. Please log in again.',
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
        });
        return;
      }

      logoutTimerRef.current = setTimeout(() => {
        unsetUser();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'warning',
          title: 'Session expired',
          text: 'Your session has expired. Please log in again.',
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
        });
      }, msUntilExpiry);
    } catch {
      // Malformed token — don't crash, just skip the timer
    }

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [user?.token, unsetUser]);

  return (
    <UserContext.Provider value={{ user, setUser, unsetUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
