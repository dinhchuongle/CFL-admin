const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const users = require("./models/users"); // 👈 bạn cần có file users.js để lấy dữ liệu người dùng

// Cấu hình strategy
passport.use(new LocalStrategy(
  async function(username, password, done) {
    try {
      const user = await users.findByUsername(username);
      if (!user) return done(null, false, { message: "Tài khoản không tồn tại" });
      if (user.password !== password) return done(null, false, { message: "Sai mật khẩu" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Lưu vào session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Lấy từ session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await users.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
