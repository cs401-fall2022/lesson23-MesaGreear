
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
}