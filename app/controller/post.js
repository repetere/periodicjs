'use strict';
// https://github.com/silverlaketosoho/sweat/blob/master/repetere/model/workout.js
// https://github.com/silverlaketosoho/sweat/blob/master/repetere/model/media.js
// https://github.com/yawetse/getperiodic/blob/master/webapp/db/schema.js
// https://github.com/getperiodic/app.web-app/blob/master/dist/app/controller/home.js
// https://github.com/getperiodic/app.web-app/blob/master/dist/app/routes/home.js
// https://github.com/silverlaketosoho/sweat/blob/master/repetere/controller/exercise.js
// https://github.com/silverlaketosoho/sweat/blob/master/repetere/controller/application.js
var path = require('path'),
	mongoose,
	Post,
	logger;

var show = function(req,res,next){
	var newPost = new Post({title:"test title",name:"test-title"});

	newPost.save(function(err){
		console.log("trying to create new post");
		if(err){
			logger.error(err);
			res.send(err);
			console.log(err);
		}
		else{
			logger.debug("post id: ",req.params.id);
			logger.debug("showing new post");
			res.render('home/index',{randomdata:'show post'});
		}
	});
};

var index = function(req,res,next){
	console.log('index list');
	Post.find({ title: /title/ }).exec(function(err,posts){
		console.log("model search");
		if(err){
			res.send(err);
		}
		else{
			res.send(posts);
		}
	});
};

var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	Post = mongoose.model('Post');

	return{
		show:show,
		index:index
	};
};

module.exports = controller;