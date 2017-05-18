var connection;
function FamilyMember(familyMember) {
  this.email = familyMember.email;
  this.relation = familyMember.relation;
  this.name = familyMember.name;
  this.age = familyMember.age;
  this.gender = familyMember.gender;
  this.number = familyMember.number;
  this.job = familyMember.job;
  this.certificationID = familyMember.certificationID;
  this.birthday = familyMember.birthday;
  this.description = familyMember.description;
}
exports.FamyliMember = FamilyMember;
exports.setConnection = function(conn) {
  connection = conn;
}

FamilyMember.prototype.save = function(callback) {
  connection.query('insert into familyMember (email, relation, name, age, description, gender, number, job, certification, birthday) values (?, ?, ?, ?, ?);', [this.email, this.relation, this.name, this.age, this.description], 
  function(err, row, fileds) {
    if(err) {
      console.log('insert into familyMember err :', err);
      callback(err);
    }
    console.log('insert into familyMember success');
    callback(null);
  });
}

FamilyMember.update = function(email, familyMember, callback) {
  connection.query('update FamyliMember set relation = ?, name = ?, age = ?, description = ?, gender = ?, number = ?, job = ?, certification = ?, birthday = ? where email = ?;', [familyMember.relation, familyMember.name, familyMember.age, familyMember.description,familyMember.gender, familyMember.number, familyMember.job, familyMember.certification, familyMember.birthday, email],
  function(err, row, fileds) {
    if(err) {
      console.log('update familyMember err:', err);
      callback(err);
    }
    console.log('update familyMember success');
    callback(null);
  });
}

FamilyMember.deleteMember = function(email, familyMember, callback) {
  connection.query('delete FamyliMember where email = ? and relation = ? and name = ?;', [email, familyMember.relation, familyMember.name],
  function(err, row, fileds) {
    if(err) {
      console.log('delete familyMember err:', err);
      callback(err);
    }
    console.log('delete familyMember success');
    callback(null);
  });
}

FamilyMember.getAll = function(email, callback) {
  connection.query('select * from FamilyMember where email = ?;', [email],
  function(err, row, fileds) {
    if(err) {
      console.log('getAll by email err:', err);
      callback(err);
    }
    console.log('getAll by email success');
    callback(null, row);
  });
}