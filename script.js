let allPokemon = [];            // Speichert ALLE Pokémon aus der API (nur Name + URL)
                                // Wird einmal beim Start gefüllt und dann immer wieder benutzt

let startIndex = 0;             // Zeigt, ab welchem Pokémon wir gerade anzeigen
                                // Beispiel: 0 = erstes Pokémon
                                // 25 = zweiter Block

let isSearching = false;        // true = User sucht gerade
                                // false = normale Ansicht


let isLoading = false;          // true = gerade am Laden → verhindert mehrfaches Klicken


let pokemonDetailsCache = {};   // Speicher für Detaildaten (Cache)
                                // Vorteil: Weniger Internet → schneller


let currentPokemonIndex = 0;    // Welches Pokémon ist im Dialog gerade offen?
                                // Wird für Links/Rechts Navigation benutzt


let lastScrollPosition = 0;      // Merkt sich die Scroll-Position der Seite
                                 // Damit wir nach dem Dialog wieder dorthin springen



async function fetchData() {                               //Diese Funktion startet dein Programm , async bedeutet: „Hier drin benutze ich await“.
  
                                                            // Startzustand: keine Suche aktiv

  isSearching = false;                                      // Sicherstellen: Suche aus
  updateBackButton();

  const response = await fetch(
    "https://pokeapi.co/api/v2/pokemon?limit=1000&offset=0",
  );                                                                    //Hier schicken wir eine Anfrage an die PokéAPI.
                                                                        // fetch holt Daten aus dem Internet.
                                                                        // await heißt: „Warte, bis die Antwort da ist“.
                                                                        // Ohne await wäre die Antwort noch leer.

  const responseAsJson = await response.json();                         //Die Antwort kommt als Text.
                                                                        //json() wandelt sie in ein JavaScript-Objekt um.
                                                                        //Jetzt können wir damit arbeiten.

  allPokemon = responseAsJson.results;                                  // Wir speichern nur die results-Liste Dort stehen Name + URL

  renderPokemon(responseAsJson);                                        // Erste Karten anzeigen
}

function renderSinglePokemon(pokemon, detailData) {                     // Diese Funktion erstellt eine einzelne Pokémon-Karte
                                                                        // und fügt sie in den HTML-Container ein.
                                                                        // Sie kombiniert Basisdaten (Name, URL)
                                                                        // mit Detaildaten (Bild, Typen, Infos).

  const content = document.getElementById("content");                   // Holt das HTML-Element,
                                                                        // in dem alle Pokémon-Karten angezeigt werden

  const id = pokemon.url.split("/")[6];                                 // Extrahiert die Pokémon-ID aus der API-URL
                                                                        // Beispiel:
                                                                        // "https://pokeapi.co/api/v2/pokemon/25/"
                                                                        // → ["https:", "", "pokeapi.co", "api", "v2", "pokemon", "25", ""]
                                                                        // → Index 6 = "25"

  const imageUrl =
    detailData.sprites.other["official-artwork"].front_default;          // Holt das offizielle Pokémon-Bild
                                                                         // aus den verschachtelten API-Daten

  const types = detailData.types;                                        // Holt alle Typen des Pokémon (z.B. fire, water)
                                                                         // Wird später für Farben und Labels benutzt

  content.innerHTML += createPokemonCard({                               //nimmt die daten aus dem templates.js
    id,                                                                  // Pokémon-Nummer
    name: pokemon.name,                                                  // Pokémon-Name
    imageUrl,                                                            // Bild-URL
    types,                                                               // Typen-Liste
    url: pokemon.url,                                                    // API-Link für Details
  });
}

async function getPokemonDetails(url) {               // Prüft zuerst, ob die Detaildaten dieses Pokémon
                                                      // bereits im Cache gespeichert wurden
                                                      // → Wenn ja, sparen wir einen neuen API-Aufruf

  if (pokemonDetailsCache[url]) {
    return pokemonDetailsCache[url];                  // Gibt gespeicherte Daten zurück
  }

  const response = await fetch(url);                  // Falls noch nicht im Cache:
                                                      // Neue Anfrage an die API senden

  const data = await response.json();                 // Antwort in ein JavaScript-Objekt umwandeln

  pokemonDetailsCache[url] = data;                    // Die geladenen Daten im Cache speichern,
                                                      // damit sie beim nächsten Mal sofort verfügbar sind

  return data;                                        // Daten an den Aufrufer zurückgeben
}

