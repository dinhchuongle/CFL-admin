const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const SPREADSHEET_ID = "ID_SHEET_CUA_BAN"; // dùng chung với Sheet lớp học

async function getSheetsClient() {
  const authClient = await auth.getClient();
  return google.sheets({ version: "v4", auth: authClient });
}

// 🔍 Tìm user theo username
async function findByUsername(username) {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Users!A2:D" // đọc dữ liệu từ sheet Users
  });
  const rows = res.data.values || [];

  const userRow = rows.find(row => row[1] === username);
  if (!userRow) return null;

  return {
    id: userRow[0],
    username: userRow[1],
    password: userRow[2],
    role: userRow[3]
  };
}

// 🔍 Tìm user theo ID
async function findById(id) {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Users!A2:D"
  });
  const rows = res.data.values || [];

  const userRow = rows.find(row => row[0] === id);
  if (!userRow) return null;

  return {
    id: userRow[0],
    username: userRow[1],
    password: userRow[2],
    role: userRow[3]
  };
}

module.exports = {
  findByUsername,
  findById
};
