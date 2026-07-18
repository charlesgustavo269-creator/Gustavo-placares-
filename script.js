const API_KEY = "cb6cfc4960ec49edb8a04af5975ab816";
let jogos = [];

window.onload = carregarJogos;

async function carregarJogos() {
    const msg = document.getElementById("status-msg");
    const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent('https://api.football-data.org/v4/matches')}`,
        `https://corsproxy.io/?https://api.football-data.org/v4/matches`
    ];

    for (let url of proxies) {
        try {
            const resposta = await fetch(url, { headers: { "X-Auth-Token": API_KEY } });
            let data;
            
            if (url.includes("allorigins")) {
                const temp = await resposta.json();
                data = JSON.parse(temp.contents);
            } else {
                data = await resposta.json();
            }

            if (data.matches) {
                jogos = data.matches;
                mostrarJogos();
                return;
            }
        } catch (e) {
            console.warn("Proxy falhou, tentando o próximo...");
        }
    }
    msg.innerHTML = "Erro ao conectar. Tente mais tarde.";
}

function mostrarJogos() {
    const container = document.getElementById("jogos");
    let html = "";
    
    jogos.forEach(jogo => {
        const timeCasa = jogo.homeTeam.shortName || jogo.homeTeam.name;
        const timeFora = jogo.awayTeam.shortName || jogo.awayTeam.name;
        
        html += `
        <div style="background:#1e1e1e; padding:20px 10px; margin:10px auto; border-radius:12px; color:white; display:flex; justify-content:space-between; align-items:center; max-width: 90%;">
            <div style="width:35%; text-align:center; font-weight:bold; color:#2ecc71; font-size:14px;">${timeCasa}</div>
            
            <div style="width:20%; text-align:center; background:#2d2d2d; padding:8px 5px; border-radius:8px; font-weight:bold; font-size:16px;">
                ${jogo.score.fullTime.home ?? 0} - ${jogo.score.fullTime.away ?? 0}
            </div>
            
            <div style="width:35%; text-align:center; font-weight:bold; color:#2ecc71; font-size:14px;">${timeFora}</div>
        </div>`;
    });

    if (container.innerHTML !== html) {
        container.innerHTML = html;
    }
}

function filtrar(tipo) {
    // Adicione aqui a lógica de filtro se necessário
    console.log("Filtrando por:", tipo);
}

setInterval(carregarJogos, 60000);
