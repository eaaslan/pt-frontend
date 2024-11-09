document.addEventListener("DOMContentLoaded", () => {
  const checkInBtn = document.getElementById("checkInBtn");
  const notification = document.getElementById("notification");
  const memberNameElement = document.getElementById("memberName");
  const scanResult = document.getElementById("scanResult");

  const API_URL = "https://pt-backend-42d98685b856.herokuapp.com";
  const TEST_QR_CODE = "GYM_LOCATION_001";

  function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = "block";
    setTimeout(() => {
      notification.style.display = "none";
    }, 3000);
  }

  function getUserData() {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      window.location.href = "login.html";
      return null;
    }
    return userData;
  }

  function getBasicAuthHeader(username, password) {
    return "Basic " + btoa(username + ":" + password);
  }

  async function testCheckIn() {
    try {
      const userData = getUserData();
      if (!userData || !userData.id) {
        throw new Error("Please log in again");
      }

      console.log("Making check-in request for user:", userData.id);
      console.log("Using test QR code:", TEST_QR_CODE);

      // Get credentials from either localStorage or sessionStorage
      let username = userData.username;
      let password =
        userData.password ||
        JSON.parse(sessionStorage.getItem("credentials"))?.password;

      if (!username || !password) {
        throw new Error(
          "Authentication credentials not found. Please log in again."
        );
      }

      const authHeader = getBasicAuthHeader(username, password);

      const response = await fetch(
        `${API_URL}/api/qr/check-in/${userData.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          credentials: "include",
          body: JSON.stringify({ qrCode: TEST_QR_CODE }),
        }
      );

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.status === 401) {
        // Clear stored data and redirect to login
        localStorage.removeItem("user");
        sessionStorage.removeItem("credentials");
        window.location.href = "login.html";
        throw new Error("Session expired. Please log in again.");
      }

      if (response.ok) {
        showNotification("Check-in successful!", "success");
        scanResult.textContent = `Successfully checked in at ${new Date().toLocaleTimeString()}`;
        scanResult.className = "scan-result success";
      } else {
        throw new Error(data.error || "Check-in failed");
      }
    } catch (error) {
      console.error("Check-in error:", error);
      showNotification(error.message, "error");
      scanResult.textContent = error.message;
      scanResult.className = "scan-result error";
    }
  }

  // Event Listeners
  checkInBtn.addEventListener("click", testCheckIn);

  // Initialize user data
  const userData = getUserData();
  if (userData && userData.username) {
    memberNameElement.textContent = userData.username;
  } else {
    window.location.href = "login.html";
  }

  // Log stored data for debugging
  console.log("Stored user data:", userData);
  console.log("Stored credentials:", sessionStorage.getItem("credentials"));
});
