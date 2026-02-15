// ====// CARD TEMPLATE// ====

function createPokemonCard({ id, name, imageUrl, types, url }) {  // Diese Funktion erstellt den HTML-Code für eine einzelne Pokémon-Karte
  const firstType = types[0].type.name; // Wir holen den ersten Typ des Pokémon

  let typeHtml = `<span class="type">${firstType}</span>`; // Wir erstellen den HTML-Code für den ersten Typ

  if (types.length > 1) { // Prüfen: Hat das Pokémon einen zweiten Typ?
    typeHtml += `<span class="type">${types[1].type.name}</span>`; // Wenn ja → zweiten Typ hinzufügen
  }

  // Wir geben den fertigen HTML-Code zurück
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

function createStatsTemplate(stats) {// Diese Funktion erstellt den HTML-Code für die Statistik-Anzeige eines Pokémon

  let total = 0; // Hier speichern wir die Summe aller Werte (Total)
  let html = ""; // In dieser Variable sammeln wir den HTML-Code

  stats.forEach(stat => { // Wir gehen durch alle Stats des Pokémon
    const value = stat.base_stat; // Basis-Wert des jeweiligen Stats holen
    const name = stat.stat.name.toUpperCase(); // Namen des Stats holen und groß schreiben

    total += value; // Wert zur Gesamt-Summe addieren

    const barWidth = (value / 200) * 100; // Breite für den Balken berechnen (in Prozent) 200 = angenommener Max-WertBeispiel: 100 / 200 * 100 = 50%

    html += `
      <div class="stat-row">
        <span class="stat-name">${name}</span>
        <span class="stat-value">${value}</span>
        <div class="stat-bar">
          <div 
            class="stat-bar-fill" 
            style="width:${barWidth}%">
          </div>
        </div>
      </div>
    `;
  });

  // Nach allen Stats fügen wir die Gesamt-Summe hinzu
  html += `
    <div class="stat-row total">
      <span class="stat-name">TOTAL</span>
      <span class="stat-value">${total}</span>
    </div>
  `;
// Fertigen HTML-Code zurückgeben
  return html;
}

// ====// DIALOG TEMPLATE// ====

function createPokemonDialog(data, speciesData, statsHtml) { // Diese Funktion erstellt den kompletten HTML-Code für das Pokémon-Dialogfenster

  // Wir bauen die Typ-Badges (fire, water, etc.)
  // und fassen sie zu einem HTML-String zusammen
  const typeBadges = data.types
    .map(t => `<span class="type">${t.type.name}</span>`)
    .join("");

    // Wir geben den fertigen Dialog als HTML-String zurück
  return `

<div class="dialog-header"> 
  <button class="dialog-close" onclick="closeDialog()">X</button>

  <h2>
    <span class="poke-id">#${data.id}</span>
    <span class="poke-name">
      ${data.name.charAt(0).toUpperCase() + data.name.slice(1)}
    </span>
  </h2>

  <img src="${data.sprites.other["official-artwork"].front_default}" width="180">

  <div class="dialog-types">
    ${typeBadges}
  </div>

  <div class="dialog-tabs">
    <button class="tab-btn active" onclick="showAbout()">About</button>
    <button class="tab-btn" onclick="showStats()">Base Stats</button>
  </div>
</div>


<div class="dialog-body">

  <div id="aboutTab">

    <p><b>Species:</b> ${speciesData.name}</p>
    <p><b>Height:</b> ${data.height / 10} m</p>
    <p><b>Weight:</b> ${data.weight / 10} kg</p>

    <p><b>Abilities:</b> ${data.abilities
      .map(a => a.ability.name)
      .join(", ")}</p>

    <h3>Breeding</h3>

    <p><b>Gender:</b> ${
      speciesData.gender_rate === -1
        ? "Genderless"
        : "Male / Female"
    }</p>

    <p><b>Egg Groups:</b> ${
      speciesData.egg_groups.map(e => e.name).join(", ")
    }</p>

    <p><b>Egg Cycle:</b> ${speciesData.hatch_counter}</p>

  </div>


  <div id="statsTab" class="hidden">

    <h3>Base Stats</h3>

    ${statsHtml}

  </div>

</div>


<div class="dialog-nav">
  <button id="prevBtn" onclick="showPrevPokemon()">❮</button>
  <button id="nextBtn" onclick="showNextPokemon()">❯</button>
</div>

`;
}