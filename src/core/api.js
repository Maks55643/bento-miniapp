const API_BASE = "https://bentoapp-production.up.railway.app";

export async function api(path, options = {}){
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw { status: res.status, ...err };
  }

  return res.json();
}
