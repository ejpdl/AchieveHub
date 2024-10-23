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
async function togglePrivacySetting(hideDemographics){

    const token = localStorage.getItem('token');
    
    const response = await fetch(`http://localhost:5000/student_user/privacy`, {

        method: 'POST',
        headers: {

            'Authorization' : token,
            'Content-Type'  : 'application/json',

        },

        body: JSON.stringify({ hide_demographics: hideDemographics })

    });

    const data = await response.json();
    console.log(data.msg);
    
}

document.addEventListener('DOMContentLoaded', () => {

    const classmateLinks = document.querySelectorAll('.classmate-link');

    classmateLinks.forEach(link => {

        link.addEventListener('click', function () {

            const studentId = this.getAttribute('data-student-id');
            localStorage.setItem('classmateId', studentId);

        });
        
    });

});