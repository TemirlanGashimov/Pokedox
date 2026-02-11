let allPokemon = [];
let startIndex = 0;
let isSearching = false;
let isLoading = false;
let pokemonDetailsCache = {};
let currentPokemonIndex = 0;
let lastScrollPosition = 0;

async function fetchData() {
  //Diese Funktion startet dein Programm , async bedeutet: „Hier drin benutze ich await“.

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

  renderPokemon(responseAsJson); // Wie geben die Daten an eine andere Funktion weiter, diese soll die pokemon anzeigen

  isSearching = false;
  updateBackButton();
}

async function renderPokemon(responseAsJson, append = false) {
  // Diese Funktion baut die Karten.
  //Sie ist auch async, weil wir darin nochmal fetch benutzen.

  updateBackButton();

  const contentRef = document.getElementById("content"); //Wir holen uns das <div id="content"> aus dem HTML.
  //Dort kommen alle Pokémon rein.

  if (!append) {
    contentRef.innerHTML = ""; //Wir löschen vorher alles.
  } //Damit keine doppelten Karten entstehen.

  let end = startIndex + 25;

  if (end > responseAsJson.results.length) {
    end = responseAsJson.results.length;
  }

  for (let i = startIndex; i < end; i++) {
    const pokemon = responseAsJson.results[i]; //Wir holen ein einzelnes Pokémon aus der Liste.
    //Jetzt haben wir ein Objekt

    const name = pokemon.name; //Wir speichern den Namen
    const url = pokemon.url; // Wir speichern die Dateil URL, In dieser URL sind Bilder Typ Status usw.
    const id = url.split("/")[6];

    let detailData;

    if (pokemonDetailsCache[url]) {
      // 🧠 Daten sind schon da → aus dem Speicher holen
      detailData = pokemonDetailsCache[url];
    } else {
      // 🌐 Noch nicht da → aus dem Internet laden
      const detailResponse = await fetch(url);
      detailData = await detailResponse.json();

      // Im Cache speichern
      pokemonDetailsCache[url] = detailData;
    }

    // 👉 Bild holen
    const imageUrl = detailData.sprites.other["official-artwork"].front_default; //Das ist der wichtigste Teil, Hier holen wir den Bild-Link.

    const types = detailData.types;

    contentRef.innerHTML += createPokemonCard({
      id,
      name,
      imageUrl,
      types,
      url,
    });
  }
}
fetchData();

function searchPokemon() {
  const input = document.getElementById("pokemonName");
  const searchText = input.value.toLowerCase().trim();

  const noResult = document.getElementById("noResultText");
  noResult.classList.add("hidden");

  // Zu kurz → Hauptliste
  if (searchText.length < 3) {
    isSearching = false;
    startIndex = 0;

    renderPokemon({ results: allPokemon });
    checkLoadMore();
    updateBackButton();
    return;
  }

  // Suche aktiv
  isSearching = true;
  startIndex = 0;

  const filtered = allPokemon.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchText),
  );

  if (filtered.length === 0) {
    noResult.classList.remove("hidden");
  }

  renderPokemon({ results: filtered });
  checkLoadMore();
  updateBackButton();
}

async function loadMore() {
  if (isLoading) return;

  isLoading = true;

  const btn = document.getElementById("loadMoreBtn");
  const loadingWrapper = document.getElementById("loadingWrapper");

  // Anzeige starten
  btn.disabled = true;
  btn.innerText = "Loading...";
  loadingWrapper.classList.remove("hidden");

  // Optional: kleine Wartezeit
  await sleep(1000);

  startIndex += 25;

  await renderPokemon({ results: allPokemon }, true);

  // Fertig
  isLoading = false;

  btn.disabled = false;
  btn.innerText = "Next 25 Pokémon ";
  loadingWrapper.classList.add("hidden");

  checkLoadMore();
  updateBackButton();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function checkLoadMore() {
  const btn = document.getElementById("loadMoreBtn");

  if (isSearching) {
    btn.style.display = "none";
    return;
  }

  if (startIndex + 25 >= allPokemon.length) {
    btn.style.display = "none";
  } else {
    btn.style.display = "block";
  }
}

async function openDialog(url) {
  currentPokemonIndex = allPokemon.findIndex((p) => p.url === url);

  const dialog = document.getElementById("pokemonDialog");
  const content = document.getElementById("dialogContent");

  if (!dialog) {
    console.error("Dialog not found!");
    return;
  }

  content.innerHTML = "Loading...";

  lastScrollPosition = window.scrollY;
  dialog.showModal();

  document.body.style.overflow = "hidden";

  let data;

  if (pokemonDetailsCache[url]) {
    data = pokemonDetailsCache[url];
  } else {
    const res = await fetch(url);
    data = await res.json();
    pokemonDetailsCache[url] = data;
  }

  dialog.classList.remove(...dialog.classList);
  const mainType = data.types[0].type.name;
  dialog.classList.add("type-" + mainType);

  const typeBadges = data.types
    .map((t) => `<span class="type">${t.type.name}</span>`)
    .join("");

  const speciesRes = await fetch(data.species.url);
  const speciesData = await speciesRes.json();

  const height = data.height / 10;
  const weight = data.weight / 10;

  const abilities = data.abilities
    .map((a) => a.ability.name) // <-- FIX
    .join(", ");

  const species = speciesData.name;

  const eggGroups = speciesData.egg_groups.map((e) => e.name).join(", ");

  const eggCycle = speciesData.hatch_counter;

  let gender = "Unknown";

  if (speciesData.gender_rate === -1) {
    gender = "Genderless";
  } else {
    gender = "Male / Female";
  }

  const img = data.sprites.other["official-artwork"].front_default;

const statsHtml = createStatsTemplate(data.stats);

content.innerHTML = createPokemonDialog(
  data,
  speciesData,
  statsHtml
);
}
function showPrevPokemon() {
  if (currentPokemonIndex > 0) {
    currentPokemonIndex--;
    openDialog(allPokemon[currentPokemonIndex].url);
  }
}

function showNextPokemon() {
  if (currentPokemonIndex < allPokemon.length - 1) {
    currentPokemonIndex++;
    openDialog(allPokemon[currentPokemonIndex].url);
  }
}

function closeDialog() {
  document.body.style.overflow = "auto";

  document.getElementById("pokemonDialog").close();

  window.scrollTo(0, lastScrollPosition);
}

const dialog = document.getElementById("pokemonDialog");

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    closeDialog();
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

function showAbout() {
  document.getElementById("aboutTab").classList.remove("hidden");
  document.getElementById("statsTab").classList.add("hidden");

  setActiveTab(0);
}

function showStats() {
  document.getElementById("aboutTab").classList.add("hidden");
  document.getElementById("statsTab").classList.remove("hidden");

  setActiveTab(1);
}

function setActiveTab(index) {
  const buttons = document.querySelectorAll(".tab-btn");

  buttons.forEach((btn, i) => {
    btn.classList.toggle("active", i === index);
  });
}

function resetSearch() {
  const input = document.getElementById("pokemonName");
  const noResult = document.getElementById("noResultText");

  input.value = "";
  noResult.classList.add("hidden");

  isSearching = false;
  startIndex = 0;

  renderPokemon({ results: allPokemon });
  checkLoadMore();
  updateBackButton();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateBackButton() {
  const backBtn = document.getElementById("searchBackWrapper");

  if (isSearching) {
    backBtn.classList.remove("hidden");
  } else {
    backBtn.classList.add("hidden");
  }
}
