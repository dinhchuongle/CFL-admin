const bcrypt = require("bcrypt");

const users = [
    {
        username: "admin",
        password: bcrypt.hashSync("admin123", 10),
        role: "admin"
    }
];

module.exports = { users };
