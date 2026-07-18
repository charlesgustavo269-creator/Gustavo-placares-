const API_KEY = "cb6cfc4960ec49edb8a04af5975ab816";
let jogos = [];
let filtro = "ALL";

// Quando o site carrega, verifica se já foi clicado
window.onload = function() {
    if (localStorage.getItem("jaClicou") === "sim") {
        document.getElementById("tela-inicial").style.display = "none";
        document.getElementById("container-conteudo").style.display = "block";
        carregarJogos();
    }
};

function iniciarSite() {
    const audio = document.getElementById("audio-apresentacao");
    if(audio) audio.play();
    
    // Salva a memória de que já foi clicado
    localStorage.setItem("jaClicou", "sim");
    
    document.getElementById("tela-inicial").style.display = "none";
    document.getElementById("container-conteudo").style.display = "block";
    carregarJogos();
}

async function carregarJogos() {
    const quebraCache = Math.random().toString(36).substring(7);
    const url = `https://api.allorigins.win/raw?url=${encodeURIComponent('https://api.football-data.org/v4/matches?nocache=' + quebraCache)}`;
    
    try {
        const res = await fetch(url, { headers: { "X-Auth-Token": API_KEY } });
        const dados = await res.json();
        jogos = dados.matches;
        mostrarJogos();
    } catch (e) { console.error("Erro ao carregar"); }
}

function mostrarJogos() {
    const pesquisa = document.getElementById("pesquisa").value.toLowerCase();
    const container = document.getElementById("jogos");
    let html = "";
    
    jogos.filter(j => j.homeTeam.name.toLowerCase().includes(pesquisa) || j.awayTeam.name.toLowerCase().includes(pesquisa))
         .forEach(jogo => {
            html += `
            <div style="background:#1e1e1e;padding:15px;margin:10px;border-radius:8px;color:white;box-shadow:0 4px 6px rgba(0,0,0,0.3);">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div style="width:40%;text-align:center;color:#2ecc71;font-weight:bold;">${jogo.homeTeam.shortName || jogo.homeTeam.name}</div>
                    <div style="width:20%;text-align:center;background:#2d2d2d;padding:5px;border-radius:5px;">${jogo.score.fullTime.home ?? 0} - ${jogo.score.fullTime.away ?? 0}</div>
                    <div style="width:40%;text-align:center;color:#2ecc71;font-weight:bold;">${jogo.awayTeam.shortName || jogo.awayTeam.name}</div>
                </div>
            </div>`;
    });
    container.innerHTML = html;
}

function filtrar(tipo) {
    filtro = tipo;
    mostrarJogos();
}

setInterval(() => {
    if (localStorage.getItem("jaClicou") === "sim") carregarJogos();
}, 30000);
