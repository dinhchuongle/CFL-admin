const express = require("express");
const router = express.Router();
const { getClasses, addClass, deleteClass } = require("../models/google-sheet");

// 📘 GET - Hiển thị danh sách lớp
router.get("/", async (req, res) => {
  try {
    const classes = await getClasses();
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

// 🗑️ POST - Xoá lớp học
router.post("/delete/:rowIndex", async (req, res) => {
  try {
    const rowIndex = parseInt(req.params.rowIndex);
    await deleteClass(rowIndex);
    res.redirect("/class");
  } catch (error) {
    console.error(error);
    res.status(500).send("Không thể xoá lớp.");
  }
});

// 📅 GET - Hiển thị lịch học từng lớp
router.get("/:rowIndex/schedule", async (req, res) => {
  try {
    const rowIndex = parseInt(req.params.rowIndex);
    const classes = await getClasses();

    if (rowIndex < 0 || rowIndex >= classes.length) {
      return res.status(404).send("Không tìm thấy lớp học.");
    }

    const cls = classes[rowIndex];

    // Xử lý lịch học
    const scheduleDays = (cls.schedule || "")
      .replace(/-/g, ",") // hỗ trợ cả T3-T5-T7 hoặc T3, T5, T7
      .split(",")
      .map(day => day.trim());

    const startDate = new Date(cls.startDate);
    const totalWeeks = parseInt(cls.durationWeeks) || 0;
    const sessions = [];

    if (!scheduleDays.length || totalWeeks <= 0) {
      return res.render("class_schedule", { cls, sessions: [] });
    }

    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]; // Mapping đúng thứ

    let current = new Date(startDate);
    let sessionCount = 1;
    let maxDate = new Date(startDate);
    maxDate.setDate(maxDate.getDate() + 365); // Giới hạn tối đa 1 năm

    while (current <= maxDate) {
      if (sessionCount > totalWeeks * scheduleDays.length) break;

      const currentDay = current.getDay();
      const currentDayString = dayNames[currentDay];

      if (scheduleDays.includes(currentDayString)) {
        sessions.push({
          title: `Buổi ${sessionCount} - ${cls.teacher}`,
          date: current.toISOString().split("T")[0]
        });
        sessionCount++;
      }

      current.setDate(current.getDate() + 1);
    }

    res.render("class_schedule", { cls, sessions });
  } catch (error) {
    console.error(error);
    res.status(500).send("Không thể lấy lịch học lớp.");
  }
});

module.exports = router; // ✅ Chỉ 1 lần export đúng cuối file
