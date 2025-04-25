// Import thư viện
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const path = require("path");

const app = express(); // ✅ Phải khởi tạo app trước!

// Cấu hình view engine EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware để xử lý dữ liệu form POST
app.use(express.urlencoded({ extended: true }));

// Middleware để phục vụ file tĩnh (CSS, JS, ảnh nếu có)
app.use(express.static(path.join(__dirname, "public")));

// Cấu hình session
app.use(session({
  secret: "your_secret_key", // 🛡️ Bạn nên đổi secret này khi triển khai thực tế
  resave: false,
  saveUninitialized: false
}));

// Cấu hình Passport.js cho login/logout (nếu có)
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Gọi routes
const classRouter = require("./routes/class"); // ✅ Route quản lý lớp học
app.use("/class", classRouter);

// Trang chủ mặc định chuyển về /class
app.get("/", (req, res) => {
  res.redirect("/admin");
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
// check login
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
