document.addEventListener("DOMContentLoaded", () => {
  let html5QrCode = null;
  let isScanning = false;

  // Get DOM elements
  const reader = document.getElementById("reader");
  const scanResult = document.getElementById("scanResult");
  const notification = document.getElementById("notification");
  const memberNameElement = document.getElementById("memberName");
  const logoutBtn = document.getElementById("logoutBtn");
  const checkInBtn = document.getElementById("checkInBtn");

  // Configuration
  const API_URL = "https://pt-backend-42d98685b856.herokuapp.com";

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

  // Handle successful QR scan
  async function onScanSuccess(qrCodeMessage) {
    try {
      if (html5QrCode) {
        await html5QrCode.stop();
        html5QrCode = null;
        isScanning = false;
        checkInBtn.textContent = "Check in";
      }

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

      const response = await fetch(
        `${API_URL}/api/qr/check-in/${userData.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          credentials: "include",
          body: JSON.stringify({ qrCode: qrCodeMessage }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("user");
        sessionStorage.removeItem("credentials");
        window.location.href = "login.html";
        throw new Error("Session expired. Please log in again");
      }

      const data = await response.json();

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

  // Improved camera initialization function
  async function initializeCamera() {
    try {
      if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
      }

      const devices = await Html5Qrcode.getCameras();

      if (devices && devices.length > 0) {
        // First try to get the back camera
        const backCamera = devices.find(
          (device) =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("rear")
        );

        const cameraId = backCamera ? backCamera.id : devices[0].id;

        // Configure camera with specific settings for mobile
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
        };

        await html5QrCode.start(cameraId, config, onScanSuccess, (error) => {
          if (!error.includes("QR code parse error")) {
            console.warn(error);
          }
        });

        isScanning = true;
        checkInBtn.textContent = "Stop Scanning";
      } else {
        throw new Error("No cameras found");
      }
    } catch (err) {
      console.error("Camera initialization error:", err);
      showNotification(
        "Failed to access camera. Please check permissions.",
        "error"
      );
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

      if (!isScanning) {
        await initializeCamera();
      } else {
        if (html5QrCode) {
          await html5QrCode.stop();
          html5QrCode = null;
        }
        isScanning = false;
        checkInBtn.textContent = "Check in";
      }
    } catch (error) {
      console.error("Camera error:", error);
      showNotification(error.message, "error");
    }
  });

  logoutBtn.addEventListener("click", async () => {
    try {
      if (html5QrCode && isScanning) {
        await html5QrCode.stop();
        html5QrCode = null;
        isScanning = false;
      }
    } catch (error) {
      console.error("Error stopping scanner:", error);
    } finally {
      localStorage.removeItem("user");
      sessionStorage.removeItem("credentials");
      window.location.href = "login.html";
    }
  });

  // Initialize user data
  const userData = getUserData();
  if (userData && userData.username) {
    memberNameElement.textContent = userData.username;
  } else {
    window.location.href = "login.html";
  }

  // Cleanup on page unload
  window.addEventListener("beforeunload", async () => {
    if (html5QrCode && isScanning) {
      try {
        await html5QrCode.stop();
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
  });
});
