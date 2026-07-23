let jogos = [];
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
            
            // Ordenação fixa baseada no ID do jogo para a lista não saltar na tela
            jogos.sort((a, b) => a.id - b.id);
            
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
    const options = { timeZone: "America/Sao_Paulo", year: 'numeric', month: '2-digit', day: '2-digit' };
    
    const hojeStr = agora.toLocaleDateString("pt-BR", options).split('/').reverse().join('-');
    
    const amanhaObj = new Date(agora);
    amanhaObj.setDate(agora.getDate() + 1);
    const amanhaStr = amanhaObj.toLocaleDateString("pt-BR", options).split('/').reverse().join('-');

    // Filtra apenas o essencial: jogos de hoje, de amanhã, ou que estejam ao vivo / finalizados recentemente
    const jogosFiltrados = jogos.filter(j => {
        const dataJogoObj = new Date(j.utcDate);
        const dataJogoStr = dataJogoObj.toLocaleDateString("pt-BR", options).split('/').reverse().join('-');

        const éHoje = (dataJogoStr === hojeStr);
        const éAmanha = (dataJogoStr === amanhaStr);
        const estaAoVivo = ["IN_PLAY", "PAUSED", "LIVE"].includes(j.status);
        const estaFinalizado = (j.status === "FINISHED");

        return éHoje || éAmanha || estaAoVivo || estaFinalizado;
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
            
            const hora = dataJogo.toLocaleTimeString("pt-BR", {
                hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Sao_Paulo"
            });

            const dataJogoStr = dataJogo.toLocaleDateString("pt-BR", options).split('/').reverse().join('-');

            if (dataJogoStr === hojeStr) {
                statusDisplay = `📅 Hoje às ${hora}`;
            } else if (dataJogoStr === amanhaStr) {
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
        
        const golsHome = (jogo.score?.fullTime?.home !== null && jogo.score?.fullTime?.home !== undefined) ? jogo.score.fullTime.home : 0;
        const golsAway = (jogo.score?.fullTime?.away !== null && jogo.score?.fullTime?.away !== undefined) ? jogo.score.fullTime.away : 0;

        // Escudos oficiais dos times (com fallback para a bola caso a API não envie o link)
        const escudoHome = jogo.homeTeam?.crest 
            ? `<img src="${jogo.homeTeam.crest}" alt="${jogo.homeTeam.name}" style="width:32px; height:32px; object-fit:contain; margin-bottom:4px;">` 
            : '⚽';
            
        const escudoAway = jogo.awayTeam?.crest 
            ? `<img src="${jogo.awayTeam.crest}" alt="${jogo.awayTeam.name}" style="width:32px; height:32px; object-fit:contain; margin-bottom:4px;">` 
            : '⚽';

        html += `
        <div class="card" style="background:#1a1a1a; margin:10px auto; max-width: 500px; padding:15px; border-radius:10px; text-align:center; box-shadow:0 4px 8px rgba(0,0,0,0.4); border: 1px solid #333;">
            <div style="font-size:12px; color:#aaa; margin-bottom:10px; font-weight:bold;">🏟️ ${jogo.competition?.name || "Campeonato"}</div>
            
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="width:33%; display:flex; flex-direction:column; align-items:center;">
                    <div>${escudoHome}</div>
                    <div style="font-size:17px; font-weight:bold; color:#2e8b57; text-align:center;">${jogo.homeTeam?.shortName || jogo.homeTeam?.name || "---"}</div>
                </div>

                <div style="width:34%; text-align:center;">
                    <div style="font-size:26px; font-weight:bold; color:#2e8b57; letter-spacing:2px;">
                        ${golsHome} - ${golsAway}
                    </div>
                    <div style="font-size:11px; margin-top:5px; color:#ccc;">
                        ${statusDisplay}
                    </div>
                </div>

                <div style="width:33%; display:flex; flex-direction:column; align-items:center;">
                    <div>${escudoAway}</div>
                    <div style="font-size:17px; font-weight:bold; color:#2e8b57; text-align:center;">${jogo.awayTeam?.shortName || jogo.awayTeam?.name || "---"}</div>
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

carregarJogos();
setInterval(carregarJogos, 60000);
