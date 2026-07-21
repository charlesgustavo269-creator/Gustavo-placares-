const API_KEY = "cb6cfc4960ec49edb8a04af5975ab816";

let jogos = [];
let filtro = "ALL";
let audioAtual = null; // Variável para controlar o áudio que está tocando

// Lista de proxies para contornar o bloqueio do GitHub Pages
const proxies = [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`
];

async function carregarJogos() {
    const competicoes = [
        "SA",   // Serie A Itália
        "BSA",  // Brasileirão Série A
        "PL",   // Premier League
        "PD",   // La Liga
        "BL1",  // Bundesliga
        "FL1",  // Ligue 1
        "CL",   // Champions League
        "CLI",  // Libertadores
        "ELC",  // Championship
        "WC",   // Copa do Mundo
        "EC",   // Eurocopa
        "PPL",  // Primeira Liga
        "DED",  // Eredivisie
        "EL"    // Europa League
    ];

    jogos = [];
    const timestamp = Date.now();

    for (const liga of competicoes) {
        const urlOriginal = `https://api.football-data.org/v4/competitions/${liga}/matches?t=${timestamp}`;
        let carregou = false;

        for (let i = 0; i < proxies.length; i++) {
            try {
                const resposta = await fetch(
                    proxies[i](urlOriginal),
                    {
                        headers: {
                            "X-Auth-Token": API_KEY
                        }
                    }
                );

                if (!resposta.ok) continue;

                const dados = await resposta.json();

                if (dados.matches && dados.matches.length > 0) {
                    jogos.push(...dados.matches);
                }

                carregou = true;
                break;

            } catch (e) {
                console.log(`Erro na competição ${liga}`);
            }
        }

        if (!carregou) {
            console.log(`${liga} indisponível.`);
        }
    }

    // Remove duplicados pelo ID do jogo
    jogos = jogos.filter(
        (jogo, indice, array) =>
            indice === array.findIndex(j => j.id === jogo.id)
    );

    // Ordena do mais próximo para o mais distante
    jogos.sort((a, b) =>
        new Date(a.utcDate) - new Date(b.utcDate)
    );

    mostrarJogos();

    console.log(
        `Atualizado às ${new Date().toLocaleTimeString()} | ${jogos.length} jogos`
    );
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
        document.getElementById("jogos").innerHTML = `<h3 style="text-align: center; color: #888; margin-top:20px;">Nenhum jogo encontrado</h3>`;
        return;
    }

    jogosFiltrados.forEach(jogo => {
        let statusDisplay = "";
        
        // Verifica status para exibir 🔴 AO VIVO, Data exata com AM/PM ou Encerrado
        if (["IN_PLAY", "PAUSED", "LIVE"].includes(jogo.status)) {
            statusDisplay = '<span style="color:red; font-weight:bold;">🔴 AO VIVO</span>';
        } else if (["TIMED", "SCHEDULED"].includes(jogo.status)) {
            const dataJogo = new Date(jogo.utcDate);
            const diaMes = dataJogo.toLocaleDateString("pt-BR", {
                day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo"
            });
            const hora = dataJogo.toLocaleTimeString("en-US", {
                hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/Sao_Paulo"
            });
            statusDisplay = `📅 ${diaMes} às ${hora}`;
        } else if (jogo.status === "FINISHED") {
            statusDisplay = "✔ Encerrado";
        } else {
            statusDisplay = jogo.status;
        }

        const escudoHome = jogo.homeTeam?.crest || "https://via.placeholder.com/40?text=⚽";
        const escudoAway = jogo.awayTeam?.crest || "https://via.placeholder.com/40?text=⚽";
        
        // Pega os gols ou define 0 caso venha nulo
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

// Função para tocar os áudios gravados sem sobrepor
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

// Inicia o ciclo de atualização
carregarJogos();
setInterval(carregarJogos, 60000);
