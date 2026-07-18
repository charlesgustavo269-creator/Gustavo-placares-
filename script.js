function mostrarJogos() {
    const campoPesquisa = document.getElementById("pesquisa");
    let pesquisa = campoPesquisa ? campoPesquisa.value.toLowerCase() : "";
    let html = "";

    const hoje = new Date().toLocaleDateString("pt-BR").split(' ')[0];

    const jogosFiltrados = jogos.filter(j => {
        const statusAoVivo = j.status === "LIVE" || j.status === "IN_PLAY" || j.status === "PAUSED";
        const passaFiltro = filtro === "ALL" || j.status === filtro || (filtro === "LIVE" && statusAoVivo);
        
        const casa = j.homeTeam?.name?.toLowerCase() || "";
        const fora = j.awayTeam?.name?.toLowerCase() || "";
        const passaPesquisa = casa.includes(pesquisa) || fora.includes(pesquisa);
        return passaFiltro && passaPesquisa;
    });

    const containerJogos = document.getElementById("jogos");
    if (!containerJogos) return;

    if (jogosFiltrados.length === 0) {
        containerJogos.innerHTML = `<h3 style="text-align:center;color:#888;margin-top:40px;font-family:sans-serif;">Nenhum jogo encontrado.</h3>`;
        return;
    }

    jogosFiltrados.forEach(jogo => {
        let status = jogo.status;
        let corStatus = "#2ecc71"; 

        if (jogo.status === "LIVE" || jogo.status === "IN_PLAY" || jogo.status === "PAUSED") {
            status = "🔴 AO VIVO";
            corStatus = "#ff4d4d"; 
        } else if (jogo.status === "TIMED" || jogo.status === "SCHEDULED") {
            const dataJogo = new Date(jogo.utcDate);
            const dataFormatada = dataJogo.toLocaleDateString("pt-BR").split(' ')[0];
            const hora = dataJogo.toLocaleTimeString("pt-BR",{ hour:"2-digit", minute:"2-digit", timeZone:"America/Sao_Paulo" });
            
            // Lógica nova: se for igual a hoje, mostra "Hoje", senão, mostra a data
            if (dataFormatada === hoje) {
                status = `📅 Hoje às ${hora}`;
            } else {
                status = `📅 ${dataFormatada} às ${hora}`;
            }
        } else if (jogo.status === "FINISHED") {
            status = "✔ Encerrado";
            corStatus = "#888";
        }

        const escudoHome = jogo.homeTeam?.crest || "https://via.placeholder.com/40?text=⚽";
        const escudoAway = jogo.awayTeam?.crest || "https://via.placeholder.com/40?text=⚽";
        const golsHome = jogo.score?.fullTime?.home ?? 0;
        const golsAway = jogo.score?.fullTime?.away ?? 0;
        
        const nomeCasa = jogo.homeTeam?.shortName || jogo.homeTeam?.name || "Casa";
        const nomeFora = jogo.awayTeam?.shortName || jogo.awayTeam?.name || "Fora";
        const campeonato = jogo.competition?.name || "Campeonato";

        html += `
        <div class="card" style="background:#1e1e1e;padding:15px;margin:10px;border-radius:8px;font-family:sans-serif;color:white;box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
            <div class="liga" style="font-size:12px;color:#888;margin-bottom:10px;text-transform:uppercase;">🏟️ ${campeonato}</div>
            <div class="times" style="display:flex;justify-content:space-between;align-items:center;">
                <div class="time" style="width:35%;text-align:center;">
                    <img src="${escudoHome}" alt="${nomeCasa}" style="width:40px;height:40px;object-fit:contain;margin-bottom:5px;" onerror="this.src='https://via.placeholder.com/40?text=⚽'">
                    <div class="nome" style="font-size:14px;font-weight:bold;">${nomeCasa}</div>
                </div>
                <div style="width:30%;text-align:center;">
                    <div class="placar" style="font-size:20px;font-weight:bold;background:#2d2d2d;padding:5px 10px;border-radius:5px;display:inline-block;margin-bottom:5px;">${golsHome} - ${golsAway}</div>
                    <div class="status" style="font-size:11px;color:${corStatus};font-weight:bold;">${status}</div>
                </div>
                <div class="time" style="width:35%;text-align:center;">
                    <img src="${escudoAway}" alt="${nomeFora}" style="width:40px;height:40px;object-fit:contain;margin-bottom:5px;" onerror="this.src='https://via.placeholder.com/40?text=⚽'">
                    <div class="nome" style="font-size:14px;font-weight:bold;">${nomeFora}</div>
                </div>
            </div>
        </div>`;
    });

    containerJogos.innerHTML = html;
}
