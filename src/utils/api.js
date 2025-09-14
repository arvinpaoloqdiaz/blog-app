const API_URL = process.env.REACT_APP_API_URL;

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
