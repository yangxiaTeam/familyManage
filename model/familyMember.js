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
  connection.query('insert into familyMember (email, relation, name, age, description, gender, number, job, certificationID, birthday) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [this.email, this.relation, this.name, this.age, this.description, this.gender, this.number, this.job, this.certificationID, this.birthday], 
  function(err, row, fileds) {
    if(err) {
      console.log('insert into familyMember err :', err);
      callback(err);
    }
    console.log('insert into familyMember success');
    callback(null);
  });
}

FamilyMember.update = function(email, id, familyMember, callback) {
  connection.query('update FamilyMember set relation = ?, name = ?, age = ?, description = ?, gender = ?, number = ?, job = ?, certificationID = ?, birthday = ? where email = ? and id = ?;', [familyMember.relation, familyMember.name, familyMember.age, familyMember.description,familyMember.gender, familyMember.number, familyMember.job, familyMember.certificationID, familyMember.birthday, email, id],
  function(err, row, fileds) {
    if(err) {
      console.log('update familyMember err:', err);
      callback(err);
    }
    console.log('update familyMember success');
    callback(null);
  });
}

FamilyMember.deleteMember = function(email, id, callback) {
  connection.query('delete from FamilyMember where email = ? and id = ?;', [email, id],
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