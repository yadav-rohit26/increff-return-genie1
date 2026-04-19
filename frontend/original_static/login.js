
const loginBtn = document.getElementById('login-btn');
const togglePassword = document.getElementById('toggle-password');
const passwordField = document.getElementById('login-pass');
const eyeIcon = document.getElementById('eye-icon');

/**
 * Handle Password Visibility Toggle
 */
if (togglePassword) {
    togglePassword.addEventListener('click', () => {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        // Switch Eye/Eye-Slash icons
        eyeIcon.classList.toggle('fa-eye');
        eyeIcon.classList.toggle('fa-eye-slash');
    });
}

/**
 * Login Handler Logic
 */
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        const u = document.getElementById('login-user').value.trim();
        const p = passwordField.value.trim();

        // Basic Check using decoded Base64 strings
        if (u === atob(AUTH_CONFIG.user) && p === atob(AUTH_CONFIG.pass)) {
            localStorage.setItem('isLoggedIn', 'true'); // Create session

            // Trigger Animation & Feedback
            loginBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...';
            document.body.classList.add('animate-page-exit');
            // <<<<<<< HEAD

            // =======

            // >>>>>>> f0edf379127faa186aa90e33131bc5a106b56e43
            // Wait for animation to finish before redirecting
            setTimeout(() => {
                window.location.href = 'upload.html';       // Navigate to app
            }, 600);
        } else {
            const error = document.getElementById('login-error');
            error.classList.remove('d-none');
            // Feedback: Change button color briefly
            loginBtn.classList.replace('btn-primary', 'btn-danger');
            setTimeout(() => {
                loginBtn.classList.replace('btn-danger', 'btn-primary');
                error.classList.add('d-none');
            }, 2000);
        }
    });

    // Add Enter key support for input fields
    const userField = document.getElementById('login-user');
    const handleEnter = (e) => {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    };
    // <<<<<<< HEAD

    // =======

    // >>>>>>> f0edf379127faa186aa90e33131bc5a106b56e43
    if (userField && passwordField) {
        userField.addEventListener('keypress', handleEnter);
        passwordField.addEventListener('keypress', handleEnter);
    }
}