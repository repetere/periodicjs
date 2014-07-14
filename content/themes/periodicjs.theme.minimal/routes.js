'use strict';
var path = require('path');

module.exports = function(periodic){
	var themeController = require(path.join(__dirname,'../../../app/controller/theme'))(periodic),
			themeRouter = periodic.express.Router();

	// themeRouter.get('/',function(req,res,next){
	// 	themeController.customLayout({
	// 		req:req,
	// 		res:res,
	// 		next:false,
	// 		viewtype:'theme',
	// 		viewpath:'home/index',
	// 		layoutdata:{
	// 			nav:{
	// 				model:'Category',
	// 				search:{
	// 					query:req.params.cat,sort:'-createdat',limit:1,offset:0
	// 				}
	// 			},
	// 			page:{
	// 				model:'Post',
	// 				search:{
	// 					query:req.params.post,sort:'-createdat',limit:1,offset:0
	// 				}
	// 			}
	// 		}
	// 	});
	// });
	// themeRouter.get('/feature/:cat/:post',function(req,res,next){
	// 	themeController.customLayout({
	// 		req:req,
	// 		res:res,
	// 		next:false,
	// 		viewtype:'theme',
	// 		viewpath:'feature/index',
	// 		pagedata:{
	// 			nav:{
	// 				model:'Category',
	// 				search:{
	// 					query:req.params.cat,sort:'-createdat',limit:1,offset:0
	// 				}
	// 			},
	// 			page:{
	// 				model:'Post',
	// 				search:{
	// 					query:req.params.post,sort:'-createdat',limit:1,offset:0
	// 				}
	// 			}
	// 		}
	// 	});
	// });

	periodic.app.use(themeRouter);
};