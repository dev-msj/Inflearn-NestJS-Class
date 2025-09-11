# Socket.IO와 Websocket 개념 정리

## Websocket이란?

> Client와 Server 간의 실시간 양방향 통신을 위한 프로토콜이다.

---

## Socket IO란?

> Client와 Server가 Low-Latency(낮은 지연 시간), Bidirectional(양방향 소통), Event-Based(이벤트 기반)으로 통신할 수 있게 Websocket 프로토콜을 기반으로 만들어진 라이브러리다.

## Socket IO 통신 방식

### 기본적인 통신 방법

1. **on** 메서드에서 이벤트를 감지하고자 하는 **Event Name**을 미리 등록한다.
2. **Event Name**과 함께 전달하고자 하는 데이터와 **Callback 함수**를 **emit** 메서드로 이벤트를 발생시켜 전송한다.
   - 의도적으로 Callback 함수를 전달하지 않으므로써 단방향 통신으로 처리되게 할 수도 있다.
3. **on** 메서드를 통해 미리 등록된 **Event Name**으로 이벤트를 감지하고 요청을 처리하여 **Callback 함수**를 활용해 응답한다.
   - Callback을 호출하지 않으면 Event가 완료되지 않고 Pending 상태가 된다.
4. 등록되지 않은 **Event Name**은 *폐기된다*.

### 최초 통신 절차

1. Server가 `io.on("connection", (socket) => {})`을 정의하여 Client와 연결할 수 있도록 한다.
2. Client는 Socket IO 객체를 생성하여 Server와 Socket 통신 연결을 한다.
   - Socket IO 객체를 생성할 때 기본적으로 Server에 **connection**을 Event Name으로 연결 요청을 한다.
   - http 통신에서 응답값과 상관없이 상태 코드가 200이면 통신에 성공한 것으로 인식하는 것처럼, Client는 Server에 connection이 Event Name으로 등록만 되어 있으면 Socket 연결에 성공한 것으로 본다.
3. Server는 `(socket) => {}`의 `{}` 안에 통신을 위한 이벤트들을 등록한다.
4. Client는 생성된 Socket IO 객체를 활용해 통신을 위한 이벤트들을 등록한다.
5. 통신이 필요할 때마다 3, 4에서 등록된 이벤트들을 발생시켜 실시간으로 통신한다.

### 코드 구현 예시

* Server

  ```javascript
  import { Server } from "socket.io"

  const io = Server(3000);

  // Client와의 연결을 위한 "connection" 이벤트 등록
  io.on("connection", (socket) => {
    // 소켓 통신을 위한 이벤트 구현

    // callback 함수를 활용한 양방향 통신 이벤트 발생
    socket.emit('hello', 'world', (response) => {
      console.log(response);
    });

    // 단방향 통신 이벤트 발생
    socket.emit('language', 'javascript');

    // typescript를 event name으로 하는 리스너. callback 함수가 없는 경우
    socket.on('typescript', (message) => {
      console.log(message);
    });

    // nestjs를 event name으로 하는 리스너. callback 함수를 호출하는 경우
    socket.on('nestjs', (message, callback) => {
      console.log(message);

      callback("framework");
    });
  });
  ```

* Client

  ```javascript
  import { io } from "socket.io-client"

  // 객체 생성 시 "connection" event name 자동 호출로 소켓 연결
  const socket = io("ws://localhost:3000");

  // socket 객체를 활용해 서버와 동일한 방법으로 이벤트 구현...
  socket.emit("typescript", "best");

  socket.on("hello", (message, callback) => {
    console.log(message);

    callback("client!");
  });
  ```

---

## Namespace와 Room

### Namespace

> 기능 단위로 Socket 연결을 독립된 통신 채널로 분리하여 관리한다.

- URL 경로처럼 `/`, `/chat`, `/notification`와 같이 구분한다.
- 각 Namespace마다 별도의 이벤트 핸들러를 정의한다.
- Slack의 워크스페이스, 게임의 서버와 같은 개념이다.

### Room

> 같은 Namespace 내에서 Client들을 그룹 단위로 묶어서 관리한다.

- 동적으로 생성/삭제가 가능하다.
- 하나의 Client가 동시에 여러 room에 참여 가능하다.
- Server가 특정 room에 속한 모든 Client에게 메시지 전송이 가능하다.
- Slack의 워크스페이스 안에 있는 채널들, 게임에서의 서버 안의 채널이나 플레이를 위한 대기방과 같은 개념이다.

### 코드 구현 예시

* Server

  ```javascript
  // 기본 Namespace "/"
  io.on("connection", (socket) => {
    // 통신 이벤트 구현...
  });

  // chat Namespace "/chat"
  const chatNamespace = io.of("/chat");
  chatNamespace.on("connection", (socket) => {
    // Client를 요청 별로 room에 추가
    socket.on("join-room", (roomInfo, callback) => {
      if (roomInfo.type === "room:dev") {
        socket.join("room:dev");

        // chat Namaspace의 room:dev 룸의 모든 Client에게 메시지 전송.
        chatNamespace.to("room:dev").emit("hello", `${roomInfo.user} has joined chat room.`);

        callback("success");
      } else if (roomInfo.type === "room:music") {
        socket.join("room:music");

        // chat Namaspace의 room:music 룸의 모든 Client에게 메시지 전송.
        chatNamespace.to("room:music").emit("hello", `${roomInfo.user} has joined music room.`);

        callback("success");
      } else {
        callback("The room doesn't exist");
      }
    });

    // room 단위 이벤트 등록
    socket.on(room-message, (socket) => {
      // room 단위 이벤트 구현...
    });

    // 기타 이벤트 구현...
  });

  // notification Namespace "/notification"
  const notificationNamespace = io.of("/notification");
  notificationNamespace.on("connection", (socket) => {
    // 통신 이벤트 구현...

    // Client를 room1과 room2에 추가
    socket.join("room1");
    socket.join("room2");

    // notification Namaspace의 모든 Client에게 메시지 전송.
    notificationNamespace.emit("hello", "notification");
  });
  ```

* Client

  ```javascript
  // 기본 Namespace로 연결
  const socket = io("ws://localhost:3000")

  // chat Namespace로 연결
  const chatSocket = io("ws://localhost:3000/chat")

  // notification Namespace로 연결
  const notificationSocket = io("ws://localhost:3000/notification")

  // Namespace Socket 별 이벤트 등록...
  ```

---

## Broadcast

> **socket.broadcast.emit**를 활용해 *요청자(나)를 제외한* 모두에게 이벤트를 전송할 수 있다.

- **Client**는 직접 Broadcast할 수 없으며, 반드시 *Server에게 요청*해야 한다.
- **Server**는 Client 요청을 받아 Broadcast하며, *요청자인 Client는 수신자에서 제외*된다.
- Broadcast의 대상은 **Namespace 안의 Client들**까지만 가능하다.
- `to({room name})`을 활용해 **Room 안의 Client들**에게만 Broadcast 할 수도 있다.

### 예시 케이스

- **Server 주도 Broadcast**: 모든 Client에게 *공지 메시지* 전송
- **Client 주도 Broadcast**: 게임에서 *친구 등록된 유저의 접속 알림* 전송
