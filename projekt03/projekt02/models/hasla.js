import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("./db.sqlite");

db.exec(`
CREATE TABLE IF NOT EXISTS kategorie (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hasla (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kategoria_id TEXT NOT NULL,
  slowo TEXT NOT NULL,
  FOREIGN KEY(kategoria_id) REFERENCES kategorie(id)
);
`);

const isEmpty = db.prepare("SELECT COUNT(*) AS count FROM kategorie").get().count === 0;

if (isEmpty) {
  console.log("Tworzę przykładowe dane...");
  db.prepare("INSERT INTO kategorie (id, name) VALUES (?, ?)").run("zwierzeta-domowe", "Zwierzęta domowe");
  db.prepare("INSERT INTO kategorie (id, name) VALUES (?, ?)").run("kolory", "Kolory");

  const insertHaslo = db.prepare("INSERT INTO hasla (kategoria_id, slowo) VALUES (?, ?)");
  ["kot", "pies", "mysz"].forEach(h => insertHaslo.run("zwierzeta-domowe", h));
  ["czerwony", "zielony", "niebieski", "żółty", "czarny"].forEach(h => insertHaslo.run("kolory", h));
}

export default db;