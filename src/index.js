// Imports
const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const { sendMsg } = require("./utils/msg");
const { addUser, removeUser, roomUsers, getUser } = require("./utils/users");

// Main Variables
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// App settings
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Variables
const PORT = process.env.PORT || 3000;

io.on("connection", (socket) => {

    // Joining a chatroom
    socket.on("join_room", ({ name, room }, acknowledgement) => {
        // Getting the data
        const { err, user } = addUser({ id: socket.id, name, room });
        if (!user) return acknowledgement(err);

        // Joining the socket to the users room
        socket.join(user.room);

        // Sending a welcome message to the just joined user
        const m = `Hello there, ${user.name}!`;
        socket.emit("Welcome message", sendMsg(m, "Jinjo"));

        // Letting everyone in the users room know that a new user has joined
        socket.broadcast.to(user.room).emit("Send Message", sendMsg(`${user.name} entered the chat`, "Jinjo"));

        const users = roomUsers(user.room.trim().toLowerCase());
        io.to(user.room).emit("updateUserList", { users, room: user.room });
        acknowledgement();
    });

    // Send messages between users
    socket.on("Send Message", (msg, acknowledgement) => {
        // Checking if the word is bad
        const pattern = /(fr?[uai]ck)\w*/;
        if (msg.match(pattern)) return acknowledgement({ status: "bad", message: sendMsg("That is a naughty word!", "Jinjo") });

        // finding the user by their id
        const user = getUser(socket.id);

        // Getting the message object
        const data = sendMsg(msg, user.name);
        io.to(user.room).emit("Send Message", data, acknowledgement({ status: "Good" }));
    });

    // Sending geo-location data
    socket.on("geo", ({ latitude, longitude }, acknowledgement) => {
        // Returning the persons address in google maps
        const user = getUser(socket.id);
        io.to(user.room).emit("geoLocationSend", sendMsg(`https://google.com/maps?q=${latitude},${longitude}`, user.name), acknowledgement());
    });

    // Letting everyone except the one that left know that a user has left
    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit("Send Message", sendMsg(`${user.name} has left the charroom`, "Jinjo"));
            io.to(user.room).emit("updateUserList", { users: roomUsers(user.room.trim().toLowerCase()), room: user.room });
        }
    });

});


server.listen(PORT, () => console.log(`Listening on port ${PORT}`));