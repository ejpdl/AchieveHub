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

                'Authorization' : token

            }

        });

        const data = await response.json();

        if(!data){

            throw new Error(`No data found`);

        }

        const fullName = `${data.First_Name} ${data.Last_Name}`;
        document.querySelector(`#teacher-name`).textContent = fullName;

        const teacherID = data.Student_ID;

        const students = await fetch(`http://localhost:5000/students/list`, {

            method: 'GET',

            headers: {

                'Authorization' : token

            }

        });

        const studentsData = await students.json();

        if(!studentsData || studentsData.length === 0){

            throw new Error(`No student data found`);

        }

        const tablebody = document.querySelector(`.student-table tbody`);  

        tablebody.innerHTML = '';

        const removeteacher = studentsData.filter(student => student.Student_ID !== teacherID);

        removeteacher.forEach(student => {

            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${student.Student_ID}</td>
                <td>${student.First_Name} ${student.Last_Name}</td>
                <td>${student.Grade_Level} - ${student.Section}</td>
                <td>
                    <a href="../Classmate_Page/classmate.html?Student_ID=${student.Student_ID}" class="btn primary" data-student-id="${student.Student_ID}">View Profile</a>
                    <a href="../Artifacts_Page_Classmate/artifacts_classmate.html?Student_ID=${student.Student_ID}" class="btn secondary" data-student-id="${student.Student_ID}">View Artifacts</a>
                </td>
            `;

            tablebody.appendChild(row);

        });

        setupStudentLinks();

    }catch(error){

        console.log(error);
        alert(`An error occurred while loading the data.`);

    }

}

function setupStudentLinks(){

    const studentLinks = document.querySelectorAll(`a[data-student-id]`);

    studentLinks.forEach(link => {

        link.addEventListener('click', function (event){

            const studentId = this.getAttribute('data-student-id');
            localStorage.setItem('classmateId', studentId);

        });

    });

}

loadTeacherData();
