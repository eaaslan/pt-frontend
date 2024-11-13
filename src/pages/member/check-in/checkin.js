// /src/pages/member/checkin/checkin.js

import { ROUTES } from "../../../config/routes.js";
import { navigationService } from "../../../services/navigationService.js";
import { Navbar } from "../../../components/common/Navbar.js";

class CheckInHandler {
  constructor() {
    this.html5QrCode = null;
    this.isScanning = false;
    this.API_URL = "https://pt-backend-42d98685b856.herokuapp.com";
    this.initializeElements();
    this.initializeNavbar();
    this.initializeCamera();
  }

  initializeNavbar() {
    new Navbar("navbarContainer");
  }

  initializeElements() {
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
        // Navigate back to dashboard after successful check-in
        setTimeout(() => navigationService.navigateToMemberDashboard(), 2000);
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
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new CheckInHandler();
});
