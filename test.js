var bcrypt = require('bcryptjs');

 // HASH BEFORE COMPARE??

bcrypt.compare("1", "1", function (err, result) {
	
	console.log(result);
	
});