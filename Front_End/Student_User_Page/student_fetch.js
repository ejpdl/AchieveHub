// TO LOAD STUDENT DATA AND INFORMATION
async function loadStudentData(){

    const token = localStorage.getItem('token');

    if(!token){

        alert(`No token found. Please Log In`);
        return;

    }

    try{

        const response = await fetch(`http://localhost:5000/student_user/view`, {

            method: 'GET',
            headers: {

                'Authorization': token

            }

        });

        const data = await response.json();

        if(!data){

            throw new Error(`No data found`);

        }

        const fullname = `${data.First_Name} ${data.Last_Name}`;
        const age = `${data.Age} Years Old`;
        const gender = data.Gender;

        var typed = new Typed(".typed", {

            strings: [fullname, age, gender],
            typeSpeed: 60,
            backSpeed: 60,
            loop: true

        });

        document.querySelector(`#grade_section`).textContent = data.Grade_Section;

        document.querySelector(`#aboutme`).textContent = data.About_Me;

        const demographics = document.querySelectorAll(`.demographics span`);
        demographics[0].textContent = new Date(data.Birthday).toLocaleDateString();
        demographics[1].textContent = data.Email;


    }catch(error){

        console.log(`Error fetching: ${error}`);
        alert(`An error occured while loading the student data`);

    }

}

loadStudentData();


// EDIT DIALOG FETCH
async function EditDialog() {

    const token = localStorage.getItem('token');

    try{

        const response = await fetch(`http://localhost:5000/student_user/view`, {

            headers: {

                'Authorization' :  token

            }

        });

        const data = await response.json();

        if(response.ok && data){

            document.querySelector(`#fname`).value = data.First_Name;
            document.querySelector(`#gender`).value = data.Gender;
            document.querySelector(`#mname`).value = data.Middle_Name;
            document.querySelector(`#lname`).value = data.Last_Name;
            document.querySelector(`#grade`).value = data.Grade_Section;
            // document.querySelector(`#section`).value = data.Grade_Section;
            document.querySelector(`#email`).value = data.Email;
            document.querySelector(`#age`).value = data.Age;

            const formatDate = new Date(data.Birthday).toISOString().split('T')[0];
            document.querySelector(`#bday`).value = formatDate;

            document.querySelector(`#bio`).value = data.About_Me; 

            document.querySelector(`#studentID`).value = data.Student_ID || "";
            
            showEditDialog(true);

        }else{

            console.log(`No data found or an error occured`);
            alert(`Could not retrieve user data. Please try again`);

        }


    }catch(error){

        console.log(error);
        alert(`An error occured while fetching the data`);

    }

    const update_information = document.querySelector(`#confirm-button`);

    if(update_information){

        update_information.onclick = async (e) => {

            e.preventDefault();

            const updateData = {

                First_Name: document.querySelector(`#fname`).value,
                Gender: document.querySelector(`#gender`).value,
                Middle_Name: document.querySelector(`#mname`).value,
                Last_Name: document.querySelector(`#lname`).value,
                Grade_Section: document.querySelector(`#grade`).value,
                Email: document.querySelector(`#email`).value,
                Age: document.querySelector(`#age`).value,
                Birthday: document.querySelector(`#bday`).value,
                About_Me: document.querySelector(`#bio`).value,
                Student_ID: document.querySelector(`#studentID`).value

            };

            try{

                const updateResponse = await fetch(`http://localhost:5000/student_user/update`, {

                    method: 'PUT',
                    body: JSON.stringify(updateData),
                    headers: {

                        'Authorization' :  token,
                        'Content-Type'  :  'application/json'

                    }

                });

                const result = await updateResponse.json();

                if(updateResponse.ok){

                    alert(`Successfully Updated`);
                    location.reload();

                }else{

                    console.log(result.error);
                    alert(`Error updating user: ${result.error}`);

                }

            }catch(error){

                console.log(error);
                alert(`An error has occured during the update proccess. Please Try Again`);

            }

        };

    }

}
