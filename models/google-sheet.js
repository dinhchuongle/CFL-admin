const { google } = require("googleapis");
const path = require("path");

const CREDENTIALS_PATH = path.join(__dirname, "../credentials.json"); // 👈 Nếu credentials để ở gốc project
const SPREADSHEET_ID = "1K7S8ZZjsInS6bWxPuUkMxtt-Mnb36A9jJjJTlQIr318"; // 👈 Thay đúng ID
const SHEET_NAME = "LopHoc"; // 👈 Sheet có dấu tiếng Việt cần đặt trong ' '

const auth = new google.auth.GoogleAuth({
  keyFile: CREDENTIALS_PATH,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

async function getSheetsClient() {
  const authClient = await auth.getClient();
  return google.sheets({ version: "v4", auth: authClient });
}

// 📘 READ - Lấy danh sách lớp học
async function getClasses() {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:H`
  });
  const rows = res.data.values || [];
  return rows.map(row => ({
    name: row[0] || "",
    startDate: row[1] || "",
    durationWeeks: row[2] || "",
    schedule: row[3] || "",
    teacher: row[4] || "",
    zoomLink: row[5] || "",
    zaloGroup: row[6] || "",
    program: row[7] || ""
  }));
}

// 🟢 CREATE - Thêm lớp học
async function addClass(cls) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:H`,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[
        cls.name, cls.startDate, cls.durationWeeks,
        cls.schedule, cls.teacher, cls.zoomLink,
        cls.zaloGroup, cls.program
      ]]
    }
  });
}

module.exports = {
  getClasses,
  addClass
};
