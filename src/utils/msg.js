const { DateTime } = require("luxon");

const sendMsg = (msg, name) => {
    const sentAt = DateTime
        .fromISO(DateTime.local())
        .setLocale("en")
        .toFormat('ff');
    return { msg, sentAt, name };
}

module.exports = {
    sendMsg
};