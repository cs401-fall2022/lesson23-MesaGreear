//Store the popupContainer element once the page is done loading
var popupContainer;
window.onload = () => {
    popupContainer = document.getElementById("popupContainer");
}

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
 * Delete the currently active popup.
 */
function deletePopup() {
    popupContainer.innerHTML = "";
}