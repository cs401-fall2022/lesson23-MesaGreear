var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const DBPath = "./data/databases/mainDB.sqlite3";
const uploadsPath = "./public/uploads/";
//For getting datetime in sql format - https://stackoverflow.com/questions/5129624/convert-js-date-time-to-mysql-datetime
const getDateTime = () => {return (new Date().toISOString().slice(0, 19).replace('T', ' '))};

/**
 * Display the homepage of the website. Renders SQL database information so that it can
 * be displayed in index.pug and creates the SQL database/tables if it does not exist
 * already.
 */
router.get('/', function (req, res, next) {
  console.log("");
  var renderables = {title: "Bug Juice Appreciation Blog", posts_data: [], comments_data: []};

  //(https://stackoverflow.com/questions/21194934/how-to-create-a-directory-if-it-doesnt-exist-using-node-js)
  var fs = require('fs');
  var dir = './data'; //check that data folder exists
  if (!fs.existsSync(dir))
      fs.mkdirSync(dir);
  var dir = './data/databases'; //check that databases folder exists
  if (!fs.existsSync(dir))
      fs.mkdirSync(dir);
  var dir = './public/uploads'; //check that uploads folder exists
  if (!fs.existsSync(dir))
      fs.mkdirSync(dir);
  
  var db = new sqlite3.Database(DBPath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      //use of foreign keys to CASCADE DELETE comments linked to a deleted post https://stackoverflow.com/questions/5890250/on-delete-cascade-in-sqlite3
      db.all(`PRAGMA foreign_keys = ON;`);
      //Query if the table exists if not lets create it on the fly!
      db.all(`SELECT name FROM sqlite_master WHERE type='table' AND (name='posts' OR name='comments')`,
        (err, rows) => {
          //if there are 2 tables, then we're probably all good to go
          if (rows.length === 2) {
            console.log("Table exists!");
            //render and log posts & comments tables
            db.all(` SELECT post_id, post_title, post_txt, post_image, post_datetime FROM posts`, (err, posts_rows) => {
              console.log("returning " + posts_rows.length + " records for posts");
              db.all(` SELECT comment_id, comment_txt, comment_datetime, post_id FROM comments`, (err, comments_rows) => {
                console.log("returning " + comments_rows.length + " records for comments");

                renderables.posts_data = posts_rows;
                renderables.comments_data = comments_rows;
                res.render('index', renderables);
              });
            });
          }
          //else create the missing table and insert example data
          else {
            console.log("Creating tables and inserting some sample data");

            //create tables for posts and comments
            db.exec(`CREATE TABLE IF NOT EXISTS posts (
                     post_id INTEGER PRIMARY KEY AUTOINCREMENT,
                     post_title TEXT NOT NULL,
                     post_txt TEXT NOT NULL,
                     post_image TEXT,
                     post_datetime DATETIME NOT NULL);

                     INSERT INTO posts (post_title, post_txt, post_datetime)
                     VALUES ('I like this blog!', 'This is a great blog #ilovebugjuice', '2022-11-17 18:07:18'),
                            ('I''m enthusiastic about blogging!', 'Oh my goodness blogging is fun #ilovebugjuice', '2022-11-17 21:45:29');
                             
                     CREATE TABLE IF NOT EXISTS comments (
                       comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                       comment_txt TEXT NOT NULL,
                       comment_datetime DATETIME NOT NULL,
                       post_id INTEGER NOT NULL,
                       FOREIGN KEY (post_id)
                       REFERENCES posts (post_id)
                       ON DELETE CASCADE);  

                     INSERT INTO comments (comment_txt, comment_datetime, post_id)
                     VALUES ('This is an intelligent, well thought out response', '2022-11-17 20:04:34', 1),
                             ('I am definitely not too young to be on the internet', '2022-11-18 03:55:02', 1),
                             ('Please be patient, there are things wrong with my brain', '2022-11-17 23:21:25', 2);`,
              () => {
                //render new posts & comments tables
                db.all(` SELECT post_id, post_title, post_txt, post_image, post_datetime FROM posts`, (err, posts_rows) => {
                  db.all(` SELECT comment_id, comment_txt, comment_datetime, post_id FROM comments`, (err, comments_rows) => {

                    renderables.posts_data = posts_rows;
                    renderables.comments_data = comments_rows;
                    res.render('index', renderables);
                  });
                });
              });
          }
        });
    });
});

/**
 * Adds a new post to the posts table. 'Sanitizes' by replacing instances of single quotes with
 * another single quote so that they escape each other out.
 */
