import "./style.css";

let frameCount = 0;
const debugDiv = gEI("debug");

function getDebug(innerHtml: string) {
  if (frameCount == 3 && debugDiv) debugDiv.innerHTML = innerHtml;

  frameCount++;
  if (frameCount >= 10) frameCount = 0;
}
type Position = {
  x: number,
  y: number,
};

type Size = {
  h: number,
  w: number,
  halfSizeH: number,
  halfSizeW: number
};

type BgSize = {
  h: number,
  w: number
};


const Variant = {
  player: 0,
  enemy: 1,
  wall: 2,
  attack: 3
};

const State = {
  moving: 0,
  still: 1,
  attacking: 2,
}

type VariantKey = keyof typeof Variant;

type Attack = {
  damage: number,
  cooldown: number,
  runtime: number,
  ammunition: number,
  speed: number,
  moving: boolean,
  position: Position,
  size: Size,
  collisionLayer: Set<number>,
  targetCollisionLayer: Set<number>,
  color: string,
  targetPosition: Position,
  rotationTarget: Position,
  rotation: number,
}

type Thing = {
  id: number,
  variant: typeof Variant[VariantKey], 
  hp: number,
  maxHp: number,
  attack: Attack,
  speed: number,
  slowed: number,
  moving: boolean,
  position: Position,
  distanceX: number,
  distanceY: number,
  size: Size,
  collisionLayer: Set<number>,
  targetCollisionLayer: Set<number>,
  color: string,
  targetPosition: Position,
  rotationTarget: Position,
  rotation: number,
}

type Zone = {
  color: string,
  position: Position,
  size: BgSize
};

let GLOBALID = 1;

const INITTHINGSNOTPLAYER = 100;

const defaultZoneSize = {h: 720, w: 1280};

const playerCentered = {x: defaultZoneSize.w/2, y:  defaultZoneSize.h/2}

const map = [
  {color: "rebeccapurple", position: {x:0, y:0}, size: defaultZoneSize},
  {color: "blue", position: {x:1, y:0}, size: defaultZoneSize},
  {color: "teal", position: {x:2, y:0}, size: defaultZoneSize},
  {color: "orange", position: {x:0, y:1}, size: defaultZoneSize},
  {color: "green", position: {x:1, y:1}, size: defaultZoneSize},
  {color: "black", position: {x:2, y:1}, size: defaultZoneSize},
  {color: "pink", position: {x:0, y:2}, size: defaultZoneSize},
  {color: "brown", position: {x:1, y:2}, size: defaultZoneSize},
  {color: "grey", position: {x:2, y:2}, size: defaultZoneSize}
];


let paused = true;

const mousePosition = { x: defaultZoneSize.w/2, y: defaultZoneSize.h/2 };

/*
  * collision layer: 
  * 0 - wall
* 1 - player
* 2 - base enemy
*/

function createAttack(attack: Attack): Thing{
  
  GLOBALID++;
  return {
    id: GLOBALID,
    variant: Variant.attack,
    hp: 0,
    maxHp: 0,
    attack: attack,
    speed: 0,
    slowed: 0,
    moving: attack.moving,
    position: attack.position,
    distanceX: 0,
    distanceY: 0,
    size: attack.size,
    collisionLayer: new Set(attack.collisionLayer),
    targetCollisionLayer: new Set(attack.targetCollisionLayer),
    color: attack.color,
    targetPosition: attack.targetPosition,
    rotationTarget: attack.rotationTarget,
    rotation: attack.rotation,
  };

}

const player: Thing = {
  id: 0,
  variant: Variant.player,
  hp: 500,
  maxHp: 500,
  attack: {damage: 10, cooldown: 5, runtime: 1, ammunition: Infinity, speed: 600, moving: true, position: {} as Position, size: {w: 20, h: 20, halfSizeW: 10, halfSizeH: 10}, collisionLayer: new Set([3]), targetCollisionLayer: new Set([1]), color: "darkslategray", targetPosition: {} as Position, rotationTarget: {} as Position, rotation: 0 },
  speed: 300,
  slowed: 0,
  moving: false,
  position: {
    x: defaultZoneSize.w / 2,
    y: defaultZoneSize.h / 2,
  },
  collisionLayer: new Set([0]),
  targetCollisionLayer: new Set([1]),
  distanceX: 0,
  distanceY: 0,
  size: {h: 30, w: 30, halfSizeH: 15, halfSizeW: 15},
  color: "red",
  targetPosition:  {x: defaultZoneSize.w / 2, y: defaultZoneSize.h /2},
  rotationTarget: mousePosition,
  rotation: 0,
};



