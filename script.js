// Speichert ALLE Pokémon aus der API (nur Name + URL)
// Wird einmal beim Start gefüllt und dann immer wieder benutzt
let allPokemon = [];

// Zeigt, ab welchem Pokémon wir gerade anzeigen
// Beispiel: 0 = erstes Pokémon
// 25 = zweiter Block
let startIndex = 0;

// true = User sucht gerade
// false = normale Ansicht
let isSearching = false;

// true = gerade am Laden → verhindert mehrfaches Klicken
let isLoading = false;

// Speicher für Detaildaten (Cache)
// Vorteil: Weniger Internet → schneller
let pokemonDetailsCache = {};

// Welches Pokémon ist im Dialog gerade offen?
// Wird für Links/Rechts Navigation benutzt
let currentPokemonIndex = 0;

// Merkt sich die Scroll-Position der Seite
// Damit wir nach dem Dialog wieder dorthin springen
let lastScrollPosition = 0;

async function fetchData() {
//Diese Funktion startet dein Programm , async bedeutet: „Hier drin benutze ich await“.

// Startzustand: keine Suche aktiv
  isSearching = false;
  updateBackButton();

  const response = await fetch(
    "https://pokeapi.co/api/v2/pokemon?limit=1000&offset=0",
  ); //Hier schicken wir eine Anfrage an die PokéAPI.
  // fetch holt Daten aus dem Internet.
  // await heißt: „Warte, bis die Antwort da ist“.
  // Ohne await wäre die Antwort noch leer.

  const responseAsJson = await response.json(); //Die Antwort kommt als Text.
  //json() wandelt sie in ein JavaScript-Objekt um.
  //Jetzt können wir damit arbeiten.

  allPokemon = responseAsJson.results;
   // Wir speichern nur die results-Liste
  // Dort stehen Name + URL

  renderPokemon(responseAsJson); // Erste Karten anzeigen

  isSearching = false; // Sicherstellen: Suche aus
  updateBackButton();
}

async function renderPokemon(responseAsJson, append = false) {
  // Diese Funktion baut die Karten.
  //Sie ist auch async, weil wir darin nochmal fetch benutzen.

  updateBackButton();

  const contentRef = document.getElementById("content"); //Wir holen uns das <div id="content"> aus dem HTML.
  //Dort kommen alle Pokémon rein.

// Wenn append = false:
  // → Alte Karten löschen
  // → Neu anfangen
  if (!append) { 
    contentRef.innerHTML = ""; 
  } 

  let end = startIndex + 25; // Endindex berechnen (25 pro Seite)

  if (end > responseAsJson.results.length) { // Falls wir am Ende sind → begrenzen
    end = responseAsJson.results.length;
  }

  for (let i = startIndex; i < end; i++) { // Schleife über aktuelle Seite
    const pokemon = responseAsJson.results[i];  // Einzelnes Pokémon aus der Liste

    const name = pokemon.name; // Name holen
    const url = pokemon.url; // Wir speichern die Dateil URL, In dieser URL sind Bilder Typ Status usw. // API-URL holen
    const id = url.split("/")[6]; // ID aus URL extrahieren

    let detailData;

    if (pokemonDetailsCache[url]) { // Prüfen: Gibt es die Daten schon im Cache?
      // Daten sind schon da → aus dem Speicher holen
      detailData = pokemonDetailsCache[url]; // Ja → aus Speicher holen
    } else {
      // Noch nicht da → aus dem Internet laden
      const detailResponse = await fetch(url); // Nein → aus API laden
      detailData = await detailResponse.json();

      // Im Cache speichern
      pokemonDetailsCache[url] = detailData;
    }

    // Bild aus der API holen
    const imageUrl = detailData.sprites.other["official-artwork"].front_default; //Das ist der wichtigste Teil, Hier holen wir den Bild-Link. // Offizielles Artwork holen

    const types = detailData.types; // Pokémon-Typen

    contentRef.innerHTML += createPokemonCard({ // Karte erstellen und einfügen
      id,
      name,
      imageUrl,
      types,
      url,
    });
  }
}
fetchData(); // Beim Start automatisch laden

