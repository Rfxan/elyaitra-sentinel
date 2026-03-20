const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("token");

  const res = await fetch(API_URL + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let errorMessage = "API Error";
    try {
      const errorJson = JSON.parse(text);
      errorMessage = errorJson.detail || errorJson.message || text;
    } catch {
      errorMessage = text || `Error: ${res.status} ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}
