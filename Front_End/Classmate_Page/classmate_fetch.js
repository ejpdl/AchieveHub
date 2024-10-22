// TO DISPLAY THE INFORMATION OF THE STUDENT CLASSMATE
async function loadClassmateData(){

    const urlParams = new URLSearchParams(window.location.search);
    const studentID = urlParams.get('Student_ID');

    if(!studentID){

        alert(`No Student ID Provided`);
        return;

    }

    const token = localStorage.getItem('token');
    console.log('Token:', token);

    if(!token){

        alert(`No authentication token found. Please Log In again`);
        return;

    }

    try{

        const response = await fetch(`http://localhost:5000/classmate/view/${studentID}`, {

            method: 'GET',
            headers: {

                'Authorization' : token

            }

        });

        const data = await response.json();

        if(!data){

            throw new Error(`No data found for the specified student`);

        }

        const profileImage = document.querySelector(`#profile`);

        if(data.Profile_Picture){

            profileImage.src = `http://localhost:5000/${data.Profile_Picture}`;
            profileImage.alt = `${data.First_Name}'s Profile Picture`;

        }

        
        document.querySelector(`#classmate-name`).textContent = `${data.First_Name} ${data.Last_Name}`;
        const gradeAndsection = `${data.Grade_Level} - ${data.Section}`;
        document.querySelector(`#gradesection`).textContent= gradeAndsection;
        document.querySelector(`#bio`).textContent = data.About_Me;

        const demographics = document.querySelectorAll(`.demographics span`);
        demographics[0].textContent = data.Phone_Number;
        demographics[1].textContent = data.Email;

        if(studentID === token){

            loadQuizzes(token);

        }

    }catch(error){

        console.log(`Error fetching classmate data ${error}`);
        alert(`An error occured while loading classmate data`);

    }

}

async function loadClassmateFiles(studentID){

    const token = localStorage.getItem('token');

    try{

        const response = await fetch(`http://localhost:5000/view/classmate/quizzes/${studentID}`, {

            method: 'GET',
            headers: {

                'Authorization' :  token
            }

        });

        if(response.ok){

            const files = await response.json();
            const uploadedImagesContainer = document.querySelector(`#uploadedImagesContainer`);

            if(files.length > 0){

                uploadedImagesContainer.innerHTML = '';

                files.forEach(file => {

                    const imageUrl = `http://localhost:5000/${file.File}`;
                    addImageCard(imageUrl, file);

                });

            }else{

                uploadedImagesContainer.innerHTML = "<p>No quizzes found.</p>";

            }

        }else{

            console.error("Error fetching classmate's uploaded files");

        }

    }catch(error){

        console.error("Error:", error);

    }

}

loadClassmateData();