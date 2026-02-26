const express = require("express");
const path = require("path");
const fs = require("fs");
const multiparty = require("multiparty");
const { engine } = require("express-handlebars");

const app = express();
const PORT = 3000;

app.disable("x-powered-by");

global.reports = [];

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

/* ================= ENSURE UPLOAD DIRECTORY ================= */
const uploadDir = path.join(__dirname, "public/uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ================= ROUTES ================= */


app.get("/", (req, res) => {
  res.redirect("/dashboard");
});

app.get("/report", (req, res) => {
  res.render("report");
});

app.post("/report", (req, res) => {
  const form = new multiparty.Form({
    uploadDir: uploadDir,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Upload error:", err);
      return res.redirect("/report");
    }

    const name = fields.name?.[0]?.trim();
    const description = fields.description?.[0]?.trim();
    const location = fields.location?.[0]?.trim();
    const date = fields.date?.[0]?.trim();
    const contact = fields.contact?.[0]?.trim();
    const image = files.image?.[0];

    /* ===== BACKEND VALIDATION ===== */
    if (!name || !description || !location || !date || !contact || !image) {

      // Remove uploaded file if validation fails
      if (image && fs.existsSync(image.path)) {
        fs.unlinkSync(image.path);
      }

      return res.redirect("/report");
    }

    /* ===== SAVE IMAGE PROPERLY ===== */
    const ext = path.extname(image.originalFilename);
    const filename = Date.now() + ext;
    const finalPath = path.join(uploadDir, filename);

    fs.renameSync(image.path, finalPath);

    const newReport = {
      id: Date.now().toString(),
      name,
      description,
      location,
      date,
      contact,
      imagePath: "/uploads/" + filename,
      status: "Lost", // Default status
    };

    global.reports.push(newReport);

    return res.redirect("/dashboard");
  });
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard", { reports: global.reports });
});

app.get("/items/:id", (req, res) => {
  const report = global.reports.find(r => r.id === req.params.id);
  if (!report) return res.redirect("/dashboard");

  res.render("items/detail", {
    report,
    isLost: report.status === "Lost",
    isFound: report.status === "Found",
    isClosed: report.status === "Closed",
  });
});

app.post("/items/:id/status", (req, res) => {
  const report = global.reports.find(r => r.id === req.params.id);
  if (!report) return res.redirect("/dashboard");

  const newStatus = req.body.status;

  if (["Lost", "Found", "Closed"].includes(newStatus)) {
    report.status = newStatus;
  }

  res.redirect("/items/" + report.id);
});

app.post("/items/:id/delete", (req, res) => {
  global.reports = global.reports.filter(r => r.id !== req.params.id);
  res.redirect("/dashboard");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});