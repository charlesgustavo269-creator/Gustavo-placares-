const API_KEY = "cb6cfc4960ec49edb8a04af5975ab816";

let jogos = [];
let filtro = "ALL";
let jogoSelecionadoId = null; // Guarda o ID do jogo clicado

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
            const resposta = await fetch(urlProxy, { headers: { "X-Auth-Token": API_KEY } });

            if (!resposta.ok) throw new Error(`Status: ${resposta.status}`);

            const dados = await resposta.json();
            
            if (dados && dados.matches) {
                jogos = dados.matches;
                mostrarJogos();
                sucesso = true;
                break;
            }
        } catch (erro) {
            console.warn(`Proxy ${i + 1} falhou:`, erro.message);
        }
    }

    if (!sucesso) {
        document.getElementById("jogos").innerHTML = `
            <div style="text-align: center; color: #ff4d4d; padding: 20px;">
                <h2>Erro ao carregar os jogos.</h2>
                <p style="font-size: 14px; color: #888; margin-top: 8px;">Limite de requisições excedido. Tentando novamente em instantes...</p>
            </div>
        `;
    }
}

function mostrarJogos() {
    // Se o usuário clicou em um jogo, mostra apenas a tela de detalhes dele
    if (jogoSelecionadoId !== null) {
        mostrarDetalhesDoJogo(jogoSelecionadoId);
        return;
    }

    let pesquisa = document.getElementById("pesquisa").value.toLowerCase();
    let html = "";

    const jogosFiltrados = jogos.filter(j => {
        const passaFiltroStatus = filtro === "ALL" || j.status === filtro;
        const nomeHome = (j.homeTeam && j.homeTeam.name) ? j.homeTeam.name.toLowerCase() : "";
        const nomeAway = (j.awayTeam && j.awayTeam.name) ? j.awayTeam.name.toLowerCase() : "";
        return passaFiltroStatus && (nomeHome.includes(pesquisa) || nomeAway.includes(pesquisa));
    });

    if (jogosFiltrados.length === 0) {
        document.getElementById("jogos").innerHTML = `<h3 style="text-align: center; color: #888; margin-top: 40px;">Nenhum jogo encontrado</h3>`;
        return;
    }

    jogosFiltrados.forEach(jogo => {
        let status = jogo.status;

        if (jogo.status === "LIVE" || jogo.status === "IN_PLAY") {
            status = "🔴 AO VIVO";
        } else if (jogo.status === "TIMED" || jogo.status === "SCHEDULED") {
            const dataJogo = new Date(jogo.utcDate);
            const horaFormatada = dataJogo.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
            status = `📅 Hoje às ${horaFormatada}`;
        } else if (jogo.status === "FINISHED") {
            status = "✔ Encerrado";
        }

        const escudoHome = (jogo.homeTeam && jogo.homeTeam.crest) ? jogo.homeTeam.crest : "https://via.placeholder.com/40?text=⚽";
        const escudoAway = (jogo.awayTeam && jogo.awayTeam.crest) ? jogo.awayTeam.crest : "https://via.placeholder.com/40?text=⚽";
        const golsHome = (jogo.score && jogo.score.fullTime && jogo.score.fullTime.home !== null) ? jogo.score.fullTime.home : 0;
        const golsAway = (jogo.score && jogo.score.fullTime && jogo.score.fullTime.away !== null) ? jogo.score.fullTime.away : 0;
        const nomeCasa = (jogo.homeTeam && (jogo.homeTeam.shortName || jogo.homeTeam.name)) || "Time Casa";
        const nomeFora = (jogo.awayTeam && (jogo.awayTeam.shortName || jogo.awayTeam.name)) || "Time Fora";
        const nomeCompeticao = (jogo.competition && jogo.competition.name) ? jogo.competition.name : "Campeonato";

        // Adicionado o 'onclick="selecionarJogo(${jogo.id})"' para detectar o clique no card
        html += `
        <div class="card" onclick="selecionarJogo(${jogo.id})">
            <div class="liga">🏟️ ${nomeCompeticao}</div>
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
        </div>
        `;
    });

    document.getElementById("jogos").innerHTML = html;
}

// Função executada ao clicar em um card
function selecionarJogo(id) {
    jogoSelecionadoId = id;
    mostrarJogos();
}

// Função para voltar à lista com todos os jogos
function voltarParaLista() {
    jogoSelecionadoId = null;
    mostrarJogos();
}

// Renderiza a tela exclusiva do jogo aberto
function mostrarDetalhesDoJogo(id) {
    const jogo = jogos.find(j => j.id === id);
    if (!jogo) return;

    let status = jogo.status;
    if (jogo.status === "LIVE" || jogo.status === "IN_PLAY") {
        status = "🔴 AO VIVO";
    } else if (jogo.status === "TIMED" || jogo.status === "SCHEDULED") {
        const dataJogo = new Date(jogo.utcDate);
        const horaFormatada = dataJogo.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
        status = `📅 Hoje às ${horaFormatada}`;
    } else if (jogo.status === "FINISHED") {
        status = "✔ Encerrado";
    }

    const escudoHome = (jogo.homeTeam && jogo.homeTeam.crest) ? jogo.homeTeam.crest : "https://via.placeholder.com/40?text=⚽";
    const escudoAway = (jogo.awayTeam && jogo.awayTeam.crest) ? jogo.awayTeam.crest : "https://via.placeholder.com/40?text=⚽";
    const golsHome = (jogo.score && jogo.score.fullTime && jogo.score.fullTime.home !== null) ? 0 : 0;
    const golsAway = (jogo.score && 0 && jogo.score.fullTime.away !== null) ? 0 : 0;
    const nomeCasa = (jogo.homeTeam && jogo.homeTeam.name) || "Time Casa";
    const nomeFora = (jogo.awayTeam && jogo.awayTeam.name) || "Time Fora";
    const nomeCompeticao = (jogo.competition && jogo.competition.name) ? jogo.competition.name : "Campeonato";

    document.getElementById("jogos").innerHTML = `
        <div class="tela-detalhes">
            <button class="btn-voltar" onclick="voltarParaLista()">⬅ Voltar para os jogos</button>
            <div class="card card-foco">
                <div class="liga" style="justify-content: center; font-size: 16px;">🏆 ${nomeCompeticao}</div>
                <div class="times" style="margin-top: 20px;">
                    <div class="time" style="width: 40%;">
                        <img src="${escudoHome}" alt="${nomeCasa}" style="width: 70px; height: 70px;" onerror="this.src='https://via.placeholder.com/40?text=⚽'">
                        <div class="nome" style="font-size: 16px; margin-top: 10px;">${nomeCasa}</div>
                    </div>
                    <div>
                        <div class="placar" style="font-size: 36px;">${jogo.score.fullTime.home ?? 0} - ${jogo.score.fullTime.away ?? 0}</div>
                        <div class="status" style="font-size: 14px; margin-top: 10px;">${status}</div>
                    </div>
                    <div class="time" style="width: 40%;">
                        <img src="${escudoAway}" alt="${nomeFora}" style="width: 70px; height: 70px;" onerror="this.src='https://via.placeholder.com/40?text=⚽'">
                        <div class="nome" style="font-size: 16px; margin-top: 10px;">${nomeFora}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function filtrar(tipo){
    filtro = tipo;
    jogoSelecionadoId = null; // Reseta o foco caso clique nos filtros superiores
    mostrarJogos();
}

document.getElementById("pesquisa").addEventListener("input", () => {
    jogoSelecionadoId = null; // Reseta o foco se o usuário pesquisar algo
    mostrarJogos();
});

carregarJogos();
setInterval(carregarJogos, 60000);
