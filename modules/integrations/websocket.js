// const WebSocketServer = require("websocket").server;
// const http = require("http");
// const utf8 = require("utf8");
//
// let server = http.createServer(function (request, response) {
//     response.writeHead(404);
//     response.end();
// });
// server.listen(process.env.SERVER_PORT);
// let wsServer = new WebSocketServer({
//     httpServer: server,
//     autoAcceptConnections: false
// });
// wsServer.on("request", request => {
//     if (!request.origin || request.origin !== "https://bot.zapsqua.red/") {
//         request.reject();
//         return;
//     }
//     let connection = request.accept("echo-protocol", request.origin);
//     connection.on("message", message => {
//         if (message.type === "utf8") {
//             let query = utf8.decode(message.utf8Data);
//             if (query === "ping") {
//                 connection.sendUTF(utf8.encode("pong"));
//             }
//         }
//     });
// });