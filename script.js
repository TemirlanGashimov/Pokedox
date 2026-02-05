async function fetchData() {  //Diese Funktion startet dein Programm , async bedeutet: „Hier drin benutze ich await“.
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');  //Hier schicken wir eine Anfrage an die PokéAPI.
                                                                                 // fetch holt Daten aus dem Internet.
                                                                                 // await heißt: „Warte, bis die Antwort da ist“.
                                                                                 // Ohne await wäre die Antwort noch leer.

    const responseAsJson = await response.json();   //Die Antwort kommt als Text.
                                                    //json() wandelt sie in ein JavaScript-Objekt um.
                                                    //Jetzt können wir damit arbeiten.

    renderPokemon(responseAsJson);  // Wie geben die Daten an eine andere Funktion weiter, diese soll die pokemon anzeigen
}

async function renderPokemon(responseAsJson) {  // Diese Funktion baut die Karten.
                                                //Sie ist auch async, weil wir darin nochmal fetch benutzen.
    const contentRef = document.getElementById('content');  //Wir holen uns das <div id="content"> aus dem HTML.
                                                            //Dort kommen alle Pokémon rein.

    contentRef.innerHTML = "";  //Wir löschen vorher alles.
                                //Damit keine doppelten Karten entstehen.

    for (let i = 0; i < responseAsJson.results.length; i++) {  //Wir laufen durch alle Pokémon.
                                                                //results ist das Array mit name + url.
                                                                // length sagt: Wie viele es gibt.
                                                                //Die Schleife läuft also für jedes Pokémon einmal.

        const pokemon = responseAsJson.results[i];  //Wir holen ein einzelnes Pokémon aus der Liste.
                                                    //Jetzt haben wir ein Objekt

        const name = pokemon.name; //Wir speichern den Namen
        const url = pokemon.url; // Wir speichern die Dateil URL, In dieser URL sind Bilder Typ Status usw.
        const types = pokemon.types;

        // 👉 Details holen
        const detailResponse = await fetch(url);    //Wir rufen jetzt die Detail-URL auf.
                                                    //Das ist die zweite API-Anfrage.
                                                    //Wieder mit await, weil Internet Zeit braucht.

        const detailData = await detailResponse.json();  //Wir wandeln die Antwort wieder in ein Objekt um.
                                                        //Jetzt haben wir ALLE Infos über das Pokemon.

        // 👉 Bild holen
        const imageUrl =
            detailData.sprites.other["official-artwork"].front_default; //Das ist der wichtigste Teil, Hier holen wir den Bild-Link.

        // 👉 Anzeigen
        contentRef.innerHTML += `
            <div>
                <p>${name}</p>
                <img src="${imageUrl}" width="150">
            </div>
        `;
    }
}

fetchData();
