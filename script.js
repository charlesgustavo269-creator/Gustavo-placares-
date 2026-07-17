const API_KEY = "318727d98f6b807ddfb293084a95342f";

let jogos = [];
let filtro = "ALL";

// Lista de proxies estáveis para evitar bloqueios de CORS no GitHub Pages ou Netlify
const proxies = [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`
];

async function carregarJogos() {
    const urlOriginal = "https://api.football-data.org/v4/matches";
    let sucesso = false;

    // Tenta carregar os dados passando pelos proxies da lista
    for (let i = 0; i < proxies.length; i++) {
        try {
            const urlProxy = proxies[i](urlOriginal);
            console.log(`Tentando conexão via proxy ${i + 1}...`);

            const resposta = await fetch(urlProxy, {
                headers: {
                    "X-Auth-Token": API_KEY
                }
            });

            if (!resposta.ok) {
                throw new Error(`Status: ${resposta.status}`);
            }

            const dados = await resposta.json();
            
            if (dados && dados.matches) {
                jogos = dados.matches;
                mostrarJogos();
                sucesso = true;
                break; // Sucesso! Sai do laço e não tenta o próximo proxy
            }
        } catch (erro) {
            console.warn(`Proxy ${i + 1} falhou:`, erro.message);
        }
    }

    // Se nenhum proxy funcionar (geralmente por limite de requisições da API de 10 por minuto)
    if (!sucesso) {
        document.getElementById("jogos").innerHTML = `
            <div style="text-align: center; color: #ff4d4d; padding: 20px;">
                <h2>Erro ao carregar os jogos.</h2>
                <p style="font-size: 14px; color: #888; margin-top: 8px;">
                    Limite de requisições excedido. O site tentará atualizar automaticamente em instantes...
                </p>
            </div>
        `;
    }
}

function mostrarJogos() {
    let pesquisa = document.getElementById("pesquisa").value.toLowerCase();
    let html = "";

    const jogosFiltrados = jogos.filter(j => {
        const passaFiltroStatus = filtro === "ALL" || j.status === filtro;
        
        const nomeHome = (j.homeTeam && j.homeTeam.name) ? j.homeTeam.name.toLowerCase() : "";
        const nomeAway = (j.awayTeam && j.awayTeam.name) ? j.awayTeam.name.toLowerCase() : "";
        const passaPesquisa = nomeHome.includes(pesquisa) || nomeAway.includes(pesquisa);
        
        return passaFiltroStatus && passaPesquisa;
    });

    if (jogosFiltrados.length === 0) {
        document.getElementById("jogos").innerHTML = `
            <h3 style="text-align: center; color: #888; margin-top: 40px;">Nenhum jogo encontrado</h3>
        `;
        return;
    }

    jogosFiltrados.forEach(jogo => {
        let status = jogo.status;

        // VERIFICAÇÃO E CORREÇÃO DO STATUS COM HORÁRIO DO BRASIL CORRETO
        if (jogo.status === "LIVE" || jogo.status === "IN_PLAY") {
            status = "🔴 AO VIVO";
        } else if (jogo.status === "TIMED" || jogo.status === "SCHEDULED") {
            // Garante que o navegador interprete corretamente a data UTC da API
            const dataJogo = new Date(jogo.utcDate);
            
            // Pega a hora formatada em português brasileiro (ex: "16:00") e força o fuso de Brasília
            const horaFormatada = dataJogo.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/Sao_Paulo"
            });
            
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

        html += `
        <div class="card">
            <div class="liga">
                 🏟️ ${nomeCompeticao}
            </div>

            <div class="times">
                <div class="time">
                    <img src="${escudoHome}" alt="${nomeCasa}" onerror="this.src='https://via.placeholder.com/40?text=⚽'">
                    <div class="nome">
                        ${nomeCasa}
                    </div>
                </div>

                <div>
                    <div class="placar">
                        ${golsHome} - ${golsAway}
                    </div>
                    <div class="status">
                        ${status}
                    </div>
                </div>

                <div class="time">
                    <img src="${escudoAway}" alt="${nomeFora}" onerror="this.src='https://via.placeholder.com/40?text=⚽'">
                    <div class="nome">
                        ${nomeFora}
                    </div>
                </div>
            </div>
        </div>
        `;
    });

    document.getElementById("jogos").innerHTML = html;
}

function filtrar(tipo){
    filtro = tipo;
    mostrarJogos();
}

document.getElementById("pesquisa").addEventListener("input", mostrarJogos);

// Carrega os jogos ao abrir a página
carregarJogos();

// Atualiza automaticamente a cada 60 segundos (1 minuto)
setInterval(carregarJogos, 60000);