function searchPokemon() {
  const input = document.getElementById("pokemonName"); // Wir holen uns das Input-Feld aus dem HTML,
                                                        // in das der User den Pokémon-Namen eintippt.

  const searchText = input.value.toLowerCase().trim();  // Hier holen wir den Text aus dem Input-Feld.
                                                        // input.value = das, was der User eingegeben hat.
    // Danach machen wir zwei wichtige Sachen:  // 1) toLowerCase() //    → Macht alle Buchstaben klein,    //damit "Pika", "PIKA" und "pika" gleich behandelt werden. //  // 2) trim()
  //    → Entfernt Leerzeichen am Anfang und Ende,


  const noResult = document.getElementById("noResultText"); // Wir holen uns das HTML-Element,
                                                            // das angezeigt wird, wenn keine Pokémon gefunden wurden.
                                                            // Beispiel: "No Pokémon found"
  noResult.classList.add("hidden");
  // Am Anfang verstecken wir diese Meldung immer.
  // Grund:
  // Vielleicht gibt es diesmal ein Ergebnis,
  // dann soll die alte Fehlermeldung nicht mehr sichtbar sein

  // Wenn zu kurz → normale Liste
  if (searchText.length < 3) { // Jetzt prüfen wir: // Hat der User weniger als 3 Zeichen eingegeben? // Unter 3 Zeichen starten wir keine Suche,
                                // damit die App nicht unnötig rechnet
                                // und die Ergebnisse nicht chaotisch werden.

    isSearching = false;    // Wir sagen dem Programm:
                            // "Wir sind NICHT im Suchmodus"

    startIndex = 0; // Wir setzen den Startpunkt der Liste wieder auf 0,
                    // damit wir wieder beim ersten Pokémon anfangen.

    renderPokemon({ results: allPokemon }); // Wir zeigen wieder ALLE Pokémon an,
                                            // weil keine echte Suche aktiv ist.

    checkLoadMore();    // Wir prüfen, ob der "Load More"-Button
                        // sichtbar sein soll oder nicht.

    updateBackButton(); // Wir aktualisieren den Zurück-Button,
                        // damit er korrekt ein- oder ausgeblendet wird.


    return;     // Hier beenden wir die Funktion sofort.
                // Alles darunter wird NICHT mehr ausgeführt.
                // Ohne return würde der Such-Code unten trotzdem laufen
                // und Fehler verursachen.
  }

  // Suche aktiv
  isSearching = true;
  startIndex = 0;

  const filtered = allPokemon.filter((pokemon) => // Pokémon filtern // filter() geht durch jedes Pokémon in allPokemon 
                                                   // und prüft, ob es zum Suchtext passt. // Nur passende Pokémon bleiben im neuen Array "filtered".
    
     
    pokemon.name.toLowerCase().includes(searchText),    // 1) Name klein machen
                                                        // 2) Prüfen, ob der Suchtext enthalten ist
  );

  if (filtered.length === 0) {          // Jetzt prüfen wir:
                                        // Haben wir GAR kein passendes Pokémon gefunden?

    noResult.classList.remove("hidden");    // "Keine Ergebnisse gefunden"
  }

  renderPokemon({ results: filtered });     // Jetzt zeigen wir die gefilterten Pokémon an,
                                            // also nur die, die zur Suche passen.
  checkLoadMore();
  updateBackButton();
}

async function loadMore() {
    
    // Diese Funktion wird aufgerufen,
  // wenn der User auf den "Load More"-Button klickt.
  // async bedeutet:
  // → Wir benutzen hier await
  // → Die Funktion arbeitet mit asynchronen Vorgängen (z.B. API, sleep)

  if (isLoading) return; // Wenn schon geladen wird → abbrechen
                        // Verhindert Bug durch Spam-Klick

  isLoading = true; // → Wir sind gerade am Laden. // → Weitere Klicks sollen ignoriert werden.

  const btn = document.getElementById("loadMoreBtn"); // Wir holen den "Load More"-Button aus dem HTML.
  const loadingWrapper = document.getElementById("loadingWrapper"); // Wir holen den Wrapper, der den Spinner enthält.
                                                                    // (Also die Ladeanimation)

  // Button sperren // disabled = true bedeutet:
  btn.disabled = true;

  btn.innerText = "Loading..."; // ändern text im Button, es passiert gerade was (Loading es Lädt....)

  loadingWrapper.classList.remove("hidden");
    //Spinner anzeigen
    //Die Klasse "hidden" versteckt das Element.
  // remove("hidden") macht es sichtbar.
  // Jetzt sieht der User eine Ladeanimation.

  
  await sleep(1000); // Mini-Wartezeit 1sek (UX)

  startIndex += 25; // Wir gehen 25 weiter
                    // Nächste Pokémon

  await renderPokemon({ results: allPokemon }, true);
  // Wir rufen renderPokemon erneut auf.
  // Das zweite Argument = true das bedeutet: Nicht alles löschen Sondern neue Karten anhängen
  // append = true

  
  isLoading = false; // Reset und Der Button darf wieder benutzt werden.

  btn.disabled = false; // button wieder aktiv 
  btn.innerText = "Next 25 Pokémon "; // text zurücksetzen 
  loadingWrapper.classList.add("hidden"); //spinner wieder verstecken 

  checkLoadMore();
  updateBackButton();
}

function sleep(ms) { // Diese Funktion erstellt eine künstliche Pause für async/await Funktionen. ms = Millisekunden (1000 = 1 Sekunde)
  return new Promise((resolve) => setTimeout(resolve, ms));// setTimeout wartet ms Millisekunden Danach wird resolve() aufgerufen
}

