const openMenuButton = document.querySelector('.open-menu');
const navigationMenu = document.querySelector('#navigation ul');

openMenuButton.addEventListener('click', () => {
    navigationMenu.style.display = navigationMenu.style.display === 'none' ? 'block' : 'none';
});