const things = [player];


function swapWithLast(idx: number){
  if(idx !== things.length - 1){
    const lastThing = things[things.length - 1];
    things[idx] = lastThing;
  }
  things.pop();
}

function randomThingCreator(count: number){
  for(let i = 1; i < count; i++){
    GLOBALID++;
    things[i] = (
      {
        id: GLOBALID,
        variant: Variant.enemy,
        hp: 50,
        maxHp: 50,
        attack: {damage: 10, cooldown: 5, runtime: 1, ammunition: Infinity, speed: 600, moving: true, position: {} as Position, size: {w: 20, h: 20, halfSizeW: 10, halfSizeH: 10}, collisionLayer: new Set([3]), targetCollisionLayer: new Set([1]), color: "darkslategray", targetPosition: {} as Position, rotationTarget: {} as Position, rotation: 0 },
        speed: 170,
        slowed: 0,
        moving: true,
        distanceX: 0,
        distanceY: 0,
        position: {x: Math.floor(Math.random()*defaultZoneSize.w), y: Math.floor(Math.random()*defaultZoneSize.h)},
        size: {h: 20, w: 20, halfSizeH: 10, halfSizeW: 10},
        collisionLayer: new Set([1]),
        targetCollisionLayer: new Set([0, 1]),
        color: `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`,
        targetPosition: player.position,
        rotationTarget: player.position,
        rotation: 0,
      }
    )
  }
}

const activeKeys = new Set();

function gEI(id: string) {
  return document.getElementById(id);
}

function playerZoneDisplace(){
  return {displaceX: (player.position.x - defaultZoneSize.w/2), displaceY: (player.position.y - defaultZoneSize.h/2)};
}

function drawThing(
  ctx: CanvasRenderingContext2D,
  thing: Thing,
  position: Position,
  displace: {displaceX: number, displaceY: number}
) {
  const {size: {h, w, halfSizeW, halfSizeH}, color, rotation} = thing;
  const {x, y} = position;
  const {displaceX, displaceY} = displace;
  ctx.fillStyle = color;
  ctx.translate(x - displaceX, y - displaceY);
  ctx.rotate(rotation);
  ctx.translate(-halfSizeW, -halfSizeH);
  ctx.fillRect(0, 0, w, h);
  ctx.translate(halfSizeW, halfSizeH);
  ctx.rotate(-(rotation));
  ctx.translate(-(x - displaceX), - (y - displaceY));
}

function positionZoneConverter({x, y}: Position){
  const convX = x * defaultZoneSize.w;
  const convY = y * defaultZoneSize.h;

  return {x: convX, y: convY};
}

function drawBg(
  ctx: CanvasRenderingContext2D,
  zone: Zone 
){
  const {position, size: {h, w}, color} = zone;
  const {x, y} = positionZoneConverter(position);
  const {displaceX, displaceY} = playerZoneDisplace();
  ctx.fillStyle = color;
  ctx.translate(x - displaceX, y - displaceY);
  ctx.fillRect(0, 0, w, h);
  ctx.translate(-(x - displaceX), -(y - displaceY));

}

function sH(keyCode: string) {
  return activeKeys.has(keyCode);
}

function processPlayerInput(){
  if(sH('KeyA')) {
    //A
    player.targetPosition.x = player.position.x - 10;
  }
  if(sH('KeyD')) {
    //D
    player.targetPosition.x = player.position.x + 10;
  }
  if(sH('KeyS')) {
    //S
    player.targetPosition.y = player.position.y + 10;
  }
  if(sH('KeyW')) {
    //W
    player.targetPosition.y = player.position.y - 10;
  }
  if(sH('MR')){
    createAttack();
  }

}

