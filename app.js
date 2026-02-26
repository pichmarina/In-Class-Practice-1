const express = require("express");
const path = require("path");
const { engine } = require("express-handlebars");

const app = express();
const PORT = 3000;

app.disable("x-powered-by");

global.reports = [];

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


app.get("/", (req, res) => {
  res.redirect("/dashboard");
});

app.get("/report", (req, res) => {
  res.render("report");
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

app.get("/items/:id", (req, res) => {
  res.render("items/detail");
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