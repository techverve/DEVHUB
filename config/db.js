/*This file is for connecting mongodb */
const mongoose = require('mongoose')
const config = require('config')
const db=config.get('mongoURI') /* to get the value from the JSON file */
//Asynchronous function
/* try catch block to handle error 
ususally used for async await */

const connectDB = async () => {
	try {
		await mongoose.connect(db, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex:true
		});

		console.log('MongoDB Connected...');
	} catch (err) {
		console.error(err.message);
		// Exit process with failure
		process.exit(1);
	}
};
/*exporting out module*/
module.exports = connectDB;