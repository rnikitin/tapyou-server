/// <reference path="typings/app.d.ts" />
/// <reference path="typings/socket.io/socket.io.d.ts" />
/// <reference path="typings/node/node.d.ts" />

var http = require('http');
var httpServer = http.createServer().listen(process.env.PORT || 31337);

var io: SocketManager = require('socket.io').listen(httpServer);

// configure
// due to azure issue disable websocket
io.configure(function () {
    io.set('transports', [
      'flashsocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
    ]);

    io.set('log level', 2);
});

io.sockets.on('connection', function (socket: Socket) {

    socket.emit('connected');

    // joining the room
    socket.on('join', (data: ISubscribeData) =>
    {
        socket['user'] = data;

        console.log('joined: ', data);

        // join user to room
        socket.join(data.channel);
        io.sockets.in(data.channel).emit('user:connected', data.name);
    });

    // event for sent message
    socket.on('message:sent', (message: ISocketMessage) =>
    {
        var user = socket['user'];
        console.log('message: ', message, ' for room: ', user);
        io.sockets.in(socket['user'].channel).emit('message:new', message);
    });

    socket.on('get:users', (room: string, fn) =>
    {
        var users = [];
        io.sockets.in(room).clients().forEach((s) =>
        {
            users.push(s['user'].name);
        });

        console.log('get:users', users);
        // return data
        fn(users);
    });

    // work with disconnect
    socket.on('disconnect', () =>
    {
        var user = socket['user'];
        try {
            io.sockets.in(user.channel).emit('user:disconnected', user.name);
        }
        catch (e) { }
    });
});