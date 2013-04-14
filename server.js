var http = require('http');
var httpServer = http.createServer().listen(process.env.PORT || 31337);
var io = require('socket.io').listen(httpServer);
io.sockets.on('connection', function (socket) {
    socket.on('join', function (data) {
        socket.set('user', data, function () {
        });
        console.log('join: ', data);
        socket.join(data.channel, function () {
        });
        io.sockets.in(data.channel).emit('user:connected', data.name);
    });
    socket.on('message:sent', function (message) {
        socket.get('user', function (err, user) {
            console.log('message: ', message, ' for room: ', user);
            io.sockets.in(user.channel).emit('message:new', message);
        });
    });
    socket.on('get:users', function (room) {
        var users = [];
        io.sockets.clients(room).forEach(function (s) {
            s.get('user', function (err, user) {
                users.push(user.name);
            });
        });
        socket.emit('result:users', users);
    });
    socket.on('disconnect', function () {
        socket.get('user', function (err, user) {
            try  {
                io.sockets.in(user.channel).emit('user:disconnected', user.name);
            } catch (e) {
            }
        });
    });
});
