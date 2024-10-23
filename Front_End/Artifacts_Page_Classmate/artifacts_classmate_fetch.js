document.addEventListener("DOMContentLoaded", async () => {

    const filterbuttons = document.querySelectorAll(`.filter-buttons button`);
    const filterablecards = document.querySelectorAll(`.filter-cards .card`);

    const filtercards = e => {

        document.querySelector(`.active`)?.classList.remove("active"); 
        e.target.classList.add("active");

        filterablecards.forEach(card => {

            card.classList.add("hide");

            if(card.dataset.name === e.target.dataset.name || e.target.dataset.name === "all"){

                card.classList.remove("hide");

            }

        });

    };

    filterbuttons.forEach(button => button.addEventListener("click", filtercards));


});


async function loadClassmateFiles(){

    const studentID = localStorage.getItem('classmateId');
    const token = localStorage.getItem('token');

    if(!studentID){

        console.log(`No classmate ID found in the local storage`);
        return;

    }

    try{

        const response = await fetch(`http://localhost:5000/view/classmate/artifacts/${studentID}`, {

            method: 'GET',
            headers: {

                'Authorization' :  token

            }

        });

        if(response.ok){

            const { quizzes, performanceTasks } = await response.json();
            const uploadedImagesContainer = document.querySelector(`#uploadedImagesContainer`);

            if(quizzes.length > 0){

                quizzes.forEach(file => {

                    const fileUrl = `http://localhost:5000/${file.File}`;
                    addImageCard(fileUrl, file);

                });

            }else{

                uploadedImagesContainer.innerHTML += "<p> No quizzes found </p>";

            }

            if(performanceTasks.length > 0){

                performanceTasks.forEach(file => {

                    const fileUrl = `http://localhost:5000/${file.File}`;
                    addImageCard(fileUrl, file);

                });

            }else{

                uploadedImagesContainer.innerHTML += "<p> No performance tasks found </p>";

            }


        }else{

            console.log(`Error fetching classmates files`);

        }

    }catch(error){

        console.log(error);

    }

}

loadClassmateFiles();

function addImageCard(fileUrl, fileData){

    const uploadedImagesContainer = document.querySelector(`#uploadedImagesContainer`);

    const OwnerName = `${fileData.First_Name} ${fileData.Last_Name}`
    document.querySelector(`#owner-name`).textContent = `${OwnerName}'s Property`;

    const card = document.createElement("div");
    card.classList.add("card");
    const subjectName = (fileData.Subject && typeof fileData.Subject === 'string') 
        ? fileData.Subject.toLowerCase() 
        : "unknown";
    card.setAttribute("data-name", subjectName); 

    let fileType;
    
    if(fileUrl.match(/\.(jpeg|jpg|png)$/)){

        // FOR IMAGES
        fileType = document.createElement("img");
        fileType.src = fileUrl;
        fileType.alt = "Images";

    }else if(fileUrl.match(/\.(mp4|avi|mkv)$/)){

        // FOR VIDEOS
        fileType = document.createElement("video");
        fileType.src = fileUrl;
        fileType.controls = true; 

    }else if(fileUrl.match(/\.pdf$/)){

        // FOR PDF
        const pdfLink = document.createElement("a");
        pdfLink.href = fileUrl;
        pdfLink.target = "_blank";

        const pdfIcon = document.createElement("img");
        pdfIcon.src = "../assets/image_placeholders/pdf.png"; 
        pdfIcon.alt = "PDF icon";

        pdfLink.appendChild(pdfIcon); 
        fileType = pdfLink

    }else{

        const pdfLink = document.createElement("a");
        pdfLink.href = fileUrl;
        pdfLink.target = "_blank";

        const pdfIcon = document.createElement("img");
        pdfIcon.src = "../assets/image_placeholders/pdf.png"; 
        pdfIcon.alt = "PDF icon";

        pdfLink.appendChild(pdfIcon); 
        fileType = pdfLink
    
    }

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const title = document.createElement("h6");
    title.classList.add("card-title");
    title.textContent = fileData.Title;

    const text = document.createElement("p");
    text.classList.add("card-text");
    text.textContent = `File: ${fileData.File || 'File not found'}`;

    const uploader = document.createElement("h6");
    uploader.classList.add("card-text");
    uploader.textContent = `Uploaded by: ${fileData.First_Name} ${fileData.Last_Name}`;

    cardBody.appendChild(title);
    cardBody.appendChild(text);
    cardBody.appendChild(uploader);
    card.appendChild(fileType);
    card.appendChild(cardBody);
    
    uploadedImagesContainer.appendChild(card); 

}
