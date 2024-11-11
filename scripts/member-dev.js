import getIstanbulTimeISO from "./localTime.js";

document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  const reader = document.getElementById("reader");
  const scanResult = document.getElementById("scanResult");
  const notification = document.getElementById("notification");
  const memberNameElement = document.getElementById("memberName");
  const logoutBtn = document.getElementById("logoutBtn");
  const checkInBtn = document.getElementById("checkInBtn");
  const timeInfo = getIstanbulTimeISO();

  // Configuration
  //const API_URL = "https://pt-backend-42d98685b856.herokuapp.com";
  const API_URL = "http://localhost:8080";

  // const API_URL = "http://localhost:8080";
  const TEST_QR_CODE = "GYM_LOCATION_001"; // Hardcoded test QR code

  // Utility functions
  function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = "block";
    setTimeout(() => {
      notification.style.display = "none";
    }, 3000);
  }

  const getUserData = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      window.location.href = "login.html";
      return null;
    }
    return userData;
  };

  const getBasicAuthHeader = () => {
    const userData = getUserData();
    if (!userData) return null;

    // Try to get credentials from various sources
    let username = userData.username;
    let password =
      userData.password ||
      (sessionStorage.getItem("credentials")
        ? JSON.parse(sessionStorage.getItem("credentials")).password
        : null);

    if (!username || !password) {
      return null;
    }

    return "Basic " + btoa(username + ":" + password);
  };

  // Test check-in function without camera
  async function testCheckIn() {
    try {
      const userData = getUserData();
      if (!userData || !userData.id) {
        throw new Error("Please log in again");
      }

      const authHeader = getBasicAuthHeader();
      if (!authHeader) {
        localStorage.removeItem("user");
        sessionStorage.removeItem("credentials");
        window.location.href = "login.html";
        throw new Error(
          "Authentication credentials not found. Please log in again"
        );
      }

      console.log("Making check-in request for user:", userData.id);
      console.log("Using test QR code:", TEST_QR_CODE);

      console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);

      const response = await fetch(
        `${API_URL}/api/qr/check-in/${userData.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          credentials: "include",
          body: JSON.stringify({
            qrCode: TEST_QR_CODE,
            clientLocalTime: timeInfo,
            clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        }
      );

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.status === 401) {
        localStorage.removeItem("user");
        sessionStorage.removeItem("credentials");
        window.location.href = "login.html";
        throw new Error("Session expired. Please log in again");
      }

      if (response.ok) {
        showNotification("Check-in successful!", "success");
        scanResult.textContent = `Successfully checked in at ${new Date().toLocaleTimeString()}`;
        scanResult.className = "scan-result success";
      } else {
        throw new Error(data.error || "Check-in failed");
      }
    } catch (error) {
      showNotification(error.message, "error");
      scanResult.textContent = error.message;
      scanResult.className = "scan-result error";
      console.error("Check-in error:", error);
    }
  }

  // Event Listeners
  checkInBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
      // Verify user is logged in and has valid credentials
      const userData = getUserData();
      if (!userData) return;

      if (!getBasicAuthHeader()) {
        showNotification(
          "Please log in again to refresh your credentials",
          "error"
        );
        window.location.href = "login.html";
        return;
      }

      await testCheckIn();
    } catch (error) {
      console.error("Check-in error:", error);
      showNotification(error.message, "error");
    }
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("credentials");
    window.location.href = "login.html";
  });

  // Initialize user data
  const userData = getUserData();
  if (userData && userData.username) {
    memberNameElement.textContent = userData.username;
    console.log("Current user data:", userData);
  } else {
    window.location.href = "login.html";
  }
});