function clearContent(append) {
  const content = document.getElementById("content"); // Holt das Haupt-Container-Element,
                                                      // in dem alle Pokémon-Karten stehen

  if (!append) {                                      // Wenn append = false ist,
                                                      // sollen alte Karten gelöscht werden

    content.innerHTML = "";                           // Container leeren
  }
                                                      // Wenn append = true ist,
                                                      // bleibt der Inhalt erhalten
}

async function renderPokemon(responseAsJson, append = false) {                // Diese Funktion zeigt Pokémon als Karten auf der Webseite an.
                                                                              // Sie lädt immer maximal 25 Pokémon auf einmal.
                                                                              // append = false → Alte Karten löschen (neue Ansicht)
                                                                              // append = true  → Neue Karten anhängen (Load More)


  clearContent(append);                                                       // Löscht alte Karten, falls append = false ist

  let end = Math.min(startIndex + 25, responseAsJson.results.length);         // Berechnet, bis zu welchem Index angezeigt werden soll
                                                                              // startIndex + 25 → maximal 25 Pokémon pro Seite
                                                                              // Math.min → verhindert, dass wir über das Array-Ende gehen

  for (let i = startIndex; i < end; i++) {                                    // Schleife über den aktuellen Bereich der Pokémon-Liste
                                                                              // → Pagination (Seitenweises Laden)

    const pokemon = responseAsJson.results[i];                                // Holt das aktuelle Pokémon aus der Ergebnisliste

    const detailData = await getPokemonDetails(pokemon.url);                  // Lädt die Detaildaten dieses Pokémon (Bild, Typ, Stats)
                                                                              // Nutzt dabei den Cache, falls vorhanden

    renderSinglePokemon(pokemon, detailData);                                  // Erstellt eine Karte für dieses Pokémon
                                                                              // und fügt sie ins HTML ein
  }
}

fetchData(); // Beim Start automatisch laden

function getSearchText() {
  const input = document.getElementById("pokemonName");       // Holt das Suchfeld aus dem HTML

  return input.value.toLowerCase().trim();                    // Gibt den Text zurück:
                                                              // - klein geschrieben (toLowerCase)
                                                              // - ohne Leerzeichen am Rand (trim)
}

function resetSearchView() {                                  // Setzt die Ansicht nach einer Suche
                                                              // wieder in den Standard-Zustand zurück
                                                              // → Alle Pokémon anzeigen
                                                              // → Suche deaktivieren
  isSearching = false;
  startIndex = 0;

  renderPokemon({ results: allPokemon });
  checkLoadMore();
  updateBackButton();
}

function filterPokemon(searchText) {                            // Durchsucht alle Pokémon nach Namen,
                                                                // die den Suchtext enthalten

  return allPokemon.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchText)             // Prüft bei jedem Pokémon:
                                                                // Kommt der Suchtext im Namen vor?
  );
}

function showSearchResults(filtered) {
  const noResult = document.getElementById("noResultText");     // Holt den Text für "Kein Ergebnis"

  if (filtered.length === 0) {                                  // Wenn keine Treffer vorhanden sind
    noResult.classList.remove("hidden");                        // Zeigt die "Kein Ergebnis"-Meldung
  } else {
    noResult.classList.add("hidden");                           // Versteckt die Meldung wieder
  }

  renderPokemon({ results: filtered });                          // Zeigt die gefilterten Pokémon an
  checkLoadMore();                                               // Aktualisiert den Load-Button
  updateBackButton();                                            // Aktualisiert den Zurück-Button
}

function searchPokemon() {

  const searchText = getSearchText();                             // Holt den aktuellen Suchtext

  if (searchText.length < 3) {                                    // Wenn weniger als 3 Buchstaben eingegeben wurden

    resetSearchView();                                            // Suche abbrechen und normale Ansicht zeigen
    return;                                                       // Funktion beenden
  }

  isSearching = true;                                             // Suchmodus aktivieren
  startIndex = 0;                                                 // Liste wieder von vorne starten

  const filtered = filterPokemon(searchText);                     // Pokémon filtern

  showSearchResults(filtered);                                    // Gefilterte Ergebnisse anzeigen
}

