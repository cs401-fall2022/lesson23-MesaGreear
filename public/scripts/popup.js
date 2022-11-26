//Store the popupContainer element once the page is done loading
var popupContainer;
window.addEventListener("DOMContentLoaded", () => {
    popupContainer = document.getElementById("popupContainer");
});

/**
 * Toggles the visibility of the file submission input field on the a post's
 * edit popup.
 */
 function toggleEditImageSubmission() {
    document.getElementById(("postEditImage")).classList.toggle("editImageShow");
}

/**
 * Create a popup used to allow the user to create a new post.
 */
function createNewPostPopup() {
    popupContainer.innerHTML =
    `<div id="unfocused" onclick="deletePopup()"></div>
        
    <section id="popup">
        <h3 id="popupHeading">Create a New Post</h3>

        <form action="/addPost" method="POST" enctype="multipart/form-data">
            <label class="popupAreaLabel" for="postTitle">Title Text</label>
            <input class="popupTextField" name="postTitle" id="postTitle" value="New post title here!" maxlength="100" required="">
            
            <label class="popupAreaLabel" for="postText">Post Text</label>
            <textarea class="popupTextarea" name="postText" id="postText" required="">New post text here!</textarea>
            
            <label class="popupAreaLabel" for="postImage">Image Upload</label>
            <p class="popupDetailText">(Leave empty for no image on you post | Only png, jpg, and gif file formats accepted)</p>
            <input class="imageUpload" name="postImage" id="postImage" type="file" accept=".png, .jpg, ,.gif">
            
            <div id="popupButtonsContainer">
                <button class="popupButtons" id="popupButtonSend" title="Send Post">Send Post</button>

                <!--'type="button"' prevents this button from 'activating' the form-->
                <button class="popupButtons" id="popupButtonCancel" title="Cancel" type="button" onclick="deletePopup()">Cancel</button>
            </div>
        </form>
    </section>`;
    setImageUploadConstraints();
}

/**
 * Create a popup used to allow the user to create a new comment under a
 * specific post.
 * 
 * @param {int} id - Post_id that the new comment will be linked to
 */
function createNewCommentPopup(id) {
    popupContainer.innerHTML = 
    `<div id="unfocused" onclick="deletePopup()"></div>
    
    <section id="popup">
        <h3 id="popupHeading">Comment on Post #${id}</h3>
        
        <form action="/addComment" method="POST">
            <label class="popupAreaLabel" for="commentText">Comment Text</label>
            <textarea class="popupTextarea" name="commentText" id="postCommentText" required="">New comment text here!</textarea>
            
            <input class="hidden" name="commentPost" id="postComment" value="${id}" readonly="">
            
            <div id="popupButtonsContainer">
                <button class="popupButtons" id="popupButtonSend" title="Send Comment">Send Comment</button>
                
                <!--'type="button"' prevents this button from 'activating' the form-->
                <button class="popupButtons" id="popupButtonCancel" title="Cancel" type="button" onclick="deletePopup()">Cancel</button>
            </div>
        </form>
    </section>`;
}

/**
 * Create a popup used to allow the user to edit an existing post.
 * 
 * @param {int} id       - Post_id of the post to edit
 * @param {string} title - Post_title, i.e. the original title text
 * @param {string} text  - Post_txt, i.e. the original post text
 */
