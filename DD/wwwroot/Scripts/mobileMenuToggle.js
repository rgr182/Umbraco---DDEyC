const openMenuButton = document.querySelector('#open-menu');
const navigationMenu = document.querySelector('#navigation ul');
const navigation = document.querySelector('#navigation');
const dropdownToggles = document.querySelectorAll('.has-dropdown .dropdown-arrow');
const dropdownContents = document.querySelectorAll('.has-dropdown ul');

openMenuButton.addEventListener('click', () => {
    navigationMenu.style.display = navigationMenu.style.display === 'none' ? 'block' : 'none';
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 930) {
        navigationMenu.style.display = 'flex';
    }
});
window.addEventListener('resize', () => {
    if (window.innerWidth < 930) {
        navigationMenu.style.display = 'none';
    }
});

navigation.addEventListener('click', (event) => {
    // Check if the click target is a dropdown arrow button
    if (event.target.classList.contains('dropdown-arrow')) {
        const toggle = event.target; // Get the clicked dropdown arrow button
        const index = Array.from(navigation.querySelectorAll('.has-dropdown .dropdown-arrow')).indexOf(toggle); // Get the index of the clicked button

        // Toggle the corresponding dropdown content
        dropdownContents[index].classList.toggle('active');
    }
});

if (dropdownToggles.length > 0 && dropdownContents.length > 0) {
    // Proceed with event listener setup and dropdown functionality logic
} else {
    // Handle the case where no dropdown elements are found
    console.error('Dropdown elements not found. Check HTML structure and class names.');
}