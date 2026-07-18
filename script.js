const API_URL = "https://api.football-data.org/v4/matches";
const API_KEY = "cb6cfc4960ec49edb8a04af5975ab816";


async function carregarJogos() {
    const container = document.getElementById("jogos");

    try {
        const res = await fetch(API_URL, {
            headers: {
                "X-Auth-Token": API_KEY
            }
        });

        if (!res.ok) throw new Error("Erro na API");

        const data = await res.json();

        if (data.matches && data.matches.length > 0) {
            exibirJogos(data.matches);
        } else {
            container.innerHTML = "<p>Nenhum jogo encontrado.</p>";
        }

    } catch (erro) {
        console.error(erro);
        container.innerHTML = "<p>Erro ao carregar jogos.</p>";
    }
}


function exibirJogos(listaJogos) {
    const container = document.getElementById("jogos");
    let html = "";

    listaJogos.forEach(jogo => {


        const data = new Date(jogo.utcDate);

        const hoje = new Date();
        hoje.setHours(0,0,0,0);

        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 1);
        amanha.setHours(0,0,0,0);


        const hora = data.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });


        let dataJogo;


        if (data.toDateString() === hoje.toDateString()) {
            dataJogo = `Hoje ${hora}`;
        } 
        else if (data.toDateString() === amanha.toDateString()) {
            dataJogo = `Amanhã ${hora}`;
        } 
        else {
            dataJogo = data.toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        }



        let status =
            jogo.status === "IN_PLAY" || jogo.status === "PAUSED"
            ? "🔴 AO VIVO"
            : jogo.status === "FINISHED"
            ? "Finalizado"
            : "Agendado";



        let placar =
            jogo.status === "SCHEDULED"
            ? "VS"
            : `${jogo.score.fullTime.home ?? 0} - ${jogo.score.fullTime.away ?? 0}`;



        const escudoCasa = jogo.homeTeam.crest
            ? `<img src="${jogo.homeTeam.crest}" width="40" height="40">`
            : "⚽";


        const escudoFora = jogo.awayTeam.crest
            ? `<img src="${jogo.awayTeam.crest}" width="40" height="40">`
            : "⚽";



        html += `
        <div class="jogo-card" style="
            background:white;
            margin:10px;
            padding:15px;
            border-radius:10px;
            text-align:center;
        ">

            <h3>🏟 ${jogo.competition.name}</h3>

            <p>📅 ${dataJogo}</p>

            <div style="
                display:flex;
                justify-content:center;
                align-items:center;
                gap:15px;
            ">

                <div>
                    ${escudoCasa}
                    <br>
                    ${jogo.homeTeam.shortName || jogo.homeTeam.name}
                </div>


                <div>
                    <strong style="font-size:22px">
                        ${placar}
                    </strong>
                    <br>
                    ${status}
                </div>


                <div>
                    ${escudoFora}
                    <br>
                    ${jogo.awayTeam.shortName || jogo.awayTeam.name}
                </div>

            </div>

        </div>
        `;
    });


    container.innerHTML = html;
}


// Carrega os jogos ao abrir o site
carregarJogos();


// Atualiza automaticamente a cada 60 segundos
setInterval(carregarJogos, 60000);
