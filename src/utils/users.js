let users = [];

const addUser = ({ id, name, room }) => {
    name = name.toLowerCase().trim();
    room = room.toLowerCase().trim();

    if (room && name) {
        // Checking for dublicate usernames
        const exists = users.filter((user) => {
            return user.room === room && user.name === name;
        });

        if (exists.length) return { err: "User already exists" };

        // Storing the user if everything is valid
        users.push({ id, name, room });
        const user = { id, name, room };
        return { user };

    } else return { err: "Please provide information!" };

}

const removeUser = (id) => {
    const search = users.findIndex((user) => user.id === id);
    const user = users[search];
    if (search !== -1) { users = users.filter((user) => user.id !== id); }
    return user;
}

const getUser = (id) => users.find((user) => user.id === id);

const roomUsers = (name) => users.filter((user) => user.room === name);

module.exports = {
    addUser,
    getUser,
    removeUser,
    roomUsers
};