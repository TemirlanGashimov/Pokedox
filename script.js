let allPokemon = [];
let startIndex = 0;
let isSearching = false; 
let isLoading = false; 

async function fetchData() {  //Diese Funktion startet dein Programm , async bedeutet: „Hier drin benutze ich await“.
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000&offset=0');  //Hier schicken wir eine Anfrage an die PokéAPI.
                                                                                 // fetch holt Daten aus dem Internet.
                                                                                 // await heißt: „Warte, bis die Antwort da ist“.
                                                                                 // Ohne await wäre die Antwort noch leer.

    const responseAsJson = await response.json();   //Die Antwort kommt als Text.
                                                    //json() wandelt sie in ein JavaScript-Objekt um.
                                                    //Jetzt können wir damit arbeiten.
    
    allPokemon = responseAsJson.results;

    renderPokemon(responseAsJson);  // Wie geben die Daten an eine andere Funktion weiter, diese soll die pokemon anzeigen
}

async function renderPokemon(responseAsJson, append = false) {  // Diese Funktion baut die Karten.
                                                //Sie ist auch async, weil wir darin nochmal fetch benutzen.
    const contentRef = document.getElementById('content');  //Wir holen uns das <div id="content"> aus dem HTML.
                                                            //Dort kommen alle Pokémon rein.

    if (!append) {
        contentRef.innerHTML = "";  //Wir löschen vorher alles.
     }                              //Damit keine doppelten Karten entstehen.

     let end = startIndex +25;

     if (end > responseAsJson.results.length) {
        end = responseAsJson.results.length;
     }

     for (let i= startIndex; i < end; i++){


        const pokemon = responseAsJson.results[i];  //Wir holen ein einzelnes Pokémon aus der Liste.
                                                    //Jetzt haben wir ein Objekt

        const name = pokemon.name; //Wir speichern den Namen
        const url = pokemon.url; // Wir speichern die Dateil URL, In dieser URL sind Bilder Typ Status usw.
        const id = url.split("/")[6];
    

        // 👉 Details holen
        const detailResponse = await fetch(url);    //Wir rufen jetzt die Detail-URL auf.
                                                    //Das ist die zweite API-Anfrage.
                                                    //Wieder mit await, weil Internet Zeit braucht.

        const detailData = await detailResponse.json();  //Wir wandeln die Antwort wieder in ein Objekt um.
                                                        //Jetzt haben wir ALLE Infos über das Pokemon.

        // console.log("TYPES:", detailData.types);


        // 👉 Bild holen
        const imageUrl =
            detailData.sprites.other["official-artwork"].front_default; //Das ist der wichtigste Teil, Hier holen wir den Bild-Link.

        
        const types = detailData.types;

        const firstType = types[0].type.name;

        let typeHtml = `<span class="type">${firstType}</span>`;
        
        if (types.length > 1) {

            const secondType = types[1].type.name;
            typeHtml += `<span class="type">${secondType}</span>`
        }

        // 👉 Anzeigen
        contentRef.innerHTML += `

            <div class="card type-${firstType}">
            <div class="card-style-h3-p">
             <p> #${id} </p>
                <h3>${name}</h3> 
            </div>
                <img src="${imageUrl}" width="150">

                 <div class="types">
                    ${typeHtml}
                </div>
     

            </div>
        `;
    }
}
fetchData();


function searchPokemon() {

    const input = document.getElementById("pokemonName");
    const searchText = input.value.toLowerCase();

    if (searchText === "") {
        isSearching = false;
        startIndex = 0;
        renderPokemon({results: allPokemon});
        checkLoadMore();
        return;
    }

    startIndex = 0;
    isSearching = true; 

    const filtered = allPokemon.filter((pokemon) =>{
        return pokemon.name.toLowerCase().includes(searchText);
    });

renderPokemon({results: filtered});
checkLoadMore();
}


async function loadMore(){

    if (isLoading) return;

    isLoading = true;

    const btn = document.getElementById("loadMoreBtn");
    const loadingWrapper = document.getElementById("loadingWrapper");

    // Anzeige starten
    btn.disabled = true;
    btn.innerText = "Loading...";
    loadingWrapper.style.display = "block";

    // Optional: kleine Wartezeit
    await sleep(1000);

    startIndex += 25;

    await renderPokemon({ results: allPokemon }, true);

    // Fertig
    isLoading = false;

    btn.disabled = false;
    btn.innerText = "Load more";
    loadingWrapper.style.display = "none";

    checkLoadMore();
}



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function checkLoadMore() {

    const btn = document.getElementById("loadMoreBtn");

    if (isSearching){
        btn.style.display = "none";
        return;
    }

    if (startIndex +25 >= allPokemon.length) {
        btn.style.display = "none";
    }else {
        btn.style.display = "block";
    }
    
}