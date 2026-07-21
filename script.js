const API_KEY = "cb6cfc4960ec49edb8a04af5975ab816";

let jogos = [];
let filtro = "ALL";
let audioAtual = null;

const proxies = [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`
];

async function carregarJogos() {
    const urlOriginal = "https://api.football-data.org/v4/matches";
    let sucesso = false;
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

    const hojeStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());

    const jogosFiltrados = jogos.filter(j => {
        const passaFiltroStatus = filtro === "ALL" || (filtro === "LIVE" ? ["IN_PLAY", "PAUSED"].includes(j.status) : j.status === filtro);
        const nomeHome = j.homeTeam?.name?.toLowerCase() || "";
        const nomeAway = j.awayTeam?.name?.toLowerCase() || "";
        return passaFiltroStatus && (nomeHome.includes(pesquisa) || nomeAway.includes(pesquisa));
    });

    if (jogosFiltrados.length === 0) {
        document.getElementById("jogos").innerHTML = `<h3 style="text-align: center; color: #888; margin-top:20px;">Nenhum jogo encontrado</h3>`;
        return;
    }

    jogosFiltrados.forEach(jogo => {
        let statusDisplay = "";
        
        if (["IN_PLAY", "PAUSED", "LIVE"].includes(jogo.status)) {
            statusDisplay = '<span style="color:red; font-weight:bold;">🔴 AO VIVO</span>';
        } else if (["TIMED", "SCHEDULED"].includes(jogo.status)) {
            const dataJogo = new Date(jogo.utcDate);
            
            // Pega a data do jogo no formato YYYY-MM-DD para comparar com hoje
            const dataJogoStr = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'America/Sao_Paulo',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(dataJogo);

            const hora = dataJogo.toLocaleTimeString("en-US", {
                hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/Sao_Paulo"
            });

            // Se for hoje, escreve "Hoje", senão exibe a data normal
            if (dataJogoStr === hojeStr) {
                statusDisplay = `📅 Hoje às ${hora}`;
            } else {
                const diaMes = dataJogo.toLocaleDateString("pt-BR", {
                    day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo"
                });
                statusDisplay = `📅 ${diaMes} às ${hora}`;
            }

        } else if (jogo.status === "FINISHED") {
            statusDisplay = "✔ Encerrado";
        } else {
            statusDisplay = jogo.status;
        }

        const escudoHome = jogo.homeTeam?.crest || "https://via.placeholder.com/40?text=⚽";
        const escudoAway = jogo.awayTeam?.crest || "https://via.placeholder.com/40?text=⚽";
        
        const golsHome = (jogo.score?.fullTime?.home !== null && jogo.score?.fullTime?.home !== undefined) ? jogo.score.fullTime.home : 0;
        const golsAway = (jogo.score?.fullTime?.away !== null && jogo.score?.fullTime?.away !== undefined) ? jogo.score.fullTime.away : 0;

        html += `
        <div class="card" style="background:white; margin:10px; padding:15px; border-radius:10px; text-align:center; box-shadow:0 2px 5px rgba(0,0,0,0.1); color: #222;">
            <div style="font-size:12px; color:#555; margin-bottom:10px; font-weight:bold;">🏟️ ${jogo.competition?.name || "Campeonato"}</div>
            
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <!-- Time da Casa -->
                <div style="width:30%; display:flex; flex-direction:column; align-items:center;">
                    <img src="${escudoHome}" width="40" height="40" style="object-fit:contain;">
                    <div style="font-size:12px; font-weight:bold; margin-top:5px; color:#222;">${jogo.homeTeam?.shortName || jogo.homeTeam?.name || "---"}</div>
                </div>

                <!-- Placar e Status -->
                <div style="width:40%; text-align:center;">
                    <div style="font-size:24px; font-weight:bold; color:#111; letter-spacing:2px;">
                        ${golsHome} - ${golsAway}
                    </div>
                    <div style="font-size:11px; margin-top:5px;">
                        ${statusDisplay}
                    </div>
                </div>

                <!-- Time de Fora -->
                <div style="width:30%; display:flex; flex-direction:column; align-items:center;">
                    <img src="${escudoAway}" width="40" height="40" style="object-fit:contain;">
                    <div style="font-size:12px; font-weight:bold; margin-top:5px; color:#222;">${jogo.awayTeam?.shortName || jogo.awayTeam?.name || "---"}</div>
                </div>
            </div>
        </div>`;
    });

    document.getElementById("jogos").innerHTML = html;
}

function tocarAudio(caminhoArquivo) {
    if (audioAtual) {
        audioAtual.pause();
        audioAtual.currentTime = 0;
    }
    audioAtual = new Audio(caminhoArquivo);
    audioAtual.play().catch(erro => console.log("Erro ao reproduzir áudio:", erro));
}

function filtrar(tipo) {
    filtro = tipo;
    mostrarJogos();
}

document.getElementById("pesquisa").addEventListener("input", mostrarJogos);

carregarJogos();
setInterval(carregarJogos, 60000);
