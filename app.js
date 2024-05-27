var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

//使用sqlite3來操作數據庫，並開啟位置在 db/sqlite.db 的資料庫
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/sqliteHP.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

//建立一個 HousePrice 資料表，包含 id, date, address, price_TenThousand, area, age, floor, layout_BBL 欄位
db.run(`CREATE TABLE IF NOT EXISTS HousePrice (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  address TEXT NOT NULL,
  price_TenThousand INTEGER NOT NULL,
  area REAL NOT NULL,
  age REAL NOT NULL,
  floor INTEGER NOT NULL,
  layout_BBL TEXT NOT NULL
)`);

//撰寫 /api/xxx 路由，使用 SQL 來查詢資料，回傳 json 格式的資料就好
app.get('/api/chiayiHouseInfo', (req, res) => {
    db.all('SELECT * FROM HousePrice', (err, rows) => {
        if (err) {
            console.error(err.message);
        }
        res.json(rows);
    });
});


//撰寫 get /api?address= 路由，使用 SQLite 查詢提供的所有資料
app.get('/api', (req, res) => {
    let address = req.query.address;
    let sql = 'SELECT * FROM HousePrice WHERE address = ?';
    db.all(sql, [address], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.send(rows);
    });
});

//撰寫 post /api 路由，使用 SQLite 查詢提供的所有資料
app.post('/api', (req, res) => {
    let address = req.body.address;
    let sql = 'SELECT * FROM HousePrice WHERE address = ?';
    db.all(sql, [address], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.send(rows);
    });
});


//撰寫post /api/info/insert路由，使用 SQLite 新增一筆資料，回傳文字的訊息，不要 json
app.post('/api/info/insert', (req, res) => {
    let date = req.body.date;
    let address = req.body.address;
    let price_TenThousand = req.body.price_TenThousand;
    let area = req.body.area;
    let age = req.body.age;
    let floor = req.body.floor;
    let layout_BBL = req.body.layout_BBL;
    let sql = 'INSERT INTO HousePrice (date, address, price_TenThousand, area, age, floor, layout_BBL) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.run(sql, [date, address, price_TenThousand, area, age, floor, layout_BBL], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.send('Insert Success');
    });
});



module.exports = app;
