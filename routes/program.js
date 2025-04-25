const express = require("express");
const router = express.Router();
const { programs } = require("../models/programs");
const { classes } = require("../models/classes");

router.get("/", (req, res) => {
    res.render("program_list", { programs });
});

router.get("/new", (req, res) => {
    res.render("new_program");
});

router.post("/new", (req, res) => {
    const { title, sessions, material } = req.body;
    programs.push({ title, sessions, material });
    res.redirect("/program");
});

router.get("/assign", (req, res) => {
    res.render("assign_program", { programs, classes });
});

router.post("/assign", (req, res) => {
    const { className, programTitle } = req.body;
    const cls = classes.find(c => c.name === className);
    const prog = programs.find(p => p.title === programTitle);
    if (cls && prog) {
        cls.program = prog;
    }
    res.redirect("/class");
});

module.exports = router;
