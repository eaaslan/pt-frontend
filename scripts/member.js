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
  const LOCAL_IP = "192.168.1.13";
  const API_URL = `http://${LOCAL_IP}:8080`;

  // Utility functions
  function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = "block";
    setTimeout(() => {
      notification.style.display = "none";
    }, 3000);
  }

  function getUserId() {
    const userData = JSON.parse(localStorage.getItem("user"));
    console.log("Stored user data:", userData); // Debug log
    return userData?.id || null;
  }

  // Handle successful QR scan
  async function onScanSuccess(qrCodeMessage) {
    try {
      if (html5QrCode) {
        await html5QrCode.stop();
        html5QrCode = null;
        isScanning = false;
        checkInBtn.textContent = "Check in";
      }

      const memberId = getUserId();
      if (!memberId) {
        throw new Error("User ID not found");
      }

      const response = await fetch(`${API_URL}/api/qr/check-in/${memberId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ qrCode: qrCodeMessage }),
      });

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
  checkInBtn.addEventListener("click", async () => {
    try {
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
      window.location.href = "login.html";
    }
  });

  // Initialize user data
  const userData = JSON.parse(localStorage.getItem("user"));
  if (userData && userData.username) {
    memberNameElement.textContent = userData.username;
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
