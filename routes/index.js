var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose()

/**
 * Display the homepage of the website. Renders SQL database information so that it can
 * be displayed in index.pug and creates the SQL database/tables if it does not exist
 * already.
 */
router.get('/', function (req, res, next) {
  //create directory for database if it doesn't exist yet (https://stackoverflow.com/questions/21194934/how-to-create-a-directory-if-it-doesnt-exist-using-node-js)
  var fs = require('fs');
  var dir = './databases';
  if (!fs.existsSync(dir))
      fs.mkdirSync(dir);
  
  var db = new sqlite3.Database('./databases/db_PostsComments.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      //Query if the table exists if not lets create it on the fly!
      db.all(`SELECT name FROM sqlite_master WHERE type='table' AND (name='posts' OR name='comments')`,
        (err, rows) => {
          //if there are 2 tables, then we're probably all good to go
          if (rows.length === 2) {
            console.log("Table exists!");
            //render and log posts & comments tables
            db.all(` select post_id, post_txt from posts`, (err, posts_rows) => {
              console.log("returning " + posts_rows.length + " records for posts");
              db.all(` select comment_id, comment_txt, post_id from comments`, (err, comments_rows) => {
                console.log("returning " + comments_rows.length + " records for comments");
                res.render('index', { posts_data: posts_rows, comments_data: comments_rows, title: 'Bug Juice Appreciation Blog' });
              });
            });
          }
          //else create the missing table and insert example data
          else {
            console.log("Creating tables and inserting some sample data");

            //create tables for posts and comments
            db.exec(`create table IF NOT EXISTS posts (
                     post_id INTEGER PRIMARY KEY AUTOINCREMENT,
                     post_txt text NOT NULL);

                      insert into posts (post_txt)
                      values ('This is a great blog #ilovebugjuice'),
                             ('Oh my goodness blogging is fun #ilovebugjuice');
                             
                      create table IF NOT EXISTS comments (
                       comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                       comment_txt TEXT NOT NULL,
                       post_id INTEGER NOT NULL,
                       FOREIGN KEY (post_id) REFERENCES posts (post_id));

                      insert into comments (comment_txt, post_id)
                      values ('This is an intelligent, well thought out response', 1),
                             ('I am definitely not too young to be on the internet', 1),
                             ('Please be patient, there are things wrong with my brain', 2);`,
              () => {
                //render new posts & comments tables
                db.all(` select post_id, post_txt from posts`, (err, posts_rows) => {
                  db.all(` select comment_id, comment_txt, post_id from comments`, (err, comments_rows) => {
                    res.render('index', { posts_data: posts_rows, comments_data: comments_rows, title: 'Bug Juice Appreciation Blog'});
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
  var db = new sqlite3.Database('./databases/db_PostsComments.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }

      //'sanitization' by removing instances of alone single quotes
      var text = req.body.post.replace(/'/g, "''");
      console.log("inserting " + text + " into posts");

      db.exec(`insert into posts ( post_txt )
                values ('${text}');`);

      res.redirect('/');
    }
  );
})

/**
 * TODO
 */
router.post('/delete', (req, res, next) => {
  var db = new sqlite3.Database('./databases/mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      // console.log("inserting " + req.body.blog);

      //'sanitization' by not running commands that have single quotes in them
      //check that the text includes the #ilovebugjuice hashtag
      if(req.body.blog.includes("'")){
        console.log("You were trying to do something naughty weren't you?");
      }
      else {
        db.exec(`delete from blog where blog_id='${req.body.blog}';`);       
      }
      res.redirect('/');
    }
  );
})

module.exports = router;
