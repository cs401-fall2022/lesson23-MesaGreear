var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose()

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Bug Juice Appreciation Blog' });

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
          if (rows.length === 1) {
            //TODO ========================================================================================
            console.log("Table exists!");
            db.all(` select blog_id, blog_txt from blog`, (err, rows) => {
              console.log("returning " + rows.length + " records");
              res.render('index', { data: rows });
            });
          } else {
            console.log("Creating tables and inserting some sample data");

            //create table for posts
            db.exec(`create table posts (
                     post_id INTEGER PRIMARY KEY AUTOINCREMENT,
                     post_txt text NOT NULL);

                      insert into posts (post_txt)
                      values ('This is a great blog #ilovebugjuice'),
                             ('Oh my goodness blogging is fun #ilovebugjuice');`,
              () => {
                db.all(` select post_id, post_txt from posts`, (err, rows) => {
                  res.render('index', { posts_data: rows });
                });
              });

              console.log("BRUHRBRBUURBURBBURUBRUHRUBRU");

              //create table for comments
              db.exec(`create table comments (
                       comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                       comment_txt TEXT NOT NULL,
                       post_id INTEGER NOT NULL,
                       FOREIGN KEY (post_id) REFERENCES posts (post_id));

                      insert into comments (comment_txt, post_id)
                      values ('This is an intelligent response', 1),
                             ('Goobers and the likes', 1),
                             ('Please be patient, there are things wrong with my brain', 2);`,
              () => {
                db.all(` select comment_id, comment_txt, post_id from comments`, (err, rows) => {
                  res.render('index', { comments_data: rows });
                });
              });

              console.log("IONU FNGSOUDVFNOIUVNHFOSIDUVFHOS");
          }
        });
    });
});

router.post('/add', (req, res, next) => {
  // console.log("Adding blog to table without sanitizing input! YOLO BABY!!");
  var db = new sqlite3.Database('./databases/mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }

      //check that the text includes the #ilovebugjuice hashtag
      if(!req.body.blog.includes("#ilovebugjuice")){
        console.log("You done forgot the '#ilovebugjuice'!");
      }
      else {
        console.log("inserting " + req.body.blog);

        //'sanitization' by removing instances of single quotes
        var text = req.body.blog.replace(/'/g, "[You were trying to do something naughty werent you?]");
        db.exec(`insert into blog ( blog_txt)
                  values ('${text}');`)
      }
      res.redirect('/');
    }
  );
})

router.post('/delete', (req, res, next) => {
  // console.log("deleting stuff without checking if it is valid! SEND IT!");
  var db = new sqlite3.Database('./databases/mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      console.log("inserting " + req.body.blog);

      //'sanitization' by not running commands that have single quotes in them
      //check that the text includes the #ilovebugjuice hashtag
      if(req.body.blog.includes("'")){
        console.log("You were trying to do something naughty werent you?");
      }
      else {
        db.exec(`delete from blog where blog_id='${req.body.blog}';`);       
      }
      res.redirect('/');
    }
  );
})

module.exports = router;
