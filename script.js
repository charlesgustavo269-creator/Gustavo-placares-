const API_URL = "https://api.football-data.org/v4/matches";
const API_KEY = "cb6cfc4960ec49edb8a04af5975ab816"; // Sua chave aqui

async function carregarJogos() {
    try {
        const res = await fetch(API_URL, {
            headers: { "X-Auth-Token": API_KEY }
        });
        const data = await res.json();
        
        if (data.matches) {
            exibirJogos(data.matches);
        }
    } catch (err) {
        console.error("Erro ao atualizar:", err);
    }
}

function exibirJogos(listaJogos) {
    const container = document.getElementById("jogos");
    let html = "";

    listaJogos.forEach(jogo => {
        const statusTexto = jogo.status === "IN_PLAY" || jogo.status === "PAUSED" ? "🔴 AO VIVO" : "Finalizado";
        const corStatus = jogo.status === "IN_PLAY" || jogo.status === "PAUSED" ? "#e74c3c" : "#aaa";

        const escudoCasa = jogo.homeTeam.crest ? `<img src="${jogo.homeTeam.crest}" style="width:30px; height:30px; object-fit:contain;">` : '⚽';
        const escudoFora = jogo.awayTeam.crest ? `<img src="${jogo.awayTeam.crest}" style="width:30px; height:30px; object-fit:contain;">` : '⚽';

        html += `
        <div class="jogo-card">
            <div style="display:flex; flex-direction:column; align-items:center; width: 30%;">
                ${escudoCasa}
                <div class="time-nome">${jogo.homeTeam.shortName || jogo.homeTeam.name}</div>
            </div>
            
            <div style="text-align:center; width: 40%;">
                <div style="font-size:18px; font-weight:bold;">${jogo.score.fullTime.home ?? 0} - ${jogo.score.fullTime.away ?? 0}</div>
                <div style="font-size:10px; color:${corStatus}; font-weight:bold;">${statusTexto}</div>
            </div>
            
            <div style="display:flex; flex-direction:column; align-items:center; width: 30%;">
                ${escudoFora}
                <div class="time-nome">${jogo.awayTeam.shortName || jogo.awayTeam.name}</div>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

carregarJogos();
setInterval(carregarJogos, 30000);
