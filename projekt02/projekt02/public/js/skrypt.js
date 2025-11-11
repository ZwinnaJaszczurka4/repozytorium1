let odsloniete = ""; 
let licznik = 0;     

document.addEventListener("DOMContentLoaded", () => {
        start();
});
function start() {
    const hasloElement = document.getElementById("slowo");
    const haslo = hasloElement.dataset.haslo;

    odsloniete = "x".repeat(haslo.length);
    licznik = 0;

    document.getElementById("kreski").textContent = odsloniete;
    document.getElementById("wynik").textContent = "";
}

function sprawdz(){
    const hasloElement = document.getElementById("slowo"); 
    const litera = document.getElementById("litera").value; 
    const haslo = hasloElement.dataset.haslo;

    let trafiona = false;

    let myArray = odsloniete.split("");

    for (let i = 0; i < haslo.length; i++) {
        if (litera == haslo[i] && myArray[i] == "x") {
            myArray[i] = litera;
            licznik++;
            trafiona = true;
        }
    }

    odsloniete = myArray.join("");
    document.getElementById("kreski").textContent = odsloniete;

    let wynik = document.getElementById("wynik");

    if (trafiona) {
        wynik.textContent = "Gratulacje! Literka " + litera + " znajduje się w hasle!";
    } else {
        wynik.textContent = "Niestety, nie ma litery " + litera + " w hasle!";
    }

    if (licznik == haslo.length) {
        wynik.textContent = "Koniec gry! Wygrales!";
    }
}