function checkLoadMore() {
  const btn = document.getElementById("loadMoreBtn"); // Wir holen uns den "Load More"-Button aus dem HTML.
                                                    // Über diesen Button lädt der User weitere Pokémon nach.
                                                    // Ohne diese Referenz könnten wir den Button // weder anzeigen noch verstecken.

  if (isSearching) {  
    btn.style.display = "none"; // Wenn gesucht wird,
                                // verstecken wir den Button komplett. 

    return; // Wir beenden hier die Funktion sofort.
  }

  if (startIndex + 25 >= allPokemon.length) { // Jetzt prüfen wir, ob wir bereits am Ende der Pokémon-Liste angekommen sind.

    btn.style.display = "none";// Wenn wir am Ende sind, gibt es nichts mehr zu laden. Deshalb verstecken wir den Button.
  } else {
    btn.style.display = "block";// Wenn wir NICHT am Ende sind, Es gibt noch weitere Pokémon Der User kann weiterladen Deshalb zeigen wir den Button an.
  }
}

async function openDialog(url) {
  currentPokemonIndex = allPokemon.findIndex((p) => p.url === url); // Wir suchen den Index des angeklickten Pokémon
                                                                    // in der gesamten Pokémon-Liste.
                                                                    // Das brauchen wir später für:
                                                                    // → Vor / Zurück Navigation im Dialog

  const dialog = document.getElementById("pokemonDialog"); // Wir holen uns das Dialog-Fenster aus dem HTML
  const content = document.getElementById("dialogContent"); // Hier kommt später der Inhalt des Dialogs rein

  if (!dialog) { // Falls der Dialog im HTML nicht existiert, // brechen wir ab, damit kein Fehler entsteht.
    console.error("Dialog not found!");
    return;
  }

  content.innerHTML = "Loading..."; // Ladeanzeige

  lastScrollPosition = window.scrollY; // Wir merken uns die aktuelle Scroll-Position der Seite,damit wir später wieder genau dorthin zurückspringen können.
  dialog.showModal(); // Dialog öffnen

  document.body.style.overflow = "hidden"; // Wir deaktivieren das Scrollen im Hintergrund, damit der User nur den Dialog benutzt.

  let data; // Variable für Pokémon-Daten

  if (pokemonDetailsCache[url]) { // Prüfen, ob wir diese Pokémon-Daten schon gespeichert haben
    data = pokemonDetailsCache[url]; // Wenn ja → aus dem Cache holen (schneller)
  } else {
    const res = await fetch(url); // Wenn nein → aus der API laden
    data = await res.json();
    pokemonDetailsCache[url] = data; // Für später speichern
  }

  dialog.classList.remove(...dialog.classList); // Alle alten CSS-Klassen vom Dialog entfernen, damit keine falschen Farben übrig bleiben.
  const mainType = data.types[0].type.name; // Wir holen den Haupt-Typ des Pokémon
  dialog.classList.add("type-" + mainType); // Wir setzen eine CSS-Klasse basierend auf dem Typ, damit der Dialog farbig angepasst wird.

  const typeBadges = data.types // Wir erstellen kleine Typ-Badges (HTML)
    .map((t) => `<span class="type">${t.type.name}</span>`)
    .join("");

// Zusätzliche Infos (Species) von einer anderen API laden
  const speciesRes = await fetch(data.species.url); 
  const speciesData = await speciesRes.json();

  const height = data.height / 10; // Größe in Meter umrechnen
  const weight = data.weight / 10; // Gewicht in Kilogramm umrechnen

  // Fähigkeiten auslesen und als Text zusammenfügen
  const abilities = data.abilities 
    .map((a) => a.ability.name)
    .join(", ");

  const species = speciesData.name; // Art-Name holen

  const eggGroups = speciesData.egg_groups.map((e) => e.name).join(", "); // Ei-Gruppen holen und zusammenfügen

  const eggCycle = speciesData.hatch_counter; // Brut-Zyklus (Hatch Counter)

  let gender = "Unknown"; // Geschlecht vorbereiten


  // Wenn gender_rate = -1 → kein Geschlecht
  if (speciesData.gender_rate === -1) {
    gender = "Genderless";
  } else {
    gender = "Male / Female";
  }

  const img = data.sprites.other["official-artwork"].front_default; // Offizielles Pokémon-Bild holen

const statsHtml = createStatsTemplate(data.stats); // Stats-HTML erzeugen (Balken usw.)

content.innerHTML = createPokemonDialog( // Jetzt bauen wir den kompletten Dialog-Inhalt und setzen ihn ins HTML ein
  data,
  speciesData,
  statsHtml
);
}
function showPrevPokemon() { // Diese Funktion zeigt das vorherige Pokémon im Dialog an
  if (currentPokemonIndex > 0) { // Prüfen: Gibt es ein Pokémon davor?
    currentPokemonIndex--; // Einen Schritt zurück in der Liste gehen
    openDialog(allPokemon[currentPokemonIndex].url); // Dialog mit dem vorherigen Pokémon neu öffnen
  }
    // Wenn wir beim ersten Pokémon sind (Index 0),
    // passiert nichts → kein Fehler
}

