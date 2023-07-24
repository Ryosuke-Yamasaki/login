const express = require('express');
const app = express();
const passport = require('./auth');
const session = require('express-session');
const flash = require('connect-flash');
const mustacheExpress = require('mustache-express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

app.engine('mst', mustacheExpress());
app.set('view engine', 'mst');
app.set('views', __dirname + '/views');

// ミドルウェア
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(session({
  secret: 'YOUR-SECRET-STRING',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

//暗号化に使うキー
const APP_KEY = 'YOUR_SECRET_KEY';

const authMiddleware = (req, res, next) => {
  if(req.isAuthenticated()) { // ログインしてるかチェック

    next();

  } else {

    res.redirect(302, '/login');

  }
};

// ログインフォーム
app.get('/login', (req, res) => {
    const errorMessage = req.flash('error').join('<br>');
    res.render('login/form', {
      errorMessage: errorMessage
    });
});
  
// ログイン実行
app.post('/login',
    passport.authenticate('local', {
      successRedirect: '/user',
      failureRedirect: '/login',
      failureFlash: true,
      badRequestMessage: '「メールアドレス」と「パスワード」は必須入力です。'
    })
);
  
// ログイン成功後のページ
app.get('/user', authMiddleware, (req, res) => {
    const user = req.user;
    res.send('ログイン完了！');
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

// 3000番ポートで待機
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`${PORT}番のポートで待機中です...`);
});
