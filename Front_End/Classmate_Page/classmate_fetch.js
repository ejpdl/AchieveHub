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

        document.querySelector(`#classmate-name`).textContent = `${data.First_Name} ${data.Last_Name}`;
        document.querySelector(`#gradesection`).textContent= data.Grade_Section;
        document.querySelector(`#bio`).textContent = data.About_Me;

        const demographics = document.querySelectorAll(`.demographics span`);
        demographics[0].textContent = `${data.Age} Years Old`;
        demographics[1].textContent = new Date(data.Birthday).toLocaleDateString();
        demographics[2].textContent = data.Phone_Number;
        demographics[3].textContent = data.Email;

    }catch(error){

        console.log(`Error fetching classmate data ${error}`);
        alert(`An error occured while loading classmate data`);
    }

}

loadClassmateData();