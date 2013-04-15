var http = require('http');
var httpServer = http.createServer().listen(process.env.PORT || 31337);
var io = require('socket.io').listen(httpServer);
io.configure(function () {
    io.set('transports', [
        'flashsocket', 
        'htmlfile', 
        'xhr-polling', 
        'jsonp-polling'
    ]);
    io.set('log level', 2);
});
io.sockets.on('connection', function (socket) {
    socket.emit('connected');
    socket.on('join', function (data) {
        socket['user'] = data;
        console.log('joined: ', data);
        socket.join(data.channel);
        io.sockets.in(data.channel).emit('user:connected', data.name);
    });
    socket.on('message:sent', function (message) {
        var user = socket['user'];
        console.log('message: ', message, ' for room: ', user);
        io.sockets.in(socket['user'].channel).emit('message:new', message);
    });
    socket.on('get:users', function (room, fn) {
        var users = [];
        io.sockets.in(room).clients().forEach(function (s) {
            users.push(s['user'].name);
        });
        console.log('get:users', users);
        fn(users);
    });
    socket.on('disconnect', function () {
        var user = socket['user'];
        try  {
            io.sockets.in(user.channel).emit('user:disconnected', user.name);
        } catch (e) {
        }
    });
});
