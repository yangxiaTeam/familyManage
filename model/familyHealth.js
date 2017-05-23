var connection;
function FamilyHealth(familyHealth) {
  this.email = familyHealth.email;
  this.name = familyHealth.name;
  this.type = familyHealth.type;
  this.people = familyHealth.people;
  this.description = familyHealth.description;
  this.src = familyHealth.src;
}
exports.FamilyHealth = FamilyHealth;
exports.setConnection = function(conn) {
  connection = conn;
}

FamilyHealth.prototype.save = function(callback) {
  connection.query('insert into familyHealth (email, name, type, description, people, src) values (?, ?, ?, ?, ?, ?);', [this.email, this.name, this.type, this.description, this.people, this.src], 
  function(err, row, fileds) {
    if(err) {
      console.log('insert into familyHealth err :', err);
      callback(err);
    }
    console.log('insert into familyHealth success');
    callback(null);
  });
}

FamilyHealth.update = function(email, id, familyHealth, callback) {
  connection.query('update FamilyHealth set name = ?, description = ?, people = ?, src = ? where email = ? and id = ?;', [familyHealth.name, familyHealth.description, familyHealth.people, familyHealth.src,email, id],
  function(err, row, fileds) {
    if(err) {
      console.log('update familyHealth err:', err);
      callback(err);
    }
    console.log('update familyHealth success');
    callback(null);
  });
}

FamilyHealth.deleteById = function (id, callback) {
  connection.query('delete from familyhealth where id = ?;', [id],
  function(err, row) {
    if(err) {
      console.log('delete from FamilyHealth err:', err);
      callback(err);
    }
    console.log('delete from familyHealth success');
    callback(null);
  });
}

FamilyHealth.getByType = function(email, type, callback) {
  connection.query('select * from FamilyHealth where email = ? and type = ?;', [email, type],
  function(err, row, fileds) {
    if(err) {
      console.log(' familyHealth getByType err:', err);
      callback(err);
    }
    console.log(' familyHealth getByType success');
    callback(null, row);
  });
}

FamilyHealth.getByTypeAndPeople = function(email, type, people,callback) {
  connection.query('select * from FamilyHealth where email = ? and type = ? and people = ?;', [email, type, people],
  function(err, row, fileds) {
    if(err) {
      console.log('getByTypeAndPeople err:', err);
      callback(err);
    }
    console.log('getByTypeAndPeople success');
    callback(null, row);
  });
}