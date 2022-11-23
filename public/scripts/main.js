//work to perform once page is finished loading
window.addEventListener("DOMContentLoaded", () => {
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
});