const express = require('express');

const app = express();
const conn = require('./storageData');
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');

const port = process.env.PORT || 3005;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))

app.use(flash());

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/users/register', (req, res) => {
    res.render('register');
});
app.get('/users/login', (req, res) => {
    res.render('login');
});
app.get('/users/dashboard', (req, res) => {
    res.render('dashboard',{user:"Shankar"});
});

app.post('/users/register', async (req, res) => {
    const { name, email, password, password2 } = req.body;
    console.log({
        name,
        email,
        password,
        password2
    });

let errors = [];
if ( !name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
    }

if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
    }
if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });    
}    
if (errors.length>0) {
    res.render('register', {errors})
      }
   else{
    // form validaton has passed
let hashedPassword = await bcrypt.hash(password, 10);
console.log(hashedPassword);

// const existingUser = await conn.findOne({ where: { email } });
// const existingUser = await conn.where('SELECT * FROM users WHERE email = ?', [email]);
// const existingUser = await conn.create('SELECT name, email, password FROM users WHERE email = ?', [email]);

 const existingUser = await conn.findOne({where: {email}})

if (existingUser.length>0) {
  errors.push({ msg: 'Email already exists' });
  return res.render('register', { errors });
}
else{
conn.create(`INSERT INTO users (name, email, password) VALUES ('${name}', '${email}', '${hashedPassword}')`);
(err, results) => {
    if (err) {
        throw err;
    }   
    console.log(results.rows);
    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/users/login');
}
}
        }
 });

conn.sync({force:false}).then(result =>{
    app.listen(port, ()=>{
        console.log(`Server running on port ${port}`);
    })
}).catch(err=>{
    console.log(err);
}); 
