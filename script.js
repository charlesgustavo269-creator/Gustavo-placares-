// FUNÇÃO ADICIONADA
function iniciarSite() {
    const audio = document.getElementById("audio-apresentacao");
    if(audio) audio.play();
    document.getElementById("tela-inicial").style.display = "none";
    document.getElementById("container-conteudo").style.display = "block";
    carregarJogos();
}

const API_KEY = "cb6cfc4960ec49edb8a04af5975ab816";
let jogos = [];
let filtro = "ALL";
let carregandoPrimeiraVez = true;

const proxies = [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`
];

async function carregarJogos() {
    const containerJogos = document.getElementById("jogos");
    if(carregandoPrimeiraVez && containerJogos) {
        containerJogos.innerHTML = `<h3 style="text-align:center;color:#fff;margin-top:40px;font-family:sans-serif;">Entrando em campo 🏟️ Aguarde...</h3>`;
    }

    const quebraCache = Math.random().toString(36).substring(7);
    const urlOriginal = `https://api.football-data.org/v4/matches?nocache=${quebraCache}`;

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
                    carregandoPrimeiraVez = false;
                    mostrarJogos();
                    return;
                }
            }
        } catch (erro) {
            console.warn(`Tentativa ${i + 1} falhou`);
        }
    }
}

function mostrarJogos() {
    const campoPesquisa = document.getElementById("pesquisa");
    let pesquisa = campoPesquisa ? campoPesquisa.value.toLowerCase() : "";
    let html = "";
    const hoje = new Date().toLocaleDateString("pt-BR");

    const containerJogos = document.getElementById("jogos");
    if (!containerJogos) return;

    const jogosFiltrados = jogos.filter(j => {
        const statusAoVivo = j.status === "LIVE" || j.status === "IN_PLAY" || j.status === "PAUSED";
        const passaFiltro = filtro === "ALL" || j.status === filtro || (filtro === "LIVE" && statusAoVivo);
        const casa = j.homeTeam?.name?.toLowerCase() || "";
        const fora = j.awayTeam?.name?.toLowerCase() || "";
        return passaFiltro && (casa.includes(pesquisa) || fora.includes(pesquisa));
    });

    if (jogosFiltrados.length === 0) {
        containerJogos.innerHTML = `<h3 style="text-align:center;color:#888;margin-top:40px;font-family:sans-serif;">Nenhum jogo encontrado.</h3>`;
        return;
    }

    jogosFiltrados.forEach(jogo => {
        let status = "";
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

        const escudoHome = jogo.homeTeam?.crest || "https://via.placeholder.com/40?text=⚽";
        const escudoAway = jogo.awayTeam?.crest || "https://via.placeholder.com/40?text=⚽";
        const golsHome = jogo.score?.fullTime?.home ?? 0;
        const golsAway = jogo.score?.fullTime?.away ?? 0;
        
        html += `
        <div class="card" style="background:#1e1e1e;padding:15px;margin:10px;border-radius:8px;font-family:sans-serif;color:white;box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
            <div style="font-size:12px;color:#888;margin-bottom:10px;text-transform:uppercase;">🏟️ ${jogo.competition?.name || "Campeonato"}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="width:35%;text-align:center;">
                    <img src="${escudoHome}" style="width:40px;height:40px;object-fit:contain;margin-bottom:5px;">
                    <div style="font-size:14px;font-weight:bold;color:#2ecc71;">${jogo.homeTeam?.shortName || jogo.homeTeam?.name || "Casa"}</div>
                </div>
                <div style="width:30%;text-align:center;">
                    <div style="font-size:20px;font-weight:bold;background:#2d2d2d;padding:5px 10px;border-radius:5px;color:#2ecc71;">${golsHome} - ${golsAway}</div>
                    <div style="font-size:11px;color:${corStatus};margin-top:5px;font-weight:bold;">${status}</div>
                </div>
                <div style="width:35%;text-align:center;">
                    <img src="${escudoAway}" style="width:40px;height:40px;object-fit:contain;margin-bottom:5px;">
                    <div style="font-size:14px;font-weight:bold;color:#2ecc71;">${jogo.awayTeam?.shortName || jogo.awayTeam?.name || "Fora"}</div>
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

// Removi o carregarJogos() que rodava automático no início.
// Agora ele só roda dentro da função iniciarSite()
setInterval(carregarJogos, 30000);
