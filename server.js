const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "99847784aA@",
    database: "expense_tracker"
});

db.connect((err) => {
    if (err) throw err;
    console.log("MySQL Connected");
});

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup",(req,res)=>{
    res.render("signup");
});

app.post("/signup",(req,res)=>{

const {name,email,password} = req.body;

const sql = "INSERT INTO users (name,email,password) VALUES (?,?,?)";

db.query(sql,[name,email,password],(err,result)=>{

if(err){
console.log(err);
}

res.redirect("/");

});

});

app.post("/login",(req,res)=>{

const {email,password} = req.body;

const sql = "SELECT * FROM users WHERE email=? AND password=?";

db.query(sql,[email,password],(err,result)=>{

if(result.length > 0){

res.redirect("/dashboard");

}

else{

res.send("Invalid Login");

}

});

});

app.get("/dashboard",(req,res)=>{

const month = req.query.month;

let sql = "SELECT * FROM transactions";

if(month){
sql += " WHERE MONTH(date)=?";
}

db.query(sql,month?[month]:[],(err,results)=>{

let income=0;
let expense=0;
let categories={};

results.forEach(t=>{

let amount=parseFloat(t.amount);

if(t.type==="income"){
income+=amount;
}else{
expense+=amount;

if(categories[t.category]){
categories[t.category]+=amount;
}else{
categories[t.category]=amount;
}

}

});

let balance=income-expense;

let monthlyExpenses = new Array(12).fill(0);

results.forEach(t=>{

let amount=parseFloat(t.amount);

if(t.type==="expense"){

let month = new Date(t.date).getMonth();

monthlyExpenses[month]+=amount;

}

});

res.render("dashboard",{
transactions:results,
income,
expense,
balance,
categories,
monthlyExpenses
});

});

});

app.get("/add",(req,res)=>{
    res.render("add");
});


app.post("/addTransaction",(req,res)=>{

const {type,category,amount,date,description} = req.body;

const sql = `INSERT INTO transactions
(type,category,amount,date,description)
VALUES (?,?,?,?,?)`;

db.query(sql,[type,category,amount,date,description],(err,result)=>{

if(err) throw err;

res.redirect("/dashboard");

});

});

app.get("/edit/:id",(req,res)=>{

const id = req.params.id;

const sql = "SELECT * FROM transactions WHERE id=?";

db.query(sql,[id],(err,result)=>{

if(err) throw err;

res.render("edit",{transaction:result[0]});

});

});

app.post("/update/:id",(req,res)=>{

const id = req.params.id;

const {type,category,amount,date} = req.body;

const sql = `
UPDATE transactions
SET type=?,category=?,amount=?,date=?
WHERE id=?`;

db.query(sql,[type,category,amount,date,id],(err,result)=>{

if(err) throw err;

res.redirect("/dashboard");

});

});

app.get("/delete/:id",(req,res)=>{

const id = req.params.id;

const sql = "DELETE FROM transactions WHERE id=?";

db.query(sql,[id],(err,result)=>{

if(err) throw err;

res.redirect("/dashboard");

});

});

app.listen(3000, () => {
    console.log("Server running on address http://localhost:3000");
});