function showNextPokemon() {
  if (currentPokemonIndex < allPokemon.length - 1) { // Prüfen: Gibt es noch ein Pokémon nach dem aktuellen?
    currentPokemonIndex++; // Einen Schritt nach vorne in der Liste gehen
    openDialog(allPokemon[currentPokemonIndex].url); // Dialog mit dem nächsten Pokémon neu öffnen
  }
  // Wenn wir beim letzten Pokémon sind,
  // passiert nichts → kein Fehler
}

function closeDialog() { //Dialog schließ funktion 

  document.body.style.overflow = "auto";  // Scrollen auf der Hauptseite wieder erlauben
  
  document.getElementById("pokemonDialog").close();// Dialog-Fenster schließen

  window.scrollTo(0, lastScrollPosition);  // Zur alten Scroll-Position zurückspringen
}

const dialog = document.getElementById("pokemonDialog"); // Dialog-Element aus dem HTML holen

// Klick-Event für den Dialog
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {// Prüfen: Wurde auf den Hintergrund geklickt (nicht auf den Inhalt)?
    closeDialog(); // Dann Dialog schließen
  }
});

document.addEventListener("keydown", (event) => { // Tastatur-Steuerung (Keyboard Controls)
  const dialog = document.getElementById("pokemonDialog"); // Dialog erneut holen

  // Nur reagieren, wenn der Dialog offen ist
  if (!dialog.open) return;

  if (event.key === "ArrowLeft") { // Linke Pfeiltaste → vorheriges Pokémon
    showPrevPokemon();
  }

  if (event.key === "ArrowRight") { // Rechte Pfeiltaste → nächstes Pokémon
    showNextPokemon();
  }

  if (event.key === "Escape") { // Escape-Taste → Dialog schließen
    closeDialog();
  }
});

function showAbout() { // Diese Funktion zeigt den "About"-Tab an

  document.getElementById("aboutTab").classList.remove("hidden"); // About-Bereich sichtbar machen
  document.getElementById("statsTab").classList.add("hidden"); // Stats-Bereich verstecken

  setActiveTab(0); // About-Button als aktiv markieren
}

function showStats() { // Diese Funktion zeigt den "Stats"-Tab an

  document.getElementById("aboutTab").classList.add("hidden"); // About-Bereich verstecken
  document.getElementById("statsTab").classList.remove("hidden"); // Stats-Bereich sichtbar machen

  setActiveTab(1); // Stats-Button als aktiv markieren
} 

function setActiveTab(index) {  // Diese Funktion markiert den aktiven Tab-Button

  const buttons = document.querySelectorAll(".tab-btn"); // Alle Tab-Buttons aus dem HTML holen

  buttons.forEach((btn, i) => { // Durch alle Buttons gehen

    btn.classList.toggle("active", i === index);
    // classList.toggle("active", ...)
    // bedeutet:
    // Wenn die Bedingung true ist → Klasse hinzufügen
    // Wenn die Bedingung false ist → Klasse entfernen
    // i === index prüft:
    // Ist dieser Button der aktive?
  });
}

function resetSearch() {    // Diese Funktion setzt die Suche komplett zurück und zeigt wieder alle Pokémon an


  const input = document.getElementById("pokemonName"); // Suchfeld aus dem HTML holen

  const noResult = document.getElementById("noResultText"); // "Kein Ergebnis"-Text holen

  input.value = ""; // Suchfeld leeren
  noResult.classList.add("hidden"); // Fehlermeldung verstecken

  isSearching = false; // Suchmodus deaktivieren
  startIndex = 0; // Liste wieder beim Anfang starten

  renderPokemon({ results: allPokemon }); // Alle Pokémon neu anzeigen
  checkLoadMore(); // Load-More-Button prüfen
  updateBackButton(); // Back-Button aktualisieren

  window.scrollTo({ top: 0, behavior: "smooth" }); // Seite sanft nach oben scrollen
} 

function updateBackButton() { // Diese Funktion steuert, ob der "Zurück zur Liste"-Button sichtbar ist

  const backBtn = document.getElementById("searchBackWrapper"); // Back-Button aus dem HTML holen

  if (isSearching) { // Prüfen: Wird gerade gesucht?
    backBtn.classList.remove("hidden"); // Wenn ja → Button anzeigen
  } else {
    backBtn.classList.add("hidden"); // Wenn nein → Button verstecken
  }
}
