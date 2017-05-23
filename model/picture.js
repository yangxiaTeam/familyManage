var connection;
function Picture (picture) {
  this.src = picture.src;
  this.date = picture.date;
  this.email = picture.email;
}

exports.Picture = Picture;
exports.setConnection = function(conn) {
  connection = conn;
}

Picture.prototype.save = function(callback) {
  connection.query('insert into picture (src, date, email) values (?, ?, ?);', [this.src, this.date, this.email],
  function(err, row, fileds) {
    if(err) {
      console.log('insert into picture err:', err);
      return callback(err);
    }
    console.log('insert into picture success');
    callback(null);
  });
}

Picture.deleteById = function(id, callback) {
  connection.query('delete from picture where id = ?;', [id],
  function(err, row, fileds) {
    if(err) {
      console.log('delete from picture err:', err);
      return callback(err);
    }
    console.log('delete from picture success');
    callback(null);
  });
}

Picture.getAll = function(email, callback) {
  connection.query('select * from picture where email = ?;',[email],
  function(err, rows) {
    if(err) {
      console.log('getAll from picture err:', err);
      return callback(err);
    }
    console.log('getAll from picture success');
    callback(err, rows);
  });
}