document.addEventListener("DOMContentLoaded", async () => {

    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:5000/view/quiz', {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        if (response.ok) {
            const files = await response.json();
            const uploadedImagesContainer = document.querySelector(`#uploadedImagesContainer`);

            if (files.length > 0) {
                files.forEach(file => {
                    const imageUrl = `http://localhost:5000/${file.File}`;
                    addImageCard(imageUrl, file);
                });
            } else {
                console.log("No files found");
            }
        } else {
            console.error("Error fetching uploaded files");
        }
    } catch (error) {
        console.error("Error:", error);
    }

});

function addImageCard(imageUrl, fileData) {
    const uploadedImagesContainer = document.querySelector(`#uploadedImagesContainer`);

    const card = document.createElement("div");
    card.classList.add("card");

    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = "Uploaded file";

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const title = document.createElement("h6");
    title.classList.add("card-title");
    title.textContent = fileData.Title;

    const text = document.createElement("p");
    text.classList.add("card-text");
    text.textContent = `File: ${fileData.File || 'File not found'}`;

    cardBody.appendChild(title);
    cardBody.appendChild(text);
    card.appendChild(img);
    card.appendChild(cardBody);

    uploadedImagesContainer.appendChild(card);
}
