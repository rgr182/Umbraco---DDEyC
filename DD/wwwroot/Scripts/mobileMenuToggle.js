document.addEventListener("DOMContentLoaded", function () {
  // Display the navigation bar
  const navigationMenu = document.querySelector("#navigation ul");
  const toggleNavigationMenu = () => {
    if (
      navigationMenu.style.display === "none" ||
      navigationMenu.style.display === ""
    ) {
      navigationMenu.style.display = "block";
    } else {
      navigationMenu.style.display = "none";
    }
  };

  // Toggle the visibility of the navigation menu when clicking the menu button
  document.querySelector("#open-menu").addEventListener("click", (e) => {
    toggleNavigationMenu();
    e.stopPropagation();
  });

  // Toggle the visibility of submenus when clicking the dropdown arrow
  document.querySelectorAll(".dropdown-arrow").forEach((arrow) => {
    arrow.addEventListener("click", () => {
      if (arrow.style.display === "block") {
        arrow.style.display = "none";
      } else {
        arrow.style.display = "block";
      }
    });
    console.log(arrow.style.display);
  });

    // Toggle the visibility of submenus when clicking the dropdown arrow
    document.querySelectorAll('.dropdown-arrow').forEach(arrow => {
        arrow.addEventListener('click', () => {
            if (arrow.style.display === 'block') {
                arrow.style.display = 'none';
            } else {
                arrow.style.display = 'block';
            }            
        });
    });
  setupLinks(".parent-link", ".dropdown");
  setupLinks(".child-link", ".sub-dropdown");
});
