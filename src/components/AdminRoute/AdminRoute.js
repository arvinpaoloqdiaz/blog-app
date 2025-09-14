import { useContext } from "react";
import { Navigate } from "react-router-dom";
import UserContext from "../../UserContext";

export default function AdminRoute({ children }) {
  const { user } = useContext(UserContext);

  // ⏳ Wait until we know the user role
  if (user.isAdmin === null) {
    return <p>Loading...</p>; // You could replace with a spinner
  }

  // ❌ Not admin → redirect home
  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // ✅ Authorized → render the page
  return children;
}
