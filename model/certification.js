/**
 * Created by xiaowei on 16-9-13.
 */

var connection;

/**
 * diary表的属性
 * id, name, email, password, role
 */
function Certification(diary) {
    this.email = diary.email;
    this.src = diary.src;
    this.name = diary.name;
    this.description = diary.description;
    this.deadtime = diary.deadtime;
}

exports.Certification = Certification;
exports.setConnection = function(conn) {
    connection = conn;
}


Certification.prototype.save = function(callback) {
    connection.query('insert into certification(email, src, name, description, deadtime) values(?,?,?,?,?);', [this.email, this.src, this.name, this.description, this.deadtime],
        function(err, row, fields) {
            if(err) {
                console.log('save Certification error ' + err.message);
                return callback(err);
            }
            console.log('save Certification success ');
            callback(null);
        });
}

Certification.getByEmail = function(email, callback) {
  connection.query('select * from certification where email = ?;',[email],
  function(err, rows, fileds) {
    if(err) {
      console.log('certification getByEmail error:' + err);
      return callback(err);
    }
    callback(null, rows);
  });
}

Certification.deleteById = function(id, email, callback) {
  connection.query('delete from certification where id = ? and email = ?;', [id, email],
  function(err, rows, fileds) {
    if(err) {
      console.log('delete certification by id err:' + err);
      return callback(err);
    }
    console.log('rows', rows);
    callback(null,rows);
  });
}


Certification.updateById = function(id, email, name,description,deadtime,callback) {
  console.log('11144444', id, email, name,description,deadtime);
  connection.query('update certification set name = ? , description = ? ,deadtime = ? where id = ? and email = ?;', [name,description,deadtime,id, email],
  function(err, rows, fileds) {
    if(err) {
      console.log('update certification by id err:' + err);
      return callback(err);
    }
    console.log('rows', rows);
    callback(null,rows);
  });
}



// Diary.update = function(id, email, diary, callback){
//     connection.query('update diarytable set title = ?, content = ?, time = ? where id = ? and email = ?;', [diary.title, diary.content, diary.time, id, email],
//     function(err, row, fileds) {
//       if(err) {
//           console.log('update diary error:' + err);
//           callback(err);
//       }
//       console.log('update diary success');
//       callback(null, row);
//     })
// }

// Diary.getByEami = function(email, callback) {
//     connection.query('select * from diarytable where email = "' + email + '"', function(err, rows, fields) {
//         if(err) {
//             console.log('get diary error: ' + err.message);
//             return callback(err);
//         }
//         console.log('get diary success ' );
//         if(rows.length == 0) {
//             callback(null, null);
//         }else{
//             callback(null, rows);
//         }
//     })
// }

// Diary.getById = function(id, email, callback) {
//     connection.query('select * from diarytable where id = ? and email = ?', [id, email], 
//     function(err, row, fileds) {
//       if(err) {
//           console.log('get diary by id error:' + err.message);
//           return callback(err);
//       }
//       console.log('get diary by id success');
//       callback(null,row[0]);
//     });
// }

// Diary.getByEmail = function(email, callback){
//     connection.query('select * from diarytable where email = ?', [email],
//     function(err, rows, fileds) {
//       if(err) {
//           console.log('get diary by emial error:' + err);
//           return callback(err);
//       }
//       console.log('get diary by emial success');
//       callback(null, rows);
//     });
// }

// Diary.deleteDiary = function(id, email, callback) {
//     connection.query('delete from diarytable where id= ? and email = ?', [id, email], function(err, rows, fields) {
//         if(err) return console.log("fail to delete diary whose id = " + id +',error:' + err);
//         console.log("success to delete diary whose id = " + id);
//         callback(null, rows);
//     });
// }
