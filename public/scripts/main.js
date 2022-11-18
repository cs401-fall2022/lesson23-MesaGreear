
/**
 * Upon loading the page, all dates will get translated from their stored UTC
 * time in the database to the local time of the machine running the client
 * side.
 * 
 * https://stackoverflow.com/questions/10830357/javascript-toisostring-ignores-timezone-offset
 */
window.onload = () => {
    Array.from(document.getElementsByClassName("date")).forEach (element => {
        
        var date = new Date(element.innerHTML.replace(' ', 'T').replace('(', '').replace(')', '')); //translate string to date object
        var localOffset = (new Date()).getTimezoneOffset() * 60000 * 2; //offset in milliseconds, * 2 to 'cancel out' compensation caused by line above's constructor
        element.innerHTML = "(" + (new Date(date.getTime() - localOffset)).toISOString().slice(0, -5).replace('T', ' ') + ")";
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