// Target n8n Webhook Endpoint
const N8N_URL = 'https://n8n.omni.increff.com/webhook/return-sync';

/**
 * Global Session Management: Clears localStorage
 */
function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const submitBtn = document.getElementById('submit-btn');

/**
 * File Input Trigger Mapping
 */
if (dropZone) dropZone.onclick = () => fileInput.click();
if (fileInput) fileInput.onchange = () => {
    if (fileInput.files.length) {
        document.getElementById('file-label').innerHTML = `Selected: <b class="text-primary">${fileInput.files[0].name}</b>`;
    }
};

/**
 * Main Payload Submission Logic
 */
if (submitBtn) {
    submitBtn.onclick = async () => {
        const marketplace = document.getElementById('marketplace-select').value;
        const userId = document.getElementById('user-id').value.trim();
        const file = fileInput.files[0];

        // Reset Validation UI
        document.getElementById('marketplace-error').classList.add('d-none');
        document.getElementById('email-error').classList.add('d-none');
        document.getElementById('file-error').classList.add('d-none');

        let isValid = true;

        if (!marketplace) {
            document.getElementById('marketplace-error').classList.remove('d-none');
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailErrorEl = document.getElementById('email-error');
        if (!userId) {
            emailErrorEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter your email ID';
            emailErrorEl.classList.remove('d-none');
            isValid = false;
        } else if (!emailRegex.test(userId)) {
            emailErrorEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a valid email address';
            emailErrorEl.classList.remove('d-none');
            isValid = false;
        }

        if (!file) {
            document.getElementById('file-error').classList.remove('d-none');
            isValid = false;
        }

        if (!isValid) return;

        // Switch to Processing State
        document.getElementById('ui-upload').classList.add('d-none');
        document.getElementById('ui-processing').classList.remove('d-none');

        // Build Payload for n8n
        const formData = new FormData();
        formData.append('file', file);
        formData.append('marketplace', marketplace);
        formData.append('userId', userId);

        try {
            // Async API Call to n8n Webhook
            const res = await fetch(N8N_URL, { method: 'POST', body: formData });
            if (res.ok) {
                // Switch to Success State
                document.getElementById('ui-processing').classList.add('d-none');
                document.getElementById('ui-success').classList.remove('d-none');
            } else {
                throw new Error("n8n Server Handshake Failed");
            }
        } catch (err) {
            alert("Sync Failed: " + err.message);
            location.reload();
        }
    };
}
// Reset Application State
document.getElementById('reset-btn').onclick = () => location.reload();