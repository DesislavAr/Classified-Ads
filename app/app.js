const express = require('express');

const init = (data) => {
    const app = express();

    require('./config').applyTo(app);
    require('./auth').applyTo(app, data);

    app.use(require('connect-flash')());
    app.use((req, res, next) => {
        res.locals.messages = require('express-messages')(req, res);
        next();
    });

    require('./routers')
        .attachTo(app, data);

    const server = require('http').createServer(app);
    const io = require('../static/js/index')(server);
    let numUsers = 0;

    io.on('connection', function(socket) {
        let addedUser = false;

        // when the client emits 'new message', this listens and executes
        socket.on('new message', function(dat) {
            // we tell the client to execute 'new message'
            socket.broadcast.emit('new message', {
                username: socket.username,
                message: dat,
            });
        });

        // when the client emits 'add user', this listens and executes
        socket.on('add user', function(username) {
            if (addedUser) return;

            // we store the username in the socket session for this client
            socket.username = username;
            ++numUsers;
            addedUser = true;
            socket.emit('login', {
                numUsers: numUsers,
            });
            // echo globally (all clients) that a person has connected
            socket.broadcast.emit('user joined', {
                username: socket.username,
                numUsers: numUsers,
            });
        });

        // when the client emits 'typing', we broadcast it to others
        socket.on('typing', function() {
            socket.broadcast.emit('typing', {
                username: socket.username,
            });
        });

        // when the client emits 'stop typing', we broadcast it to others
        socket.on('stop typing', function() {
            socket.broadcast.emit('stop typing', {
                username: socket.username,
            });
        });

        // when the user disconnects.. perform this
        socket.on('disconnect', function() {
            if (addedUser) {
                --numUsers;

                // echo globally that this client has left
                socket.broadcast.emit('user left', {
                    username: socket.username,
                    numUsers: numUsers,
                });
            }
        });
    });

    return Promise.resolve(server);
};

module.exports = {
    init,
};
