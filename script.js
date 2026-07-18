<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gustavo Placares</title>

<style>
body {
    background:#111;
    color:white;
    font-family:Arial;
    margin:0;
}

h1 {
    text-align:center;
}

#jogos {
    max-width:600px;
    margin:auto;
}
</style>
</head>

<body>

<h1>⚽ Gustavo Placares</h1>

<div id="jogos"></div>

<script>

const API_KEY = "cb6cfc4960ec49edb8a04af5975ab816";

let jogos = [];
let filtro = "ALL";


// Buscar jogos na API
async function carregarJogos(){

    try {

        const resposta = await fetch(
            "https://api.football-data.org/v4/matches",
            {
                headers:{
                    "X-Auth-Token": API_KEY
                }
            }
        );

        const dados = await resposta.json();

        jogos = dados.matches || [];

        mostrarJogos();

    } catch(e){

        document.getElementById("jogos").innerHTML =
        "<h3 style='text-align:center'>Erro ao carregar jogos</h3>";

        console.log(e);
    }

}


// Mostrar jogos
function mostrarJogos(){

let html="";

const hoje = new Date().toLocaleDateString("pt-BR");


const jogosFiltrados = jogos.filter(j=>{

const statusAoVivo =
j.status==="LIVE" ||
j.status==="IN_PLAY" ||
j.status==="PAUSED";


return filtro==="ALL" ||
j.status===filtro ||
(filtro==="LIVE" && statusAoVivo);

});


if(jogosFiltrados.length===0){

document.getElementById("jogos").innerHTML =
"<h3 style='text-align:center;color:#888'>Nenhum jogo encontrado</h3>";

return;

}



jogosFiltrados.forEach(jogo=>{


let status=jogo.status;
let cor="#2ecc71";


if(
jogo.status==="LIVE" ||
jogo.status==="IN_PLAY" ||
jogo.status==="PAUSED"
){

status="🔴 AO VIVO";
cor="#ff4444";

}

else if(
jogo.status==="TIMED" ||
jogo.status==="SCHEDULED"
){

const data=new Date(jogo.utcDate);

const dataFormatada=
data.toLocaleDateString("pt-BR");

const hora=
data.toLocaleTimeString("pt-BR",
{
hour:"2-digit",
minute:"2-digit",
timeZone:"America/Sao_Paulo"
});


if(dataFormatada===hoje){

status=`📅 Hoje às ${hora}`;

}else{

status=`📅 ${dataFormatada} às ${hora}`;

}

}

else if(jogo.status==="FINISHED"){

status="✔ Encerrado";
cor="#888";

}



const casa =
jogo.homeTeam?.shortName ||
jogo.homeTeam?.name ||
"Casa";


const fora =
jogo.awayTeam?.shortName ||
jogo.awayTeam?.name ||
"Fora";


const escudoCasa =
jogo.homeTeam?.crest ||
"https://via.placeholder.com/40";


const escudoFora =
jogo.awayTeam?.crest ||
"https://via.placeholder.com/40";



const golsCasa =
jogo.score?.fullTime?.home ??
jogo.score?.current?.home ??
0;


const golsFora =
jogo.score?.fullTime?.away ??
jogo.score?.current?.away ??
0;



html += `

<div style="
background:#1e1e1e;
margin:10px;
padding:15px;
border-radius:10px;
text-align:center;
">

<div style="color:#aaa;font-size:12px">
🏆 ${jogo.competition?.name || ""}
</div>


<div style="
display:flex;
justify-content:space-around;
align-items:center;
margin-top:15px;
">


<div>
<img src="${escudoCasa}" width="40">
<br>
<b>${casa}</b>
</div>


<div>

<div style="
font-size:22px;
font-weight:bold;
">

${golsCasa} - ${golsFora}

</div>


<div style="color:${cor}">
${status}
</div>


</div>


<div>
<img src="${escudoFora}" width="40">
<br>
<b>${fora}</b>
</div>


</div>

</div>

`;

});


document.getElementById("jogos").innerHTML=html;


}



// Atualiza automaticamente a cada 30 segundos
setInterval(carregarJogos,30000);


// Carrega ao abrir
carregarJogos();


</script>

</body>
</html>
