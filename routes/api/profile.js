/*For routing of different pages */
const express=require('express')
const router=express.Router();
const auth=require('../middleware/auth');
const Profile=require('../../models/profile')
const User=require('../../models/User')
const {check,validationResult}=require('express-validator')
const request=require('request');
const config=require('config');
const axios=require('axios');
const Post=require('../../models/Post')

/* @route GET api/profile/me  .... to get my profile
Description of the route : Get current users profile
Access of the route      :Private
(the access of the route can be public or private in private we
    send the token along like for authentication) */

/* ROUTE TO GET OUR OWN PROFILE */
router.get('/me', auth, async (req, res) => {
    try {
        /* to get the user based on the user id */
      const profile = await Profile.findOne({
        user: req.user.id
      }).populate('user', ['name', 'avatar']);
  
      if (!profile) {
        return res.status(400).json({ msg: 'There is no profile for this user' });
      }
  
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


  /* @route POST api/profile 
Description of the route : Create or update user profile
Access of the route      :Private
(the access of the route can be public or private in private we
    send the token along like for authentication) */
router.post('/',
[
    auth, // Adding in the middlewares to authrize user and check if status and skills arent empty
[
    check('status','Status is required')
        .not()
        .isEmpty(),
    check('skills','Skills is required')
        .not()
        .isEmpty()
]],async function(request,response){
    const errors=validationResult(request);
    if(!errors.isEmpty())
    {
        return response.status(400).json({errors:errors.array()});
    }
    // to get the values from the request body
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin,
      } = request.body;

      // We have to build the profile object
      //Basically we set our profile up
      const profileFields={};
      profileFields.user=request.user.id;
      if(company) profileFields.company=company;
      if(website) profileFields.website=website;
      if(location) profileFields.location=location;
      if(bio) profileFields.bio=bio;
      if(status) profileFields.status=status;
      if(githubusername) profileFields.githubusername=githubusername;

      //since skills is an string we have to convert it to an array
      if(skills){
          //To convert the skills string into array
          //And remove extra space 
          profileFields.skills=skills.split(',').map(skill=>skill.trim());
          console.log(profileFields.skills);
        //   response.send('hello');
      }

      //To build the social object
      profileFields.social={};
      if(youtube) profileFields.social.youtube=youtube;
      if(twitter) profileFields.social.twitter=twitter;
      if(facebook) profileFields.social.facebook=facebook;
      if(linkedin) profileFields.social.linkedin=linkedin;
      if(instagram) profileFields.social.instagram=instagram;

      try {
        // We update the profile if present
        // Using upsert option (creates new doc if no match is found):
        let profile=await Profile.findOne({user:request.user.id});
        if(profile)
        {
            profile=await Profile.findOneAndUpdate({
                user:request.user.id},
                {$set :profileFields},
                {new :true}
        )
        return response.json(profile)
            
    }
    profile=new Profile(profileFields);
    await profile.save();
    response.json(profile);
}
      catch (err) {
        console.error(err.message);
        return response.status(500).send('Server Error');
      }
    }
  );

/* @route GET api/profile 
Description of the route :Get all profiles
Access of the route      :Public 
(the access of the route can be public or private in private we
    send the token along like for authentication) */

router.get('/',async function(request,response){
  try {
    // To get all the profiles with their name and avatar
    const profiles=await Profile.find().populate('user',['name','avatar']);
    response.json(profiles);
  } catch (err) {
    console.error(err.message);
    response.status(500).send('Server Error');
  }
})

/* @route GET api/profile 
Description of the route :Get profile by user id
Access of the route      :Public 
(the access of the route can be public or private in private we
    send the token along like for authentication) */
    router.get('/user/:user_id',async function(request,response){
      try {
        // To get all the profiles with their name and avatar
        const profile=await Profile.findOne({user:request.params.user_id}).populate('user',['name','avatar']);
        // If there is no profile return an error
        if(!profile)
        return response.status(400).json({msg:'There is no profile for the user'})
        response.json(profile);
      } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
          return response.status(400).json({msg:'There is no profile for the user'})
        }
        response.status(500).send('Server Error');
      }
    })

/* @route DELETE api/profile 
Description of the route :Delete profile ,user and posts
Access of the route      :Private
(the access of the route can be public or private in private we
    send the token along like for authentication) */

    router.delete('/',auth,async function(request,response){
      try {
        await Post.deleteMany({ user:req.user.id});
        // to remove the profile
        await Profile.findOneAndRemove({user:request.user.id});
        //To remove user
        await User.findOneAndRemove({_id:request.user.id});
        response.json({msg:'Profile and user both are deleted'});
      } catch (err) {
        console.error(err.message);
        response.status(500).send('Server Error');
      }
    })

