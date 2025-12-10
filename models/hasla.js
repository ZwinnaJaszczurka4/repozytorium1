import { DatabaseSync } from "node:sqlite";

const db_path = "./db.sqlite";
const db = new DatabaseSync(db_path);

console.log("Creating database tables");

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    category_id   INTEGER PRIMARY KEY,
    id            TEXT UNIQUE NOT NULL,
    name          TEXT NOT NULL
  ) STRICT;

  CREATE TABLE IF NOT EXISTS words (
    id            INTEGER PRIMARY KEY,
    category_id   INTEGER NOT NULL REFERENCES categories(category_id),
    text          TEXT NOT NULL
  ) STRICT;
`);

const db_ops = {
  insert_category: db.prepare(
    `INSERT INTO categories (id, name) VALUES (?, ?) RETURNING category_id, id, name;`
  ),
  insert_word: db.prepare(
    `INSERT INTO words (category_id, text) VALUES (?, ?) RETURNING id, category_id, text;`
  ),
  insert_word_by_category_id: db.prepare(
    `INSERT INTO words (category_id, text) VALUES (
      (SELECT category_id FROM categories WHERE id = ?),
      ?
    ) RETURNING id, category_id, text;`
  ),
  get_categories: db.prepare("SELECT id, name FROM categories;"),
  get_category_by_id: db.prepare("SELECT category_id, id, name FROM categories WHERE id = ?;"),
  get_words_by_category_id: db.prepare("SELECT id, text FROM words WHERE category_id = ?;"),
  delete_word_by_id: db.prepare("DELETE FROM words WHERE id = ?;"),
  delete_category_by_id: db.prepare("DELETE FROM categories WHERE category_id = ?;"),
};

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

if (process.env.POPULATE_DB) {
  console.log("Populating database...");

  Object.entries(hasla_kategorie).forEach(([id, data]) => {
    const category = db_ops.insert_category.get(id, data.name);
    console.log("Created category:", category);

    for (const word of data.hasla) {
      const w = db_ops.insert_word.get(category.category_id, word);
      console.log("Created word:", w);
    }
  });
}

export function getCategorySummaries() {
  return db_ops.get_categories.all();
}

export function hasCategory(categoryId) {
  return db_ops.get_category_by_id.get(categoryId) != null;
}

export function getCategory(categoryId) {
  const category = db_ops.get_category_by_id.get(categoryId);
  if (category) {
    category.words = db_ops.get_words_by_category_id.all(category.category_id);
    return category;
  }
  return null;
}

export function addCategory(id, name) {
  return db_ops.insert_category.get(id, name);
}

export function addWord(categoryId, text) {
  return db_ops.insert_word_by_category_id.get(categoryId, text);
}

export function deleteWord(wordId) {
  return db_ops.delete_word_by_id.run(wordId);
}

export function deleteCategory(categoryId) {
  return db_ops.delete_category_by_id.run(categoryId);
}

export default {
  getCategorySummaries,
  hasCategory,
  getCategory,
  addCategory,
  addWord,
  deleteWord,
  deleteCategory,
  db,
};