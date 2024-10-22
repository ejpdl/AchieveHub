async function loadTeacherData(){

    const token = localStorage.getItem('token');

    if(!token){

        alert(`No token found. Please Log In!`);
        return;

    }

    try{

        const response = await fetch(`http://localhost:5000/student_user/view`, {

            method: 'GET',
            headers: {

                'Authorization' :  token

            }

        });

        const data = await response.json();

        if(!data){

            throw new Error(`No data found`);

        }

        const fullName = `${data.First_Name} ${data.Last_Name}`
        document.querySelector(`#teacher-name`).textContent = fullName;
        

    }catch(error){

        console.log(error);

    }

}

loadTeacherData();
