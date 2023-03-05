// https://socket.io/get-started/chat
// https://story.pxd.co.kr/1620
const socket = io();

const input = document.getElementById('input');
const typing = document.getElementById('typing');
const membersCount = document.getElementById('members_count');

function now() {
  return moment().format('YY.M.D ddd HH:mm:ss');
}

function isBottomScroll() {
  return window.outerHeight + window.scrollY >= document.body.scrollHeight;
}

const messages = document.getElementById('messages');
function appendChildMessage(message, from) {
  const item = document.createElement('pre');
  item.textContent = message;

  const maxLineLength = Math.max(...message.split("\n").map(m => m.length));
  if (from === 'me') {
    item.style.background = '#e4e400';
    item.style.border = '1px solid #e4e400';
    item.style.width = `${maxLineLength * 18}px`;
    item.style.marginLeft = 'auto';
  } else if (from === 'you') {
    item.style.background = '#666666';
    item.style.border = '1px solid #666666';
    item.style.color = '#f7f7f7';
    item.style.width = `${maxLineLength * 18}px`;
  } else {
    item.style.fontSize = '14px';
    item.style.textAlign = 'center';
    item.style.width = `${maxLineLength * 14}px`;
    item.style.marginRight = 'auto';
    item.style.marginLeft = 'auto';
  }
  messages.appendChild(item);

  if (from === 'me' || isBottomScroll()) {
    window.scrollTo(0, document.body.scrollHeight);
  }
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

  appendChildMessage(`${socket_id} is connected\n${now()}`, 'system');
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
  appendChildMessage(`${socket_id} is disconnected\n${now()}`, 'system');
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

const form = document.getElementById('form');
form.addEventListener('input', event => {
  event.preventDefault();
  socket.emit('chat message typing', {nickname, message: input.value});
});

socket.on('chat message', ({nickname: senderName, message}) => {
  const isMyMsg = nickname === senderName;
  if (!isMyMsg) {
    message = `<${senderName}>\n${message}`;
    deleteTypingId(senderName);
  }

  appendChildMessage(message, isMyMsg ? 'me' : 'you');
});

function sendMessage(event) {
  event.preventDefault();
  const message = input.value;
  if (!message) {
    return;
  }
  if (!message.replace(/\n|\s/g, '')) {
    return;
  }

  socket.emit('chat message', {
    nickname,
    message: `${message}\n${now()}`
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