/* @route PUT api/profile/experience
Description of the route : Add profile experience 
Access of the route      :Private
(the access of the route can be public or private in private we
    send the token along like for authentication) */

    router.put(
      '/experience',
      [
        auth,
        [ // FOR EXPERIENCE TTILE,COMPANY AND FROM ARE ESSENTIAL
          check('title', 'Title is required').not().isEmpty(),
          check('company', 'Company is required').not().isEmpty(),
          check('from', 'From date is required and needs to be from the past')
            .not()
            .isEmpty()
        ]
      ],
      async (req, res) => {
        const errors = validationResult(req);
        //IF THERE ARE ERRORS DISPLAY THEM
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
    
        const {
          title,
          company,
          location,
          from,
          to,
          current,
          description
        } = req.body;
    
        // CREATING A EXPERIENCE OBJECT 
        const newExp = {
          title,
          company,
          location,
          from,
          to,
          current,
          description
        };
    
        try {
          const profile = await Profile.findOne({ user: req.user.id });
    
          profile.experience.unshift(newExp);
    
          await profile.save();
    
          res.json(profile);
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server Error');
        }
      }
    );

/* @route DELETE api/profile/experience/:exp_id
Description of the route : delete profile experience 
Access of the route      :Private
(the access of the route can be public or private in private we
    send the token along like for authentication) */

    router.delete('/experience/:exp_id',auth,async function(request,response){
      try{
      const profile = await Profile.findOne({ user: request.user.id });
      //to get the index of the experience to be removed
      const removeIndex=profile.experience.map(item => item.id).indexOf(request.params.exp_id);
      profile.experience.splice(removeIndex,1);
      await profile.save();
      response.json(profile);
      }
      catch(err)
      {
        console.error(err.message);
        response.status(500).send('Server Error');
      }
    })
    
// PROFILE EDUCATION

/* @route PUT api/profile/education
Description of the route : Add education
Access of the route      :Private
(the access of the route can be public or private in private we
    send the token along like for authentication) */

    router.put(
      '/education',
      [
        auth,
        [ //school,degree,fieldofstudy,fromdate is essential
          check('school', 'School is required').not().isEmpty(),
          check('degree', 'Degree is required').not().isEmpty(),
          check('fieldofstudy', 'Field of study is required').not().isEmpty(),
          check('from', 'From date is required and needs to be from the past')
            .not()
            .isEmpty()        ]
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
    
        const {
          school,
          degree,
          fieldofstudy,
          from,
          to,
          current,
          description
        } = req.body;
    
        const newEdu = {
          school,
          degree,
          fieldofstudy,
          from,
          to,
          current,
          description
        };
    
        try {
          const profile = await Profile.findOne({ user: req.user.id });
    
          profile.education.unshift(newEdu);
    
          await profile.save();
    
          res.json(profile);
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server Error');
        }
      }
    );
    
    // @route    DELETE api/profile/education/:edu_id
    // @desc     Delete education from profile
    // @access   Private
    
    router.delete('/education/:edu_id', auth, async (req, res) => {
      try {
        const foundProfile = await Profile.findOne({ user: req.user.id });
        foundProfile.education = foundProfile.education.filter(
          (edu) => edu._id.toString() !== req.params.edu_id
        );
        await foundProfile.save();
        return res.status(200).json(foundProfile);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error' });
      }
    });
    
    // @route    GET api/profile/github/:username
    // @desc     Get user repos from Github
    // @access   Public
    // router.get('/github/:username', async (req, res) => {
    //   try {
    //     const options={
    //       uri:'https://api.github.com/users/${request.params.username}/repos?per_page=5&sort=created:asc&client&client_id=${config.get("githubClientId"}&client_secret=${config.get("githubSecret"}',
    //       method:"GET",
    //       headers:{'user-agent':'node.js'}
    //     }
    //   request(options,(error,response,body)=>
    //   {
    //     if(error)console.error(error);
    //     if(response.statusCode !== 200){
    //       res.status(404).json({msg:'No Github profile found'});
    //     }
    //     res.json(JSON.parse(body));
    //   })
    //   } catch (err) {
    //     console.error(err.message);
    //     return res.status(404).json({ msg: 'No Github profile found' });
    //   }
    // });

    // @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get('/github/:username', async (req, res) => {
  try {
    const uri = encodeURI(
      `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
    );
    const headers = {
      'user-agent': 'node.js',
      Authorization: `token ${config.get('githubToken')}`
    };

    const gitHubResponse = await axios.get(uri, { headers });
    return res.json(gitHubResponse.data);
  } catch (err) {
    console.error(err.message);
    return res.status(404).json({ msg: 'No Github profile found' });
  }
});




module.exports=router;