function handleImageError(imageElement, defaultImageUrl) {
    imageElement.onerror = null;
    imageElement.src = defaultImageUrl;
}