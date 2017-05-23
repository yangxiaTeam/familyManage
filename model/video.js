var connection;
function Video (video) {
  this.src = video.src;
  this.date = video.date;
  this.email = video.email;
  this.title = video.title;
}

exports.Video = Video;
exports.setConnection = function(conn) {
  connection = conn;
}

Video.prototype.save = function(callback) {
  connection.query('insert into video (src, date, email, title) values (?, ?, ?, ?);', [this.src, this.date, this.email, this.title],
  function(err, row, fileds) {
    if(err) {
      console.log('insert into video err:', err);
      return callback(err);
    }
    console.log('insert into video success');
    callback(null);
  });
}

Video.deleteById = function(id, callback) {
  connection.query('delete from video where id = ?;', [id],
  function(err, row, fileds) {
    if(err) {
      console.log('delete from video err:', err);
      return callback(err);
    }
    console.log('delete from video success');
    callback(null);
  });
}

Video.getAll = function(email, callback) {
  connection.query('select * from video where email = ?;',[email],
  function(err, rows) {
    if(err) {
      console.log('getAll from video err:', err);
      return callback(err);
    }
    console.log('getAll from video success');
    callback(err, rows);
  });
}