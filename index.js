const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const moment = require('moment-timezone');
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
    socket.emit('chat message', data);
  });

  socket.on('chat message typing', data => {
    console.log('message typing:', data);
    socket.broadcast.emit('chat message typing', data);
  });

  socket.on('disconnect', data => {
    connection_count--;
    console.log('user disconnected', data, connection_count);
    socket.broadcast.emit('disconnection', {connection_count, socket_id: socket.id});
  });

  const dateFormat = 'YYYY년 M월 D일 (ddd)';
  let date = moment().format(dateFormat);
  setInterval(() => {
    const nowDate = moment().format(dateFormat);
    if (date !== nowDate) {
      date = nowDate;
      socket.emit('chat message', {system: true, message: date});
    }
  }, 1000);
});

http.listen(port, () => {
  console.log(`listening on *:${port}`);
});
