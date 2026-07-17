// ==========================================
// CONTROLE DE ENTRADA E ÁUDIO (NO TOPO PARA NÃO TRAVAR)
// ==========================================

const btnEntrar = document.getElementById("btnEntrar");
const telaEntrada = document.getElementById("telaEntrada");
const audioAbertura = document.getElementById("audioAbertura");

// Checa IMEDIATAMENTE se o usuário já entrou nesta aba antes
const jaEntrouNestaSessao = sessionStorage.getItem("gustavoPlacares_entrou_sessao");
if (jaEntrouNestaSessao === "true" && telaEntrada) {
    telaEntrada.style.display = "none";
}

// Configura o clique do botão VER PLACARES de forma prioritária
if (btnEntrar) {
    btnEntrar.onclick = function() {
        sessionStorage.setItem("gustavoPlacares_entrou_sessao", "true");
        
        if (audioAbertura) {
            audioAbertura.play().catch(erro => console.warn("Áudio bloqueado:", erro));
        }

        if (telaEntrada) {
            telaEntrada.style.display = "none";
        }
    };
}

// ==========================================
// LÓGICA DOS JOGOS E DA API
// ==========================================

const API_KEY = "cb6cfc4960ec49edb8a04af5975ab816";
let jogos = [];
let filtro = "ALL";

const proxies = [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`
];

async function carregarJogos() {
    const urlOriginal = "https://api.football-data.org/v4/matches";
    let sucesso = false;

    for (let i = 0; i < proxies.length; i++) {
        try {
            const urlProxy = proxies[i](urlOriginal);
            const resposta = await fetch(urlProxy, {
                headers: { "X-Auth-Token": API_KEY }
            });

            if (!resposta.ok) throw new Error(`Status: ${resposta.status}`);

            const dados = await resposta.json();
            if (dados && dados.matches) {
                jogos = dados.matches;
                mostrarJogos();
                sucesso = true;
                break;
            }
        } catch (erro) {
            console.warn("Erro no proxy:", erro);
        }
    }

    if (!sucesso && document.getElementById("jogos")) {
        document.getElementById("jogos").innerHTML = `
        <div style="text-align:center;color:#ff4d4d;padding:20px;">
            <h2>Erro ao carregar os jogos.</h2>
            <p>Aguarde e tente novamente.</p>
        </div>`;
    }
}

function mostrarJogos() {
    const campoPesquisa = document.getElementById("pesquisa");
    if (!campoPesquisa) return;

    let pesquisa = campoPesquisa.value.toLowerCase();
    let html = "";

    const jogosFiltrados = jogos.filter(j => {
        const passaFiltro = filtro === "ALL" || j.status === filtro;
        const casa = j.homeTeam?.name?.toLowerCase() || "";
        const fora = j.awayTeam?.name?.toLowerCase() || "";
        const passaPesquisa = casa.includes(pesquisa) || fora.includes(pesquisa);
        return passaFiltro && passaPesquisa;
    });

    const containerJogos = document.getElementById("jogos");
    if (!containerJogos) return;

    if (jogosFiltrados.length === 0) {
        containerJogos.innerHTML = `<h3 style="text-align:center;color:#888;margin-top:40px;">Nenhum jogo encontrado</h3>`;
        return;
    }

    jogosFiltrados.forEach(jogo => {
        let status = jogo.status;
        if (jogo.status === "LIVE" || jogo.status === "IN_PLAY") {
            status = "🔴 AO VIVO";
        } else if (jogo.status === "TIMED" || jogo.status === "SCHEDULED") {
            const data = new Date(jogo.utcDate);
            const hora = data.toLocaleTimeString("pt-BR",{ hour:"2-digit", minute:"2-digit", timeZone:"America/Sao_Paulo" });
            status = `📅 Hoje às ${hora}`;
        } else if (jogo.status === "FINISHED") {
            status = "✔ Encerrado";
        }

        const escudoHome = jogo.homeTeam?.crest || "https://via.placeholder.com/40";
        const escudoAway = jogo.awayTeam?.crest || "https://via.placeholder.com/40";
        const golsHome = jogo.score?.fullTime?.home ?? 0;
        const golsAway = jogo.score?.fullTime?.away ?? 0;
        const nomeCasa = jogo.homeTeam?.shortName || jogo.homeTeam?.name || "Casa";
        const nomeFora = jogo.awayTeam?.shortName || jogo.awayTeam?.name || "Fora";
        const campeonato = jogo.competition?.name || "Campeonato";

        html += `
        <div class="card">
            <div class="liga">🏟️ ${campeonato}</div>
            <div class="times">
                <div class="time">
                    <img src="${escudoHome}" alt="${nomeCasa}" onerror="this.src='https://via.placeholder.com/40?text=⚽'">
                    <div class="nome">${nomeCasa}</div>
                </div>
                <div>
                    <div class="placar">${golsHome} - ${golsAway}</div>
                    <div class="status">${status}</div>
                </div>
                <div class="time">
                    <img src="${escudoAway}" alt="${nomeFora}" onerror="this.src='https://via.placeholder.com/40?text=⚽'">
                    <div class="nome">${nomeFora}</div>
                </div>
            </div>
        </div>`;
    });

    containerJogos.innerHTML = html;
}

function filtrar(tipo){
    filtro = tipo;
    mostrarJogos();
}

// Configura a busca se o elemento existir
const campoPesquisa = document.getElementById("pesquisa");
if (campoPesquisa) {
    campoPesquisa.addEventListener("input", mostrarJogos);
}

// Inicializa as chamadas
carregarJogos();
setInterval(carregarJogos, 60000);
warn("Áudio bloqueado pelo navegador:", erro));
        }

        if (telaEntrada) {
            telaEntrada.style.display = "none";
        }
    });
}
ssao", "true");
        
        // Toca o áudio de abertura (a mulher falando)
        if (audioAbertura) {
            audioAbertura.play().catch(erro => console.warn("Áudio bloqueado pelo navegador:", erro));
        }

        // Some com a tela de entrada para mostrar os placares
        if (telaEntrada) {
            telaEntrada.style.display = "none";
        }
    });
}
