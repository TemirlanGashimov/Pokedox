async function fetchData() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon/ditto');
    const responseAsJson = await response.json();

    renderPokemon(responseAsJson);   
}

function renderPokemon(responseAsJson){
    const contentRef = document.getElementById('');

    responseAsJson.forEach(abilities => {
        const name = abilities.name;

        console.log(name);
        
    });
}