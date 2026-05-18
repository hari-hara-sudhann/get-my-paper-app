const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const getConfiguredBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_SERVER_URL;

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  if (typeof window === "undefined") {
    return "http://localhost:8080";
  }

  if (window.location.port === "5173") {
    return `${window.location.protocol}//${window.location.hostname}:8080`;
  }

  return window.location.origin;
};

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getConfiguredBaseUrl()}${normalizedPath}`;
};

export const fetchJson = async (path, options) => {
  const response = await fetch(apiUrl(path), options);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload?.error ?? `Request failed with status ${response.status}.`,
    );
  }

  return payload;
};
