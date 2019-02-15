'use strict';
//required after configuration loaded
const periodic = require('periodicjs');
const { Router, EventRouter,  } = require('simple-socket-router/bundle/router.cjs.js');
const router = new Router();
// const socketAuth = require('socketio-auth');

// const { server: socketServer, sockets: socketConnections, } = periodic.servers.get('socket.io');
// router.addRoute('/test/users', function(req, res){
//   console.log('got the 2nd test route');
//   res.send('ok');
// });
// socketServer.on('connection', socket => {
//   socket.emit('debug', { status:'another test', });
//   socket.use(EventRouter({ socket, router ,}));
// });

// const AuthRoutes = socketServer.of('/auth');
// socketAuth(AuthRoutes, { //to use globally - socketAuth(socketServer, {
// authenticate: (socket, data, callback) => {
//get credentials sent by the client
// const username = data.username;
// const password = data.password;
  
// db.findUser('User', {username:username}, function(err, user) {
  
//   //inform the callback of auth success/failure
//   if (err || !user) return callback(new Error("User not found"));
//   return callback(null, user.password == password);
// });
// },
// postAuthenticate: (socket, data) => {
// console.log('postauth', { data, });
// const username = data.username;
     
// db.findUser('User', {username:username}, function(err, user) {
//   socket.client.user = user;
// });
// },
// disconnect: (socket) => {
//   console.log(socket.id + ' disconnected');
// },
// timeout:1000,
// });
// AuthRoutes.register('test:path', function(req, res, next){
//   console.log('request:', req.query, req.socket);
//   res.send({
//     query: req.query,
//   });
//   next();
// });

module.exports = {};