router.post('/addPost', (req, res, next) => {
  console.log("");
  var db = new sqlite3.Database(DBPath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }

      //check if the user uploaded an image
      //https://stackoverflow.com/questions/23691194/node-express-file-upload
      var fileName = null;
      if(!req.files){
        console.log("No image uploaded.");
      }
      else{
        //check if uploaded file is a valid image (.png, .jpg, .gif)
        fileName = req.files.postImage.name;
        var fileType = fileName.slice(fileName.length - 3, fileName.length);
        if(fileType == "png" || fileType == "jpg" || fileType == "gif") {

          //account for duplicate names by ending files with '(x)' where x is what number duplicate the file is
          var fs = require('fs');
          var dupes = 0;

          fileName = fileName.substring(0, fileName.lastIndexOf(".")) + "(" + dupes + ")." + fileType;
          while(fs.existsSync(uploadsPath + fileName))
            fileName = fileName.substring(0, fileName.lastIndexOf(".") - 3) + "(" + ++dupes + ")." + fileType;

          //'move' the file into the uploads folder
          req.files.postImage.mv(uploadsPath + fileName, (err) => {
            if(err) {
              console.log("Getting error " + err);
              exit(1);
            }
          });
          console.log("Image '" + fileName + "' uploaded.");
        }
        else{
          console.log("File '" + fileName + "' is invalid file type '" + fileType + "'");
          fileName = null;
        }
      }

      //'sanitization' by removing instances of alone single quotes
      var title = req.body.postTitle.replace(/'/g, "''");
      var text = req.body.postText.replace(/'/g, "''");
      console.log("inserting new post \"" + title + "\": \"" + text + "\" into posts");

      if(fileName)
        db.exec(`INSERT INTO posts ( post_title, post_txt, post_image, post_datetime )
                VALUES ( '${title}', '${text}', '${fileName}', '${getDateTime()}');`);
      else
        db.exec(`INSERT INTO posts ( post_title, post_txt, post_datetime )
                VALUES ( '${title}', '${text}', '${getDateTime()}');`);
      

      res.redirect('/');
    }
  );
})

/**
 * Adds a new comment to the comments table with a post_id matching that of the parent post. 'Sanitizes'
 * by replacing instances of single quotes with another single quote so that they escape each other out.
 */
 router.post('/addComment', (req, res, next) => {
  console.log("");
  var db = new sqlite3.Database(DBPath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }

      // 'sanitization' by removing instances of alone single quotes
      var text = req.body.commentText.replace(/'/g, "''");
      console.log("inserting \"" + text + "\" under post " + req.body.commentPost + " into comments");

      db.exec(`INSERT INTO comments ( comment_txt, comment_datetime, post_id )
                VALUES ('${text}', '${getDateTime()}', ${req.body.commentPost});`);

      res.redirect('/');
    }
  );
})

/**
 * Replaces the post_title, post_txt, & post_datetime of the post this edit request was associated with.
 * 'Sanitizes' by replacing instances of single quotes with another single quote so that they escape
 * each other out.
 */
 router.post('/editPost', (req, res, next) => {
  console.log("");
  var db = new sqlite3.Database(DBPath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }

      //'sanitization' by removing instances of alone single quotes
      var title = req.body.editTitle.replace(/'/g, "''");
      var text = req.body.editText.replace(/'/g, "''");
      console.log("editing post " + req.body.editPost + " to new text \"" + title + "\": \"" + text + "\"");

      db.exec(`UPDATE posts
                SET post_title = '${title}',
                    post_txt = '${text}',
                    post_datetime = '${getDateTime()}'
                WHERE post_id = ${req.body.editPost};`);

      res.redirect('/');
    }
  );
})

/**
 * Replaces the comment_txt & comment_datetime of the comment this edit request was associated with.
 * 'Sanitizes' by replacing instances of single quotes with another single quote so that they escape
 * each other out.
 */
 router.post('/editComment', (req, res, next) => {
  console.log("");
  var db = new sqlite3.Database(DBPath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }

      //'sanitization' by removing instances of alone single quotes
      var text = req.body.editText.replace(/'/g, "''");
      console.log("editing comment " + req.body.editComment + " to new text: \"" + text + "\"");

      db.exec(`UPDATE comments
                SET comment_txt = '${text}',
                    comment_datetime = '${getDateTime()}'
                WHERE comment_id = ${req.body.editComment};`);

      res.redirect('/');
    }
  );
})

/**
 * Deletes the post that this delete request was associated with. Also deletes the image file associated
 * with this post if it has one.
 */
router.post('/deletePost', (req, res, next) => {
  console.log("");
  var db = new sqlite3.Database(DBPath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }

      //log what post is being deleted and the comments that are going with it
      db.all(`SELECT comment_id FROM comments WHERE post_id = ${req.body.deletePost};`, (err, commentIDs) => {
        var log = "Deleting post " + req.body.deletePost;
        if (commentIDs.length > 0) {
          log += " & comment(s) "
          commentIDs.forEach( (commentID) => { //for forEach https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
            log += commentID.comment_id + ", ";
          });
          log = log.slice(0, log.length - 2);
        }
        console.log(log);
      });

      //delete and log the post's image if it has one
      db.all(`SELECT post_image FROM posts WHERE post_id = ${req.body.deletePost};`, (err, image) => {
        if(image[0].post_image){
          var fs = require('fs');
          fs.unlinkSync(uploadsPath + image[0].post_image);
          console.log("Image '" + image[0].post_image + "' deleted");
        }
        else
          console.log("No image deleted");
      });

      db.all(`PRAGMA foreign_keys = ON;`); //use of foreign keys to CASCADE DELETE all comments linked to this post
      db.exec(`DELETE FROM posts WHERE post_id='${req.body.deletePost}';`);       
      res.redirect('/');
    }
  );
})

/**
 * Deletes the comment that this delete request was associated with.
 */
 router.post('/deleteComment', (req, res, next) => {
  console.log("");
  var db = new sqlite3.Database(DBPath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      console.log("Deleting comment " + req.body.deleteComment);

      db.exec(`DELETE FROM comments WHERE comment_id='${req.body.deleteComment}';`);       
      res.redirect('/');
    }
  );
})

module.exports = router;
