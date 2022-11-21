//work to perform once page is finished loading
window.onload = () => {
    /**
     * Translate all dates from their stored UTC time in the database to the
     * local time of the machine running the client side.
     * 
     * https://stackoverflow.com/questions/10830357/javascript-toisostring-ignores-timezone-offset
     */
    Array.from(document.getElementsByClassName("date")).forEach (element => {
        
        var date = new Date(element.innerHTML.replace(' ', 'T').replace('(', '').replace(')', '')); //translate string to date object
        var localOffset = (new Date()).getTimezoneOffset() * 60000 * 2; //offset in milliseconds, * 2 to 'cancel out' compensation caused by line above's constructor
        element.innerHTML = "(" + (new Date(date.getTime() - localOffset)).toISOString().slice(0, -5).replace('T', ' ') + ")";
    });

    /**
     * Alerts the user when they attempt to upload a image that exceeds the max
     * size of 512kB or when they upload a file that is not an accepted file type.
     * 
     * https://stackoverflow.com/questions/5697605/limit-the-size-of-a-file-upload-html-input-element
     */
    Array.from(document.getElementsByClassName("imageUpload")).forEach (element => {
        element.onchange = () =>{
            //check valid file size
            if(element.files[0].size > (1024 * 512)){
                alert("Image '" + element.files[0].name + "' exceeds max size of 512kB!");
                element.value = "";
                return;
            };

            //check valid file types
            var fileType = element.files[0].name.slice(element.files[0].name.lastIndexOf(".") + 1, element.files[0].name.length);
            if(fileType != "png" && fileType != "jpg" && fileType != "gif"){
                alert("File '" + element.files[0].name + "' is invalid file type '" + fileType + "'!\nAcceptable file types are png, jpg, and gif!")
                element.value = "";
                return;
            };
        };
    });
}

/**
 * Makes the popup and the unfocused layer appear, essentially opening a
 * popup. Which popup to open is determined by the given parameters.
 * 
 * @param {int} change - 0 for new, 1 for edit
 * @param {int} type   - 0 for post, 1 for comment
 * @param {int} id     - The post_id/comment_id of the popup
 */
function openPopup(change, type, id) {
    document.getElementById("popup" + change + "_" + type + "_" + id).classList.add("popupShow");
    document.getElementById("unfocused" + change + "_" + type + "_" + id).classList.add("unfocusedShow");
    //'deactivate' all decorated buttons by removing their position rule https://stackoverflow.com/questions/3871547/iterating-over-result-of-getelementsbyclassname-using-array-foreach
    Array.from(document.getElementsByClassName("decoratedButton")).forEach (element => {
        element.classList.add("decoratedButtonDeactivate");
    });
}

/**
 * Makes the popup and the unfocused layer disappear, essentially closing a
 * popup. Which popup to close is determined by the given parameters.
 * 
 * @param {int} change - 0 for new, 1 for edit
 * @param {int} type   - 0 for post, 1 for comment
 * @param {int} id     - The post_id/comment_id of the popup
 */
function closePopup(change, type, id) {
    document.getElementById("popup" + change + "_" + type + "_" + id).classList.remove("popupShow");
    document.getElementById("unfocused" + change + "_" + type + "_" + id).classList.remove("unfocusedShow");
    //'activate' all decorated buttons by adding their position: relative rule
    Array.from(document.getElementsByClassName("decoratedButton")).forEach (element => {
        element.classList.remove("decoratedButtonDeactivate");
    });
}

/**
 * Toggles the visibility of the file submission input field on the given post's
 * edit popup.
 * 
 * @param {int} id - post_id of the edit request
 */
function toggleEditImageSubmission(id) {
    document.getElementById(("post" + id + "editImage")).classList.toggle("hidden");
}