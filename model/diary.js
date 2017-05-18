/**
 * Created by xiaowei on 16-9-13.
 */

var connection;

/**
 * diary表的属性
 * id, name, email, password, role
 */
function Diary(diary) {
    this.email = diary.email;
    this.content = diary.content;
    this.title = diary.title;
    this.time = diary.time;
}

exports.Diary = Diary;
exports.setConnection = function(conn) {
    connection = conn;
}


Diary.prototype.save = function(callback) {
    var diary = {
        email: this.email,
        content: this.content,
        title: this.title,
        time: this.time,
    };
    console.log('eeeee', diary);
    connection.query('insert into diarytable(email, content, title, time) values(?,?,?,?);', [diary.email, diary.content, diary.title, diary.time],
        function(err, row, fields) {
            if(err) {
                console.log('save diary error ' + err.message);
                return callback(err);
            }
            console.log('save diary success ');
            callback(null);
        });
}

Diary.update = function(id, email, diary, callback){
    connection.query('update diarytable set title = ?, content = ?, time = ? where id = ? and email = ?;', [diary.title, diary.content, diary.time, id, email],
    function(err, row, fileds) {
      if(err) {
          console.log('update diary error:' + err);
          callback(err);
      }
      console.log('update diary success');
      callback(null, row);
    })
}

Diary.getByEami = function(email, callback) {
    connection.query('select * from diarytable where email = "' + email + '"', function(err, rows, fields) {
        if(err) {
            console.log('get diary error: ' + err.message);
            return callback(err);
        }
        console.log('get diary success ' );
        if(rows.length == 0) {
            callback(null, null);
        }else{
            callback(null, rows);
        }
    })
}

Diary.getById = function(id, email, callback) {
    connection.query('select * from diarytable where id = ? and email = ?', [id, email], 
    function(err, row, fileds) {
      if(err) {
          console.log('get diary by id error:' + err.message);
          return callback(err);
      }
      console.log('get diary by id success');
      callback(null,row[0]);
    });
}

Diary.getByEmail = function(email, callback){
    connection.query('select * from diarytable where email = ?', [email],
    function(err, rows, fileds) {
      if(err) {
          console.log('get diary by emial error:' + err);
          return callback(err);
      }
      console.log('get diary by emial success');
      callback(null, rows);
    });
}

Diary.deleteDiary = function(id, email, callback) {
    connection.query('delete from diarytable where id= ? and email = ?', [id, email], function(err, rows, fields) {
        if(err) return console.log("fail to delete diary whose id = " + id +',error:' + err);
        console.log("success to delete diary whose id = " + id);
        callback(null, rows);
    });
}
