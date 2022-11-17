
/**
 * Makes the popup and the unfocused layer appear, essentially opening a
 * popup.
 * 
 * @param {int} id - The post_id of the popup
 */
function openPopup(id) {
    console.log("opening popup for post_" + id);
    document.getElementById("myPopup" + id).classList.add("popupShow");
    document.getElementById("unfocused" + id).classList.add("unfocusedShow");
}

/**
 * Makes the popup and the unfocused layer disappear, essentially closing a
 * popup.
 * 
 * @param {int} id - The post_id of the popup
 */
function closePopup(id) {
    console.log("closing popup for post_" + id);
    document.getElementById("myPopup" + id).classList.remove("popupShow");
    document.getElementById("unfocused" + id).classList.remove("unfocusedShow");
}