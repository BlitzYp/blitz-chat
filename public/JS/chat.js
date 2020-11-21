// Main variables
const socket = io();

// Form elements
const $send = document.querySelector("#sendMessage");
const $msg = $send.querySelector("#msg");
const $inputButton = $send.querySelector("#input-button");
const $loc = document.getElementById("location");

// Display elements
const $msgs = document.querySelector("#messages");
const $userList = document.querySelector("#userList");

// Templates
const msgTemp = document.querySelector("#msg-template").innerHTML;
const geoTemp = document.querySelector("#geo-template").innerHTML;
const userList = document.querySelector("#user-list-template").innerHTML;

// Joining options
const { name, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

// A function that renders messages using a template
function renderMsg(temp, obj) {
    const messageToBeDisplayed = Mustache.render(temp, obj);
    $msgs.insertAdjacentHTML("beforeend", messageToBeDisplayed);
    return;
}

// Auto scrolling
function autoScroll() {
    // The newest message
    const $message = $msgs.lastElementChild;

    // Height of the message
    const style = getComputedStyle($message);
    const margin = parseInt(style.marginBottom);
    const height = $message.offsetHeight + margin;

    // How much can you see
    const visible = $msgs.offsetHeight;

    // The scrolling height
    const contentHeight = $msgs.scrollHeight;

    // How far has the user scrolled
    const howFarScrolled = $msgs.scrollTop + visible;

    if ((contentHeight - height) <= howFarScrolled) $msgs.scrollTop = $msgs.scrollHeight;
}

// Sending a welcome msg to new users
socket.on("Welcome message", ({ msg, sentAt, name }) => {
    // Rendering the welcome message to the user
    renderMsg(msgTemp, { message: msg, sentAt, name });
});

// Sending messages that every user can see
socket.on("Send Message", ({ msg, sentAt, name }) => {
    // Rendering the message
    renderMsg(msgTemp, { message: msg, sentAt, name });
    autoScroll();
});

// Sending the link about the geo location (link)
socket.on("geoLocationSend", ({ msg, sentAt, name }) => {
    // Rendering the geo message
    console.log(msg, sentAt, name);
    renderMsg(geoTemp, { url: msg, sentAt, name });
});

// User joining a room
socket.emit("join_room", { name, room }, (err) => {
    // If ther is a error go back to the join page
    if (err) { alert(err); location.href = "/"; }
});

// Updating the user list on the side
socket.on("updateUserList", ({ users, room }) => {
    // Rendering the user list
    const display = Mustache.render(userList, { users, room });
    $userList.innerHTML = display;
});

// Awaiting sending messages
$send.addEventListener("submit", (i) => {
    i.preventDefault();

    // Disabling the button
    $inputButton.setAttribute("disabled", "disabled");

    const ctx = $msg.value;
    if (!ctx) return $inputButton.removeAttribute("disabled");
    socket.emit("Send Message", ctx, (res) => {
        if (res.status === "bad") {
            const { msg, sentAt, name } = res;
            renderMsg(msgTemp, { msg, sentAt, name });
            $inputButton.removeAttribute("disabled");
        }

        // Making everything how it was before the input message
        $inputButton.removeAttribute("disabled");
        $msg.value = "";
        $send.focus(); // Puts the cursor at the start
    });
});


// If the user wants to share their location
$loc.addEventListener("click", (i) => {
    i.preventDefault();

    // Disabling the button for sending the geo location
    $loc.setAttribute("disabled", "disabled");

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((location) => {

            // Getting the coordinates of the user
            const { longitude, latitude } = location.coords;
            socket.emit("geo", { latitude, longitude }, () => {
                // Enabling the button again
                $loc.removeAttribute("disabled");
                console.log("The location was sent!");
            });
        });
    } else {
        console.log("Feature not available");
    }
});

