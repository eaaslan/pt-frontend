document.addEventListener("DOMContentLoaded", () => {
  // 1. Declare all variables at the top
  let html5QrCode = null;
  let isScanning = false; // This was missing before

  // 2. Get all DOM elements
  const reader = document.getElementById("reader");
  const scanResult = document.getElementById("scanResult");
  const notification = document.getElementById("notification");
  const memberNameElement = document.getElementById("memberName");
  const logoutBtn = document.getElementById("logoutBtn");
  const checkInBtn = document.getElementById("checkInBtn");
  const API_URL = window.CONFIG.getApiUrl();
  // 3. Configuration constants

  const qrConfig = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
  };

  // 4. Define utility functions
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
    return userData?.id || null;
  }

  async function onScanSuccess(qrCodeMessage) {
    try {
      // Stop scanning after successful scan
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
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          qrCode: qrCodeMessage,
        }),
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

  function onScanFailure(error) {
    if (!error.includes("QR code parse error")) {
      console.error("Scan error:", error);
      showNotification(error, "error");
    }
  }

  // 5. Initialize user data
  const userData = JSON.parse(localStorage.getItem("user"));
  if (userData && userData.username) {
    memberNameElement.textContent = userData.username;
  }

  checkInBtn.addEventListener("click", async () => {
    try {
      if (!isScanning) {
        html5QrCode = new Html5Qrcode("reader");
        const devices = await Html5Qrcode.getCameras();

        // Simple direct camera access
        await html5QrCode
          .start(
            devices[0].id,
            { facingMode: { exact: "environment" } }, // Try exact environment first
            {
              fps: 10,
              qrbox: 250,
            },
            (decodedText) => {
              console.log("QR Code detected:", decodedText);
              onScanSuccess(decodedText);
            },
            (error) => console.log("QR Scan error:", error)
          )
          .catch(async (err) => {
            console.log("Falling back to user camera");
            // If environment camera fails, try user camera
            await html5QrCode.start(
              { facingMode: "user" },
              {
                fps: 10,
                qrbox: 250,
              },
              (decodedText) => {
                console.log("QR Code detected:", decodedText);
                onScanSuccess(decodedText);
              },
              (error) => console.log("QR Scan error:", error)
            );
          });

        isScanning = true;
        checkInBtn.textContent = "Stop Scanning";
      } else {
        await html5QrCode.stop();
        html5QrCode = null;
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

  // 7. Clean up on page unload
  window.addEventListener("beforeunload", async () => {
    if (html5QrCode && isScanning) {
      try {
        await html5QrCode.stop();
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
  });

  // 8. Debug logs
  console.log("Elements found:", {
    reader: !!reader,
    checkInBtn: !!checkInBtn,
    scanResult: !!scanResult,
  });
  console.log("Html5Qrcode available:", typeof Html5Qrcode !== "undefined");
});
