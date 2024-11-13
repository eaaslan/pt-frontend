// /src/components/member/QRScannerHandler.js

class QRScannerHandler {
  constructor() {
    this.html5QrCode = null;
    this.isScanning = false;
    this.API_URL = "https://pt-backend-42d98685b856.herokuapp.com";
    this.init();
  }

  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.initializeElements()
      );
    } else {
      this.initializeElements();
    }
  }

  initializeElements() {
    // Create QR scanner container
    const navbarContainer = document.querySelector(".grid");
    if (!navbarContainer) {
      console.error("Navbar container not found");
      return;
    }

    // Create QR scanner button
    const qrScannerItem = document.createElement("a");
    qrScannerItem.href = "#";
    qrScannerItem.className =
      "flex flex-col items-center justify-center space-y-1 text-gray-600";
    qrScannerItem.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v-4m6 0h2m-6 0h-2M4 12h16M4 12c0-2.209 1.791-4 4-4s4 1.791 4 4-1.791 4-4 4-4-1.791-4-4zm0 0V8m0 4v4m4-4h4m4 0h4m-4-4v4m0-4v-4m0 4h4">
                </path>
            </svg>
            <span class="text-xs">Check In</span>
        `;

    // Insert QR scanner button after Home in navbar
    const homeNav = navbarContainer.children[0];
    navbarContainer.insertBefore(qrScannerItem, homeNav.nextSibling);

    // Create modal for QR scanner
    const modal = document.createElement("div");
    modal.className =
      "qr-modal hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center";
    modal.innerHTML = `
            <div class="bg-white p-4 rounded-lg w-full max-w-md mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold">QR Code Scanner</h2>
                    <button id="closeQrScanner" class="text-gray-500 hover:text-gray-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div id="reader" class="w-full mb-4"></div>
                <div id="scanResult" class="text-center mb-4"></div>
                <div id="notification" class="hidden"></div>
            </div>
        `;

    document.body.appendChild(modal);

    // Add event listeners
    qrScannerItem.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggleScanner();
    });

    document.getElementById("closeQrScanner").addEventListener("click", () => {
      this.closeScanner();
    });

    // Store elements
    this.modal = modal;
    this.reader = document.getElementById("reader");
    this.scanResult = document.getElementById("scanResult");
    this.notification = document.getElementById("notification");
  }

  showNotification(message, type) {
    this.notification.textContent = message;
    this.notification.className = `notification ${type}`;
    this.notification.style.display = "block";
    setTimeout(() => {
      this.notification.style.display = "none";
    }, 3000);
  }

  getUserData() {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      window.location.href = "/src/pages/auth/login.html";
      return null;
    }
    return userData;
  }

  getBasicAuthHeader() {
    const userData = this.getUserData();
    if (!userData) return null;

    let username = userData.username;
    let password =
      userData.password ||
      (sessionStorage.getItem("credentials")
        ? JSON.parse(sessionStorage.getItem("credentials")).password
        : null);

    if (!username || !password) return null;

    return "Basic " + btoa(username + ":" + password);
  }

  async onScanSuccess(qrCodeMessage) {
    try {
      if (this.html5QrCode) {
        await this.html5QrCode.stop();
        this.html5QrCode = null;
        this.isScanning = false;
      }

      const userData = this.getUserData();
      if (!userData || !userData.id) {
        throw new Error("Please log in again");
      }

      const authHeader = this.getBasicAuthHeader();
      if (!authHeader) {
        localStorage.removeItem("user");
        sessionStorage.removeItem("credentials");
        window.location.href = "/src/pages/auth/login.html";
        throw new Error(
          "Authentication credentials not found. Please log in again"
        );
      }

      const response = await fetch(
        `${this.API_URL}/api/qr/check-in/${userData.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          credentials: "include",
          body: JSON.stringify({
            qrCode: qrCodeMessage,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("user");
        sessionStorage.removeItem("credentials");
        window.location.href = "/src/pages/auth/login.html";
        throw new Error("Session expired. Please log in again");
      }

      const data = await response.json();

      if (response.ok) {
        this.showNotification("Check-in successful!", "success");
        this.scanResult.textContent = `Successfully checked in at ${new Date().toLocaleTimeString()}`;
        this.scanResult.className = "scan-result success";
        setTimeout(() => this.closeScanner(), 2000);
      } else {
        throw new Error(data.error || "Check-in failed");
      }
    } catch (error) {
      this.showNotification(error.message, "error");
      this.scanResult.textContent = error.message;
      this.scanResult.className = "scan-result error";
      console.error("Check-in error:", error);
    }
  }

  async initializeCamera() {
    try {
      if (!this.html5QrCode) {
        this.html5QrCode = new Html5Qrcode("reader");
      }

      const devices = await Html5Qrcode.getCameras();

      if (devices && devices.length > 0) {
        const backCamera = devices.find(
          (device) =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("rear")
        );

        const cameraId = backCamera ? backCamera.id : devices[0].id;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
        };

        await this.html5QrCode.start(
          cameraId,
          config,
          (qrMessage) => this.onScanSuccess(qrMessage),
          (error) => {
            if (!error.includes("QR code parse error")) {
              console.warn(error);
            }
          }
        );

        this.isScanning = true;
      } else {
        throw new Error("No cameras found");
      }
    } catch (err) {
      console.error("Camera initialization error:", err);
      this.showNotification(
        "Failed to access camera. Please check permissions.",
        "error"
      );
    }
  }

  async toggleScanner() {
    if (!this.isScanning) {
      this.modal.classList.remove("hidden");
      await this.initializeCamera();
    } else {
      await this.closeScanner();
    }
  }

  async closeScanner() {
    if (this.html5QrCode && this.isScanning) {
      await this.html5QrCode.stop();
      this.html5QrCode = null;
      this.isScanning = false;
    }
    this.modal.classList.add("hidden");
  }
}
