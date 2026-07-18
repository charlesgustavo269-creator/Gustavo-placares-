const API_KEY = "cb6cfc4960ec49edb8a04af5975ab816";

async function carregarJogos() {
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent('https://api.football-data.org/v4/matches')}`;
    try {
        const res = await fetch(url, { headers: { "X-Auth-Token": API_KEY } });
        const data = await res.json();
        const conteudo = JSON.parse(data.contents);
        
        if (conteudo.matches) {
            exibirJogos(conteudo.matches);
        }
    } catch (e) { 
        console.error("Erro na API:", e);
    }
}

function exibirJogos(listaJogos) {
    const container = document.getElementById("jogos");
    let html = "";

    listaJogos.forEach(jogo => {
        // Formata data e hora
        const dataJogo = new Date(jogo.utcDate);
        const dataFormatada = dataJogo.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const horaFormatada = dataJogo.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        // Define o status simples
        let statusTexto = `${dataFormatada} às ${horaFormatada}`;
        let corStatus = "#aaa";

        if (jogo.status === "IN_PLAY" || jogo.status === "PAUSED") {
            statusTexto = "🔴 AO VIVO";
            corStatus = "#e74c3c";
        } else if (jogo.status === "FINISHED") {
            statusTexto = "Fim de Partida";
            corStatus = "#e74c3c";
        }

        const escudoCasa = jogo.homeTeam.crest ? `<img src="${jogo.homeTeam.crest}" style="width:30px; height:30px; object-fit:contain;">` : '🛡️';
        const escudoFora = jogo.awayTeam.crest ? `<img src="${jogo.awayTeam.crest}" style="width:30px; height:30px; object-fit:contain;">` : '🛡️';

        html += `
        <div style="background:#1e1e1e; padding:15px; margin:15px; border-radius:12px; color:white;">
            <div style="font-size:12px; color:#aaa; margin-bottom:10px;">🏟️ ${jogo.competition.name}</div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="width:35%; text-align:center; font-weight:bold; display:flex; flex-direction:column; align-items:center;">
                    ${escudoCasa} <span>${jogo.homeTeam.shortName || jogo.homeTeam.name}</span>
                </div>
                <div style="text-align:center; width:30%;">
                    <div style="background:#2d2d2d; padding:8px 15px; border-radius:5px; font-size:18px;">
                        ${jogo.score.fullTime.home ?? 0} - ${jogo.score.fullTime.away ?? 0}
                    </div>
                    <div style="font-size:11px; margin-top:5px; color:${corStatus}; font-weight:bold;">${statusTexto}</div>
                </div>
                <div style="width:35%; text-align:center; font-weight:bold; display:flex; flex-direction:column; align-items:center;">
                    ${escudoFora} <span>${jogo.awayTeam.shortName || jogo.awayTeam.name}</span>
                </div>
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
}

carregarJogos();
