import React, { createContext, useState, useEffect } from 'react';

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
  const unsetUser = React.useCallback(() => {
    setUser({ id: null, isAdmin: false, token: null });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, unsetUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
