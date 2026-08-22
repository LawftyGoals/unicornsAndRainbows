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

type Thing = {
  id: number,
  hp: number;
  maxHp: number;
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

const initThingsNotPlayer = 100;
const CurrentNumberOfThings = 1 + initThingsNotPlayer;

function createPlayerAttack()

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

const mapBorders = {x:[1280, 2560, 3840], y:[720, 1440, 2160]};

let paused = true;

const mousePosition = { x: defaultZoneSize.w/2, y: defaultZoneSize.h/2 };

/*
  * collision layer: 
  * 0 - player
* 1 - base enemy
*/

const player: Thing = {
  id: 0,
  hp: 500,
  maxHp: 500,
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

const thingsSize = 1001;
const things: Thing[] = new Array(thingsSize);
things[0] = player;

function randomThingCreator(count: number){
  for(let i = 1; i < count; i++){
    things[i] = (
      {
        id: i,
        hp: 50,
        maxHp: 50,
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

function setPlayerTarget(){
  if (sH('KeyA')) {
    //A
    player.targetPosition.x = player.position.x - 10;
  }
  if (sH('KeyD')) {
    //D
    player.targetPosition.x = player.position.x + 10;
  }
  if (sH('KeyS')) {
    //S
    player.targetPosition.y = player.position.y + 10;
  }
  if (sH('KeyW')) {
    //W
    player.targetPosition.y = player.position.y - 10;
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

function getDistanceFromThing(elapsedS: number, thing: Thing, targetPosition: Position){

  const omx = thing.moving ? (targetPosition.x - thing.position.x) : 0;
  const omy = thing.moving ? (targetPosition.y - thing.position.y) : 0;

  const magdeb = Math.sqrt(omx * omx + omy * omy);

  const nmx = magdeb >= 1 ? omx / magdeb : 0;
  const nmy = magdeb >= 1 ? omy / magdeb : 0;

  const velocityX = thing.speed * nmx * (1 - thing.slowed);
  const velocityY = thing.speed * nmy * (1 - thing.slowed);
  
  return {x: velocityX * elapsedS, y: velocityY * elapsedS}
}


function collisionDetector(thingA: Thing, thingANewPos: Position, thingB: Thing ){
  const {t: at, b: ab, l: al, r: ar} = getEdges(thingANewPos, thingA.size);
  const {t: bt, b: bb, l: bl, r: br} = getEdges(thingB.position, thingB.size);

  return !(ab < bt || at > bb || ar < bl || al > br);
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

  for(let idx = 0; idx < things.length; idx++){
    const otherThing = things[idx];
    if(thing.id !== otherThing.id){
      let thingX = thing.position.x;
      let thingY = thing.position.y;
      const collisionDetected = collisionDetector(thing, {x: thingX += distanceX, y: thingY += distanceY}, things[idx]);
      if(collisionDetected){
        const dist = getDistanceFromThing(elapsedS, thing, otherThing.position);
        if(otherThing.id === 0){
          //TODO: MOVE SLOW INTO ENEMY ATTACK
          otherThing.slowed = 0.7;
          if(Math.abs(dist.x) < 12 && Math.abs(dist.y) < 12){
            distanceX = 0;
            distanceY = 0;
          }
          else {
            distanceX = -(distanceX*2);
            distanceY = -(distanceY*2);
          }
        }
        else if (thing.id !== 0){
          if(Math.abs(dist.x) < 0.5 && Math.abs(dist.y) < 0.5){
            dist.x = thing.size.w;
            dist.y = thing.size.h;
          }
          distanceX = -dist.x;
          distanceY = -dist.y;
        }
      }
    }
  }

  return {distanceX, distanceY};

  
}


function attack(){
  
  
  return 0;
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
    setPlayerTarget();
    moveThings(elapsedS, player);
    rotatospotatos(player, playerCentered, player.rotationTarget);

    const displace = playerZoneDisplace();
    for(let idx = 1; idx < things.length; idx++){
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
    for(let idx = 1; idx < things.length; idx++){
      const thing = things[idx];
      drawThing(ctx, thing, thing.position, displace);
    };
  }

  requestAnimationFrame((ts) => run(ctx, timestamp, ts));
}

function addEL(canvas: HTMLCanvasElement) {

  const canvasRect = canvas.getClientRects()[0];
  /*canvas.addEventListener("mousedown", (event => {
    switch(event.button){
      case 0:
        player.moving = true;
        break;
      case 2:
        break;
    }
  }));
  canvas.addEventListener("mouseup", (event => {
    switch(event.button){
      case 0:
        player.moving = false;
        break;
    }
  }));*/

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
  
  randomThingCreator(initThingsNotPlayer);

  requestAnimationFrame((timestamp) => run(ctx, 0, timestamp));
}

init();