type Edges = {
  t: number, 
  b: number, 
  l: number, 
  r: number 
};

function getEdges(position: Position, size: Size): Edges{
  return {
    t: position.y - size.halfSizeH,  
    b: position.y + size.halfSizeH,  
    l: position.x - size.halfSizeW,  
    r: position.x + size.halfSizeW, 
  }
}

function normalizeMagnitude(thing: Thing, targetPosition: Position){
  const omx = thing.moving ? (targetPosition.x - thing.position.x) : 0;
  const omy = thing.moving ? (targetPosition.y - thing.position.y) : 0;

  const magdeb = Math.sqrt(omx * omx + omy * omy);

  const nmx = magdeb >= 1 ? omx / magdeb : 0;
  const nmy = magdeb >= 1 ? omy / magdeb : 0;
  return {nmx, nmy};

}

function getDistanceFromThing(elapsedS: number, thing: Thing, targetPosition: Position){
  const {nmx, nmy} = normalizeMagnitude(thing, targetPosition);

  const velocityX = thing.speed * nmx * (1 - thing.slowed);
  const velocityY = thing.speed * nmy * (1 - thing.slowed);

  return {x: velocityX * elapsedS, y: velocityY * elapsedS}
}


function collisionDetector(thingA: Thing, thingANewPos: Position, thingB: Thing ){
  const {t: at, b: ab, l: al, r: ar} = getEdges(thingANewPos, thingA.size);
  const {t: bt, b: bb, l: bl, r: br} = getEdges(thingB.position, thingB.size);

  return !(ab < bt || at > bb || ar < bl || al > br);
}

function detectBarrierCollision(thingA: Thing, thingANewPos: Position){
  const {t: at, b: ab, l: al, r: ar} = getEdges(thingANewPos, thingA.size);
  const collT = at < 0;
  const collB = ab > (defaultZoneSize.h * 3);
  const collL = al < 0;
  const collR = ar > (defaultZoneSize.w * 3);


  return {collision: (collT || collB || collL || collR), collT: collT, collB: collB, collL: collL, collR: collR};
}



function action(elapsedS: number, thing: Thing){

  let distanceX = 0;
  let distanceY = 0;

  if(thing.position.x === thing.targetPosition.x && thing.position.y === thing.targetPosition.y){
    distanceX = 0;
    distanceY = 0;
  } else {
    ({x: distanceX, y: distanceY} = getDistanceFromThing(elapsedS, thing, thing.targetPosition));
  }

  //TODO: REMOVE PLEASE
  thing.slowed = 0;
  let targetPositionX = thing.position.x + distanceX;
  let targetPositionY = thing.position.y + distanceY;

  for(let idx = 0; idx < (things.length); idx++){

    const otherThing = things[idx];
    if(thing.id !== otherThing.id){
      const collisionDetected = collisionDetector(thing, {x: targetPositionX, y: targetPositionY}, otherThing);
      if(collisionDetected){
        const dist = getDistanceFromThing(elapsedS, thing, otherThing.position);
        const absX = Math.abs(dist.x);
        const absY = Math.abs(dist.y);
        switch(otherThing.variant){
          case Variant.player:
            otherThing.slowed = 0.7;
          if(absX < 12 && absY < 12){
            distanceX = 0;
            distanceY = 0;
          } else {
            distanceX = -(distanceX*2);
            distanceY = -(distanceY*2);
          }
          break;
          case Variant.enemy:
            if(thing.variant === Variant.enemy){
            if(absX < 0.5 && absY < 0.5){
              dist.x = thing.size.w;
              dist.y = thing.size.h;
            }
            distanceX = -dist.x;
            distanceY = -dist.y;

          }
          if(thing.variant === Variant.player){
            otherThing.position.x += distanceX*(4);
            otherThing.position.y += distanceY*(4);
          }
          break;
        }
      }
    }
  }
  const barrierCol = detectBarrierCollision(thing, {x:targetPositionX, y: targetPositionY });

  if(barrierCol.collision){
    if(barrierCol.collT){
      distanceY = thing.size.halfSizeH;
    }
    if(barrierCol.collB){
      distanceY = -thing.size.halfSizeH;
    }
    if(barrierCol.collL){
      distanceX = thing.size.halfSizeW;
    }
    if(barrierCol.collL){
      distanceX = -thing.size.halfSizeW;
    }
  }

  return {distanceX, distanceY};


}

