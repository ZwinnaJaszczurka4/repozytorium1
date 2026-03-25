import "dotenv/config";
import express from "express";
import flashcards from "./models/hasla.js";
import cookieParser from "cookie-parser";
import settings from "./models/settings.js";
import session from "./models/sessions.js";
import auth from "./controllers/auth.js";
import { createAdmin } from "./models/user.js";


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

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (ADMIN_PASSWORD) {
  createAdmin(ADMIN_USERNAME, ADMIN_PASSWORD).catch(console.error);
}

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


app.use(cookieParser(SECRET));
app.use(session.sessionHandler);

import { getUser } from "./models/user.js";

app.use((req, res, next) => {
  const session = res.locals.session;
  if (session && session.user_id) {
    req.user = getUser(session.user_id);
    res.locals.user = req.user;
  } else {
    req.user = null;
    res.locals.user = null;
  }
  next();
});


app.use(settings.settingsHandler);
app.use((req, res, next) => {
  res.locals.app = settings.getSettings(req);
  res.locals.page = req.path;
  next();
});


const settingsRouter = express.Router();
settingsRouter.get("/toggle-theme", settings.themeToggle);
app.use("/settings", settingsRouter);

const authRouter = express.Router();
authRouter.get("/signup", auth.signup_get);
authRouter.post("/signup", auth.signup_post);
authRouter.get("/login", auth.login_get);
authRouter.post("/login", auth.login_post);
authRouter.get("/logout", auth.logout);
app.use("/auth", authRouter);


app.get("/", (req, res) => {
  res.render("index");
});

app.get("/hasla", (req, res) => {
  const kategorie = flashcards.getCategorySummariesPublic();
  res.render("hasla", { title: "Wybierz kategorię", kategorie });
});

app.get("/gramy/:kategoria", (req, res) => {
  const kategoriaId = req.params.kategoria; 
  const kategoria = flashcards.getCategoryPublic(kategoriaId);

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

app.post("/formularz/haslo/usun", auth.login_required, (req, res) => {
  const { id } = req.body;
  if (req.user.is_admin) {
    flashcards.deleteWordAdmin(id);
  } else {
    flashcards.deleteWord(id, req.user.id);
  }
  res.redirect("/formularz");
});

app.get("/formularz", auth.login_required, (req, res) => {
  const isAdmin = req.user.is_admin;
  const userId = req.user.id;
  
  let kategorie;
  if (isAdmin) {
    kategorie = flashcards.getCategorySummariesAdmin().map(cat => {
      const fullCat = flashcards.getCategoryAdmin(cat.id);
      fullCat.words = fullCat.words || [];
      return fullCat;
    });
  } else {
    kategorie = flashcards.getCategorySummaries(userId).map(cat => {
      const fullCat = flashcards.getCategory(cat.id, userId);
      fullCat.words = fullCat.words || [];
      return fullCat;
    });
  }
  res.render("formularz", { title: "Formularz", kategorie, errors: [] });
});

app.get("/formularz/kategoria/dodaj", auth.login_required, (req, res) => {
  res.render("dodajkat", { title: "Dodawanie kategorii" });
});

app.post("/formularz/kategoria/dodaj", auth.login_required, (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;
  const categories = flashcards.getCategorySummaries(userId);
  const newId = `kat_${userId}_${categories.length + 1}`;
  try {
    flashcards.addCategory(newId, name, userId);
    res.redirect("/formularz"); 
  } catch (err) {
    const kategorie = flashcards.getCategorySummaries(userId);
    res.render("formularz", { title: "Formularz", kategorie });
  }
});

app.get("/formularz/haslo/dodaj", auth.login_required, (req, res) => {
  const isAdmin = req.user.is_admin;
  const userId = req.user.id;
  
  let kategorie;
  if (isAdmin) {
    kategorie = flashcards.getCategorySummariesAdmin().map(cat => {
      const fullCat = flashcards.getCategoryAdmin(cat.id);
      fullCat.words = fullCat.words || [];
      return fullCat;
    });
  } else {
    kategorie = flashcards.getCategorySummaries(userId).map(cat => {
      const fullCat = flashcards.getCategory(cat.id, userId);
      fullCat.words = fullCat.words || [];
      return fullCat;
    });
  }
  res.render("dodajhaslo", { title: "Zarządzanie hasłami", kategorie });
});

app.post("/formularz/haslo/dodaj", auth.login_required, (req, res) => {
  const { categoryId, text } = req.body;
  flashcards.addWord(categoryId, text, req.user.id);
  res.redirect("/formularz");
});

app.post("/formularz/haslo/edytuj", auth.login_required, (req, res) => {
  const { id, categoryId, text } = req.body;
  if (req.user.is_admin) {
    flashcards.deleteWordAdmin(id);
  } else {
    flashcards.deleteWord(id, req.user.id);
  }
  flashcards.addWord(categoryId, text, req.user.id); 
  res.redirect("/formularz");
});


app.use((req, res) => res.status(404).send("Strona nie istnieje"));

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));