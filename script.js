let allPokemon = [];
let startIndex = 0;
let isSearching = false; 
let isLoading = false;
let pokemonDetailsCache = {};
let currentPokemonIndex = 0;

function createPokemonCard({ id, name, imageUrl, types, url }) {

    const firstType = types[0].type.name;

    let typeHtml = `<span class="type">${firstType}</span>`;

    if (types.length > 1) {
        typeHtml += `<span class="type">${types[1].type.name}</span>`;
    }

    return `
        <div class="card type-${firstType}" onclick="openDialog('${url}')">

            <div class="card-style-h3-p">
                <p>#${id}</p>
                <h3>${name}</h3>
            </div>

            <img src="${imageUrl}" width="150">

            <div class="types">
                ${typeHtml}
            </div>

        </div>
    `;
}
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
    

        let detailData;

        if (pokemonDetailsCache[url]) {
             // 🧠 Daten sind schon da → aus dem Speicher holen
        detailData = pokemonDetailsCache[url];
        }else {
             // 🌐 Noch nicht da → aus dem Internet laden
        const detailResponse = await fetch(url);
        detailData = await detailResponse.json();

            // Im Cache speichern
        pokemonDetailsCache[url] = detailData;
        }

        // 👉 Bild holen
        const imageUrl =
            detailData.sprites.other["official-artwork"].front_default; //Das ist der wichtigste Teil, Hier holen wir den Bild-Link.

        const types = detailData.types;

        contentRef.innerHTML += createPokemonCard({
            id,
            name,
            imageUrl,
            types,
            url
        });
    }
}
fetchData();


function searchPokemon() {

    const input = document.getElementById("pokemonName");
    const searchText = input.value.toLowerCase().trim();

    const noResult = document.getElementById("noResultText");

    noResult.style.display = "none";

    if (searchText.length <3) {
        isSearching = false;
        startIndex = 0;

        renderPokemon({results: allPokemon});
        checkLoadMore();
        return;
    }

    isSearching = true; 
    startIndex = 0;
    
    const filtered = allPokemon.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchText)
    );

    if (filtered.length === 0) {
        noResult.innerText = "No Pokémon found";
        noResult.style.display = "block";
    }

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

async function openDialog(url) {

    currentPokemonIndex = allPokemon.findIndex(p => p.url === url);

    const dialog = document.getElementById("pokemonDialog");
    const content = document.getElementById("dialogContent");

    if (!dialog) {
        console.error("Dialog not found!");
        return;
    }

    content.innerHTML = "Loading...";

    dialog.showModal();

    document.body.style.overflow = "hidden";

    let data;

    if ( pokemonDetailsCache[url]) {
        data = pokemonDetailsCache[url];
    } else {

    const res = await fetch(url);
    data = await res.json();

    pokemonDetailsCache[url] = data;
}

    const speciesRes = await fetch(data.species.url);
    const speciesData = await speciesRes.json();

    const height = data.height / 10;
    const weight = data.weight / 10;

    const abilities = data.abilities
        .map(a => a.ability.name)   // <-- FIX
        .join(", ");

    const species = speciesData.name;

    const eggGroups = speciesData.egg_groups
        .map(e => e.name)
        .join(", ");

    const eggCycle = speciesData.hatch_counter;

    let gender = "Unknown";

    if (speciesData.gender_rate === -1) {
        gender = "Genderless";
    } else {
        gender = "Male / Female";
    }

    const img = data.sprites.other["official-artwork"].front_default;

    let statsHtml = "";
let total = 0;

data.stats.forEach(stat => {
    const value = stat.base_stat;
    const name = stat.stat.name.toUpperCase();

    total += value;

    const barWidth = (value / 200) * 100;

    statsHtml += `
        <div class="stat-row">
            <span class="stat-name">${name}</span>
            <span class="stat-value">${value}</span>
            <div class="stat-bar">
                <div class="stat-bar-fill" style="width:${barWidth}%"></div>
            </div>
        </div>
    `;
});

statsHtml += `
    <div class="stat-row total">
        <span class="stat-name">TOTAL</span>
        <span class="stat-value">${total}</span>
    </div>
`;

    content.innerHTML = ` 
    <h2>#${data.id} ${data.name}</h2>
    <img src="${img}" width="200">
<div>
    <div>
    <h3>About</h3>
    <p><b>Species:</b> ${species}</p>
    <p><b>Height:</b> ${height} m</p>
    <p><b>Weight:</b> ${weight} kg</p>
    <p><b>Abilities:</b> ${abilities}</p>

    <h3>Breeding</h3>
    <p><b>Gender:</b> ${gender}</p>
    <p><b>Egg Groups:</b> ${eggGroups}</p>
    <p><b>Egg Cycle:</b> ${eggCycle}</p>
 </div>   
    <div>
    <h3>Base Stats</h3>
    ${statsHtml}
    </div>
    </div>
    <div class="dialog-nav">
     <button onclick="showPrevPokemon()">⬅️</button>
     <button onclick="showNextPokemon()">➡️</button>
     </div>
`;
}
function showPrevPokemon(){
    if (currentPokemonIndex > 0){
        currentPokemonIndex--;
        openDialog(allPokemon[currentPokemonIndex].url);
    }
}

function showNextPokemon(){
    if (currentPokemonIndex < allPokemon.length - 1) {
        currentPokemonIndex++;
        openDialog(allPokemon[currentPokemonIndex].url);
    }
}


function closeDialog(){

    document.body.style.overflow = "auto";

    document.getElementById("pokemonDialog").close();
}

const dialog = document.getElementById("pokemonDialog");

dialog.addEventListener("click", (event)=>{
    if (event.target === dialog) {
        dialog.close();
    }
});

document.addEventListener("keydown", (event) => {

    const dialog = document.getElementById("pokemonDialog");

    // Nur wenn Dialog offen ist
    if (!dialog.open) return;

    if (event.key === "ArrowLeft") {
        showPrevPokemon();
    }

    if (event.key === "ArrowRight") {
        showNextPokemon();
    }

    if (event.key === "Escape") {
        closeDialog();
    }
});


