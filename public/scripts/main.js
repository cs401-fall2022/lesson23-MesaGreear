
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
    });;
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
    });;
}