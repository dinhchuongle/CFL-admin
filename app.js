const express = require("express");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const path = require("path");

require("./passport-config"); // file riêng xử lý passport (bạn đã có hoặc sẽ tạo sau)

const app = express();

// Cấu hình view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware cơ bản
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());

app.use(session({
  secret: process.env.SESSION_SECRET || "my_secret_key",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Routing
app.use("/", require("./routes/index"));      // mặc định
app.use("/auth", require("./routes/auth"));   // đăng nhập / đăng xuất
app.use("/class", ensureAuthenticated, require("./routes/class")); // cần login
app.use("/admin", ensureAuthenticated, require("./routes/admin")); // cần login
app.use("/program", ensureAuthenticated, require("./routes/program"));

// Middleware kiểm tra login
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/auth/login");
}

// Server start
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
