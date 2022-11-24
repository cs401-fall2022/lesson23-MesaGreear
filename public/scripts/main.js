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

    /**
     * Collapses all comment lists and attatches an expand and collapse
     * function to comment lists when clicked. A bit messy, but this late
     * into the project my brain's a lil fried.
     */
    Array.from(document.getElementsByClassName("commentList")).forEach (element => {

        //function since the exact same code is run when loading the window and when collapsing a list
        /**
         * @param {int} dur how long the animations will take in ms
         */
        var collapseCommentList = (dur) => {
            element.classList.add("collapsed");
            element.setAttribute("title", "Expand Comments");

            //for each list element, set a tiny margin and height
            Array.from(element.children).forEach (li => {
                li.style.setProperty("margin", "3px 0px");
                li.children[0].style.setProperty("height", "8px");

                //for each child in the li div, set display to none
                Array.from(li.children[0].children).forEach (child => {
                    child.style.setProperty("display", "none");
                });

                //animate the margins decreasing on li
                li.animate([{
                    margin: '10px 0px'
                },{
                    margin: '3px 0px'
                }], {
                    duration: dur
                });
            });

            //animate the comment containers shrinking, a bit weirdly done
            element.animate([{
                scale: '1 2'
            },{
                scale: '1 1'
            }], {
                duration: dur
            });
        };

        //on window load, start with all lists collapsed
        collapseCommentList(0);

        //on click, collapse or expand comment list
        element.addEventListener("click", () =>{
            
            //if collapsed, expand comment list
            if(element.classList.contains("collapsed")) {
                element.classList.remove("collapsed");
                element.setAttribute("title", "Collapse Comments");

                //for each list element, set the margin to reasonably big and allow height to auto determine itself
                Array.from(element.children).forEach (li => {
                    li.style.setProperty("margin", "10px 0px");
                    li.children[0].style.setProperty("height", "auto");
    
                    //for each child in the li div, remove the 'display: none'
                    Array.from(li.children[0].children).forEach (child => {
                        child.style.removeProperty("display");

                        //animate the children fading in
                        child.animate([{
                            opacity: 0
                        },{
                            opacity: 1
                        }], {
                            duration: 500
                        });
                    });

                    //animate the comment containers expanding
                    li.children[0].animate([{
                        transition: 'scale(1 0.2)'
                    },{
                        transition: 'scale(1 1)'
                    }], {
                        duration: 500
                    });

                    //animate the margins increasing
                    li.animate([{
                        margin: '3px 0px'
                    },{
                        margin: '10px 0px'
                    }], {
                        duration: 500
                    });
                });

                //animate the comment list increasing in size
                element.animate([{
                    scale: '1 0.2'
                },
                {
                    scale: '1 1'
                }], {
                    duration: 500
                });
            }
            //else collapse the comment list
            else {
                collapseCommentList(200);
            }
        });
    });
});