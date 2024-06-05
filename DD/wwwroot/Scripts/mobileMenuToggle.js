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

  // Adjust the visibility of the navigation menu when resizing the window
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1009) {
      navigationMenu.style.display = "flex";
    } else {
      navigationMenu.style.display = "none";
    }
  });

  // Close the menus when clicking outside of the menu
  document.addEventListener("click", (e) => {
    const isClickInsideMenu = e.target.closest(".navigation-container");
    if (!isClickInsideMenu && window.innerWidth < 1009) {
      // Close the main menu on mobile
      navigationMenu.style.display = "none";
    }
  });

  // Toggle menus with children
  const toggleDropdown = function (event, dropdownClass) {
    const parentLi = event.target.closest("li");
    const dropdown = parentLi.querySelector(dropdownClass);

    if (dropdown) {
      event.preventDefault();
      const isOpen = dropdown.classList.toggle("open");
      event.target.setAttribute("aria-expanded", isOpen);
    }
  };

  const setupLinks = function (linkSelector, dropdownClass) {
    const links = document.querySelectorAll(linkSelector);
    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        toggleDropdown(event, dropdownClass);
      });
      link.setAttribute("aria-haspopup", "true");
      link.setAttribute("aria-expanded", "false");
    });
  };

  setupLinks(".parent-link", ".dropdown");
  setupLinks(".child-link", ".sub-dropdown");
});
