import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

// Registered by UserContext so the API layer can trigger a logout
// without needing React context directly.
let _logoutCallback = null;
export function setLogoutCallback(fn) {
  _logoutCallback = fn;
}

async function request(endpoint, options = {}, withAuth = false) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (withAuth) {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Reactive 401 interception — handles "token expired mid-session"
  if (res.status === 401 && withAuth) {
    if (_logoutCallback) _logoutCallback();
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: "Session expired",
      text: "Your session has expired. Please log in again.",
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
    });
    throw new Error("Unauthorized – session expired");
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `API error: ${res.status}`);
  }

  return res.json();
}

const api = {
  get: (endpoint, withAuth = false) =>
    request(endpoint, { method: "GET" }, withAuth),

  post: (endpoint, body, withAuth = false) =>
    request(endpoint, { method: "POST", body: JSON.stringify(body) }, withAuth),

  put: (endpoint, body, withAuth = false) =>
    request(endpoint, { method: "PUT", body: JSON.stringify(body) }, withAuth),

  delete: (endpoint, withAuth = false) =>
    request(endpoint, { method: "DELETE" }, withAuth),
};

export default api;
