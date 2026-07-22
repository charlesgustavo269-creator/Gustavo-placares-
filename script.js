let jogos = [];
let filtro = "ALL";
let audioAtual = null;

// URL do seu Worker da Cloudflare que esconde a chave da API
const PROXY_URL = "https://twilight-scene-8626.charlesgustavo269.workers.dev";

async function carregarJogos() {
    const timestamp = new Date().getTime(); 

    try {
        const resposta = await fetch(`${PROXY_URL}?t=${timestamp}`);

        if (!resposta.ok) throw new Error(`Status: ${resposta.status}`);

        const dados = await resposta.json();
        if (dados && dados.matches) {
            jogos = dados.matches;
            mostrarJogos();
            console.log("Placar atualizado às: " + new Date().toLocaleTimeString());
        } else {
            throw new Error("Dados inválidos recebidos");
        }
    } catch (erro) {
        console.warn("Erro ao carregar jogos:", erro);
        document.getElementById("jogos").innerHTML = `
            <div style="text-align: center; color: #ff4d4d; padding: 20px;">
                <h2>Erro ao carregar jogos.</h2>
                <p>Verifique sua conexão ou tente novamente mais tarde.</p>
            </div>`;
    }
}

function mostrarJogos() {
    let html = "";

    const agora = new Date();
    const hojeStr = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime();
    
    const amanha = new Date(agora);
    amanha.setDate(agora.getDate() + 1);
    const amanhaStr = new Date(amanha.getFullYear(), amanha.getMonth(), amanha.getDate()).getTime();

    const jogosFiltrados = jogos.filter(j => {
        const dataJogoObj = new Date(j.utcDate);
        const dataJogoStr = new Date(dataJogoObj.getFullYear(), dataJogoObj.getMonth(), dataJogoObj.getDate()).getTime();

        const éHoje = (dataJogoStr === hojeStr);
        const éAmanha = (dataJogoStr === amanhaStr);
        const estaAoVivo = ["IN_PLAY", "PAUSED", "LIVE"].includes(j.status);

        const passaData = éHoje || éAmanha || estaAoVivo;
        const passaFiltroStatus = filtro === "ALL" || (filtro === "LIVE" ? estaAoVivo : j.status === filtro);
        
        return passaData && passaFiltroStatus;
    });

    if (jogosFiltrados.length === 0) {
        document.getElementById("jogos").innerHTML = `<h3 style="text-align: center; color: #888; margin-top:20px;">Nenhum jogo encontrado para hoje ou amanhã</h3>`;
        return;
    }

    jogosFiltrados.forEach(jogo => {
        let statusDisplay = "";
        const estaAoVivo = ["IN_PLAY", "PAUSED", "LIVE"].includes(jogo.status);
        
        if (estaAoVivo) {
            statusDisplay = '<span style="color:#ff4d4d; font-weight:bold;">🔴 AO VIVO</span>';
        } else if (["TIMED", "SCHEDULED"].includes(jogo.status)) {
            const dataJogo = new Date(jogo.utcDate);
            const dataJogoDia = new Date(dataJogo.getFullYear(), dataJogo.getMonth(), dataJogo.getDate()).getTime();
            
            const hora = dataJogo.toLocaleTimeString("en-US", {
                hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/Sao_Paulo"
            });

            if (dataJogoDia === hojeStr) {
                statusDisplay = `📅 Hoje às ${hora}`;
            } else if (dataJogoDia === amanhaStr) {
                statusDisplay = `📅 Amanhã às ${hora}`;
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

        const escudoHome = jogo.homeTeam?.crest || "https://via.placeholder.com/60?text=⚽";
        const escudoAway = jogo.awayTeam?.crest || "https://via.placeholder.com/60?text=⚽";
        
        const golsHome = (jogo.score?.fullTime?.home !== null && jogo.score?.fullTime?.home !== undefined) ? jogo.score.fullTime.home : 0;
        const golsAway = (jogo.score?.fullTime?.away !== null && jogo.score?.fullTime?.away !== undefined) ? jogo.score.fullTime.away : 0;

        // Escudos maiores (width="60" height="60")
        html += `
        <div class="card" style="background:#1a1a1a; margin:10px auto; max-width: 500px; padding:15px; border-radius:10px; text-align:center; box-shadow:0 4px 8px rgba(0,0,0,0.4); border: 1px solid #333;">
            <div style="font-size:12px; color:#aaa; margin-bottom:10px; font-weight:bold;">🏟️ ${jogo.competition?.name || "Campeonato"}</div>
            
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="width:30%; display:flex; flex-direction:column; align-items:center;">
                    <img src="${escudoHome}" width="60" height="60" style="object-fit:contain;">
                    <div style="font-size:12px; font-weight:bold; margin-top:8px; color:#2e8b57;">${jogo.homeTeam?.shortName || jogo.homeTeam?.name || "---"}</div>
                </div>

                <div style="width:40%; text-align:center;">
                    <div style="font-size:26px; font-weight:bold; color:#2e8b57; letter-spacing:2px;">
                        ${golsHome} - ${golsAway}
                    </div>
                    <div style="font-size:11px; margin-top:5px; color:#ccc;">
                        ${statusDisplay}
                    </div>
                </div>

                <div style="width:30%; display:flex; flex-direction:column; align-items:center;">
                    <img src="${escudoAway}" width="60" height="60" style="object-fit:contain;">
                    <div style="font-size:12px; font-weight:bold; margin-top:8px; color:#2e8b57;">${jogo.awayTeam?.shortName || jogo.awayTeam?.name || "---"}</div>
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

carregarJogos();
setInterval(carregarJogos, 60000);
