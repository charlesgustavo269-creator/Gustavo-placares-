const API_KEY = "cb6cfc4960ec49edb8a04af5975ab816";
let jogos = [];
let filtro = "ALL";

// Lista de proxies para evitar bloqueios de CORS
const proxies = [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`
];

async function carregarJogos() {
    // Truque para quebrar o cache e trazer dados novos
    const quebraCache = Math.random().toString(36).substring(7);
    const urlOriginal = `https://api.football-data.org/v4/matches?nocache=${quebraCache}`;
    let sucesso = false;

    for (let i = 0; i < proxies.length; i++) {
        try {
            const urlProxy = proxies[i](urlOriginal);
            
            const resposta = await fetch(urlProxy, {
                method: "GET",
                headers: { 
                    "X-Auth-Token": API_KEY,
                    "Accept": "application/json",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0"
                }
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
            console.warn(`Proxy ${i + 1} falhou, tentando o próximo...`);
        }
    }

    // Se falhar tudo, mostra mensagem de erro
    if (!sucesso && jogos.length === 0 && document.getElementById("jogos")) {
        document.getElementById("jogos").innerHTML = `
        <div style="text-align:center;color:#ff4d4d;padding:20px;font-family:sans-serif;">
            <h2 style="margin-bottom:10px;">Os times estão aquecendo... 🏃‍♂️</h2>
            <p style="color:#aaa;margin-bottom:20px;">O servidor de dados está um pouco instável.</p>
        </div>`;
    }
}

function mostrarJogos() {
    const campoPesquisa = document.getElementById("pesquisa");
    if (!campoPesquisa) return;

    let pesquisa = campoPesquisa.value.toLowerCase();
    let html = "";

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
            const data = new Date(jogo.utcDate);
            const hora = data.toLocaleTimeString("pt-BR",{ hour:"2-digit", minute:"2-digit", timeZone:"America/Sao_Paulo" });
            status = `📅 Hoje às ${hora}`;
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

function filtrar(tipo){
    filtro = tipo;
    mostrarJogos();
}

const campoPesquisa = document.getElementById("pesquisa");
if (campoPesquisa) {
    campoPesquisa.addEventListener("input", mostrarJogos);
}

// Inicia o carregamento
carregarJogos();

// Recarrega a página inteira automaticamente a cada 40 segundos
setTimeout(() => {
    window.location.reload();
}, 40000);

            

