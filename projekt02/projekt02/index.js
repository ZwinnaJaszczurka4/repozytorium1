import express from "express";

const port = 8000;
const hasla_kategorie = {
  "zwierzeta-domowe": {
    name: "Zwierzęta domowe",
    hasla: ["kot", "pies", "mysz"],
  },
  "kolory": {
    name: "Kolory",
    hasla: ["czerwony", "zielony", "niebieski", "żółty", "czarny"],
  },
};

function losowanie(id) {
  const kategoria = hasla_kategorie[id];
  const hasla = kategoria.hasla;
  const cyferka = Math.floor(Math.random() * hasla.length);
  return hasla[cyferka];
}

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/hasla", (req, res) => {
  const kategorie = db.prepare("SELECT id, name FROM kategorie").all();
  res.render("hasla", { title: "Wybierz kategorię", kategorie });
});


app.get("/gramy/:kategoria", (req, res) => {
  const kategoriaId = req.params.kategoria;
  const haslo = losowanie(kategoriaId);
  res.render("gramy", {
    title: "Gramy",
    haslo,
    kategoria: hasla_kategorie[kategoriaId].name,
  });
});

app.get("/wygrana", (req, res) => {
  res.render("wygrana", {
    title: "Wygrales!",
  });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});