/*For routing of different pages */
const express=require('express')
const router=express.Router();
const {check,validationResult}=require('express-validator');
const auth=require('../middleware/auth');
const User=require('../../models/User');
const Post=require('../../models/Posts');
const Profile=require('../../models/profile');

/* @route POST api/posts
Description of the route :Create a post 
Access of the route      :Private
(the access of the route can be public or private in private we
    send the token along like for authentication) */
    router.post(
        '/',
        // to check if the user has sent any text if not there is a error
        [auth, [check('text', 'Text is required').not().isEmpty()]],
        async (req, res) => {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
          }
      
          try {
              //to get the user from his user id and select everything except password
            const user = await User.findById(req.user.id).select('-password');
      
            //Creating a newPost object
            const newPost = new Post({
              text: req.body.text,
              name: user.name,
              avatar: user.avatar,
              user: req.user.id
            });
      
            const post = await newPost.save();
      
            res.json(post);
          } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
          }
        }
      );

/* @route  GET/posts
Description of the route :To get all posts 
Access of the route      :Private
(the access of the route can be public or private in private we
    send the token along like for authentication) */
router.get('/',auth,async function(request,response){
    try
    {
        // to sort posts based on the date and the latest one is seen first
        const posts = await Post.find().sort({date: -1});
        response.json(posts);
    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


/* @route  GET/posts
Description of the route :To get post by userid
Access of the route      :Private
(the access of the route can be public or private in private we
    send the token along like for authentication) */
    router.get('/:id',auth,async function(request,response){
        try
        {
            // to sort posts based on the date and the latest one is seen first
            const post = await Post.findById(request.params.id);
            if(!post)
            {
                return response.status(404).json({msg:"Post Not found"});
            }
            response.json(post);
        }
        catch(err)
        {
            console.error(err.message);
            if(err.kind==='ObjectId')
            {
                return response.status(404).json({msg:"Post Not found"});
            }
            res.status(500).send('Server Error');
        }
    })

/* @route  DELETE/posts
Description of the route :To delete a post
Access of the route      :Private
(the access of the route can be public or private in private we
    send the token along like for authentication) */
    router.delete('/:id',auth,async function(request,response){
        try
        {
            // to sort posts based on the date and the latest one is seen first
            const post = await Post.findById(request.params.id);
            //Check if the user deleting the post is the same one as the logged in user
            if(!post)
            {
                return response.status(404).json({msg:"Post Not found"});
            }
            if(post.user.toString() !== request.user.id)
            {
                return response.status(404).json({msg:"User Not authorized"});
            }
            await post.remove();
            response.json({msg:'post removed'});
        }
        catch(err)
        {
            console.error(err.message);
            if(err.kind==='ObjectId')
            {
                return response.status(404).json({msg:"Post Not found"});
            }
            res.status(500).send('Server Error');
        }
    })

/* @route  PUT/like/:id
Description of the route :Lika a post
Access of the route      :Private
(the access of the route can be public or private in private we
    send the token along like for authentication) */
router.put('/like/:id',auth,async function(request,response){
    try 
    {
        const post=await Post.findById(request.params.id);
        //Check if the post has already been liked by the user
        //Here like is a array so we filter the array and grab the likes done by the user if its >0 then the user has already likesd so we return an error
        if(post.likes.filter(like => like.user.toString()===request.user.id).length>0)
        {
            return response.status(400).json({msg:'Post already liked'});
        }
        //If the user hasnt liked then we add the like
        post.likes.unshift({user:request.user.id});
        await post.save();
        response.json(post.likes);
    }
    catch (err)
    {
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }
})

/* @route  PUT/unlike/:id
Description of the route :Lika a post
Access of the route      :Private
(the access of the route can be public or private in private we
    send the token along like for authentication) */
    router.put('/unlike/:id',auth,async function(request,response){
        try 
        {
            const post=await Post.findById(request.params.id);
            //Check if the post has already been liked by the user
            //Here like is a array so we filter the array and grab the likes done by the user if its == 0 then the user hasnt been liked to remove the like
            if(post.likes.filter(like => like.user.toString()===request.user.id).length == 0)
            {
                return response.status(400).json({msg:'Post is not been liked'});
            }
            //If the user hasnt liked then we add the like
            //To get the remove index 
            //to get the current like to be removed
            const removeIndex=post.likes.map(like=>like.user.toString().indexOf(request.user.id));
            post.likes.splice(removeIndex,1);
            await post.save();
            response.json(post.likes);
        }
        catch (err)
        {
            console.error(err.message);
            res.status(500).send('Server Error'); 
        }
    })

/* @route POST api/posts/comment/:id
Description of the route :ADD A COMMENT on the post
Access of the route      :Private
(the access of the route can be public or private in private we
    send the token along like for authentication) */
    router.post(
        '/comment/:id',
        // to check if the user has sent any text if not there is a error
        [auth, [check('text', 'Text is required').not().isEmpty()]],
        async (req, res) => {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
          }
      
          try {
              //to get the user from his user id and select everything except password
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id)
            //Creating a newPost object
            const newComment = {
              text: req.body.text,
              name: user.name,
              avatar: user.avatar,
              user: req.user.id
            };
            
            //To add the comment in the comment arrat
            post.comments.unshift(newComment);
            await post.save();
      
            res.json(post.comments);
          } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
          }
        }
      );


/* @route DELTE api/posts/comment/:id/:comment_id
Description of the route :Delete a comment 
Access of the route      :Private
(the access of the route can be public or private in private we
    send the token along like for authentication) */

router.delete('/comment/:id/:comment_id',auth,async function(req,res){
    try
    {
        // First get the post in which we have to delete the comment
        const post = await Post.findById(req.params.id)
        //Get the comment to be deleted
        const comment=post.comments.find(comment => comment.id === req.params.comment_id);
        //Make sure that the comment exists
        if(!comment)
        {
            return res.status(404).json({msg:"The comment doesnt exist"});
        }
        //The user deleting the comment is the user who made the comment
        if(comment.user.toString()!== req.user.id)
        {
            return res.status(401).json({msg:'User not authorized'});
        }
        //If the user hasnt liked then we add the like
            //To get the remove index 
            //to get the current like to be removed
        const removeIndex=post.comments.map(comment=>comment.user.toString().indexOf(req.user.id));
        post.comments.splice(removeIndex,1);
        await post.save();
        res.json(post.comments);
    }
    catch (err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})






module.exports=router;