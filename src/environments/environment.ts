const local = window.location.hostname.startsWith("30.") || window.location.hostname === "localhost";

export const environment = {
  production: false,
  apiURL: local
    ? "30.0.0.78:3562"
    : "tamminademoapps.com:9293"
};

