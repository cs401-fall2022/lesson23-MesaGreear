var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const DBPath = "./data/databases/mainDB.sqlite3";
const uploadsPath = "./public/uploads/";
const getDateTime = () => {return (new Date().toISOString().slice(0, 19).replace('T', ' '))};

/**
 * Display the homepage of the website. Renders SQL database information so that it can
 * be displayed in index.pug and creates the SQL database/tables if it does not exist
 * already.
 */
router.get('/', function (req, res, next) {
  console.log("");
  var renderables = {title: "Moth Appreciator's Anonymous Blog", posts_data: [], comments_data: []};

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
      //use of foreign keys to CASCADE DELETE comments linked to a deleted post
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

                     ${postsTableExampleData}
                     
                     CREATE TABLE IF NOT EXISTS comments (
                      comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                      comment_txt TEXT NOT NULL,
                      comment_datetime DATETIME NOT NULL,
                      post_id INTEGER NOT NULL,
                      FOREIGN KEY (post_id)
                      REFERENCES posts (post_id)
                      ON DELETE CASCADE);  

                     ${commentsTableExampleData}`,
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
      var fileName = null;
      if(!req.files){
        console.log("No image uploaded.");
      }
      else{

        fileName = req.files.postImage.name;
        var fileType = fileName.slice(fileName.length - 3, fileName.length);

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

      //check if the user requested a change in image
      var fileName = null;
      if(req.body.editImageCheck){

        var fs = require('fs');

        //delete the old image, if it exists, associated with this post
        db.all(`SELECT post_image FROM posts WHERE post_id = ${req.body.editPost};`, (err, image) => {
          try {
            if(image[0].post_image && !image[0].post_image.includes("..")){ //don't delete images that 'go back' outside the uploads folder
              fs.unlinkSync(uploadsPath + image[0].post_image);
              console.log("Image '" + image[0].post_image + "' deleted");
            }
            else {
              console.log("There was no previous image to delete");
            }
          }
          catch(e) {
            console.log("Exception thrown: likely cause is the image associated with this post was deleted prematurely or is just missing");
          }
        });

        //if the file field is not empty, upload the new image
        if(req.files){

          fileName = req.files.editImage.name;
          var fileType = fileName.slice(fileName.length - 3, fileName.length);
  
          //account for duplicate names by ending files with '(x)' where x is what number duplicate the file is
          var dupes = 0;

          fileName = fileName.substring(0, fileName.lastIndexOf(".")) + "(" + dupes + ")." + fileType;
          while(fs.existsSync(uploadsPath + fileName))
            fileName = fileName.substring(0, fileName.lastIndexOf(".") - 3) + "(" + ++dupes + ")." + fileType;

          //'move' the file into the uploads folder
          req.files.editImage.mv(uploadsPath + fileName, (err) => {
            if(err) {
              console.log("Getting error " + err);
              exit(1);
            }
          });
          console.log("Image '" + fileName + "' uploaded.");
          
        }
      }
      else{
        console.log("No change in Image requested");
      }

      //'sanitization' by removing instances of alone single quotes
      var title = req.body.editTitle.replace(/'/g, "''");
      var text = req.body.editText.replace(/'/g, "''");
      console.log("editing post " + req.body.editPost + " to new text \"" + title + "\": \"" + text + "\"");

      //only update the image field if a change in image was requested
      if(req.body.editImageCheck)
        db.exec(`UPDATE posts
                  SET post_title = '${title}',
                      post_txt = '${text}',
                      post_image = ${(fileName ? "'" + fileName + "'" : "NULL") /*Tern Op because setting field to null in SQLite requires special keyword*/},
                      post_datetime = '${getDateTime()}'
                  WHERE post_id = ${req.body.editPost};`);
      else
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
          commentIDs.forEach( (commentID) => {
            log += commentID.comment_id + ", ";
          });
          log = log.slice(0, log.length - 2);
        }
        console.log(log);
      });

      //delete and log the post's image if it has one
        db.all(`SELECT post_image FROM posts WHERE post_id = ${req.body.deletePost};`, (err, image) => {
          try {
            if(image[0].post_image && !image[0].post_image.includes("..")){ //don't delete images that 'go back' outside the uploads folder
              var fs = require('fs');
              fs.unlinkSync(uploadsPath + image[0].post_image);
              console.log("Image '" + image[0].post_image + "' deleted");
            }
            else {
              console.log("No image deleted");
            }
          }
          catch(e) {
            console.log("Exception thrown: likely cause is the image associated with this post was deleted prematurely or is just missing");
          }
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

//Example data to enter into the SQL database if it's empty. Lotsa text so I put it here at the bottom of the file.
const postsTableExampleData = `
INSERT INTO posts (post_title, post_txt, post_image, post_datetime)
  VALUES
  ('Look at this plump lil goober!', 'Last night I was catching moths inside my house and letting them back outside as per usual. Most of the moths I catch are usually fairly small, no bigger than my pinky fingernail. However this dubious little creature was by far one of the largest moths I''ve ever caught. He was at least 5x as large as most other moths and thus was much fuzzier and cuter! Here''s a pic I took of him before I let him back outside where he more than likely instantly flew into one of the many spider webs on my patio.', '../images/example(0).jpg', '2022-11-17 18:07:18'),
  ('How many sweaters should I feed my poodle moth a day?', 'Now I understand that poodle moths require lots of love, attention, and food, but I''m having a hard time keeping up with the food part. My poodle moth is going through 2 - 3, 95% wool sweaters a day and I just can''t keep up financially for much longer. At this rate I''ll have to take out a third mortgage by the end of the year. Am I doing something wrong, is it too much? Should I put her on a diet?', NULL, '2022-11-19 20:45:29'),
  ('Look at this really pretty moth I found!', 'This is such a strange moth, I''ve never seen one so colorful before! Even stranger was that it was out and about during the daytime and seemed to be eating flowers and not articles of clothing. Truly a fascinating specimen.', '../images/example(1).jpg', '2022-11-20 14:19:54');`;

const commentsTableExampleData = `
INSERT INTO comments (comment_txt, comment_datetime, post_id)
  VALUES
  ('That''s nothing, I once found a moth back that was the size of my fist. It was a little scary keeping around such a large insect, but it helped me with my mouse infestation so I kept him around.', '2022-11-18 09:14:02', 1),
  ('Can you post a pic of your moth next time? If I''m able to take a look I might be able to make an accurate diagnosis since I''m a Lepidopterologist. It sounds like your poodle moth is showing signs of depression, so I don''t think you''re fit to care for her.', '2022-11-19 23:38:21', 2),
  ('I am definetly not too young to be on the internet and thus will reply to your post with a well though out and intuitive response that took longer than 15 seconds to think and type out.', '2022-11-20 08:32:53', 1),
  ('I don''t mean to detract from your post, but did you know that moths are fuzzy because it provides as protection from echolocation, making it harder for bats to find and eat them. Also the fuzz on moths is not actually hair, it is instead very fine scales!', '2022-11-20 11:03:47', 1),
  ('You do realize that this is a blog for moths right? And that the picture you have posted is a picture of a butterfly, not a moth? You stupidity baffles me. It is nearly impossible for someone of my intellectual caliber to even comprehend how completely and utterly brain dead someone must be to mix up too vastly different and easily identifiable species of insects. I''m afraid you missed the Ice Age by about 10,000 years you troglodyte!', '2022-11-21 02:29:23', 3);`;