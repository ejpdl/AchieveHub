// EDIT DIALOG
const edit_dialog = document.querySelector(`#Edit-dialog`);
const cancel_button = document.querySelector(`#cancel-button`);

const showEditDialog = (show) => show ? edit_dialog.showModal() : edit_dialog.close();
cancel_button.addEventListener('click', () => edit_dialog.close());

// UPLOAD DIALOG
const upload_dialog = document.querySelector(`#Upload-dialog`);
const cancel_upload = document.querySelector(`#cancel-upload`);

const showUploadDialog = (show) => show ? upload_dialog.showModal() : upload_dialog.close();
cancel_upload.addEventListener('click', () => upload_dialog.close());

// SHOW AND HIDE DEMOGRAPHICS INFORMATION
// Function to toggle demographics visibility
function toggleDemographics() {     
    const demographics = document.querySelector('.demographics');
    const eyeIcon = document.querySelector('#eye-icon');

    // Check the current content and toggle accordingly
    if (demographics.textContent === "*********") {
        demographics.textContent = `${data.Birthday}`;
        eyeIcon.classList.remove('fa-eye', 'fa-2x');
        eyeIcon.classList.add('fa-eye-slash', 'fa-2x');
    } else {
        demographics.textContent = "*********"; 
        eyeIcon.classList.remove('fa-eye-slash', 'fa-2x');
        eyeIcon.classList.add('fa-eye', 'fa-2x');
    }
}

document.getElementById('toggle-eye').addEventListener('click', toggleDemographics);

