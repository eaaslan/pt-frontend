// printMember.js
const apiUrl = "http://localhost:8080/members";
const memberList = document.querySelector(".memberList");

if (memberList) {
  // Handle member card clicks
  memberList.addEventListener("click", (event) => {
    const memberCard = event.target.closest(".member-card");
    if (memberCard) {
      event.preventDefault();
      const memberId = memberCard.dataset.memberId;
      window.location.href = `member-details.html?id=${memberId}`;
    }
  });

  // Fetch and display members
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      const memberCards = data.map(
        (member) => `
                <li class="member-card" data-member-id="${member.id}">
                    <div class="member-name">${member.name}</div>
                    <div class="member-email">${member.email}</div>
                    <div class="member-package">
                        ${
                          member.activePackage
                            ? `Active Package: ${member.activePackage.totalSessions} sessions`
                            : "No active package"
                        }
                    </div>
                </li>
            `
      );
      memberList.innerHTML = memberCards.join("");
    })
    .catch((error) => {
      console.error("Error:", error);
      memberList.innerHTML =
        '<li class="error-message">Error loading members</li>';
    });
}
