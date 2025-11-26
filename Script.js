document.addEventListener("DOMContentLoaded",main,false);

const MAX_WIDTH = 1000;
const MAX_HEIGHT = 500;
const PIXEL_DIM = 20;
const MAX_X = MAX_WIDTH/PIXEL_DIM;
const MAX_Y = MAX_HEIGHT/PIXEL_DIM;
const SCOLOR = "yellow";
const FCOLOR = "red";
const UCOLOR = "white";
const GAMETICK = 100;
const EzMode = true;
const EzLevel = 2;
const SuperProb = 10;

const percorsiTesta=["./Images/Testa_Up.png","./Images/Testa_Right.png","./Images/Testa_Down.png","./Images/Testa_Left.png"];
const percorsiCorpo=["./Images/Corpo_Up.png","./Images/Corpo_Right.png","./Images/Corpo_Down.png","./Images/Corpo_Left.png"];
const percorsiCoda=["./Images/Coda_Up.png","./Images/Coda_Right.png","./Images/Coda_Down.png","./Images/Coda_Left.png"];
const percorsiS = [percorsiTesta,percorsiCorpo,percorsiCoda];
let immaginiFinali = [];

for(let j = 0;j<4;j++){
    let immagini = [];
    if( j == 3){
        let timg = new Image;
        timg.src = "./Images/Cibo.png";
        let simg = new Image;
        simg.src = "./Images/Super_Cibo.png"
        immagini.push(timg);
        immagini.push(simg);
    }else{
        for(let i = 0;i<4;i++){
            let timg = new Image;
            timg.src = percorsiS[j][i];
            immagini.push(timg);
        }
    }
    immaginiFinali.push(immagini);
}
/*
for(let i = 0;i<4;i++){
    for(let j = 0;j<immaginiFinali[i].length;j++){
        console.log(immaginiFinali[i][j].src);
    }
}*/

const indiciPosizioni= [3,0,0,2,1] // 2 * direz[0] + direz[1] + 2 ---> per la posizione

let direz;
let pos;
let dim = 3;
let ris=null;
let generato;
let posF;
let maxP=0;
let superFood=false;

function getObj(id){
    return document.getElementById(id);
}

function main(){
    getObj("start").addEventListener("click",game);
    document.addEventListener("keydown",(a) => {
        if(ris==null) return
        let b = a.code;
        let deltax = pos[pos.length -1][0] - pos[pos.length-2][0];
        let deltay = pos[pos.length -1][0] - pos[pos.length-2][0];
        switch(b){
            case "KeyW":
            case "ArrowUp":
                if(deltax == 0 && deltay == 0){
                    return;
                }else if(direz[1] != 1){
                    direz = [0,-1];
                }
                break;
            case "KeyS":
            case "ArrowDown":
                if(deltax == 0 && deltay == 0){
                    return;
                }else if(direz[1] != -1){
                    direz = [0,1];  
                }
                break
            case "KeyA":
            case "ArrowLeft":
                if(deltax == 1 && deltay == 1){
                    return;
                }
                if(direz[0] != 1){
                    direz = [-1,0];
                }
                break;
            case "KeyD":
            case "ArrowRight":
                if(deltax == -1 && deltay == -1){
                    return;
                }else if(direz[0] != -1){
                    direz = [1,0];
                }
                break;
        }
    })
    putPunteggio("Sc",0);
    pulisciCampo(getObj("campoGioco").getContext("2d"));
}

function game(){
    if(ris!=null){
        return;
    }
    let campo = getObj("campoGioco");
    campo = campo.getContext("2d");
    direz = [1,0];
    pos = [[10,10]];
    dim = 3;
    generato=false;
    ris = setInterval(() => {
        if(!generato){
            posF = spawnFood(campo,pos);
            //console.log(posF[0]);
            generato = true;
        }

        let index = dim -1 > pos.length-1 ? pos.length-1 : dim-1;
        
        let nuovaPos = [pos[index][0] + direz[0],pos[index][1] + direz[1]];
        pos.push(nuovaPos);      // aggiornamento posizione testa la pos è una lista invertita, l'ultima posizione è la testa
        //console.log(pos)              // posvecchia posnuova

        dim = checkFood(pos,posF,generato);

        pos = clearPath(campo,dim,pos);     //tolgo la pos vecchia
                
        if(checkCollisioni(pos)){
            stopGame(campo);
            return;
        }
        
        //console.log(dim);

        disegnaQuadrati(campo,pos,SCOLOR,"s");      // solo qua aggiorno lo screen
        putPunteggio("Sc",dim-3);

    },GAMETICK);
}

