var connection;
function FriendMember(friendMember) {
  this.email = friendMember.email;
  this.relation = friendMember.relation;
  this.name = friendMember.name;
  this.age = friendMember.age;
  this.gender = friendMember.gender;
  this.number = friendMember.number;
  this.job = friendMember.job;
  this.certificationID = friendMember.certificationID;
  this.birthday = friendMember.birthday;
  this.description = friendMember.description;
}
exports.FriendMember = FriendMember;
exports.setConnection = function(conn) {
  connection = conn;
}

FriendMember.prototype.save = function(callback) {
  connection.query('insert into friendMember (email, relation, name, age, description, gender, number, job, certificationID, birthday) values (?, ?, ?, ?, ?,?,?,?,?,?);', [this.email, this.relation, this.name, this.age, this.description,this.gender,this.number,this.job,this.certificationID,this.birthday], 
  function(err, row, fileds) {
    if(err) {
      console.log('insert into friendMember err :', err);
      callback(err);
    }
    console.log('insert into friendMember success');
    callback(null);
  });
}

FriendMember.update = function(id, friendMember, callback) {
  connection.query('update FriendMember set relation = ?, name = ?, age = ?, description = ?, gender = ?, number = ?, job = ?, certificationID = ?, birthday = ? where id = ?;', [friendMember.relation, friendMember.name, friendMember.age, friendMember.description,friendMember.gender, friendMember.number, friendMember.job, friendMember.certificationID, friendMember.birthday, id],
  function(err, row, fileds) {
    if(err) {
      console.log('update friendMember err:', err);
      callback(err);
    }
    console.log('update friendMember success');
    callback(null);
  });
}

FriendMember.deleteMember = function(id, callback) {
  connection.query('delete from FriendMember where id = ? ;', [id],
  function(err, row, fileds) {
    if(err) {
      console.log('delete friendMember err:', err);
      callback(err);
    }
    console.log('delete friendMember success');
    callback(null);
  });
}

FriendMember.getAll = function(email, callback) {
  connection.query('select * from FriendMember where email = ?;', [email],
  function(err, row, fileds) {
    if(err) {
      console.log('getAll by email err:', err);
      callback(err);
    }
    console.log('getAll by email success');
    callback(null, row);
  });
}