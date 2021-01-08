const mongoose=require('mongoose')
// Defining the schema
const UserSchema=new mongoose.Schema({
    name:
    {
        type:String,
        required:true
    },
    email:
    {
        type:String,
        required:true,
        unique:true, //Email must be unique
    },
    password:
    {
        type:String,
        required:true,
    },
    avatar:
    {
        type:String
    },
    date:
    {
        type:Date,
        default:Date.now
    }
})

module.exports =User = mongoose.model('user',UserSchema)