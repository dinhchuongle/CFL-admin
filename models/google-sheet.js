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
    range: `${SHEET_NAME}!A2:I`
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
    program: row[7] || "",
    teachersPerSession: row[8] || "[]"
  }));
}

// 📋 READ - Lấy danh sách giáo viên từ Sheet "GV"
async function getTeachers() {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `GV!A2:A`
  });
  const rows = res.data.values || [];
  return rows.map(row => row[0]).filter(name => name);
}

// 🟢 CREATE - Thêm lớp học mới
async function addClass(cls) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:I`,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[
        cls.name,
        cls.startDate,
        cls.durationWeeks,
        cls.schedule,
        cls.teacher,
        cls.zoomLink,
        cls.zaloGroup,
        cls.program,
        cls.teachersPerSession
      ]]
    }
  });
}

// 📝 UPDATE - Cập nhật lớp học
async function updateClass(rowIndex, cls) {
  const sheets = await getSheetsClient();
  const rowNum = rowIndex + 2;
  const range = `${SHEET_NAME}!A${rowNum}:I${rowNum}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: range,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[
        cls.name,
        cls.startDate,
        cls.durationWeeks,
        cls.schedule,
        cls.teacher,
        cls.zoomLink,
        cls.zaloGroup,
        cls.program,
        cls.teachersPerSession
      ]]
    }
  });
}

// 🔴 DELETE - Xoá lớp học theo rowIndex (Cập nhật mới)
async function deleteClass(rowIndex) {
  const sheets = await getSheetsClient();

  // 🔥 Lấy sheetId đúng của sheet "LopHoc"
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID
  });

  const sheet = meta.data.sheets.find(s => s.properties.title === SHEET_NAME);
  if (!sheet) {
    throw new Error(`Không tìm thấy sheet có tên ${SHEET_NAME}`);
  }
  const sheetId = sheet.properties.sheetId;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    resource: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheetId, // 🛡️ Không hardcode nữa
            dimension: "ROWS",
            startIndex: rowIndex + 1,
            endIndex: rowIndex + 2
          }
        }
      }]
    }
  });
}

// ✅ EXPORT chuẩn
module.exports = {
  getClasses,
  addClass,
  deleteClass,
  updateClass,
  getTeachers
};