async function loadMore() {
                                                                  // Diese Funktion wird aufgerufen, 
                                                                  // // wenn der User auf den "Load More"-Button klickt.
                                                                  // async bedeutet:// → Wir benutzen hier await
                                                                  // → Die Funktion arbeitet mit asynchronen Vorgängen (z.B. API, sleep)

  if (isLoading) return;                                            // Wenn schon geladen wird → abbrechen
                                                                    // Verhindert Bug durch Spam-Klick

  isLoading = true;                                                 // → Wir sind gerade am Laden. // → Weitere Klicks sollen ignoriert werden.

  const btn = document.getElementById("loadMoreBtn");               // Wir holen den "Load More"-Button aus dem HTML.

  const loadingWrapper = document.getElementById("loadingWrapper"); // Wir holen den Wrapper, der den Spinner enthält.
                                                                    // (Also die Ladeanimation)

  
  btn.disabled = true;                                            // Button sperren // disabled = true bedeutet:

  btn.innerText = "Loading...";                                   // ändern text im Button, es passiert gerade was (Loading es Lädt....)

  loadingWrapper.classList.remove("hidden");                      //Spinner anzeigen
                                                                  //Die Klasse "hidden" versteckt das Element.
                                                                  // remove("hidden") macht es sichtbar.
                                                                  // Jetzt sieht der User eine Ladeanimation.

  await sleep(1000);                                              // Mini-Wartezeit 1sek (UX)

  startIndex += 25;                                               // Erhöht den Startindex um 25,
                                                                  // damit beim nächsten Rendern die nächsten Pokémon geladen werden

  await renderPokemon({ results: allPokemon }, true);             // Wir rufen renderPokemon erneut auf.
                                                                  // Das zweite Argument = true das bedeutet: 
                                                                  // Nicht alles löschen Sondern neue Karten anhängen
                                                                  // append = true

  isLoading = false;                                              // Reset und Der Button darf wieder benutzt werden.

  btn.disabled = false;                                           // button wieder aktiv
  btn.innerText = "Next 25 Pokémon ";                             // text zurücksetzen
  loadingWrapper.classList.add("hidden");                         // spinner wieder verstecken

  checkLoadMore();
  updateBackButton();
}

function sleep(ms) {                                              // Diese Funktion erstellt eine künstliche Pause für 
                                                                  // async/await Funktionen. ms = Millisekunden (1000 = 1 Sekunde)
  
  return new Promise((resolve) => setTimeout(resolve, ms));       // setTimeout wartet ms Millisekunden Danach wird resolve() aufgerufen
}

function checkLoadMore() {                                        // Prüft, ob der "Load More"-Button
                                                                  // angezeigt oder versteckt werden soll
  
 const btn = document.getElementById("loadMoreBtn");              // Wir holen uns den "Load More"-Button aus dem HTML.
                                                                  // Über diesen Button lädt der User weitere Pokémon nach.
                                                                  // Ohne diese Referenz könnten wir den Button // weder anzeigen noch verstecken.

  if (isSearching) {
    btn.style.display = "none";                                   // Wenn gesucht wird,
                                                                  // verstecken wir den Button komplett.

    return;                                                        // Wir beenden hier die Funktion sofort.
  }

  if (startIndex + 25 >= allPokemon.length) {                      // Jetzt prüfen wir, ob wir bereits am Ende der Pokémon-Liste angekommen sind.
   

    btn.style.display = "none";                                    // Wenn wir am Ende sind, gibt es nichts mehr zu laden. Deshalb verstecken wir den Button.
  } else {
    btn.style.display = "block";                                   // Wenn wir NICHT am Ende sind, Es gibt noch weitere Pokémon Der User kann weiterladen Deshalb zeigen wir den Button an.
  }
}

function openDialogWindow(content) {
  content.innerHTML = "Loading...";                                 // Zeigt zunächst "Loading..." im Dialog an

  lastScrollPosition = window.scrollY;                              // Speichert aktuelle Scrollposition
  dialog.showModal();                                               // Öffnet das Dialog-Fenster

  document.body.style.overflow = "hidden";                          // Verhindert Scrollen im Hintergrund
}

