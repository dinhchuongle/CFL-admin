const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const classRouter = require("./routes/class");
app.use("/class", classRouter);


const app = express();
const PORT = process.env.PORT || 3000;

const { users } = require("./models/users");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({ secret: "secretKey", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(new LocalStrategy((username, password, done) => {
    const user = users.find(u => u.username === username);
    if (!user) return done(null, false, { message: "Wrong username" });
    if (!bcrypt.compareSync(password, user.password)) return done(null, false, { message: "Wrong password" });
    return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.username));
passport.deserializeUser((username, done) => {
    const user = users.find(u => u.username === username);
    done(null, user);
});
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/index"));
app.use("/admin", require("./routes/admin"));
app.use("/class", require("./routes/class"));
app.use("/program", require("./routes/program"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


