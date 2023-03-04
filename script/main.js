// https://socket.io/get-started/chat
// https://story.pxd.co.kr/1620
const socket = io();

let messages = document.getElementById('messages');
let form = document.getElementById('form');
let input = document.getElementById('input');
let typing = document.getElementById('typing');
typing.attributes.ids = new Set();

let membersCount = document.getElementById('members_count');
let myNickName = document.getElementById('my_nickname');

let nickname;
socket.on('connection', ({connection_count, socket_id}) => {
  if (!nickname) {
    nickname = socket_id;
    myNickName.innerHTML = `My nickname is ${nickname}`;
  }
  membersCount.innerHTML = `${connection_count.toLocaleString()} 명 접속 중`;

  if (nickname === socket_id) {
    return;
  }

  let item = document.createElement('pre');
  item.textContent = `${socket_id} is connected\n${moment().format('YY.M.D ddd HH:mm:ss')}`;
  item.style.textAlign = 'center';
  item.style.fontSize = '14px';
  messages.appendChild(item);
});

function deleteTypingId(id) {
  typing.attributes.ids.delete(id);
  if (typing.attributes.ids.size > 0) {
    typing.innerHTML = `[${Array.from(typing.attributes.ids).slice(0, 5).join(', ')}] typing ...`;
    typing.style.display = 'block';
  } else {
    typing.innerHTML = '';
    typing.style.display = 'none';
  }
};

socket.on('disconnection', ({connection_count, socket_id}) => {
  membersCount.innerHTML = `${connection_count.toLocaleString()} 명 접속 중`;
  deleteTypingId(socket_id);

  let item = document.createElement('pre');
  item.textContent = `${socket_id} is disconnected\n${moment().format('YY.M.D ddd HH:mm:ss')}`;
  item.style.textAlign = 'center';
  item.style.fontSize = '14px';
  messages.appendChild(item);
});

socket.on('chat message typing', ({nickname: senderName, message}) => {
  if (nickname === senderName) {
    return;
  }

  if (!message) {
    return deleteTypingId(senderName);
  }

  if (!typing.attributes.ids.has(senderName)) {
    typing.attributes.ids.add(senderName);
  }
  typing.innerHTML = `[${Array.from(typing.attributes.ids).slice(0, 5).join(', ')}] typing ...`;
  typing.style.display = 'block';
});

socket.on('chat message', ({nickname: senderName, message}) => {
  let item = document.createElement('pre');
  if (nickname === senderName) {
    item.style.textAlign = 'right';
  } else {
    message = `<${senderName}>\n${message}`;
    deleteTypingId(senderName);
  }
  item.textContent = message;
  messages.appendChild(item);

  window.scrollTo(0, document.body.scrollHeight);
});

function sendMessage(event) {
  event.preventDefault();
  if (!input.value) {
    return;
  }

  socket.emit('chat message', {
    nickname,
    message: `${input.value}\n${moment().format('YY.M.D ddd HH:mm:ss')}`
  });
  input.value = '';
};

function inputKeyDown(event) {
  if (event.keyCode !== 13 || event.shiftKey) {
    return;
  }

  if (event.ctrlKey) {
    input.value += "\n";
    return;
  }

  sendMessage(event);
};

form.addEventListener('input', event => {
  event.preventDefault();
  socket.emit('chat message typing', {nickname, message: input.value});
});
