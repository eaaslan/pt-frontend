import { ROUTES } from "../../config/routes.js";

export class PackageHandler {
  constructor(containerId, basicAuth) {
    this.containerId = containerId;
    this.basicAuth = basicAuth;
    this.init();
  }

  async init() {
    try {
      await this.initializeElements();
      await this.loadPackageInfo();
    } catch (error) {
      console.error("Package handler initialization error:", error);
    }
  }

  async initializeElements() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      throw new Error(`Container with id "${this.containerId}" not found`);
    }

    // Make sure package-info exists in the container
    this.packageInfo = this.container.querySelector("#package-info");
    if (!this.packageInfo) {
      const packageInfoDiv = document.createElement("div");
      packageInfoDiv.id = "package-info";
      this.container.appendChild(packageInfoDiv);
      this.packageInfo = packageInfoDiv;
    }

    this.cancelPackageInfo = this.container.querySelector(
      "#cancel-package-info"
    );
    if (!this.cancelPackageInfo) {
      const cancelPackageInfoDiv = document.createElement("div");
      cancelPackageInfoDiv.id = "cancel-package-info";
      this.container.appendChild(cancelPackageInfoDiv);
      this.cancelPackageInfo = cancelPackageInfoDiv;
    }
  }

  async loadPackageInfo() {
    try {
      const basicAuth = this.basicAuth;
      console.log(basicAuth);
      if (!basicAuth) {
        throw new Error("No authentication token found");
      }
      const response = await fetch(
        `${ROUTES.API.BASE_URL}/api/users/my-package`,
        {
          method: "GET",
          headers: {
            Authorization: basicAuth,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid auth token
          //   sessionStorage.removeItem("basicAuth");
          //   window.location.href = ROUTES.AUTH.LOGIN;
          throw new Error("Authentication failed");
        }
        throw new Error(
          `Failed to fetch package information: ${response.status}`
        );
      }

      const data = await response.json();
      // Check if the package data is empty or missing
      if (!data || Object.keys(data).length === 0) {
        throw new Error("No package information found for this member");
      }
      this.displayPackageInfo(data);
    } catch (error) {
      console.error("Package info error:", error);
      this.handlePackageError(error);
    }
  }

  displayPackageInfo(packageData) {
    if (!packageData || !this.packageInfo) return;

    this.packageInfo.innerHTML = `
            <div class="package-info-card">
                <div class="package-details">
                    <div class="package-item">
                        <span class="package-label">Remaining Sessions:</span>
                        <span class="package-value">${
                          packageData.remainingSessions || 0
                        }</span>
                    </div>
                    <div class="package-item">
                        <span class="package-label">Remaining Cancellations:</span>
                        <span class="package-value">${
                          packageData.remainingCancellations || 0
                        }</span>
                    </div>
                </div>
                <div class="cancellation-info">
                    <div class="package-item">
                        <span class="package-label">Total Sessions:</span>
                        <span class="package-value">${
                          packageData.totalSessions || 0
                        }</span>
                    </div>
                </div>
            </div>
        `;
  }

  handlePackageError(error) {
    if (!this.packageInfo) return;

    this.packageInfo.innerHTML = `
            <div class="error-message">
                Unable to load package information. Please try again later.
            </div>
        `;
  }
}
