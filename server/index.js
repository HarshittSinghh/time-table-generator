const express = require("express");
const cors = require("cors");
const XLSX = require("xlsx");
const path = require("path");

const app = express();

app.use(cors({
  origin: 'https://kiit-7th-sem-time-table-generator.netlify.app'
}));


app.get("/api/timetable", (req, res) => {
  try {
    const filePath = path.join(__dirname, "timetable.xlsx");
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    res.json(data);
  } catch (error) {
    console.error("Error reading timetable:", error);
    res.status(500).json({ error: "Unable to read timetable" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
