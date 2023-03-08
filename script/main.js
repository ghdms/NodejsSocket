// https://socket.io/get-started/chat
// https://story.pxd.co.kr/1620
const socket = io();

const input = document.getElementById('input');
const typing = document.getElementById('typing');
const membersCount = document.getElementById('members_count');

function nowDate() {
  return moment().format('YYYY년 M월 D일 (ddd)');
}

function nowTime() {
  return moment().format('HH:mm:ss');
}

function isBottomScroll() {
  return window.outerHeight + window.scrollY >= document.body.scrollHeight;
}

const messages = document.getElementById('messages');
function appendChildMessage(message, from, senderName='') {
  const item = document.createElement('pre');
  item.classList = from;

  let messagesSplited = [];
  const maxLength = parseInt(window.innerWidth / 17);
  message.split("\n").forEach(m => {
    while (m.length >= maxLength) {
      messagesSplited.push(m.substring(0, maxLength));
      m = m.substring(maxLength);
    }
    if (!!m) {
      messagesSplited.push(m);
    }
  });
  item.textContent = messagesSplited.join("\n");

  const maxLineLength = Math.max(...messagesSplited.map(m => m.length));
  const widthMul = from === 'system' ? 10 : 15.5;
  item.style.width = `${maxLineLength * widthMul}px`;

  if (from === 'you') {
    const name = document.createElement('div');
    name.classList = 'sender_name';
    name.innerHTML = senderName;
    messages.appendChild(name);

    item.style.marginTop = 0;
  }

  messages.appendChild(item);

  const time = document.createElement('div');
  time.classList = `time time_${from}`;
  time.innerHTML = nowTime();
  messages.appendChild(time);

  if (from === 'me' || isBottomScroll()) {
    window.scrollTo(0, document.body.scrollHeight);
  }
}

let nickname;
socket.on('connection', ({connection_count, socket_id}) => {
  membersCount.innerHTML = `${connection_count.toLocaleString()} 명 접속 중`;

  if (nickname) {
    return appendChildMessage(`${socket_id} is connected`, 'system');
  }

  nickname = socket_id;

  const myNickName = document.getElementById('my_nickname');
  myNickName.innerHTML = `My nickname is ${nickname}`;

  appendChildMessage(nowDate(), 'system');
});

let typing_ids_set = new Set();
const maxTypingCount = 5;
function deleteTypingId(id) {
  typing_ids_set.delete(id);
  if (typing_ids_set.size > 0) {
    typing.innerHTML = `[${Array.from(typing_ids_set).slice(0, maxTypingCount).join(', ')}] typing ...`;
    typing.style.display = 'block';
  } else {
    typing.innerHTML = '';
    typing.style.display = 'none';
  }
};

socket.on('disconnection', ({connection_count, socket_id}) => {
  membersCount.innerHTML = `${connection_count.toLocaleString()} 명 접속 중`;
  deleteTypingId(socket_id);
  appendChildMessage(`${socket_id} is disconnected`, 'system');
});

socket.on('chat message typing', ({nickname: senderName, message}) => {
  if (!message) {
    return deleteTypingId(senderName);
  }

  if (typing_ids_set.has(senderName)) {
    return;
  }

  typing_ids_set.add(senderName);
  typing.innerHTML = `[${Array.from(typing_ids_set).slice(0, maxTypingCount).join(', ')}] typing ...`;
  typing.style.display = 'block';
});

const form = document.getElementById('form');
form.addEventListener('input', event => {
  event.preventDefault();
  socket.emit('chat message typing', {nickname, message: input.value});
});

socket.on('chat message', ({system, nickname: senderName, message}) => {
  const from = system ? 'system' : (nickname === senderName ? 'me' : 'you');
  if (from === 'you') {
    deleteTypingId(senderName);
  }

  appendChildMessage(message, from, senderName);
});

function sendMessage(event) {
  event.preventDefault();

  const message = input.value;
  if (!message.trim()) {
    return;
  }

  socket.emit('chat message', {nickname, message});
  input.value = '';
};

const enterKeyCode = 13;
function inputKeyDown(event) {
  if (event.keyCode !== enterKeyCode || event.shiftKey) {
    return;
  }

  if (event.ctrlKey) {
    input.value += "\n";
    return;
  }

  sendMessage(event);
};
