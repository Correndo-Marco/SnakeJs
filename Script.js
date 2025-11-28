document.addEventListener("DOMContentLoaded",main,false);

const MAX_WIDTH = 1000;
const MAX_HEIGHT = 500;
const PIXEL_DIM = 20;
const MAX_X = MAX_WIDTH/PIXEL_DIM;
const MAX_Y = MAX_HEIGHT/PIXEL_DIM;
const SCOLOR = "yellow";
const FCOLOR = "red";
const UCOLOR = "white";
const GAMETICK = 80;
const EzMode = true;
const EzLevel = 2;
const SuperProb = 10;
const AllDirez=[[0,1],[-1,0],[1,0],[0,-1]]

const percorsiTesta=["./Images/Testa_Up.png","./Images/Testa_Right.png","./Images/Testa_Down.png","./Images/Testa_Left.png"];
const percorsiCorpo=["./Images/Corpo_Up.png","./Images/Corpo_Right.png","./Images/Corpo_Down.png","./Images/Corpo_Left.png"];
const percorsiCoda=["./Images/Coda_Up.png","./Images/Coda_Right.png","./Images/Coda_Down.png","./Images/Coda_Left.png"];
const percorsiS = [percorsiTesta,percorsiCorpo,percorsiCoda];
const immaginiFinali = creaImmaginiFinali();

const indiciPosizioni= [3,0,0,2,1] // 2 * direz[0] + direz[1] + 2 ---> per la posizione , vedere formula

let direz;      // direzione snake
let pos;        // posizione snake
let dim = 3;
let ris=null;
let generatoFood;
let posF;
let maxP = 0;
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
    setPunteggio();
    putPunteggio(0);
    pulisciCampo(getObj("campoGioco").getContext("2d"));
}

function game(){
    if(ris!=null){
        return;
    }
    let campo = getObj("campoGioco");
    campo = campo.getContext("2d");

    init_game();
    ris = setInterval(() => {
        if(!generatoFood){
            posF = spawnFood();
            disegnaCibo(campo,posF);
            generatoFood = true;
        }
        cresci();
        checkFood(pos,posF);
        clearPath(campo,dim,pos);

        if(checkCollisioni(pos)){
            stopGame(campo);
            return;
        }
        
        disegnaSnake(campo,pos);
        putPunteggio(dim-3);

    },GAMETICK);
}

function cresci(){
    let index = dim -1 > pos.length-1 ? pos.length-1 : dim-1;
    let nuovax = pos[index][0] + direz[0];
    let nuovay = pos[index][1] + direz[1];
    let nuovaPos = [nuovax,nuovay];
    pos.push(nuovaPos);
}

function init_game(){
    direz = AllDirez[random(0,3)];
    pos =   generaPosRandomForSnake();
    dim = 3;
    generatoFood = false;
}

function putPunteggio(curr){
    let obj = getObj("Sc");
    let tex = `Corrente: ${curr} Massimo: ${maxP}`;
    obj.innerText=tex;
}

function checkFood(pos,posFood){
    if(pos[pos.length-1][0] == posFood[0] && pos[pos.length-1][1] == posFood[1]){ 
        generatoFood = false;
    }
    let delta = 1;
    if(superFood){
        delta = 5
    }
    //return (generatoFood ? dim : dim+delta);
    dim += generatoFood ? 0 : delta;
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

function clearPath(c){
    for(let x = pos.length-1-dim;x>=0;x--){
        disegnaQuadrati(c,[pos[x]],UCOLOR);
        pos.splice(0,1);
    }
}

function spawnFood(){
    let posTemp = generaPosRandom();
    let conflitto = true;
    while(conflitto){
        for(let x = 0;x<pos.length;x++){
            if(posTemp[0] == pos[x][0] && posTemp[1] == pos[x][1]){     // controllo conflitti con snake
                posTemp = generaPosRandom();
                conflitto = true;
                break;
            }else{
                conflitto = false;
            }
        }
        if(EzMode){
            if(posTemp[0] < EzLevel || posTemp[0] > MAX_X - EzLevel){
                posTemp = generaPosRandom();
                conflitto = true;
            }else if(posTemp[1] < EzLevel || posTemp[1] > MAX_Y - EzLevel){
                posTemp = generaPosRandom();
                conflitto = true;
            }else{
                conflitto = false;
            }
        }
    }
    let isSuper = random(0,SuperProb);
    superFood = isSuper == SuperProb;
    return posTemp;
}

function stopGame(c){
    clearInterval(ris);
    pulisciCampo(c);
    //alert("Hai perso");
    maxP= dim-3 > maxP ? dim-3 : maxP;
    setPunteggio();
    putPunteggio(0);
    ris=null
}

function setPunteggio(){
    let maxAttuale = localStorage.getItem("MaxP");
    if(maxAttuale == null){
        localStorage.setItem("MaxP",maxP);
    }else{
        if(maxAttuale < maxP){
            localStorage.setItem("MaxP",maxP);
        }else if(maxP < maxAttuale){
            maxP = maxAttuale;
        }
    }
}

function disegnaQuadrati(c,posizioni,color){
    for(let x = 0;x<posizioni.length;x++){
        let posx = posizioni[x][0]*PIXEL_DIM;
        let posy = posizioni[x][1]*PIXEL_DIM;
        disegnaQuadrato(c,posx,posy,color);
    }
}

function disegnaQuadrato(c,x,y,colore){
    c.fillStyle = colore;
    c.fillRect(x,y,PIXEL_DIM,PIXEL_DIM);
}

function disegnaSnake(c,posizioni){
    c.fillStyle = UCOLOR;
    for(let x = 0;x<posizioni.length;x++){
        let posx = posizioni[x][0]*PIXEL_DIM;
        let posy = posizioni[x][1]*PIXEL_DIM;
        c.fillRect(posx,posy,PIXEL_DIM,PIXEL_DIM);
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
    }
}

function disegnaCibo(c,posizioni){
    let posx = posizioni[0]*PIXEL_DIM;
    let posy = posizioni[1]*PIXEL_DIM;
    let img = immaginiFinali[3][0];
    if(superFood){
        img = immaginiFinali[3][1];
    }
    c.drawImage(img,posx,posy);
}

function generaPosRandom(){
    return [random(0,MAX_X-1),random(0,MAX_Y-1)];
}

function generaPosRandomForSnake(){
    let posTemp = generaPosRandom();
    let conflitto = true;
    let diff = 10;
    while(conflitto){
        if(posTemp[0] < diff || posTemp[0] > MAX_X - diff){
            posTemp = generaPosRandom();
        }else if(posTemp[1] < diff || posTemp[1] > MAX_Y - diff){
            posTemp = generaPosRandom();
        }else{
            conflitto = false;
        }
    }
    return [posTemp];
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

function creaImmaginiFinali(){
    let temp = [];
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
        temp.push(immagini);
    }
    return temp;
}