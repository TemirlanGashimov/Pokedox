// ====// CARD TEMPLATE// ====

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

function createStatsTemplate(stats) {
  let total = 0;
  let html = "";

  stats.forEach(stat => {
    const value = stat.base_stat;
    const name = stat.stat.name.toUpperCase();

    total += value;

    const barWidth = (value / 200) * 100;

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

  html += `
    <div class="stat-row total">
      <span class="stat-name">TOTAL</span>
      <span class="stat-value">${total}</span>
    </div>
  `;

  return html;
}

// ====// DIALOG TEMPLATE// ====

function createPokemonDialog(data, speciesData, statsHtml) {

  const typeBadges = data.types
    .map(t => `<span class="type">${t.type.name}</span>`)
    .join("");

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
  <button onclick="showPrevPokemon()">❮</button>
  <button onclick="showNextPokemon()">❯</button>
</div>

`;
}