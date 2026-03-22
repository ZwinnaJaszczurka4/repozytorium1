import "dotenv/config";
import express from "express";
import flashcards from "./models/hasla.js";
import cookieParser from "cookie-parser";
import settings from "./models/settings.js";
import session from "./models/sessions.js";
import auth from "./controllers/auth.js";


const SECRET = process.env.SECRET;

if (SECRET == null) {
  console.error(
    `SECRET environment variable missing.
     Please create an env file or provide SECRET via environment variables.`,
  );
  process.exit(1);
}

const port = process.env.PORT || 8000;
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// --- Sesja i ciasteczka ---
app.use(cookieParser(SECRET));
app.use(session.sessionHandler);

app.use((req, res, next) => {
  if (req.session && req.session.userId) {
    const user = getUserById(req.session.userId);
    req.user = user;
    res.locals.user = user;
  } else {
    req.user = null;
    res.locals.user = null;
  }
  next();
});

// --- Middleware: ustawiamy user do widoków ---

// --- Middleware ustawień ---
app.use(settings.settingsHandler);
app.use((req, res, next) => {
  res.locals.app = settings.getSettings(req);
  res.locals.page = req.path;
  next();
});

// --- Router do ustawień ---
const settingsRouter = express.Router();
settingsRouter.get("/toggle-theme", settings.themeToggle);
app.use("/settings", settingsRouter);

// --- Router auth ---
const authRouter = express.Router();
authRouter.get("/signup", auth.signup_get);
authRouter.post("/signup", auth.signup_post);
authRouter.get("/login", auth.login_get);
authRouter.post("/login", auth.login_post);
authRouter.get("/logout", auth.logout);
app.use("/auth", authRouter);

// --- Pozostałe routy ---
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/hasla", (req, res) => {
  const kategorie = flashcards.getCategorySummaries();
  res.render("hasla", { title: "Wybierz kategorię", kategorie });
});

app.get("/gramy/:kategoria", (req, res) => {
  const kategoriaId = req.params.kategoria; 
  const kategoria = flashcards.getCategory(kategoriaId);

  if (!kategoria) return res.status(404).send("nie znaleziono kategorii");
  if (!kategoria.words) return res.status(404).send("nie ma hasel w kategorii");

  const losoweHaslo = kategoria.words[Math.floor(Math.random() * kategoria.words.length)].text;

  res.render("gramy", {
    title: "Gramy",
    haslo: losoweHaslo,
    kategoria: kategoria.name
  });
});

app.post("/wygrana", (req, res) => {
  const { imie, haslo } = req.body;
  res.render("wygrana", { title: "Wygrana!", imie, haslo });
});

app.post("/formularz/haslo/usun", (req, res) => {
  const { id } = req.body;
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

app.get("/formularz/kategoria/dodaj", (req, res) => {
  res.render("dodajkat", { title: "Dodawanie kategorii" });
});

app.post("/formularz/kategoria/dodaj", (req, res) => {
  const { name } = req.body;
  const categories = flashcards.getCategorySummaries();
  const newId = categories.length + 1;
  try {
    flashcards.addCategory(newId, name);
    res.redirect("/formularz"); 
  } catch (err) {
    const kategorie = flashcards.getCategorySummaries();
    res.render("formularz", { title: "Formularz", kategorie });
  }
});

app.get("/formularz/haslo/dodaj", (req, res) => {
  const kategorie = flashcards.getCategorySummaries().map(cat => {
    const fullCat = flashcards.getCategory(cat.id);
    fullCat.words = fullCat.words || [];
    return fullCat;
  });
  res.render("dodajhaslo", { title: "Zarządzanie hasłami", kategorie });
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

// --- 404 ---
app.use((req, res) => res.status(404).send("Strona nie istnieje"));

// --- Start serwera ---
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));