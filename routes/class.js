const express = require("express");
const router = express.Router();
const sheet = require("../models/google-sheet"); // gọi google-sheet.js

// 📘 GET - Hiển thị danh sách lớp
router.get("/", async (req, res) => {
  try {
    const classes = await sheet.getClasses();
    res.render("class_list", { classes });
  } catch (error) {
    console.error(error);
    res.status(500).send("Không thể lấy danh sách lớp.");
  }
});

// 🖊️ GET - Hiển thị form thêm lớp
router.get("/new", (req, res) => {
  res.render("new_class");
});

// 🟢 POST - Thêm lớp mới
router.post("/new", async (req, res) => {
  try {
    const data = req.body;
    await sheet.addClass({
      name: data.name,
      startDate: data.startDate,
      durationWeeks: data.durationWeeks,
      schedule: data.schedule,
      teacher: data.teacher,
      zoomLink: data.zoomLink,
      zaloGroup: data.zaloGroup,
      program: data.program
    });
    res.redirect("/class");
  } catch (error) {
    console.error(error);
    res.status(500).send("Không thể thêm lớp mới.");
  }
});

module.exports = router;
