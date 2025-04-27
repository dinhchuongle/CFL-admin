const express = require("express");
const router = express.Router();
const { getClasses, addClass, deleteClass, updateClass, getTeachers } = require("../models/google-sheet");

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
router.get("/new", async (req, res) => {
  try {
    const teachers = await getTeachers();
    res.render("new_class", { teachers });
  } catch (error) {
    console.error(error);
    res.status(500).send("Không thể lấy danh sách giáo viên.");
  }
});

// 🟢 POST - Thêm lớp mới
router.post("/new", async (req, res) => {
  try {
    const data = req.body;
    const teachersPerSession = data.teachersPerSession ? data.teachersPerSession : "[]";

    await addClass({
      name: data.name,
      startDate: data.startDate,
      durationWeeks: data.durationWeeks,
      schedule: data.schedule,
      teacher: "", // Không lưu cố định teacher nữa
      zoomLink: data.zoomLink,
      zaloGroup: data.zaloGroup,
      program: data.program,
      teachersPerSession: teachersPerSession
    });

    res.redirect("/class");
  } catch (error) {
    console.error(error);
    res.status(500).send("Không thể thêm lớp mới.");
  }
});

// ✏️ GET - Hiển thị form chỉnh sửa lớp
router.get("/:rowIndex/edit", async (req, res) => {
  try {
    const rowIndex = parseInt(req.params.rowIndex);
    const classes = await getClasses();
    const teachers = await getTeachers();

    if (rowIndex < 0 || rowIndex >= classes.length) {
      return res.status(404).send("Không tìm thấy lớp học.");
    }

    const cls = classes[rowIndex];
    res.render("edit_class", { cls, rowIndex, teachers });
  } catch (error) {
    console.error(error);
    res.status(500).send("Không thể tải thông tin lớp.");
  }
});

// 📝 POST - Cập nhật lớp sau khi chỉnh sửa
router.post("/:rowIndex/edit", async (req, res) => {
  try {
    const rowIndex = parseInt(req.params.rowIndex);
    const data = req.body;
    const teachersPerSession = data.teachersPerSession ? data.teachersPerSession : "[]";

    await updateClass(rowIndex, {
      name: data.name,
      startDate: data.startDate,
      durationWeeks: data.durationWeeks,
      schedule: data.schedule,
      teacher: "", // Không lưu cố định teacher
      zoomLink: data.zoomLink,
      zaloGroup: data.zaloGroup,
      program: data.program,
      teachersPerSession: teachersPerSession
    });

    res.redirect("/class");
  } catch (error) {
    console.error(error);
    res.status(500).send("Không thể cập nhật lớp.");
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

    let teachersPerSession = [];
    try {
      teachersPerSession = cls.teachersPerSession ? JSON.parse(cls.teachersPerSession) : [];
    } catch (error) {
      console.error("Lỗi parse teachersPerSession:", error);
    }

    const scheduleDays = (cls.schedule || "")
      .replace(/-/g, ",")
      .split(",")
      .map(day => day.trim());

    const startDate = new Date(cls.startDate);
    const totalWeeks = parseInt(cls.durationWeeks) || 0;
    const sessions = [];

    if (!scheduleDays.length || totalWeeks <= 0) {
      return res.render("class_schedule", { cls, sessions });
    }

    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    let current = new Date(startDate);
    let sessionCount = 1;
    let maxDate = new Date(startDate);
    maxDate.setDate(maxDate.getDate() + 365);

    while (current <= maxDate) {
      if (sessionCount > totalWeeks * scheduleDays.length) break;

      const currentDay = current.getDay();
      const currentDayString = dayNames[currentDay];

      if (scheduleDays.includes(currentDayString)) {
        const teacherObj = teachersPerSession.find(tp => tp.day === currentDayString);
        const teacherName = teacherObj ? teacherObj.teacher : "Chưa phân công";

        sessions.push({
          title: `Buổi ${sessionCount} - ${teacherName}`,
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

module.exports = router;
