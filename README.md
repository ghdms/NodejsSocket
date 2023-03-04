# Node.js 기반의 Socket.io 를 이용한 실시간 채팅 프로그램

## 실행 방법
1. `git clone https://github.com/ghdms/NodejsSocket.git`
2. `npm i`
3. `node index.js`
4. [ngrok sign up](https://dashboard.ngrok.com/get-started/setup)
5. `ngrok config add-authtoken #{token}`
6. `ngrok http 3000 --authtoken #{token}`
7. Forwarding url 로 접속

## 기능
1. 페이지 최하단에서 본인의 nickname(랜덤 생성) 과 현재 접속중인 인원수 확인 가능
2. 새로운 이용자가 들어오거나, 기존 이용자가 나갈 때 해당 이용자의 nickname 으로 connected/disconnected 메시지 전송
3. 내가 전송한 메시지는 오른쪽으로, 다른 이용자가 전송한 메시지는 왼쪽 정렬
4. 페이지 최하단 좌측에 현재 메시지를 타이핑하고 있는 이용자의 nickname 최대 5개 표시
5. 메시지 작성시 enter, cmd + enter 로 전송 가능 / shift + enter, ctrl + enter 로 줄바꿈 가능
6. 타이핑 중인 이용자가 페이지를 나갔을 떄 최하단 좌측 타이핑 중인 이용자 nickname 목록에서 해당 nickname 제거
7. 내가 메시지를 전송할 때만 스크롤 강제 최하단으로 이동