async function getDialogData(url) {                                 // Diese Funktion lädt die Detaildaten eines Pokémon
                                                                    // für das Dialog-Fenster.
                                                                    // Sie nutzt einen Cache, damit bereits geladene Daten
                                                                    // nicht erneut aus dem Internet geladen werden müssen.

  if (pokemonDetailsCache[url]) {                                   // Prüft zuerst, ob für diese URL bereits Daten
                                                                    // im Cache gespeichert wurden

    return pokemonDetailsCache[url];                                // Wenn ja:
                                                                    // → sofort die gespeicherten Daten zurückgeben
                                                                    // → kein neuer API-Aufruf notwendig
                                                                    // → spart Zeit und Internet
  }

  const res = await fetch(url);                                     // Falls die Daten noch NICHT im Cache sind:
                                                                    // Neue Anfrage an die PokéAPI senden

  const data = await res.json();                                    // Die Antwort der API (Text) in ein JavaScript-Objekt umwandeln

  pokemonDetailsCache[url] = data;                                  // Die geladenen Daten im Cache speichern
                                                                    // Der Schlüssel ist die URL
                                                                    // Der Wert sind die Pokémon-Daten

  return data;                                                      // Die geladenen Daten an die aufrufende Funktion zurückgeben
}

function setDialogStyle(data) { 
  dialog.classList.remove(...dialog.classList);                     // Entfernt alle bisherigen CSS-Klassen vom Dialog,
                                                                    // damit keine alten Typ-Farben übrig bleiben


  const mainType = data.types[0].type.name;                         // Holt den Haupt-Typ des Pokémon (z.B. fire, water)

  dialog.classList.add("type-" + mainType);                         // Fügt eine neue Klasse hinzu:
                                                                    // z.B. "type-fire"
}

async function loadSpeciesData(url) {

  const res = await fetch(url);                                       // Sendet Anfrage an Species-API
  return await res.json();                                            // Antwort in JSON umwandeln
}

async function openDialog(url) {

  currentPokemonIndex = allPokemon.findIndex(p => p.url === url);     // Sucht die Position des Pokémon in der Liste
                                                                      // → wird für Navigation benutzt

  const content = document.getElementById("dialogContent");           // Holt den Dialog-Inhalt-Container

  if (!dialog) return console.error("Dialog not found!");             // Falls Dialog fehlt → Fehler anzeigen

  openDialogWindow(content);                                          // Öffnet Dialog + zeigt Ladeanzeige

  const data = await getDialogData(url);                              // Lädt Pokémon-Daten

  const speciesData = await loadSpeciesData(data.species.url);        // Lädt Zusatzinfos (Beschreibung usw.)

  setDialogStyle(data);                                               // Setzt das Farb-Design

  content.innerHTML = createPokemonDialog(                            // Baut den Dialog-Inhalt zusammen und holt die daten aus Templates.js
    data,
    speciesData,
    createStatsTemplate(data.stats)
  );

  updateDialogNav();                                                      // Aktualisiert Pfeil-Buttons
}

function showPrevPokemon() {                                              // Diese Funktion zeigt das vorherige Pokémon im Dialog an
  
  if (currentPokemonIndex > 0) {                                          // Prüfen: Gibt es ein Pokémon davor?
    
    currentPokemonIndex--;                                                // Einen Schritt zurück in der Liste gehen
    openDialog(allPokemon[currentPokemonIndex].url);                      // Dialog mit dem vorherigen Pokémon neu öffnen
  }
                                                                          // Wenn wir beim ersten Pokémon sind (Index 0),
                                                                          // passiert nichts → kein Fehler
}

function showNextPokemon() {
  if (currentPokemonIndex < allPokemon.length - 1) {                        // Prüfen: Gibt es noch ein Pokémon nach dem aktuellen?
    
    currentPokemonIndex++;                                                  // Einen Schritt nach vorne in der Liste gehen
    openDialog(allPokemon[currentPokemonIndex].url);                        // Dialog mit dem nächsten Pokémon neu öffnen
  }
                                                                            // Wenn wir beim letzten Pokémon sind,
                                                                            // passiert nichts → kein Fehler
}

function closeDialog() {                                                    // Dialog schließ funktion
  

  document.body.style.overflow = "auto";                                    // Scrollen auf der Hauptseite wieder erlauben

  document.getElementById("pokemonDialog").close();                         // Dialog-Fenster schließen

  window.scrollTo(0, lastScrollPosition);                                    // Zur alten Scroll-Position zurückspringen
}

const dialog = document.getElementById("pokemonDialog");                     // Dialog-Element aus dem HTML holen


