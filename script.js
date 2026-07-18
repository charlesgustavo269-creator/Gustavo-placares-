const API_KEY = "cb6cfc4960ec49edb8a04af5975ab816";
let jogos = [];

// Carrega os jogos assim que o site abre
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
            console.warn("Tentativa falhou, tentando o próximo...");
        }
    }
    msg.innerHTML = "Erro ao conectar. Tente mais tarde.";
}

function mostrarJogos() {
    const container = document.getElementById("jogos");
    let html = "";
    
    jogos.forEach(jogo => {
        html += `
        <div style="background:#1e1e1e;padding:15px;margin:10px;border-radius:8px;color:white;box-shadow:0 4px 6px rgba(0,0,0,0.3);">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="width:40%;text-align:center;color:#2ecc71;font-weight:bold;">${jogo.homeTeam.shortName || jogo.homeTeam.name}</div>
                <div style="width:20%;text-align:center;background:#2d2d2d;padding:5px;border-radius:5px;">${jogo.score.fullTime.home ?? 0} - ${jogo.score.fullTime.away ?? 0}</div>
                <div style="width:40%;text-align:center;color:#2ecc71;font-weight:bold;">${jogo.awayTeam.shortName || jogo.awayTeam.name}</div>
            </div>
        </div>`;
    });

    if (container.innerHTML !== html) {
        container.innerHTML = html;
    }
}

// Atualiza a cada 60 segundos
setInterval(carregarJogos, 60000);
