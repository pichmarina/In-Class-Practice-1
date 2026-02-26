const express = require("express");
const path = require("path");
const { engine } = require("express-handlebars");

const app = express();

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


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});