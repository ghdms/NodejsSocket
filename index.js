const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use('/script', express.static(__dirname + '/script'));

let connection_count = 0;
io.on('connection', socket => {
  connection_count++;
  console.log('a user connected', connection_count);
  io.emit('connection', {connection_count, socket_id: socket.id});

  socket.on('chat message', data => {
    console.log('message:', data);
    io.emit('chat message', data);
  });

  socket.on('chat message typing', data => {
    console.log('message typing:', data);
    io.emit('chat message typing', data);
  });

  socket.on('disconnect', data => {
    connection_count--;
    console.log('user disconnected', data, connection_count);
    io.emit('disconnection', {connection_count, socket_id: socket.id});
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
