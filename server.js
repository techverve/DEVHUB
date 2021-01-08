const express = require('express')
const connectDB=require('./config/db')
const app=express();
//To connect database
connectDB();
const PORT=process.env.PORT; //Looks for an environment variable PORT when deployed to heroku

/*initializing middleware */
app.use(express.json({extended:false}))

// app.get('/',function(request,response){
//     response.send('API Running')
// })
/* defining routes */
// when the user accesses this uri then we will use this route
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

app.listen(5000,function(){
    console.log("Server started on ${PORT}");
});//Run locally on port 5000