function moveThings(elapsedS: number, thing: Thing) {
  const {distanceX, distanceY} = action(elapsedS, thing);
  thing.position.x += distanceX;
  thing.position.y += distanceY;
  thing.distanceX = distanceX;
  thing.distanceY = distanceY;
}

function rotatospotatos(thing: Thing, position: Position, rotationTarget: Position){
  thing.rotation = (Math.atan2(rotationTarget.y - position.y, rotationTarget.x - position.x))-(Math.PI/4) ;
}

function run(ctx: CanvasRenderingContext2D, prevTime: number, timestamp: number) {
  const elapsed = timestamp - prevTime;
  const elapsedS = elapsed / 1000;
  if(!paused){
    //CALCULATIONS AND PHYSICS
    processPlayerInput();
    moveThings(elapsedS, player);
    rotatospotatos(player, playerCentered, player.rotationTarget);

    const displace = playerZoneDisplace();
    for(let idx = 1; idx < (things.length); idx++){
      const thing = things[idx];
      if(thing.moving) moveThings(elapsedS, thing);
      rotatospotatos(thing, thing.position, thing.rotationTarget);
    };


    //RENDER
    ctx.clearRect(0,0, defaultZoneSize.w, defaultZoneSize.h);
    map.forEach((zone)=> {
      drawBg(ctx, zone);
    });
    drawThing(ctx, player, playerCentered, {displaceX: 0, displaceY: 0});
    for(let idx = 1; idx < (things.length); idx++){
      const thing = things[idx];
      drawThing(ctx, thing, thing.position, displace);
    };
  }

  requestAnimationFrame((ts) => run(ctx, timestamp, ts));
}

function addEL(canvas: HTMLCanvasElement) {

  const canvasRect = canvas.getClientRects()[0];
  canvas.addEventListener("mousedown", (event => {
    switch(event.button){
      case 0:
        activeKeys.add("ML");
        break;
      case 2:
        activeKeys.add("MR");
        break;
    }
  })); 
  canvas.addEventListener("mouseup", (event => {
    console.log(event);
    switch(event.button){
      case 0:
        activeKeys.delete("ML");
        break;
      case 2:
        activeKeys.delete("MR");
        break;
    }

    const attack = { ...player.attack, position: {x: player.position.x + 25, y: player.position.y + 25}, targetPosition: {x: player.position.x + 25, y: player.position.y + 25}};
    things.push(createAttack(attack));
  }));

  canvas.addEventListener("contextmenu", (event => {
    event.preventDefault();
  }));


  canvas.addEventListener("mousemove", (event) => {
    const x = Math.round(event.clientX - canvasRect.left);
    const y = Math.round(event.clientY - canvasRect.top);
    if((x >= 0) && (x <= defaultZoneSize.w)) mousePosition.x = x;
    if((y >= 0) && (y <= defaultZoneSize.h)) mousePosition.y = y;
  });

  const keyMaps = ['KeyA', 'KeyS', 'KeyD', 'KeyW'];
  addEventListener("keydown", (event) => {
    if(keyMaps.includes(event.code))
      activeKeys.add(event.code);
    player.moving = true;
  });
  addEventListener("keyup", (event) => {
    switch (event.code){
      case 'KeyP':
        paused = !paused;
      break;
    }
    activeKeys.delete(event.code);
    if(activeKeys.size < 1) player.moving = false;
  });
}


function init() {
  const canvas = gEI("cv") as HTMLCanvasElement | null;
  if (!canvas) return 0;
  const ctx = canvas.getContext("2d");
  addEL(canvas);
  if (!ctx) {
    console.error(
      "Canvas could not be found or context could not be initialized",
    );
    return 0;
  }

  randomThingCreator(INITTHINGSNOTPLAYER);

  requestAnimationFrame((timestamp) => run(ctx, 0, timestamp));
}

init();
