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
  this.isReaded = message.isReaded;

}
exports.Message = Message;
exports.setConnection = function(conn) {
  connection = conn;
}

Message.prototype.save = function(callback) {
  connection.query('insert into message (email, content, userName, userId, extra, createDate,updateDate, isReaded) values (?, ?, ?, ?, ?,?,?, ?);', [this.email, this.content, this.userName, this.userId, this.extra,this.createDate,this.updateDate, this.isReaded], 
  function(err, row, fileds) {
    if(err) {
      console.log('insert into messages err :', err);
      callback(err);
    }
    console.log('insert into message success');
    callback(null);
  });
}


Message.update = function(id, content,updateDate, isReaded,callback) {
  connection.query('update message set  content = ? ,updateDate = ?, isReaded = ? where id = ?;', [ content,updateDate,isReaded,id],
  function(err, row, fileds) {
    if(err) {
      console.log('update message err:', err);
      callback(err);
    }
    console.log('update message success :', id);
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
  connection.query('select * from message where email = ? order by updateDate desc;', [email],
  function(err, row, fileds) {
    if(err) {
      console.log('getAll by email err:', err);
      callback(err);
    }
    console.log('getAll by email success');
    callback(null, row);
  });
}

Message.getContentByUserId = function(userId, callback) {
  connection.query('select content from message where userId = ?', [userId],
  function(err, row, fileds) {
    if(err) {
      console.log('select content from mesage err:', err);
      return callback(err);
    }
    console.log('select content from mesage success');
    callback(null, row);
  });
}

Message.getContentByExtraId = function(userId, callback) {
  connection.query('select content from message where extra = ?', [userId],
  function(err, row, fileds) {
    if(err) {
      console.log('getContentByExtraId from message err:', err);
      return callback(err);
    }
    console.log('getContentByExtraId from message success');
    callback(null, row);
  });
}

Message.getNotReaded = function(email, callback) {
  connection.query('select * from message where email = ? and isReaded = ?;', [email, 'false'],
  function(err, rows) {
    if(err) {
      console.log('getNotReaded message err:', err);
      return callback(err);
    }
    console.log('getNotReaded message success');
    callback(err, rows);
  });
}

Message.changeAllToTrue = function(email, callback) {
  connection.query('update message set isReaded = ? where email = ?;', ['true', email],
  function(err) {
    if(err) {
      console.log('changeAllToTrue message err:', err);
      return callback(err);
    }
    console.log('changeAllToTrue message success');
    callback(null);
  });
}