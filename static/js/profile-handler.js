// Handle profile image loading
function loadUserProfile() {
    fetch('/api/user/profile')
        .then(response => response.json())
        .then(data => {
            const profileImg = document.getElementById('userProfileImage');
            const userEmail = document.querySelector('.user-email');
            const userName = document.querySelector('.user-name');
            
            if (data.profile_image) {
                profileImg.src = data.profile_image;
            }
            
            if (data.email) {
                userEmail.textContent = data.email;
                userEmail.title = data.email; // Full email on hover
            }
            
            if (data.name) {
                userName.textContent = data.name;
            }
        })
        .catch(error => {
            console.error('Error loading profile:', error);
        });
}

// Load categories from Digi4u
function loadDigi4uCategories() {
    fetch('/api/categories')
        .then(response => response.json())
        .then(categories => {
            renderCategorySelector(categories);
        })
        .catch(error => {
            console.error('Error loading categories:', error);
        });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    loadDigi4uCategories();
});