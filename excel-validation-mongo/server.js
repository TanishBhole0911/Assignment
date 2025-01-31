const express = require("express");
const multer = require("multer");
const ExcelJS = require("exceljs");
const mongoose = require("mongoose");
const dayjs = require("dayjs");
const Transaction = require("./models/Transaction");
const cors = require("cors"); // Import cors
require("dotenv").config(); // Load environment variables
const app = express();
app.use(cors()); // Enable CORS for all origins
const upload = multer({ dest: "uploads/" });
console.log(process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Upload Route
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    console.error("No file uploaded");
    return res.status(400).json({ error: "No file uploaded" });
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(req.file.path);
  const worksheet = workbook.worksheets[0];

  const requiredColumns = ["Name", "Amount", "Date", "Verified"];
  const columnIndexes = {};
  let errors = [];
  let validRecords = [];

  worksheet.getRow(1).eachCell((cell, colNumber) => {
    // Check if the cell value is one of the required columns
    if (requiredColumns.includes(cell.value)) {
      // Map the column name to its index
      columnIndexes[cell.value] = colNumber;
    }
  });

  // Debugging: Log the column headers and indexes
  console.log("Column Headers:", worksheet.getRow(1).values);
  console.log("Mapped Column Indexes:", columnIndexes);

  // If the number of mapped columns does not match the number of required columns
  if (Object.keys(columnIndexes).length !== requiredColumns.length) {
    console.error("Invalid column headers");
    // Respond with a 400 status code and an error message
    return res.status(400).json({ error: "Invalid column headers" });
  }

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    let name = row.getCell(columnIndexes["Name"]).value;
    let amount = row.getCell(columnIndexes["Amount"]).value;
    let date = row.getCell(columnIndexes["Date"]).value;
    let verified = row.getCell(columnIndexes["Verified"]).value;

    let rowErrors = [];

    if (!name) rowErrors.push("Name is required");
    if (!amount || isNaN(amount) || amount <= 0) rowErrors.push("Amount must be numeric and greater than zero");
    if (!date || !dayjs(date).isValid() || !dayjs(date).isSame(dayjs(), "month")) 
      rowErrors.push("Date must be valid and within the current month");
    if (verified !== "Yes" && verified !== "No") rowErrors.push("Verified must be Yes or No");

    if (rowErrors.length) {
      errors.push({ sheet: worksheet.name, row: rowNumber, errors: rowErrors });
    } else {
      validRecords.push({
        name,
        amount: parseFloat(amount),
        date: dayjs(date).toDate(),
        verified: verified === "Yes",
      });
    }
  });

  if (errors.length > 0) {
    console.error("Validation errors:", errors);
    return res.status(400).json({ errors });
  }

  await Transaction.insertMany(validRecords);
  res.json({ message: "File processed successfully", recordsSaved: validRecords.length });
});

// To call this API, send a POST request to http://localhost:3001/upload
// with a form-data body containing a file field named "file".
// Example using curl:
// curl -F "file=@path/to/your/file.xlsx" http://localhost:3001/upload

// To call this API from the frontend, use the following example code:
// const formData = new FormData();
// formData.append("file", fileInput.files[0]);
// fetch("http://localhost:3001/upload", {
//   method: "POST",
//   body: formData,
// })
// .then(response => response.json())
// .then(data => console.log(data))
// .catch(error => console.error("Error:", error));

app.listen(3001, () => console.log("Server running on port 3000"));

// Possible Errors and Responses:
// 1. No file uploaded
//    - Error: "No file uploaded"
//    - Response: 400 status code with { error: "No file uploaded" }

// 2. Invalid column headers
//    - Error: "Invalid column headers"
//    - Response: 400 status code with { error: "Invalid column headers" }

// 3. Validation errors in the rows
//    - Error: "Validation errors"
//    - Response: 400 status code with { errors: [ { sheet, row, errors: [error messages] } ] }

// 4. Database insertion errors (not explicitly handled in the code but possible)
//    - Error: "Database insertion error"
//    - Response: 500 status code with { error: "Database insertion error" }
