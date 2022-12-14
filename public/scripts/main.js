//work to perform once page is finished loading
window.addEventListener("DOMContentLoaded", () => {
    console.log("COOKIES: \n" + document.cookie);

    /**
     * Translate all dates from their stored UTC time in the database to the
     * local time of the machine running the client side.
     */
    Array.from(document.getElementsByClassName("date")).forEach (element => {
        var date = new Date(element.innerHTML.replace(' ', 'T').replace('(', '').replace(')', '')); //translate string to date object
        var localOffset = (new Date()).getTimezoneOffset() * 60000 * 2; //offset in milliseconds, * 2 to 'cancel out' compensation caused by line above's constructor
        element.innerHTML = "(" + (new Date(date.getTime() - localOffset)).toISOString().slice(0, -5).replace('T', ' ') + ")";
    });

    /**
     * Collapses all comment lists and attaches an expand and collapse
     * function to comment lists when clicked. Uses cookies to remember
     * if a commentList is expanded or collapsed after reloading the
     * webpage. A bit messy, but this late into the project my brain's
     * a lil fried.
     */
    Array.from(document.getElementsByClassName("commentList")).forEach (element => {
        /**
         * Collapse and animate the collapse of this commentList
         * 
         * @param {int} dur how long the animations will take in ms
         */
        var collapseCommentList = (dur) => {
            element.classList.add("collapsed");
            element.setAttribute("title", "Expand Comments");

            //for each list element, set a tiny margin and height
            Array.from(element.children).forEach (li => {
                li.style.setProperty("margin", "3px 0px");
                li.children[0].style.setProperty("height", "8px");

                li.setAttribute("title", "Expand Comments");
                li.style.setProperty("cursor", "pointer");

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

        /**
         * Expand and animate the expand of this commentList
         * 
         * @param {int} dur how long the animations will take in ms
         */
        var expandCommentList = (dur) => {
            element.classList.remove("collapsed");
            element.setAttribute("title", "Collapse Comments");

            //for each list element, set the margin to reasonably big and allow height to auto determine itself
            Array.from(element.children).forEach (li => {
                li.style.setProperty("margin", "10px 0px");
                li.children[0].style.setProperty("height", "auto");

                li.setAttribute("title", "");
                li.style.setProperty("cursor", "auto");

                //for each child in the li div, remove the 'display: none'
                Array.from(li.children[0].children).forEach (child => {
                    child.style.removeProperty("display");

                    //animate the children fading in
                    child.animate([{
                        opacity: 0
                    },{
                        opacity: 1
                    }], {
                        duration: dur
                    });
                });

                //animate the comment containers expanding
                li.children[0].animate([{
                    transition: 'scale(1 0.2)'
                },{
                    transition: 'scale(1 1)'
                }], {
                    duration: dur
                });

                //animate the margins increasing
                li.animate([{
                    margin: '3px 0px'
                },{
                    margin: '10px 0px'
                }], {
                    duration: dur
                });
            });

            //animate the comment list increasing in size
            element.animate([{
                scale: '1 0.2'
            },
            {
                scale: '1 1'
            }], {
                duration: dur
            });
        };

        //get the cookie for this element
        var cookie = document.cookie.split("; ").find((cookieInfo) => {
            return cookieInfo.includes(element.id + "=");
        });

        //if the cookie does not exist, create a new one that is automatically collapsed
        if(!cookie)
            cookie = document.cookie = element.id + "=collapsed";

        //determine if comment list is collapsed or expanded based on cookie
        if(cookie.includes("collapsed"))
            collapseCommentList(0);
        else
            expandCommentList(0);

        //on click, collapse or expand comment list and set cookie accordingly
        element.addEventListener("click", (event) =>{

            //only execute code if the comment list itself was clicked, not any of it's children
            //OR always if the list is collapsed
            if(event.target === element || element.classList.contains("collapsed")) {
                //if collapsed, expand comment list
                if(element.classList.contains("collapsed")) {
                    expandCommentList(500);
                    document.cookie = element.id + "=expanded";
                }
                //else collapse the comment list
                else {
                    collapseCommentList(200);
                    document.cookie = element.id + "=collapsed";
                }
            };
        });
    });

    /*
    * Scroll to the recorded user position in the page in cookies, if
    * it has been recorded. 1/10 sec wait is to ensure that everything
    * that could effect the scroll height of the webpage is fully loaded
    * and doesn't have odd dimensions.
    */
    setTimeout(() => {
        var cookie = document.cookie.split("; ").find((cookieInfo) => {
            return cookieInfo.includes("scrollPos=");
        });

        //if cookie exists, read the value from it and scroll to that position
        if(cookie) {
            window.scrollTo({
                top: parseInt(cookie.slice(cookie.indexOf("=") + 1)),
                left: 0,
                behavior: 'smooth'
            });
        }
    }, 100);
});

/**
 * Before unloading the page, record the user's position in the
 * page into cookies so that we can scroll back to that position
 * on reload.
 */
window.addEventListener("beforeunload", () => {
    document.cookie = "scrollPos=" + window.scrollY;
});