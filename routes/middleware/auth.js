/* This file is for verifying outr jwt token  and then make the user logged in */
const jwt=require('jsonwebtoken')
const config=require('config')

module.exports=function(request,response,next){
    //Get the token 
    // from the header 
    const token=request.header('x-auth-token')
    // If the token doesnt exist
    if(!token){
        return response.status(401).json({msg:'No token authorization denied'});
    }

    // Verify the token if there is one
    try{
        //Decodes and checks if its the same token
        const decoded=jwt.verify(token,config.get('jwtSecret'));
        request.user=decoded.user;
        next();
    }
    catch(err){
        response.status(401).json({msg:'Token is not valid'});
    }
}
