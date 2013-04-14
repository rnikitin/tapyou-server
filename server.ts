/// <reference path="typings/app.d.ts" />
/// <reference path="typings/socket.io/socket.io.d.ts" />
/// <reference path="typings/node/node.d.ts" />

var http = require('http');
var httpServer = http.createServer().listen(process.env.PORT || 31337);

var io: SocketManager = require('socket.io').listen(httpServer);

io.sockets.on('connection', function (socket: Socket) {
    // joining the room
    socket.on('join', (data: ISubscribeData) =>
    {
        socket.set('user', data, () => { });

        console.log('join: ', data);

        // join user to room
        socket.join(data.channel, () => { });
        io.sockets.in(data.channel).emit('user:connected', data.name);
    });

    // 
    socket.on('message:sent', (message: ISocketMessage) =>
    {
        socket.get('user', (err, user: ISubscribeData) =>
        {
            console.log('message: ', message, ' for room: ', user);
            io.sockets.in(user.channel).emit('message:new', message);
        });

    });

    socket.on('get:users', (room: string) =>
    {
        var users = [];
        io.sockets.clients(room).forEach((s) =>
        {
            s.get('user', (err, user: ISubscribeData) =>
            {
                users.push(user.name);
            });
        });

        socket.emit('result:users', users);
    });

    // work with disconnect
    socket.on('disconnect', () =>
    {
        socket.get('user', (err, user: ISubscribeData) =>
        {
            try {
                io.sockets.in(user.channel).emit('user:disconnected', user.name);
            }
            catch (e){ }
        });
    });
});