var connection;
function Interaction(interaction) {
  this.id = interaction.id;
  this.title = interaction.title;
  this.person = interaction.person;
  this.content = interaction.content;
  this.outMoney = interaction.outMoney;
  this.inMoney = interaction.inMoney;
  this.email = interaction.email;
  this.createDate = interaction.createDate;


}
exports.Interaction = Interaction;
exports.setConnection = function(conn) {
  connection = conn;
}

Interaction.prototype.save = function(callback) {
  console.log("this.person",this.person);
  connection.query('insert into interactions (title, content, person, outMoney, inMoney, createDate,email) values (?, ?, ?, ?, ?,?,?);', [this.title, this.content, this.person, this.outMoney, this.inMoney,this.createDate,this.email], 
  function(err, row, fileds) {
    if(err) {
      console.log('insert into interactions err :', err);
      callback(err);
    }
    console.log('insert into interactions success');
    callback(null);
  });
}

Interaction.update = function(id, interaction, callback) {
  connection.query('update interactions set title = ?, content = ?, person = ?, outMoney = ?, inMoney = ?, createDate = ?where id = ?;', [interaction.title, interaction.content,interaction.person, interaction.outMoney,interaction.inMoney, interaction.createDate,id],
  function(err, row, fileds) {
    if(err) {
      console.log('update interactions err:', err);
      callback(err);
    }
    console.log('update interactions success');
    callback(null);
  });
}

Interaction.delete = function(id, callback) {
  connection.query('delete from interactions where id = ?;', [id],
  function(err, row, fileds) {
    if(err) {
      console.log('delete interactions err:', err);
      callback(err);
    }
    console.log('delete interactions success');
    callback(null);
  });
}

Interaction.getAll = function(email, callback) {
  connection.query('select * from interactions where email = ?;', [email],
  function(err, row, fileds) {
    if(err) {
      console.log('getAll by email err:', err);
      callback(err);
    }
    console.log('getAll by email success');
    callback(null, row);
  });
}