document.addEventListener('DOMContentLoaded', function () {
    var modal = document.getElementById("imageModal");
    var modalImg = document.getElementById("modalImage");
    var carouselImages = document.querySelectorAll('.carousel-item img');
    var span = document.getElementsByClassName("modal-close")[0];
    carouselImages.forEach(function (img) {
        img.onclick = function () {
            if (window.innerWidth <= 767) {
                modal.style.display = "block";
                modalImg.src = this.src;
            }
        }
    });
    span.onclick = function () {
        modal.style.display = "none";
    }
    modal.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});