var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var connection = require('../config/database');

/* GET home page. */
router.get('/login', function(req, res, next) {
  res.render('passport/login', {title: '登录'});
});

router.get('/register', function(req, res, next) {
  res.render('passport/register', {title: '注册'});
});

router.get('/logout', function(req, res, next){
    // 备注：这里用的 session-file-store 在destroy 方法里，并没有销毁cookie
    // 所以客户端的 cookie 还是存在，导致的问题 --> 退出登陆后，服务端检测到cookie
    // 然后去查找对应的 session 文件，报错
    // session-file-store 本身的bug 
    req.session.destroy(function(err) {
        if(err){
          res.json({code: 300, message: '退出登录失败'});
          return;
        }
        // req.session.loginUser = null;
        //res.clearCookie(identityKey);
        res.redirect('/passport/login');
    });
});

router.post('/ajax_login', function(req, res, next){
  var  name = req.body.name;
  var  pwd = req.body.password;
  // req.assert('name', 'Name is required').notEmpty();
  // req.assert('pwd', 'pwd is required').notEmpty();
  // var errors = req.validationErrors();  

  // if (errors) {
  //   return res.json({code: 300, message: errors});
  // };
  if(name == "") return res.json({code: 300, message: '用户名不能为空'}); 
  if(pwd == "") return res.json({code: 300, message: '密码不能为空'});
  var  selectSQL = "select * from users where uname = '"+name+"'";
  connection.query(selectSQL,function (err,rs) {
      if (err) throw  err;
      if(rs != ""){
        rs.forEach(function(item, index){
          if (item.uname === name && item.upwd === pwd) {
            req.session.regenerate(function(err) {
              if(err){
                return res.json({code: 300, message: '登录失败'});                
              }
              req.session.loginUser = name;
              res.json({code: 200, message: '登录成功'});                           
            });   
          } else {
            res.json({code: 300, message: '账号或密码错误'});       
          }
        });
      } else {
        res.json({code: 300, message: '账号不存在'});  
      }    
  })   
});

router.post('/ajax_register', function(req, res, next){
  var  addSql = 'INSERT INTO users(Id,uname,upwd) VALUES(0,?,?)';
  var  addSqlParams = [req.body.uname, req.body.upwd];
  connection.query(addSql,addSqlParams,function (err, result) {
    res.json({code: 200, message: '成功'});
    res.end(JSON.stringify(result));
  });
});

module.exports = router;
