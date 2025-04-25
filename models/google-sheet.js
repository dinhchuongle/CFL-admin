const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const SPREADSHEET_ID = "1K7S8ZZjsInS6bWxPuUkMxtt-Mnb36A9jJjJTlQIr318"; // đúng ID Sheet
const SHEET_NAME = "LopHoc"; // đúng tên Sheet (phải có dấu nháy đơn nếu có dấu cách)

async function getSheetsClient() {
  const authClient = await auth.getClient();
  return google.sheets({ version: "v4", auth: authClient });
}

// 📘 READ
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

// 🟢 CREATE
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
  addClass,
  updateClass,
  deleteClass // 🔥 Phải có dòng này!
};
async function deleteClass(rowIndex) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    resource: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: 0, // ⚠️ Sheet ID của 'LopHoc', nếu không phải Sheet 0 thì cần sửa
            dimension: "ROWS",
            startIndex: rowIndex + 1,
            endIndex: rowIndex + 2
          }
        }
      }]
    }
  });
}

