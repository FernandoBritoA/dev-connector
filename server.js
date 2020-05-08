const express = require('express');
const connectDB = require('./config/db'); //fn created in db file

const app = express(); //initialize express

//Connect Database
connectDB();

//Init Middleware; get data in req.body
// @ts-ignore
app.use(express.json({ extended: false })); //bodyparser.json()

//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

const PORT = process.env.PORT || 5000; //set port

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
//listen to port, + callback function to message
