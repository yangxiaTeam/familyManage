var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var connection = require('../model/mysqldb');
var upload = require('../fileupload');
var formidable = require('formidable');  
var crypto = require('crypto');
require('../Util.js');
// req.path中如果是中文, 是urlencode编码, 需要转成utf编码
var urlencode = require('urlencode');
// 用户
var U = require('../model/user'),
    User = U.User;
U.setConnection(connection);
// 日记
var D = require('../model/diary'),
    Diary = D.Diary;
D.setConnection(connection);
// 证件
var cer = require('../model/certification');
  Certification = cer.Certification;
  cer.setConnection(connection);
// 文件
var F = require('../model/file'),
    File = F.File;
F.setConnection(connection);
// 家庭成员信息
var member = require('../model/familyMember');
FamilyMember = member.FamyliMember;
member.setConnection(connection);

function checkLogin(req, res, next) {
    if(!req.session.user) {
        req.flash('error', '未登录');
        return res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next) {
    if(req.session.user) {
        return res.redirect('/home');
    }
    next();
}

function checkRoleManage(req, res, next) {
    console.log("checkRoleManage: " + req.session.user.role);
    var roles = ['manager', 'admin'];
    for(var i=0;i<roles.length;i++) {
        if(req.session.user.role == roles[i])
            return next();
    }
    res.redirect('/home');
}

function checkRoleAdmin(req, res, next) {
    console.log("checkRoleAdmin: " + req.session.user.role)
    if(req.session.user.role == 'admin') {
        return next();
    }
    res.redirect('/home');
}

exports.disconnect = function() {
    connection.end();
}

exports.route = function(app) {
    app.get('/', function(req, res) {
        res.redirect('/login');
    });

    app.get('/login', checkNotLogin)
    app.get('/login', function(req, res) {
        res.render('login', {
            layout: null,
            error: req.flash('error').toString()
        });
    });

    /**
     * 根据输入的邮箱, 从数据库中获取密码, 检测米买是否一致
     */
    app.post('/login', checkNotLogin);
    app.post('/login', function(req, res) {
        var email = req.body.email,
            password = req.body.password;
        if(email == "" || password =="") {
            req.flash('error', "账号密码为空");
            return res.redirect('/login');
        }
        User.get(email, function(err, rows) {
            if(err) {
                req.flash('error', err);
                return res.redirect('/register');
            }
            if(rows == null) {
                req.flash('error', '邮箱未注册');
                return res.redirect('/login');
            }
            var user = rows[0];
            var md5 = crypto.createHash('md5');
            md5password = md5.update(password).digest('hex');
            if(user.password != md5password) {
                req.flash('error', "密码不正确");
                return res.redirect('/login');
            }else{
                req.session.user = user;
                res.redirect('/home');
            }
        })
    });

    app.get('/register', checkNotLogin);
    app.get('/register', function(req, res) {
        res.render('register', {
            layout: null,
            error: req.flash('error').toString()
        });
    });

    /**
     * 根据输入的信息创建新用户, 默认角色为User
     */
    app.post('/register', checkNotLogin);
    app.post('/register', function(req, res) {
        var name = req.body.name,
            email = req.body.email,
            password = req.body.password,
            password_repeat = req.body['password-repeat'];
        if(name == "" || email == "" || password == "" || password_repeat == "") {
            req.flash('error', '信息不完整');
            return res.redirect('/register');
        }
        if(password_repeat != password) {
            req.flash('error', '密码不一致');
            return res.redirect('/register');
        }
        var md5 = crypto.createHash('md5');
        password = md5.update(req.body.password).digest('hex');
        var newUser = new User({
            name: name,
            password: password,
            email: email,
            role: 'admin'
        
        });
        User.get(newUser.email, function(err, rows){
            if(err) {
                req.flash('error', err)
                return res.redirect('/register');
            }
            if(rows) {
                req.flash('error', '邮箱被注册了');
                return res.redirect('/register');
            }

            newUser.save(function(err){
                if(err) {
                    req.flash('error', err);
                    return res.redirect('/register');
                }
                req.session.user = newUser;// 用户信息存如session
                res.redirect('/home');
            });
        });
    });

    app.get('/logout', checkLogin);
    app.get('/logout', function(req, res) {
        req.session.user = null;
        res.redirect('/login');
    })

    app.get('/home', checkLogin);
    app.get('/home', function(req, res) {
        res.render('home', {
            username: req.session.user.name,
            useremail: req.session.user.email,
            userrole: req.session.user.role
        });
    });

    /**
     * TODO
     * 预归档的初始设计是文件夹形式, 后来为了简单使用了表格形式
     * 如果使用文件夹形式, 那么这个文件夹里面如果有多个文件, 其中部分文件已归档,部分文件未归档
     * 那这个文件夹是放在已归档,还是放在预归档,还是都放, 有点麻烦
     *
     * 在url后面有访问的路径, 解析这些路径
     * isdir=0 是文件, 直接发送文件内容给浏览器
     * isdir=1 是文件夹, 返回这个文件夹下的文件和文件夹表格
     * shanchu, 删除文件, 在删除文件以及在数据库中的记录
     * guidang, 将文件的isstored属性由0变成1
     */
    app.get('/yuguidang*', checkLogin);
    app.get('/yuguidang*', checkRoleManage);
    app.get('/yuguidang*', function(req, res) {
        var reqpath = urlencode.decode(req.path);
        var ygd = '/yuguidang';
        var relpath = (reqpath).substring(ygd.length);
        var isdir = req.query.isdir,
            guidang = req.query.guidang,
            shanchu = req.query.shanchu,
            fileid = req.query.fileid;
        if('' == relpath) {
            relpath = '/';
            isdir = 1;
        }
        if(!_.isUndefined(isdir)) {
            isdir = parseInt(isdir);
        }
        if(isdir) {
            File.getUnStored(relpath, function(errmessage, files) {
                if(errmessage) {
                    req.flash('error', errmessage)
                    // 这里如果在回到yuguidang, 那么可能会在这里无限循环
                    return res.redirect('/guidang');
                }
                res.render('yuguidang', {
                    files: files,
                    username: req.session.user.name,
                    useremail: req.session.user.email,
                    userrole: req.session.user.role,
                    error: req.flash('error').toString()
                })
            });
        }else{
            var basename = path.basename(relpath);
            var abspath = File.rootpath + '/' + basename;
            fs.exists(abspath, function(exists) {
                if(exists) {
                    fs.readFile(abspath, function(err, data) {
                        if(err) {
                            req.flash('error', '读取文件出错.');
                            return console.log(err.message);
                        }
                        res.send(data);
                    });
                }else {
                    if(!_.isUndefined(fileid)) {
                        File.deleteFile(fileid, function(errmessage) {
                            if(errmessage) return req.flash('error', errmessage);
                            res.redirect('/yuguidang');
                        });
                    }
                }
            });
        }
        if(!_.isUndefined(guidang)) {
            File.stored(fileid);
            res.redirect('/yuguidang');
        }
        if(!_.isUndefined(shanchu)) {
            File.deleteFile(fileid);
            res.redirect('/yuguidang');
        }
    });

    /**
     * 在url后面有访问的路径, 解析这些路径
     * isdir=0 是文件, 直接发送文件内容给浏览器
     * isdir=1 是文件夹, 返回这个文件夹下的文件和文件夹表格
     * deletefile, 删除文件, 在删除文件以及在数据库中的记录
     */
    app.get('/guidang*', checkLogin);
    app.get('/guidang*', function(req, res) {
        var reqpath = urlencode.decode(req.path);
        var gd = '/guidang';
        var relpath = reqpath.substring(gd.length);
        var isdir = req.query.isdir,
            deletefile = req.query.deletefile,
            fileid = req.query.fileid;
        if('' == relpath) {// 访问文件存储的根目录
            relpath = '/';
            isdir = 1;
        }
        if(!_.isUndefined(isdir)) {
            isdir = parseInt(isdir);
        }

        if(isdir) {
            if(!_.isUndefined(deletefile)) {
                File.deleteFolder(fileid, function(errmessage) {
                    if(errmessage) return req.flash('error', errmessage);
                    res.redirect(path.normalize(reqpath + '/..') + '?isdir=1');
                });

            }else{
                File.getStored(relpath, function(err, files) {
                    if(err) req.flash('error', err);
                    res.render('guidang', {
                        currentpath: relpath,
                        files: files,
                        username: req.session.user.name,
                        useremail: req.session.user.email,
                        userrole: req.session.user.role,
                        error: req.flash('error').toString()
                    });
                })
            }
        }else{
            if(!_.isUndefined(deletefile)) {
                File.deleteFile(fileid, function(errmessage) {
                    if(errmessage) return req.flash('error', errmessage);
                    res.redirect(path.normalize(reqpath + '/..') + '?isdir=1');
                });
            }else{
                /**
                 * 请求发送文件给浏览器,
                 * 如果文件存在就发送过去
                 * 不存在, 则删除数据库中此条文件的记录
                 */
                var basename = path.basename(relpath);
                var abspath = File.rootpath + '/' + basename;
                fs.exists(abspath, function(exists) {
                    if(exists) {
                        fs.readFile(abspath, function(err, data) {
                            if(err) {
                                req.flash('error', '读取文件出错.')
                                return console.log(err.message);
                            }
                            res.send(data);
                        });
                    }else {
                        req.flash("error", relpath + " does not exists!!");
                        if(!_.isUndefined(fileid)) {
                            File.deleteFile(fileid, function(errmessage) {
                                if(errmessage) return req.flash('error', errmessage);
                                res.redirect(path.normalize(reqpath + '/..') + '?isdir=1');
                            });
                        }
                    }
                })
            }
        }
    });

    function createFile(req, relpath, fnmae) {
        var fileid = req.body.fileid,
            filename = req.body.filename,
            filecategory = req.body.filecategory,
            filedocuments = req.body.filedocuments,
            filepages = req.body.filepages,
            responsibleperson = req.body.responsibleperson,
            filetime = req.body.filetime,
            saveperiod = req.body.saveperiod,
            confidentialitype = req.body.confidentialitype;
        if( '' == fileid); // TODO
        if( '' == filename); //
        if( '' == filecategory); //
        if( '' == filedocuments); //
        if( '' == responsibleperson); //
        if( '' == filetime); //
        if( '' == saveperiod); //
        if( '' == confidentialitype); //
        /**
         * 无论输入的文件名是什么,都会改成上传的文件的文件名
         */
        if(req.file.originalname != filename) {
            filename = req.file.originalname;
        }
        var filepath = relpath;
        var file = new File();
        file.createFile({
            id: fileid, name: filename, category: filecategory,
            responsibleperson: responsibleperson, filetime: filetime, path: filepath,
            pages: filepages, documentnum: filedocuments, saveperiod: saveperiod,
            confidentialitype: confidentialitype
        });
        file.save();
        // 当用户上传一个文件后, 先设置isstored=1,7秒后设置为0
        // 这样可以在guidang中看到, 用户就会觉得文件上传成功
        // 否则用户看不到上传的文件,会怀疑是否上传成功
        setTimeout(function() {
            file.store2unstore();
        }, 1000*7);
    }

    function createFolder(req, relpath) {
// console.log('create folder');
        var foldername = req.body.foldername;
        if('' == foldername) {
            // TODO
        }
        var folderpath = relpath;
        var folder = new File();
        folder.createFolder({name: foldername, path: folderpath});
// console.log(folder);
        folder.save();
    }

    /**
     * POST /guidang/?iscreatefolder=1   // 在/目录下创建文件夹
     * POST /guidang/?isuploadfile=1     // 在/目录下上传一个文件
     */
    app.post('/guidang*', checkLogin);
    app.post('/guidang*', upload.single('inputfile'), function(req, res) {
        var reqpath = urlencode.decode(req.path);// 解决路径中出现中文的问题
        var gd = '/guidang';
        var relpath = reqpath.substring(gd.length);
        var iscreatefolder = req.query.iscreatefolder,
            isuploadfile = req.query.isuploadfile;
        if(!_.isUndefined(iscreatefolder)) {
            iscreatefolder = parseInt(iscreatefolder);
            if(iscreatefolder) {
                createFolder(req, relpath);
            }
        }

        if(!_.isUndefined(isuploadfile)) {
            isuploadfile = parseInt(isuploadfile);
            if(isuploadfile) {
                createFile(req, relpath);
            }
        }
        res.redirect(reqpath + '?isdir=1');
    });

    /**
     * 返回用户列表
     */
    app.get('/yonghu', checkLogin);
    app.get('/yonghu', checkRoleAdmin);
    app.get('/yonghu', function(req, res) {
        var deleteuser = req.query.deleteuser,
            userid = req.query.userid;
        if(_.isUndefined(userid)) {
            User.getAll(function(err, users) {
                if(err) req.flash('error', err);
                res.render('users', {
                    users: users,
                    username: req.session.user.name,
                    useremail: req.session.user.email,
                    userrole: req.session.user.role
                })
            });
            return;
        }
        if(!_.isUndefined(deleteuser)) {
            User.deleteUser(userid);
            res.redirect('/yonghu');
        }
    });

    /**
     * 设置用户权限
     */
    app.post('/yonghu', checkLogin);
    app.post('/yonghu', checkRoleAdmin);
    app.post('/yonghu', function(req, res) {
        var userid = req.body.userid;
        var competence = req.body.competence;
        if('' == userid);// TODO
        if('' == competence);
        // TODO 设置admin为不可修改
        User.moidfyCompetence(userid, competence);
        res.redirect('/yonghu');
    });

    /**
     * 查看借阅列表
     */
    app.get('/jieyue', checkLogin);
    app.get('/jieyue', checkRoleManage);
    app.get('/jieyue', function(req, res) {
        File.getBorrowed(function(err, borrow){
            if(err) req.flash('error', err);
            res.render('jieyue', {
                borrow: borrow,
                username: req.session.user.name,
                useremail: req.session.user.email,
                userrole: req.session.user.role
            })
        });
    });

    // TODO 管理员可以增加一条借阅关系
    app.post('/jieyue', function(req, res){});

    /**
     * TODO 增加针对时间,分类等的高级搜索
     * 返回搜索结果
     */
    app.get('/search', function(req, res) {
        var q = req.query.q;
        File.search(q, function(err, files) {
            if(err) return;
            res.render('search',{
                files: files,
                username: req.session.user.name,
                useremail: req.session.user.email,
                userrole: req.session.user.role
            });
        });
    })

    app.get('/jieyue', checkLogin);
    app.get('/jieyue', checkRoleManage);
    app.get('/personCenter/basicInfo', function(req,res){ 
        var user = JSON.parse(req.session.user.detail || "{}");       
        res.render('personCenterBasicInfo', {
                username: req.session.user.name,
                useremail: req.session.user.email,
                userrole: req.session.user.role,
                user: user,
                mode: 'show',
        });
    })
    app.post('/personCenter/basicInfo', function(req,res){ 
        var body = req.body;
        var email = req.session.user.email;
        var detailObj = {
            gender: body.gender,
            certificationID: body.certificationID,
            birthday: body.birthday,
            height: body.height,
            weight: body.weight,
            age: body.age,
            job: body.job,
            tel: body.tel,
        }
        var user = {
          name: body.username,
          detail: detailObj,
        }
        User.update(email, user, function(err) {
          var sessionUser = req.session.user;
          sessionUser.name = user.name;
          sessionUser.detail = JSON.stringify(user.detail);
          console.log('session.user', req.session.user);
          res.render('personCenterBasicInfo', {
            username: req.session.user.name,
            useremail: req.session.user.email,
            userrole: req.session.user.role,
            user: JSON.parse(req.session.user.detail),
            mode: 'show',
          });
        });
    })
    app.get('/personCenter/basicInfo/edit', function(req,res){ 
        var user = JSON.parse(req.session.user.detail || "{}");
        res.render('personCenterBasicInfo', {
            username: req.session.user.name,
            useremail: req.session.user.email,
            userrole: req.session.user.role,
            user: user,
            mode: 'edit',
        });
    })

    app.get('/personCenter/diary', function(req, res) {
         console.log("1111111111",req);
        var email = req.session.user.email;
       
        Diary.getByEmail(email, function(err, rows) {
          rows = rows ? rows : [];
          res.render('personCenterDiary', {
            diaries: rows,
            username: req.session.user.name,
            useremail: req.session.user.email,
            userrole: req.session.user.role,
          });
        });
    });
    app.get('/personCenter/diary/write', function(req, res){
        res.render('writeDiary', {
            username: req.session.user.name,
            useremail: req.session.user.email,
            userrole: req.session.user.role,
        });
    });
    app.post('/personCenter/diary/write', function(req, res) {
       if(!req.body.id) {
            var diary = new Diary({
            email: req.session.user.email,
            title: req.body.title,
            content: req.body.content,
            time: new Date().Format("yyyy-MM-dd HH:mm:ss"),
        });
        diary.save(function(err) {
            if(err) {
                    req.flash('error', err);
                    return res.redirect('/home');
                }
                res.redirect('/personCenter/diary');
        });
       }
       else {
        var email = req.session.user.email;
        var id = req.body.id;
        var user = {
            title: req.body.title,
            content: req.body.content,
            time: new Date().Format("yyyy-MM-dd HH:mm:ss"),
        }
        Diary.update(id, email, user, function(err, rows) {
         res.redirect('/personCenter/diary');
        });
       }       
    });

    app.get('/personCenter/diary/modify', function(req, res) {
        var id = req.query.id;
        var email = req.session.user.email;
        Diary.getById(id, email, function(err, row) {
          var row = row ? row : {};
          res.render('writeDiary', {
            username: req.session.user.name,
            useremail: req.session.user.email,
            userrole: req.session.user.role,
            title: row.title,
            content: row.content,
            time: row.time,
            id: row.id,
          });
        });
    });

    app.post('/personCenter/diary/deleteDiary', function(req, res) {
      var id = req.body.id;
      console.log('req.body', req.body);
      var email = req.session.user.email;
      Diary.deleteDiary(id, email, function(err, row) {
        if(row.affectedRows == 1) {
            res.send('ok');
        }
      });
    });

    app.get('/personCenter/certification', function(req, res){
        var email = req.session.user.email;
        Certification.getByEmail(email, function(err, rows) {
            res.render('personCenterCertification', {
                username: req.session.user.name,
                useremail: req.session.user.email,
                userrole: req.session.user.role,
                certification: rows,
            });
        });
    });

    app.post('/personCenter/certification/del', function(req, res) {
        var id = req.body.id;
        var email = req.session.user.email;
        console.log('22222', id, email);
        Certification.deleteById(id, email, function(err, rows) {
           res.send('ok');
        });
    });

    //证件上传接口
    app.post('/certification/file-upload',function(req,res){
        //文件处理配置
       var form = new formidable.IncomingForm(); 
       form.encoding = 'utf-8'; //设置编辑  
       form.uploadDir = 'public/files/Certification'; //设置上传目录  
       form.keepExtensions = true; //保留后缀  
       form.maxFieldsSize = 20 * 1024 * 1024;   //文件大小 k  
       var CertificationName;
       var CertificationDesc;
       var CertificationDate;
       var imageUrl;
        //解析上传文件并存储
        form.parse(req,function(err, fields, files){  
            if(err) {  
                res.send(err);  
                return;  
            }  
            CertificationName=fields.name;
            CertificationDesc=fields.desc;
            CertificationDate=fields.time;
            imageUrl=files.certificationfileInput.path;
            imageUrl =imageUrl.substr(6);
            imageUrl.replace("\\","/");

            var certification = new Certification({
               email: req.session.user.email,
               src: imageUrl,
               name: CertificationName,
               description: CertificationDesc,
               deadtime: CertificationDate,
            }); 
            certification.save(function(err) {
               res.send(files);
            });
             
        }); 


    });

    //证件删除

    app.post("/certification/delete",function(req,res){

    Certification.deleteById(req.body.id,req.session.user.email,function(err, row){
        if(!err) {
            var email = req.session.user.email;
            Certification.getByEmail(email, function(err, rows) {
            res.render('personCenterCertification', {
                username: req.session.user.name,
                useremail: req.session.user.email,
                userrole: req.session.user.role,
                certification: rows,
            });
        });
        }
        res.send("failed!");
    }) 


} )

    //证件修改
 app.post("/certification/update",function(req,res){
 Certification.updateById(req.body.id,req.session.user.email,req.body.name,req.body.description,req.body.deadtime,function(err, row){
        if(!err) {
            var email = req.session.user.email;
            Certification.getByEmail(email, function(err, rows) {
            res.render('personCenterCertification', {
                username: req.session.user.name,
                useremail: req.session.user.email,
                userrole: req.session.user.role,
                certification: rows,
            });
        });
         
        }else{
            res.send("failed!");
        }
       
    })
 });

 //家庭信息
 app.get('/familyCenter/familyMemberInfo', function(req, res){
        var email = req.session.user.email;
        FamilyMember.getAll(email, function(rows) {
          console.log('rows', rows);
        });
            res.render('familyMember', {
                username: req.session.user.name,
                useremail: req.session.user.email,
                userrole: req.session.user.role,
            });       
    });   
}