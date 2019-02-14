'use strict';
//required after configuration loaded
const periodic = require('periodicjs');
const ExpressSocketIO = require('express-socket.io-router');
// const socketAuth = require('socketio-auth');

const { server: socketServer, sockets: socketConnections, } = periodic.servers.get('socket.io');
ExpressSocketIO(socketServer);

socketServer.register('test:path', function(req, res, next){
  console.log('request:', req.query, req.socket);
  res.send({
    query: req.query,
  });
  next();
});

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