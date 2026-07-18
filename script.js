const API_KEY = "cb6cfc4960ec49edb8a04af5975ab816";
let jogos = [];
let filtro = "ALL";

const proxies = [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`
];

async function carregarJogos() {
    const containerJogos = document.getElementById("jogos");
    if(containerJogos) containerJogos.innerHTML = "Carregando placares... ⏳";

    const quebraCache = Math.random().toString(36).substring(7);
    const urlOriginal = `https://api.football-data.org/v4/matches?nocache=${quebraCache}`;
    let sucesso = false;

    for (let i = 0; i < proxies.length; i++) {
        try {
            const urlProxy = proxies[i](urlOriginal);
            const resposta = await fetch(urlProxy, {
                method: "GET",
                headers: { "X-Auth-Token": API_KEY }
            });
            
            if (resposta.ok) {
                const dados = await resposta.json();
                if (dados && dados.matches) {
                    jogos = dados.matches;
                    mostrarJogos();
                    sucesso = true;
                    break;
                }
            }
        } catch (erro) {
            console.warn(`Tentativa ${i + 1} falhou`);
        }
    }

    if (!sucesso && containerJogos) {
        containerJogos.innerHTML = "API ocupada, tentando novamente... 🔄";
    }
}

function mostrarJogos() {
    const containerJogos = document.getElementById("jogos");
    if (!containerJogos) return;

    const campoPesquisa = document.getElementById("pesquisa");
    let pesquisa = campoPesquisa ? campoPesquisa.value.toLowerCase() : "";
    let html = "";
    
    const hoje = new Date().toLocaleDateString("pt-BR");

    const jogosFiltrados = jogos.filter(j => {
        const statusAoVivo = j.status === "LIVE" || j.status === "IN_PLAY" || j.status === "PAUSED";
        const passaFiltro = filtro === "ALL" || j.status === filtro || (filtro === "LIVE" && statusAoVivo);
        const casa = j.homeTeam?.name?.toLowerCase() || "";
        const fora = j.awayTeam?.name?.toLowerCase() || "";
        const passaPesquisa = casa.includes(pesquisa) || fora.includes(pesquisa);
        return passaFiltro && passaPesquisa;
    });

    if (jogosFiltrados.length === 0) {
        containerJogos.innerHTML = `<h3 style="text-align:center;color:#888;">Nenhum jogo encontrado.</h3>`;
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
            const dataFormatada = dataJogo.toLocaleDateString("pt-BR");
            const hora = dataJogo.toLocaleTimeString("pt-BR",{ hour:"2-digit", minute:"2-digit", timeZone:"America/Sao_Paulo" });
            status = (dataFormatada === hoje) ? `📅 Hoje às ${hora}` : `📅 ${dataFormatada} às ${hora}`;
        } else {
            status = "✔ Encerrado";
            corStatus = "#888";
        }

        // Trava de segurança para placares futuros:
        const golsHome = jogo.score?.fullTime?.home ?? "-";
        const golsAway = jogo.score?.fullTime?.away ?? "-";

        html += `
        <div class="card" style="background:#1e1e1e;padding:15px;margin:10px;border-radius:8px;color:white;box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
            <div style="font-size:12px;color:#888;margin-bottom:5px;">${jogo.competition?.name || "Liga"}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="width:40%;text-align:center;">${jogo.homeTeam?.shortName || "Casa"}</div>
                <div style="width:20%;text-align:center;font-weight:bold;">${golsHome} - ${golsAway}</div>
                <div style="width:40%;text-align:center;">${jogo.awayTeam?.shortName || "Fora"}</div>
            </div>
            <div style="text-align:center;font-size:11px;color:${corStatus};margin-top:8px;">${status}</div>
        </div>`;
    });

    containerJogos.innerHTML = html;
}

function filtrar(tipo){
    filtro = tipo;
    mostrarJogos();
}

carregarJogos();
setInterval(carregarJogos, 30000);
