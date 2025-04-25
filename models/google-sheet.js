const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const SPREADSHEET_ID = "1K7S8ZZjsInS6bWxPuUkMxtt-Mnb36A9jJjJTlQIr318"; 
const SHEET_NAME = "LopHoc"; 

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

// 🔴 DELETE - Xoá lớp học theo rowIndex
async function deleteClass(rowIndex) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    resource: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: 0, // ⚠️ Cẩn thận, nếu LopHoc không phải sheetId 0 thì phải chỉnh
            dimension: "ROWS",
            startIndex: rowIndex + 1, 
            endIndex: rowIndex + 2
          }
        }
      }]
    }
  });
}

// ✅ EXPORT chuẩn chỉnh
module.exports = {
  getClasses,
  addClass,
  deleteClass
};
