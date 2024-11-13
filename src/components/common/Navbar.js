export class Navbar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentPath = window.location.pathname;
    this.render();
    this.bindEvents();
  }

  render() {
    const navbar = document.createElement("nav");
    navbar.className =
      "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe-area";
    navbar.innerHTML = `
      <div class="grid grid-cols-4 h-16">
        <!-- Dashboard -->
        <a href="/src/pages/member/dashboard/index.html" 
           class="flex flex-col items-center justify-center space-y-1 ${
             this.isActive("/dashboard") || this.isActive("/index.html")
               ? "text-blue-600"
               : "text-gray-600"
           }">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
            </path>
          </svg>
          <span class="text-xs">Home</span>
        </a>

        <!-- Schedule -->
        <a href="/src/pages/member/schedule/schedule.html" 
           class="flex flex-col items-center justify-center space-y-1 ${
             this.isActive("/schedule") ? "text-blue-600" : "text-gray-600"
           }">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
            </path>
          </svg>
          <span class="text-xs">Schedule</span>
        </a>

        <!-- Profile -->
        <a href="/src/pages/member/profile/index.html" 
           class="flex flex-col items-center justify-center space-y-1 ${
             this.isActive("/profile") ? "text-blue-600" : "text-gray-600"
           }">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
            </path>
          </svg>
          <span class="text-xs">Profile</span>
        </a>

        <!-- Settings -->
        <a href="/src/pages/member/settings/index.html" 
           class="flex flex-col items-center justify-center space-y-1 ${
             this.isActive("/settings") ? "text-blue-600" : "text-gray-600"
           }">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
            </path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z">
            </path>
          </svg>
          <span class="text-xs">Settings</span>
        </a>
      </div>
    `;

    this.container.appendChild(navbar);
  }

  isActive(path) {
    return this.currentPath.includes(path);
  }

  bindEvents() {
    this.container.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (e) => {
        this.container
          .querySelectorAll("a")
          .forEach((l) => l.classList.remove("text-blue-600"));
        link.classList.add("text-blue-600");
      });
    });
  }
}