function createEditPostPopup(id, title, text) {
    popupContainer.innerHTML = 
    `<div id="unfocused" onclick="deletePopup()"></div>
    
    <section id="popup">
        <h3 id="popupHeading">Edit Post #${id}</h3>
        
        <form action="/editPost" method="POST" enctype="multipart/form-data">
            <label class="popupAreaLabel" for="editTitle">Title Text</label>
            <input class="popupTextField" name="editTitle" id="postEditTitle" value="${title}" maxlength="100" required="">
            
            <label class="popupAreaLabel" for="editText">Post Text</label>
            <textarea class="popupTextarea" name="editText" id="postEditText" required="">${text}</textarea>
            
            <label class="popupAreaLabel" for="editImage">Image Upload</label>
            <p class="popupDetailText">(If checked and no image is given, then previous image will be deleted | Only png, jpg, and gif file formats accepted)</p>
            <label for="editImageCheck">Change image?</label>
            <input class="editImageCheck" name="editImageCheck" id="postEditImageCheck" type="checkbox" onclick="toggleEditImageSubmission()">
            <input class="imageUpload hidden" name="editImage" id="postEditImage" type="file" accept=".png, .jpg, ,.gif">
            
            <input class="hidden" name="editPost" id="postEdit" value="${id}" readonly="">
            
            <div id="popupButtonsContainer">
                <button class="popupButtons" id="popupButtonSend" title="Send Edit">Send Edit</button>
                
                <!--'type="button"' prevents this button from 'activating' the form-->
                <button class="popupButtons" id="popupButtonCancel" title="Cancel" type="button" onclick="deletePopup()">Cancel</button>
            </div>
        </form>
    </section>`;
    setImageUploadConstraints();
}

/**
 * Create a popup used to allow the user to edit an existing comment.
 * 
 * @param {int} id      - Comment_id of the comment to edit
 * @param {string} text - Comment_txt, i.e. the original comment text
 */
function createEditCommentPopup(id, text) {
    popupContainer.innerHTML = 
    `<div id="unfocused" onclick="deletePopup()"></div>
    
    <section id="popup">
        <h3 id="popupHeading">Edit Comment #${id}</h3>
        
        <form action="/editComment" method="POST">
            <label class="popupAreaLabel" for="editText">Comment Text</label>
            <textarea class="popupTextarea" name="editText" id="comment1editText" required="">${text}</textarea>
            
            <input class="hidden" name="editComment" id="commentEdit" value="${id}" readonly="">
            
            <div id="popupButtonsContainer">
                <button class="popupButtons" id="popupButtonSend" title="Send Edit">Send Edit</button>
                
                <!--'type="button"' prevents this button from 'activating' the form-->
                <button class="popupButtons" id="popupButtonCancel" title="Cancel" type="button" onclick="deletePopup()">Cancel</button>
            </div>
        </form>
    </section>`;
}

/**
 * Create a popup used to confirm if the user actually wants to delete a
 * post or comment.
 * 
 * @param {boolean} post - true if this confirmation is for deleting a
 *                         post, false for deleting a comment
 * @param {int} id       - Post_id or Comment_id of what is being deleted
 */
function deleteConfirmationPopup(post, id) {
    popupContainer.innerHTML = 
    `<div id="unfocused" onclick="deletePopup()"></div>
    
    <!-- Custom styling that stretches the popup and places it in the lower middle of the screen -->
    <section id="popup" style="left: 35vw; top: 40vh; width: 25vw">
        <h3 id="popupHeading">Delete ${post ? "Post" : "Comment"} #${id}?</h3>
        
        <form action="${post ? "/deletePost" : "/deleteComment"}" method="POST">
            <input name="${post ? "deletePost" : "deleteComment"}" id=("${post ? "post" : "comment"}${id}Delete") value=${id} class="hidden" readonly>
            
            <div id="popupButtonsContainer">
                <button class="popupButtons" id="popupButtonSend" title="Delete ${post ? "Post" : "Comment"}">Delete ${post ? "Post" : "Comment"}</button>
                
                <!--'type="button"' prevents this button from 'activating' the form-->
                <button class="popupButtons" id="popupButtonCancel" title="Cancel" type="button" onclick="deletePopup()">Cancel</button>
            </div>
        </form>
    </section>`;
}

/**
 * Set constraints on the file upload field so that users are alerted when
 * they attempt to upload an image that exceeds the max size of 512kB or
 * when they upload a file that is not an accepted file type.
 */
    function setImageUploadConstraints () {
    var element = document.getElementsByClassName("imageUpload")[0];

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
}

/**
 * Delete the currently active popup.
 */
function deletePopup() {
    popupContainer.innerHTML = "";
}