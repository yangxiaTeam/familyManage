var connection;
function Message(message) {
  this.id = message.id;
  this.email = message.email;
  this.content = message.content;
  this.userName = message.userName;
  this.userId = message.userId;
  this.extra = message.extra;
  this.createDate = message.createDate;
  this.updateDate = message.updateDate;


}
exports.Message = Message;
exports.setConnection = function(conn) {
  connection = conn;
}

Message.prototype.save = function(callback) {
  connection.query('insert into message (email, content, userName, userId, extra, createDate,updateDate) values (?, ?, ?, ?, ?,?,?);', [this.email, this.content, this.userName, this.userId, this.extra,this.createDate,this.updateDate], 
  function(err, row, fileds) {
    if(err) {
      console.log('insert into messages err :', err);
      callback(err);
    }
    console.log('insert into message success');
    callback(null);
  });
}


Message.update = function(id, content,updateDate, callback) {
  connection.query('update message set  content = ? ,updateDate = ?where id = ?;', [ content,updateDate,id],
  function(err, row, fileds) {
    if(err) {
      console.log('update message err:', err);
      callback(err);
    }
    console.log('update message success');
    callback(null);
  });
}





Message.delete = function(id, callback) {
  connection.query('delete from message where id = ?;', [id],
  function(err, row, fileds) {
    if(err) {
      console.log('delete messages err:', err);
      callback(err);
    }
    console.log('delete messages success');
    callback(null);
  });
}

Message.getAll = function(email, callback) {
  connection.query('select * from message where email = ?;', [email],
  function(err, row, fileds) {
    if(err) {
      console.log('getAll by email err:', err);
      callback(err);
    }
    console.log('getAll by email success');
    callback(null, row);
  });
}