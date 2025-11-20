document.addEventListener("DOMContentLoaded",main,false);

const MAX_WIDTH=500;
const MAX_HEIGHT=500;
const PIXEL_DIM = 20;
const MAX_X =MAX_WIDTH/PIXEL_DIM;
const MAX_Y =MAX_HEIGHT/PIXEL_DIM;
const SCOLOR = "black";
const FCOLOR = "red";
const UCOLOR = "white";
const GAMETICK= 100;
let direz;
let pos;
let dim = 1;
let ris=null;
let generato;
let posF;

function getObj(id){
    return document.getElementById(id);
}

function main(){
    getObj("start").addEventListener("click",game);
    document.addEventListener("keydown",(a) => {
        let b = a.code;
        switch(b){
            case "KeyW":
            case "ArrowUp":
                if(direz[1] != 1){
                    direz = [0,-1];
                }
                break;
            case "KeyS":
            case "ArrowDown":
                if(direz[1] != -1){
                    direz = [0,1];
                }
                break
            case "KeyA":
            case "ArrowLeft":
                if(direz[0] != 1){
                    direz = [-1,0];
                }
                break;
            case "KeyD":
            case "ArrowRight":
                if(direz[0] != -1){
                    direz = [1,0];
                }
                break;
        }
    })
}

function game(){
    if(ris!=null){
        alert("Hai già startato una partita");
        return;
    }
    let campo = getObj("campoGioco");
    campo = campo.getContext("2d");
    direz = [1,0];
    pos = [[10,10]];
    dim = 1;
    generato=false;
    ris = setInterval(() => {
        if(!generato){
            posFood = spawnFood(campo,pos);
            console.log(posFood[0]);
            generato = true;
        }

        let index = dim == 1 ? dim-1 : pos.length-1;
        
        nuovaPos = [pos[index][0] + direz[0],pos[index][1] + direz[1]];
        pos.push(nuovaPos);      // aggiornamento posizione testa la pos è una lista invertita, l'ultima posizione è la testa
        //console.log(pos)              // posvecchia posnuova

        dim = checkFood(pos,posFood,generato);

        pos = clearPath(campo,dim,pos);     //tolgo la pos vecchia
                
        if(checkCollisioni(pos)){
            stopGame(campo);
            return;
        }
        
        //console.log(dim);

        disegnaQuadrati(campo,pos,SCOLOR);      // solo qua aggiorno lo screen
        

    },GAMETICK);
}

function checkFood(pos,posFood){
    if(pos[pos.length-1][0] == posFood[0][0] && pos[pos.length-1][1] == posFood[0][1]){ 
        generato = false;
    }
    return (generato ? dim:dim+1);
}

function checkCollisioni(pos){
    if(pos[pos.length-1][0] < 0 || pos[pos.length-1][0] >= MAX_X){
        return true;
    }else if(pos[pos.length-1][1] < 0 || pos[pos.length-1][1] >= MAX_Y){
        return true;
    }else if(pos.length>1){
        let max = pos.length-1
        for(let i = 0;i<pos.length-1;i++){
            if(pos[max][0] == pos[i][0] && pos[max][1] == pos[i][1]){
                return true;
            }
        }
    }
    return false;
}

function clearPath(c,dim,posSnake){
    for(let x = posSnake.length-1-dim;x>=0;x--){
        disegnaQuadrati(c,[posSnake[x]],UCOLOR);
        posSnake.splice(0,1);
        //console.log(x);
    }
    return posSnake;
}

function spawnFood(c,posSnake){
    let pos = generaPosRandom();
    console.log("Generazione di un nuovo food");
    let conflitto = true;
    while(conflitto){
        for(let x = 0;x<posSnake.length;x++){
            if(pos[0][0] == posSnake[x][0] && pos[0][1] == posSnake[x][1]){
                pos = generaPosRandom();
                break;
            }else{
                conflitto = false;
            }
        }
    }
    disegnaQuadrati(c,pos,FCOLOR);
    return pos;
}

function stopGame(c){
    clearInterval(ris);
    c.fillStyle="white";
    c.fillRect(0,0,MAX_WIDTH,MAX_HEIGHT);
    alert("Hai perso");
    ris=null
}

function disegnaQuadrati(c,posizioni,color){
    c.fillStyle=color;
    for(let x = 0;x<posizioni.length;x++){
        c.fillRect(posizioni[x][0]*PIXEL_DIM,posizioni[x][1]*PIXEL_DIM,PIXEL_DIM,PIXEL_DIM);
    }
}

function generaPosRandom(){
    return [[random(0,MAX_X-1),random(0,MAX_Y-1)]];
}

function random(min,max){
    return Math.floor(Math.random() * (max - min +1) + min);
}
