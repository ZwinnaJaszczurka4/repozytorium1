import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("./db.sqlite", { readBigInts: true });
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    category_id INTEGER PRIMARY KEY,
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    UNIQUE(id, user_id)
  ) STRICT;

  CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    user_id INTEGER NOT NULL
  ) STRICT;
`);

const db_ops = {
  insert_category: db.prepare(
    `INSERT INTO categories (id, name, user_id) VALUES (?, ?, ?) RETURNING category_id, id, name, user_id;`
  ),
  insert_word: db.prepare(
    `INSERT INTO words (category_id, text, user_id) VALUES (?, ?, ?) RETURNING id, category_id, text, user_id;`
  ),
  insert_word_by_category_id: db.prepare(
    `INSERT INTO words (category_id, text, user_id) VALUES (
      (SELECT category_id FROM categories WHERE id = ? AND user_id = ?),
      ?,
      ?
    ) RETURNING id, category_id, text, user_id;`
  ),
  get_categories: db.prepare("SELECT id, name FROM categories WHERE user_id = ?;"),
  get_categories_public: db.prepare("SELECT DISTINCT id, name FROM categories;"),
  get_categories_all: db.prepare("SELECT id, name, user_id FROM categories;"),
  get_category_by_id: db.prepare("SELECT category_id, id, name, user_id FROM categories WHERE id = ? AND user_id = ?;"),
  get_category_by_id_public: db.prepare("SELECT category_id, id, name, user_id FROM categories WHERE id = ?;"),
  get_category_by_id_all: db.prepare("SELECT category_id, id, name, user_id FROM categories WHERE id = ?;"),
  get_words_by_category_id: db.prepare("SELECT id, text FROM words WHERE category_id = ? AND user_id = ?;"),
  get_words_by_category_id_public: db.prepare("SELECT id, text FROM words WHERE category_id = ?;"),
  get_words_by_category_id_all: db.prepare("SELECT id, text, user_id FROM words WHERE category_id = ?;"),
  get_word_by_id: db.prepare("SELECT id, category_id, text, user_id FROM words WHERE id = ?;"),
  get_category_by_category_id: db.prepare("SELECT category_id, id, name, user_id FROM categories WHERE category_id = ?;"),
  delete_word_by_id: db.prepare("DELETE FROM words WHERE id = ? AND user_id = ?;"),
  delete_word_by_id_admin: db.prepare("DELETE FROM words WHERE id = ?;"),
  delete_category_by_id: db.prepare("DELETE FROM categories WHERE category_id = ? AND user_id = ?;"),
};

const hasla_kategorie = {
  "zwierzeta-domowe": { name: "Zwierzęta domowe", hasla: ["kot", "pies", "mysz", "krowa", "byk"] },
  "kolory": { name: "Kolory", hasla: ["czerwony", "zielony", "niebieski", "fioletowy", "czarny"] },
};

if (process.env.POPULATE_DB) {
  for (const [id, data] of Object.entries(hasla_kategorie)) {
    const category = db_ops.insert_category.get(id, data.name, 0);
    for (const word of data.hasla) {
      db_ops.insert_word.get(category.category_id, word, 0);
    }
  }
}


export function getCategorySummaries(userId) {
  return db_ops.get_categories.all(userId);
}

export function getCategorySummariesPublic() {
  return db_ops.get_categories_public.all();
}

export function getCategorySummariesAdmin() {
  return db_ops.get_categories_all.all();
}

export function hasCategory(categoryId, userId) {
  return !!db_ops.get_category_by_id.get(categoryId, userId);
}

export function getCategory(categoryId, userId) {
  const category = db_ops.get_category_by_id.get(categoryId, userId);
  if (!category) return null;
  category.words = db_ops.get_words_by_category_id.all(category.category_id, userId);
  return category;
}

export function getCategoryPublic(categoryId) {
  const category = db_ops.get_category_by_id_public.get(categoryId);
  if (!category) return null;
  category.words = db_ops.get_words_by_category_id_public.all(category.category_id);
  return category;
}

export function getCategoryAdmin(categoryId) {
  const category = db_ops.get_category_by_id_all.get(categoryId);
  if (!category) return null;
  category.words = db_ops.get_words_by_category_id_all.all(category.category_id);
  return category;
}

export function addCategory(id, name, userId) {
  return db_ops.insert_category.get(id, name, userId);
}

export function addWord(categoryId, text, userId) {
  return db_ops.insert_word_by_category_id.get(categoryId, userId, text, userId);
}

export function deleteWord(wordId, userId) {
  return db_ops.delete_word_by_id.run(wordId, userId);
}

export function deleteWordAdmin(wordId) {
  return db_ops.delete_word_by_id_admin.run(wordId);
}

export function deleteCategory(categoryId, userId) {
  return db_ops.delete_category_by_id.run(categoryId, userId);
}

export default {
  getCategorySummaries,
  getCategorySummariesPublic,
  getCategorySummariesAdmin,
  hasCategory,
  getCategory,
  getCategoryPublic,
  getCategoryAdmin,
  addCategory,
  addWord,
  deleteWord,
  deleteWordAdmin,
  deleteCategory,
  db,
};