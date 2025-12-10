import express from "express";

const port = 8000;

const hasla_kategorie = {
  "zwierzeta-domowe": {
    name: "Zwierzęta domowe",
    hasla: ["kot", "pies", "mysz", "krowa", "byk"],
  },
  "kolory": {
    name: "Kolory",
    hasla: ["czerwony", "zielony", "niebieski", "fioletowy", "czarny"],
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
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/hasla", (req, res) => {
  if (Object.keys(hasla_kategorie).length === 0) {
    res.status(404).send("Brak dostępnych kategorii");
  } else {
    res.render("hasla", {
      title: "Wybierz kategorię",
      kategorie: hasla_kategorie,
    });
  }
});

app.get("/gramy/:kategoria", (req, res) => {
  const kategoriaId = req.params.kategoria;
  const haslo = losowanie(kategoriaId);

  if (!haslo) {
    res.status(404).send("Nie znaleziono kategorii lub nie ma hasel");
  } else {
    res.render("gramy", {
      title: "Gramy",
      haslo,
      kategoria: hasla_kategorie[kategoriaId].name,
    });
  }
});

app.post("/wygrana", (req, res) => {
  const { imie, haslo } = req.body;
    res.render("wygrana", { title: "Wygrana!", imie, haslo });
});

app.use((req, res) => {
  res.status(404).send("strona nie istnieje");
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
