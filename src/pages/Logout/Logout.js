import { Navigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import UserContext from '../../UserContext';

export default function Logout() {
  const { unsetUser } = useContext(UserContext);
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    unsetUser();
    Swal.fire({
      title: "Logged out",
      text: "See you again soon!",
      icon: "success",
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      setLoggedOut(true);
    });
  }, [unsetUser]);

  if (loggedOut) return <Navigate to="/" />;
  return null; // nothing while alert shows
}