dialog.addEventListener("click", (event) => {                                // Klick-Event für den Dialog
  if (event.target === dialog) {                                             // Prüfen: Wurde auf den Hintergrund geklickt (nicht auf den Inhalt)?
    
    closeDialog();                                                           // Dann Dialog schließen
  }
});

document.addEventListener("keydown", (event) => {                             // Tastatur-Steuerung (Keyboard Controls)
  
  const dialog = document.getElementById("pokemonDialog");                    // Dialog erneut holen

  
  if (!dialog.open) return;                                                   // Nur reagieren, wenn der Dialog offen ist

  if (event.key === "ArrowLeft") {                                            // Linke Pfeiltaste → vorheriges Pokémon
    showPrevPokemon();
  }

  if (event.key === "ArrowRight") {                                           // Rechte Pfeiltaste → nächstes Pokémon
    showNextPokemon();
  }

  if (event.key === "Escape") {                                               // Escape-Taste → Dialog schließen
    closeDialog();
  }
});

function showAbout() {                                                        // Diese Funktion zeigt den "About"-Tab an
  

  document.getElementById("aboutTab").classList.remove("hidden");             // About-Bereich sichtbar machen
  document.getElementById("statsTab").classList.add("hidden");                // Stats-Bereich verstecken

  setActiveTab(0);                                                            // About-Button als aktiv markieren
}

function showStats() {                                                        // Diese Funktion zeigt den "Stats"-Tab an

  document.getElementById("aboutTab").classList.add("hidden");                // About-Bereich verstecken
  document.getElementById("statsTab").classList.remove("hidden");             // Stats-Bereich sichtbar machen

  setActiveTab(1);                                                            // Stats-Button als aktiv markieren
}

function setActiveTab(index) {                                                // Diese Funktion markiert den aktiven Tab-Button

  const buttons = document.querySelectorAll(".tab-btn");                      // Alle Tab-Buttons aus dem HTML holen

  buttons.forEach((btn, i) => {                                               // Durch alle Buttons gehen
    
  btn.classList.toggle("active", i === index);                                // classList.toggle("active", ...)
                                                                              // bedeutet:
                                                                              // Wenn die Bedingung true ist → Klasse hinzufügen
                                                                              // Wenn die Bedingung false ist → Klasse entfernen
                                                                              // i === index prüft:
                                                                              // Ist dieser Button der aktive?
  
  });
}

function resetSearch() {                                                        // Diese Funktion setzt die Suche komplett zurück und zeigt wieder alle Pokémon an
     

  const input = document.getElementById("pokemonName");                        // Suchfeld aus dem HTML holen

  const noResult = document.getElementById("noResultText");                    // "Kein Ergebnis"-Text holen

  input.value = "";                                                            // Suchfeld leeren
  noResult.classList.add("hidden");                                            // Fehlermeldung verstecken

  isSearching = false;                                                         // Suchmodus deaktivieren
  startIndex = 0;                                                              // Liste wieder beim Anfang starten

  renderPokemon({ results: allPokemon });                                      // Alle Pokémon neu anzeigen
  checkLoadMore();                                                             // Load-More-Button prüfen
  updateBackButton();                                                          // Back-Button aktualisieren

  window.scrollTo({ top: 0, behavior: "smooth" });                             // Seite sanft nach oben scrollen
}

function updateBackButton() {                                                   // Diese Funktion steuert, ob der "Zurück zur Liste"-Button sichtbar ist

  const backBtn = document.getElementById("searchBackWrapper");                 // Back-Button aus dem HTML holen

  if (isSearching) {
    // Prüfen: Wird gerade gesucht?
    backBtn.classList.remove("hidden");                                         // Wenn ja → Button anzeigen
  } else {
    backBtn.classList.add("hidden");                                            // Wenn nein → Button verstecken
  }
}

function updateDialogNav() {
  const prevBtn = document.getElementById("prevBtn");                           // Holt Vor -Button
  const nextBtn = document.getElementById("nextBtn");                           // Holt Zurück-Button

  prevBtn.disabled = currentPokemonIndex === 0;                                 // Deaktiviert "Zurück", wenn erstes Pokémon
  nextBtn.disabled = currentPokemonIndex === allPokemon.length - 1;             // Deaktiviert "Weiter", wenn letztes Pokémon
}
