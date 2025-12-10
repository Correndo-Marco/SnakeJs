document.addEventListener("DOMContentLoaded",main,false);

const MAX_WIDTH = 500;
const MAX_HEIGHT = 500;
const PIXEL_DIM = 20;
const MAX_X = MAX_WIDTH/PIXEL_DIM;
const MAX_Y = MAX_HEIGHT/PIXEL_DIM;
const SCOLOR = "yellow";
const FCOLOR = "red";
const UCOLOR = "white";
const AllDirez=[[0,1],[-1,0],[1,0],[0,-1]]
const START_DIM = 3;

const percorsiTesta=["./Images/Testa_Up.png","./Images/Testa_Right.png","./Images/Testa_Down.png","./Images/Testa_Left.png"];
const percorsiCorpo=["./Images/Corpo_Up.png","./Images/Corpo_Right.png","./Images/Corpo_Down.png","./Images/Corpo_Left.png"];
const percorsiCoda=["./Images/Coda_Up.png","./Images/Coda_Right.png","./Images/Coda_Down.png","./Images/Coda_Left.png"];
const percorsiS = [percorsiTesta,percorsiCorpo,percorsiCoda];
const immaginiFinali = creaImmaginiFinali();

const indiciPosizioni= [3,0,0,2,1] // 2 * direz[0] + direz[1] + 2 ---> per la posizione , vedere formula

let gameInfo = {
    direz : null,
    pos : null,
    dim : 3,
    ris : null,
    generatoFood : false,
    posF : null,
    maxP : 0,
    superFood : false,
    SuperProb : 10,
    EzLevel : 2,
    EzMode : true,
    GAMETICK : 80
};

/*
let direz;      // direzione snake
let pos;        // posizione snake
let dim = 3;
let ris=null;
let generatoFood;
let posF;
let maxP = 0;
let superFood=false;
*/

function getObj(id){
    return document.getElementById(id);
}

function main(){
    getObj("start").addEventListener("click",game);
    document.addEventListener("keydown",(a) => {
        if(gameInfo.ris==null) return
        let b = a.code;
        let deltax = gameInfo.pos[gameInfo.pos.length -1][0] - gameInfo.pos[gameInfo.pos.length-2][0];
        let deltay = gameInfo.pos[gameInfo.pos.length -1][1] - gameInfo.pos[gameInfo.pos.length-2][1];
        switch(b){
            case "KeyW":
            case "ArrowUp":
                if(deltax == 0 && deltay == 0){
                    return;
                }else if(gameInfo.direz[1] != 1){
                    gameInfo.direz = [0,-1];
                }
                break;
            case "KeyS":
            case "ArrowDown":
                if(deltax == 0 && deltay == -1){
                    return;
                }else if(gameInfo.direz[1] != -1){
                    gameInfo.direz = [0,1];  
                }
                break
            case "KeyA":
            case "ArrowLeft":
                if(deltax == 1 && deltay == 0){
                    return;
                }
                if(gameInfo.direz[0] != 1){
                    gameInfo.direz = [-1,0];
                }
                break;
            case "KeyD":
            case "ArrowRight":
                if(deltax == -1 && deltay == 0){
                    return;
                }else if(gameInfo.direz[0] != -1){
                    gameInfo.direz = [1,0];
                }
                break;
        }
    })
    setPunteggio();
    putPunteggio(0);
    pulisciCampo(getObj("campoGioco").getContext("2d"));
}

function game(){
    if(gameInfo.ris!=null) return

    let campo = getObj("campoGioco");
    campo = campo.getContext("2d");
    init_game();

    gameInfo.ris = setInterval(() => {
        
        if(!gameInfo.generatoFood){
            gameInfo.posF = spawnFood();
            disegnaCibo(campo,gameInfo.posF);
            gameInfo.generatoFood = true;
        }
        
        cresci();
        checkFood(gameInfo.posF);
        clearPath(campo);
        
        if(checkCollisioni(gameInfo.pos)){
            stopGame(campo);
            return;
        }
        
        disegnaSnake(campo,gameInfo.pos);
        putPunteggio(gameInfo.dim-START_DIM);
       
    },gameInfo.GAMETICK);
}

