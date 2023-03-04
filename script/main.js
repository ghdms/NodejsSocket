// https://socket.io/get-started/chat
// https://story.pxd.co.kr/1620
const socket = io();

const messages = document.getElementById('messages');
const form = document.getElementById('form');

const input = document.getElementById('input');
const typing = document.getElementById('typing');
const membersCount = document.getElementById('members_count');

function now() {
  return moment().format('YY.M.D ddd HH:mm:ss');
}

function appendChildMessage(message, textAlign, fontSize) {
  const item = document.createElement('pre');
  item.textContent = message;
  item.style.textAlign = textAlign;
  item.style.fontSize = fontSize;
  messages.appendChild(item);
}

let nickname;
socket.on('connection', ({connection_count, socket_id}) => {
  if (!nickname) {
    nickname = socket_id;

    const myNickName = document.getElementById('my_nickname');
    myNickName.innerHTML = `My nickname is ${nickname}`;
  }
  membersCount.innerHTML = `${connection_count.toLocaleString()} 명 접속 중`;

  if (nickname === socket_id) {
    return;
  }

  appendChildMessage(`${socket_id} is connected\n${now()}`, 'center', '14px');
});

let typing_ids_set = new Set();
function deleteTypingId(id) {
  typing_ids_set.delete(id);
  if (typing_ids_set.size > 0) {
    typing.innerHTML = `[${Array.from(typing_ids_set).slice(0, 5).join(', ')}] typing ...`;
    typing.style.display = 'block';
  } else {
    typing.innerHTML = '';
    typing.style.display = 'none';
  }
};

socket.on('disconnection', ({connection_count, socket_id}) => {
  membersCount.innerHTML = `${connection_count.toLocaleString()} 명 접속 중`;
  deleteTypingId(socket_id);
  appendChildMessage(`${socket_id} is disconnected\n${now()}`, 'center', '14px');
});

socket.on('chat message typing', ({nickname: senderName, message}) => {
  if (nickname === senderName) {
    return;
  }

  if (!message) {
    return deleteTypingId(senderName);
  }

  if (!typing_ids_set.has(senderName)) {
    typing_ids_set.add(senderName);
  }
  typing.innerHTML = `[${Array.from(typing_ids_set).slice(0, 5).join(', ')}] typing ...`;
  typing.style.display = 'block';
});

socket.on('chat message', ({nickname: senderName, message}) => {
  let textAlign = 'left';
  if (nickname === senderName) {
    textAlign = 'right';
  } else {
    message = `<${senderName}>\n${message}`;
    deleteTypingId(senderName);
  }

  appendChildMessage(message, textAlign, '18px');

  window.scrollTo(0, document.body.scrollHeight);
});

function sendMessage(event) {
  event.preventDefault();
  if (!input.value) {
    return;
  }

  socket.emit('chat message', {
    nickname,
    message: `${input.value}\n${now()}`
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
