const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login", { message: req.flash("error") });
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/admin",   // hoặc /class tùy ý bạn
  failureRedirect: "/auth/login",
  failureFlash: true
}));

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/auth/login");
  });
});

module.exports = router;