function cresci(){
    let index = gameInfo.dim -1 > gameInfo.pos.length-1 ? gameInfo.pos.length-1 : gameInfo.dim-1;
    let nuovax = gameInfo.pos[index][0] + gameInfo.direz[0];
    let nuovay = gameInfo.pos[index][1] + gameInfo.direz[1];
    let nuovaPos = [nuovax,nuovay];
    gameInfo.pos.push(nuovaPos);
}

function init_game(){
    gameInfo.direz = AllDirez[random(0,3)];
    gameInfo.pos = generaPosRandomForSnake();
    gameInfo.dim = START_DIM;
    gameInfo.generatoFood = false;
}

function putPunteggio(curr){
    let obj = getObj("Sc");
    let tex = `Corrente: ${curr} Massimo: ${gameInfo.maxP}`;
    obj.innerText=tex;
}

function checkFood(posFood){
    let last = gameInfo.pos.length - 1;
    if(gameInfo.pos[last][0] == posFood[0] && gameInfo.pos[last][1] == posFood[1]){ 
        gameInfo.generatoFood = false;
    }
    let delta = 1;
    if(gameInfo.superFood){
        delta = 5
    }
    gameInfo.dim += gameInfo.generatoFood ? 0 : delta;
}

function checkCollisioni(pos){
    let last = pos.length - 1;
    if(pos[last][0] < 0 || pos[last][0] >= MAX_X){
        return true;
    }else if(pos[last][1] < 0 || pos[last][1] >= MAX_Y){
        return true;
    }else if(last>1){
        for(let i = 0;i<last;i++){
            if(pos[last][0] == pos[i][0] && pos[last][1] == pos[i][1]){
                return true;
            }
        }
    }
    return false;
}

function clearPath(c){
    for(let x = gameInfo.pos.length-1 - gameInfo.dim; x>=0; x--){
        disegnaQuadrati(c,[gameInfo.pos[x]],UCOLOR);
        gameInfo.pos.splice(0,1);
    }
}

function spawnFood(){
    let posTemp = generaPosRandom();
    let conflitto = true;
    while(conflitto){
        for(let x = 0;x<gameInfo.pos.length;x++){
            if(posTemp[0] == gameInfo.pos[x][0] && posTemp[1] == gameInfo.pos[x][1]){     // controllo conflitti con snake
                posTemp = generaPosRandom();
                conflitto = true;
                break;
            }else{
                conflitto = false;
            }
        }
        if(gameInfo.EzMode){
            if(posTemp[0] < gameInfo.EzLevel || posTemp[0] > MAX_X - gameInfo.EzLevel){
                posTemp = generaPosRandom();
                conflitto = true;
            }else if(posTemp[1] < gameInfo.EzLevel || posTemp[1] > MAX_Y - gameInfo.EzLevel){
                posTemp = generaPosRandom();
                conflitto = true;
            }else{
                conflitto = false;
            }
        }
    }
    let isSuper = random(0,gameInfo.SuperProb);
    gameInfo.superFood = isSuper == gameInfo.SuperProb;
    return posTemp;
}

function stopGame(c){
    clearInterval(gameInfo.ris);
    pulisciCampo(c);
    gameInfo.maxP= gameInfo.dim- START_DIM > gameInfo.maxP ? gameInfo.dim-START_DIM : gameInfo.maxP;
    setPunteggio();
    putPunteggio(0);
    gameInfo.ris = null
    updatePuls("Hai perso");
    setTimeout(updatePuls,1500);
}

function updatePuls(str = "Inizia partita"){
    let iniz = getObj("start");
    iniz.innerText = str;
    if(str == "Hai perso"){
        iniz.style.backgroundColor = "red";
    }else{
        iniz.style.backgroundColor = "#22c55e";
    }
}

function setPunteggio(){
    let maxAttuale = Number(localStorage.getItem("MaxP"));
    if(maxAttuale == null){
        localStorage.setItem("MaxP",gameInfo.maxP);
    }else{
        if(maxAttuale < gameInfo.maxP){
            localStorage.setItem("MaxP",gameInfo.maxP);
        }else if(gameInfo.maxP < maxAttuale){
            gameInfo.maxP = maxAttuale;
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
                let indiceS = formula(gameInfo.direz);
                c.drawImage(immaginiFinali[0][indiciPosizioni[indiceS]],posx,posy);
                break;
            default:        //corpo e coda
                let deltax = posizioni[x+1][0] - posizioni[x][0];
                let deltay = posizioni[x+1][1] - posizioni[x][1];
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
    if(gameInfo.superFood){
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