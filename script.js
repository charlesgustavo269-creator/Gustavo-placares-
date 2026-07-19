const API_KEY = "cb6cfc4960ec49edb8a04af5975ab816";

let jogos = [];
let filtro = "ALL";

// Lista de proxies para contornar o bloqueio do GitHub Pages
const proxies = [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`
];

async function carregarJogos() {
    const urlOriginal = "https://api.football-data.org/v4/matches";
    let sucesso = false;
    
    // Adiciona um timestamp para forçar a atualização e evitar cache
    const timestamp = new Date().getTime(); 

    for (let i = 0; i < proxies.length; i++) {
        try {
            const urlProxy = proxies[i](urlOriginal + "?t=" + timestamp);
            const resposta = await fetch(urlProxy, {
                headers: { "X-Auth-Token": API_KEY }
            });

            if (!resposta.ok) throw new Error(`Status: ${resposta.status}`);

            const dados = await resposta.json();
            if (dados && dados.matches) {
                jogos = dados.matches;
                mostrarJogos();
                console.log("Placar atualizado às: " + new Date().toLocaleTimeString());
                sucesso = true;
                break;
            }
        } catch (erro) {
            console.warn(`Proxy ${i + 1} falhou.`);
        }
    }

    if (!sucesso) {
        document.getElementById("jogos").innerHTML = `
            <div style="text-align: center; color: #ff4d4d; padding: 20px;">
                <h2>Erro ao carregar jogos.</h2>
                <p>Verifique sua conexão ou tente novamente mais tarde.</p>
            </div>`;
    }
}

function mostrarJogos() {
    const pesquisa = document.getElementById("pesquisa").value.toLowerCase();
    let html = "";

    const jogosFiltrados = jogos.filter(j => {
        const passaFiltroStatus = filtro === "ALL" || (filtro === "LIVE" ? ["IN_PLAY", "PAUSED"].includes(j.status) : j.status === filtro);
        const nomeHome = j.homeTeam?.name?.toLowerCase() || "";
        const nomeAway = j.awayTeam?.name?.toLowerCase() || "";
        return passaFiltroStatus && (nomeHome.includes(pesquisa) || nomeAway.includes(pesquisa));
    });

    if (jogosFiltrados.length === 0) {
        document.getElementById("jogos").innerHTML = `<h3 style="text-align: center; color: #888;">Nenhum jogo encontrado</h3>`;
        return;
    }

    jogosFiltrados.forEach(jogo => {
        let statusDisplay = "";
        
        // Verifica status para exibir 🔴 AO VIVO, Data ou Encerrado
        if (["IN_PLAY", "PAUSED", "LIVE"].includes(jogo.status)) {
            statusDisplay = '<span style="color:red; font-weight:bold;">🔴 AO VIVO</span>';
        } else if (["TIMED", "SCHEDULED"].includes(jogo.status)) {
            const hora = new Date(jogo.utcDate).toLocaleTimeString("pt-BR", {
                hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo"
            });
            statusDisplay = `📅 Hoje às ${hora}`;
        } else if (jogo.status === "FINISHED") {
            statusDisplay = "✔ Encerrado";
        } else {
            statusDisplay = jogo.status;
        }

        const escudoHome = jogo.homeTeam?.crest || "https://via.placeholder.com/40?text=⚽";
        const escudoAway = jogo.awayTeam?.crest || "https://via.placeholder.com/40?text=⚽";
        const golsHome = jogo.score?.fullTime?.home ?? 0;
        const golsAway = jogo.score?.fullTime?.away ?? 0;

        html += `
        <div class="card" style="background:white; margin:10px; padding:15px; border-radius:10px; text-align:center; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
            <div style="font-size:12px; color:#555; margin-bottom:10px;">🏟️ ${jogo.competition?.name || "Campeonato"}</div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="width:30%">
                    <img src="${escudoHome}" width="40" height="40" style="object-fit:contain;">
                    <div style="font-size:12px; font-weight:bold;">${jogo.homeTeam?.shortName || jogo.homeTeam?.name || "---"}</div>
                </div>
                <div style="width:40%">
                    <div style="font-size:20px; font-weight:bold;">${golsHome} - ${golsAway}</div>
                    <div style="font-size:11px; margin-top:5px;">${statusDisplay}</div>
                </div>
                <div style="width:30%">
                    <img src="${escudoAway}" width="40" height="40" style="object-fit:contain;">
                    <div style="font-size:12px; font-weight:bold;">${jogo.awayTeam?.shortName || jogo.awayTeam?.name || "---"}</div>
                </div>
            </div>
        </div>`;
    });

    document.getElementById("jogos").innerHTML = html;
}

function filtrar(tipo) {
    filtro = tipo;
    mostrarJogos();
}

// Vincula o evento do campo de busca
document.getElementById("pesquisa").addEventListener("input", mostrarJogos);

// Inicia o ciclo de atualização
carregarJogos();
setInterval(carregarJogos, 60000);