function putPunteggio(id,curr){
    let obj = getObj(id);
    let tex = `Corrente: ${curr} Massimo: ${maxP}`;
    obj.innerText=tex;
}

function checkFood(pos,posFood){
    if(pos[pos.length-1][0] == posFood[0][0] && pos[pos.length-1][1] == posFood[0][1]){ 
        generato = false;
    }
    let delta = 1;
    if(superFood){
        delta = 5
    }
    return (generato ? dim:dim+delta);
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
    //console.log("Generazione di un nuovo food");
    let conflitto = true;
    while(conflitto){
        for(let x = 0;x<posSnake.length;x++){
            if(pos[0][0] == posSnake[x][0] && pos[0][1] == posSnake[x][1]){     // controllo conflitti con snake
                pos = generaPosRandom();
                conflitto = true;
                break;
            }else{
                conflitto = false;
            }
        }
        if(EzMode){
            if(pos[0][0] < EzLevel || pos[0][0] > MAX_X - EzLevel){
                pos = generaPosRandom();
                conflitto = true;
            }else if(pos[0][1] < EzLevel || pos[0][1] > MAX_Y - EzLevel){
                pos = generaPosRandom();
                conflitto = true;
            }else{
                //console.log(pos[0]);
                conflitto = false;
            }
        }
    }
    let isSuper = random(0,SuperProb);
    superFood = isSuper == SuperProb;
    disegnaQuadrati(c,pos,FCOLOR,"c");
    return pos;
}

function stopGame(c){
    clearInterval(ris);
    pulisciCampo(c);
    //alert("Hai perso");
    maxP= dim-3 > maxP ? dim-3:maxP;
    putPunteggio("Sc",0);
    ris=null
}

function disegnaQuadrati(c,posizioni,color,id){
    c.fillStyle= id=="s"? UCOLOR : color;
    for(let x = 0;x<posizioni.length;x++){
        let posx = posizioni[x][0]*PIXEL_DIM;
        let posy = posizioni[x][1]*PIXEL_DIM;

        if(id == "s"){
            c.fillRect(posx,posy,PIXEL_DIM,PIXEL_DIM);  //pulisco
            switch(x){
                case (posizioni.length-1):  //testa     
                    let indiceS = formula(direz);
                    c.drawImage(immaginiFinali[0][indiciPosizioni[indiceS]],posx,posy);
                    break;
                default:        //corpo e coda
                    let deltax = pos[x+1][0] - pos[x][0];
                    let deltay = pos[x+1][1] - pos[x][1];
                    let direzione = [deltax,deltay];
                    let indiceC = formula(direzione);
                    let parte = x==0 ? 2 : 1;  // 2 per coda, 1 per corpo
                    c.drawImage(immaginiFinali[parte][indiciPosizioni[indiceC]],posx,posy);
                    break;
            }
           
        }else if(id == "c"){
            let img = immaginiFinali[3][0];
            if(superFood){
                img = immaginiFinali[3][1];
            }
            c.drawImage(img,posx,posy);
        }else{
            c.fillRect(posx,posy,PIXEL_DIM,PIXEL_DIM);
        }
    }
}

function generaPosRandom(){
    return [[random(0,MAX_X-1),random(0,MAX_Y-1)]];
}

function random(min,max){
    return Math.floor(Math.random() * (max - min +1) + min);
}

function pulisciCampo(c){
    c.fillStyle=UCOLOR;
    c.fillRect(0,0,MAX_WIDTH,MAX_HEIGHT);
}

function formula(direzione){            // LA formula per abbinare direzione a index dello sprite giusto
    return 2 * direzione[0] + direzione[1] + 2;
}

