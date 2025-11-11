
function sprawdz(){
    const hasloElement = document.getElementById("slowo"); 
    const litera = document.getElementById("litera").value; 

    const haslo = hasloElement.dataset.haslo;
    let trwanie = true;
    let licznik = 0;
    let trafiona = false;

    let string = "";

    let wynik = document.getElementById("wynik");

    dlslowa = haslo.length;

    for (let i = 0; i < dlslowa; i++){
        string = string + "x";
    }

    let kreski = document.getElementById("kreski");
    kreski.textContent = string;

    console.log(string);
    console.log("haslo ", haslo);

    const myArray = string.split("");

    //while(trwanie){
        for (let i = 0; i < dlslowa; i++) {
            if (litera==haslo[i]){
                licznik++;
                myArray[i] = litera;
                trafiona = true;
            };
    };

    string = myArray.join("");


    if (trafiona){
        kreski.textContent = string;
        wynik.textContent = "Gratulacje! Literka " + litera + " znajduje sie w hasle!"; 
    }else{
        wynik.textContent = "Niestety, nie ma litery " + litera + " w hasle!";
    }

    if (licznik == dlslowa){
        
    }


    //};

};
