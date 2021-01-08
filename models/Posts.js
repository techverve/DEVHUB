const mongoose=require('mongoose');
const Schema=mongoose.Schema;

/* Schema for posts */
const PostSchema = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref:'users'
    },
    text: {
      type: String,
      required: true
    },
     /*Name of the user */
    name: {
      type: String
    },
    /*Avatar of the user */
    avatar: {
      type: String
    },
    /*Like or unlike his/her post */
    likes: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref:'users' //We can know which like came from which user
        }
      }
    ],
    /*Comments on his/her post */
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId
        },
        /* the comment */
        text: {
          type: String,
          required: true
        },
        name: {
          type: String
        },
        avatar: {
          type: String
        },
        // date of the comment  
        date: {
          type: Date,
          default: Date.now
        }
      }
    ],
    date: {
      type: Date,
      default: Date.now
    }
  });
  
  module.exports = Post = mongoose.model('post', PostSchema);