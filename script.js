const API_ENDPOINT = "https://SEU-PROJETO.vercel.app/api/jogos"; // Substitua pela sua URL da Vercel

async function carregarJogos() {
    const container = document.getElementById("jogos");
    
    try {
        const res = await fetch(API_ENDPOINT);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Erro ao buscar jogos");
        
        if (data.matches && data.matches.length > 0) {
            exibirJogos(data.matches);
        } else {
            container.innerHTML = `<div style="text-align:center; color:#aaa;">Nenhum jogo disponível.</div>`;
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = `<div style="text-align:center; color:#e74c3c;">${e.message}</div>`;
    }
}

function exibirJogos(listaJogos) {
    const container = document.getElementById("jogos");
    let html = "";

    listaJogos.forEach(jogo => {
        const dataJogo = new Date(jogo.utcDate);
        const dataFormatada = dataJogo.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const horaFormatada = dataJogo.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

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

// Inicia a execução
carregarJogos();
setInterval(carregarJogos, 60000);
