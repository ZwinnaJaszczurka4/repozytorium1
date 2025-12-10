import express from "express";
import flashcards from "./models/hasla.js";

const port = 8000;
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/hasla", (req, res) => {
  const kategorie = flashcards.getCategorySummaries();
  res.render("hasla", { title: "Wybierz kategorię", kategorie });
});

app.get("/gramy/:kategoria", (req, res) => {
  const kategoriaId = req.params.kategoria; 
  const kategoria = flashcards.getCategory(kategoriaId);

  if (!kategoria) {
    console.log("nie ma takiej kategorii w bazie", kategoriaId);
    return res.status(404).send("nie znaleziono kategorii");
  }

  if (!kategoria.words) {
    return res.status(404).send("nie ma hasel w kategorii");
  }

  const losoweHaslo = kategoria.words[Math.floor(Math.random() * kategoria.words.length)].text;

  res.render("gramy", {
    title: "Gramy",
    haslo: losoweHaslo,
    kategoria: kategoria.name
  });
});

app.post("/wygrana", (req, res) => {
  const {imie, haslo} = req.body;
    res.render("wygrana", { title: "Wygrana!", imie, haslo });
});

app.post("/formularz/haslo/usun", (req, res) => {
  const {id} = req.body;
  flashcards.deleteWord(id);
  res.redirect("/formularz");
});


app.get("/formularz", (req, res) => {

  const kategorie = flashcards.getCategorySummaries().map(cat => {
    const fullCat = flashcards.getCategory(cat.id);
    fullCat.words = fullCat.words || [];
    return fullCat;
  });

  res.render("formularz", { title: "Formularz", kategorie, errors: [] });
});


app.post("/formularz/kategoria/dodaj", (req, res) => {
  const { id, name } = req.body;
  try {
    flashcards.addCategory(id, name);
    res.redirect("/formularz");
  } catch (err) {
    const kategorie = flashcards.getCategorySummaries();
    res.render("formularz", { title: "Formularz", kategorie });
  }
});


app.post("/formularz/haslo/dodaj", (req, res) => {
  const { categoryId, text } = req.body;

 
 flashcards.addWord(categoryId, text);


  res.redirect("/formularz");
});

app.post("/formularz/haslo/edytuj", (req, res) => {
  const { id, categoryId, text } = req.body;

    flashcards.deleteWord(id);    
    flashcards.addWord(categoryId, text); 

  res.redirect("/formularz");
});

app.use((req, res) => res.status(404).send("Strona nie istnieje"));

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));