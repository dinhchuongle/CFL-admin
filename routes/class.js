const express = require("express");
const router = express.Router();
const { getClasses, addClass, deleteClass } = require("../models/google-sheet"); // ✅ Import đầy đủ 1 lần

// 📘 GET - Hiển thị danh sách lớp
router.get("/", async (req, res) => {
  try {
    const classes = await getClasses(); // ✅ Gọi đúng getClasses()
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
    await addClass({
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

// 🗑️ POST - Xóa lớp học
router.post("/delete/:rowIndex", async (req, res) => {
  try {
    const rowIndex = parseInt(req.params.rowIndex);
    await deleteClass(rowIndex);
    res.redirect("/class");
  } catch (error) {
    console.error(error);
    res.status(500).send("Không thể xóa lớp.");
  }
});

module.exports = router; // ✅ Chỉ 1 lần export
