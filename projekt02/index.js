import express from "express";

const port = 8000;
const hasla = ["kot", "pies", "mysz"];

function losowanieslowa(max){
  let cyfra= Math.floor(Math.random() * max);
  let slowo = hasla[cyfra];
  return slowo;
}

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/hasla", (req, res) => {
  res.render("hasla", {
    title: "Kategorie",
    categories: hasla,
  });
});

app.get("/gramy", (req, res) => {
  res.render("gramy", {
    title: "Gramy",
    haslo: losowanieslowa(hasla.length), 
  });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});