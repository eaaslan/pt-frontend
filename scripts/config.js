// config.js
const CONFIG = {
  API_URL: "https://pt-backend-42d98685b856.herokuapp.com",
  LOCAL_API_URL: "http://localhost:8080",
  DEV_IP_URL: "http://192.168.1.13:8080",

  // Get the appropriate API URL based on environment
  getApiUrl() {
    // You can add logic here to determine which URL to use
    // For example, based on hostname or environment variable

    return this.API_URL;
  },
};

// Make CONFIG available globally
window.CONFIG = CONFIG;

// Prevent modifications to the config object
Object.freeze(window.CONFIG);
