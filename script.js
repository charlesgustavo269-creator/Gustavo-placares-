let jogos = [];
let audioAtual = null;
let placaresAnteriores = {}; // Guarda os gols anteriores para comparar

// URL do seu Worker da Cloudflare que esconde a chave da API
const PROXY_URL = "https://twilight-scene-8626.charlesgustavo269.workers.dev";

async function carregarJogos() {
    const timestamp = new Date().getTime(); 

    try {
        const resposta = await fetch(`${PROXY_URL}?t=${timestamp}`);

        if (!resposta.ok) throw new Error(`Status: ${resposta.status}`);

        const dados = await resposta.json();
        if (dados && dados.matches) {
            verificarGols(dados.matches); // Verifica se houve gol antes de atualizar
            
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

// Função para comparar os placares e identificar qual jogo teve gol
function verificarGols(novosJogos) {
    novosJogos.forEach(jogo => {
        const id = jogo.id;
        const golsHome = jogo.score?.fullTime?.home ?? 0;
        const golsAway = jogo.score?.fullTime?.away ?? 0;

        if (placaresAnteriores[id] !== undefined) {
            const antigoHome = placaresAnteriores[id].home;
            const antigoAway = placaresAnteriores[id].away;

            // Se o placar atual for maior que o anterior, marcou gol neste jogo!
            if (golsHome > antigoHome || golsAway > antigoAway) {
                jogo.teveGolRecente = true; 
                
                // Remove o destaque depois de 6 segundos
                setTimeout(() => {
                    jogo.teveGolRecente = false;
                }, 6000);
            }
        }

        placaresAnteriores[id] = { home: golsHome, away: golsAway };
    });
}

// Cria o bloco de anúncio único para o rodapé
function criarBlocoAnuncio() {
    const containerAnuncio = document.createElement("div");
    containerAnuncio.style.cssText = "text-align: center; margin: 30px auto 10px auto; max-width: 300px; min-height: 250px; overflow: hidden; display: flex; justify-content: center; align-items: center; background: #111; border-radius: 10px; border: 1px dashed #333; padding: 10px;";

    const scriptOptions = document.createElement("script");
    scriptOptions.innerHTML = `
      atOptions = {
        'key' : '9aa9ff0419db7e9123b604693eb33051',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;

    const scriptInvoke = document.createElement("script");
    scriptInvoke.src = "https://www.highperformanceformat.com/9aa9ff0419db7e9123b604693eb33051/invoke.js";
    scriptInvoke.async = true;

    scriptInvoke.onerror = function() {
        containerAnuncio.style.display = "none";
    };

    setTimeout(() => {
        const iframe = containerAnuncio.querySelector("iframe");
        if (!iframe || iframe.offsetHeight === 0) {
            containerAnuncio.style.display = "none";
        }
    }, 4000);

    containerAnuncio.appendChild(scriptOptions);
    containerAnuncio.appendChild(scriptInvoke);

    return containerAnuncio;
}

function mostrarJogos() {
    const containerJogos = document.getElementById("jogos");
    containerJogos.innerHTML = ""; 

    const agora = new Date();
    const options = { timeZone: "America/Sao_Paulo", year: 'numeric', month: '2-digit', day: '2-digit' };
    
    const hojeStr = agora.toLocaleDateString("pt-BR", options).split('/').reverse().join('-');
    
    const amanhaObj = new Date(agora);
    amanhaObj.setDate(agora.getDate() + 1);
    const amanhaStr = amanhaObj.toLocaleDateString("pt-BR", options).split('/').reverse().join('-');

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
        containerJogos.innerHTML = `<h3 style="text-align: center; color: #888; margin-top:20px;">Nenhum jogo encontrado para hoje ou amanhã</h3>`;
        return;
    }

    // Adiciona o estilo de animação de gol no documento se não existir
    if (!document.getElementById("estilo-gol-card")) {
        const estilo = document.createElement("style");
        estilo.id = "estilo-gol-card";
        estilo.innerHTML = `
            @keyframes piscarCardGol {
                0% { border-color: #2e8b57; box-shadow: 0 4px 8px rgba(0,0,0,0.4); }
                50% { border-color: #00ff66; box-shadow: 0 0 25px #00ff66, inset 0 0 15px #00ff66; }
                100% { border-color: #2e8b57; box-shadow: 0 4px 8px rgba(0,0,0,0.4); }
            }
            .card-com-gol {
                animation: piscarCardGol 0.8s infinite;
            }
        `;
        document.head.appendChild(estilo);
    }

    jogosFiltrados.forEach((jogo) => {
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
        } else if (jogo.status === "POSTPONED") {
            statusDisplay = "⏳ Adiado";
        } else {
            statusDisplay = jogo.status;
        }
        
        const golsHome = (jogo.score?.fullTime?.home !== null && jogo.score?.fullTime?.home !== undefined) ? jogo.score.fullTime.home : 0;
        const golsAway = (jogo.score?.fullTime?.away !== null && jogo.score?.fullTime?.away !== undefined) ? jogo.score.fullTime.away : 0;

        const escudoHome = jogo.homeTeam?.crest 
            ? `<img src="${jogo.homeTeam.crest}" alt="${jogo.homeTeam.name}" style="width:32px; height:32px; object-fit:contain; margin-bottom:4px;">` 
            : '⚽';
            
        const escudoAway = jogo.awayTeam?.crest 
            ? `<img src="${jogo.awayTeam.crest}" alt="${jogo.awayTeam.name}" style="width:32px; height:32px; object-fit:contain; margin-bottom:4px;">` 
            : '⚽';

        // Define se o card recebe o destaque de gol recente
        const classeCard = jogo.teveGolRecente ? "card card-com-gol" : "card";
        
        let avisoGolHTML = "";
        if (jogo.teveGolRecente) {
            avisoGolHTML = `
                <div style="background: #00ff66; color: #000; font-weight: 900; font-size: 12px; padding: 2px 10px; border-radius: 20px; display: inline-block; margin-bottom: 6px; box-shadow: 0 0 10px #00ff66; letter-spacing: 1px;">
                    ⚽ GOOOOL! ⚽
                </div>
            `;
        }

        const cardJogo = document.createElement("div");
        cardJogo.className = classeCard;
        cardJogo.style.cssText = "background:#1a1a1a; margin:10px auto; max-width: 500px; padding:15px; border-radius:10px; text-align:center; box-shadow:0 4px 8px rgba(0,0,0,0.4); border: 1px solid #333; transition: all 0.3s ease;";
        
        cardJogo.innerHTML = `
            <div style="font-size:12px; color:#aaa; margin-bottom:6px; font-weight:bold;">🏟️ ${jogo.competition?.name || "Campeonato"}</div>
            ${avisoGolHTML}
            
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="width:33%; display:flex; flex-direction:column; align-items:center;">
                    <div>${escudoHome}</div>
                    <div style="font-size:17px; font-weight:bold; color:#2e8b57; text-align:center;">${jogo.homeTeam?.shortName || jogo.homeTeam?.name || "---"}</div>
                </div>

                <div style="width:34%; text-align:center;">
                    <div style="font-size:26px; font-weight:bold; color:${jogo.teveGolRecente ? '#00ff66' : '#2e8b57'}; letter-spacing:2px; text-shadow: ${jogo.teveGolRecente ? '0 0 10px #00ff66' : 'none'};">
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
        `;

        containerJogos.appendChild(cardJogo);
    });

    // Adiciona o bloco de anúncio único e limpo no rodapé de todos os jogos
    containerJogos.appendChild(criarBlocoAnuncio());
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
