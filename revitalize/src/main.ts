import "./style.css";

let frameCount = 0;
const debugDiv = gEI("debug");

function getDebug(innerHtml: string) {
  if (frameCount == 3 && debugDiv) debugDiv.innerHTML = innerHtml;

  frameCount++;
  if (frameCount >= 10) frameCount = 0;
}
type Position = {
  x: number;
  y: number;
};

type Size = {
  h: number;
  w: number;
};

type RigidBody = {
  w: number,
  h: number,
}

type Thing = {
  id: number,
  speed: number,
  moving: boolean,
  position: Position,
  size: Size,
  color: string,
  targetPosition: Position,
  rotationTarget: Position,
  rotation: number,
  rigidBody: RigidBody
}

type Zone = {
  color: string,
  position: Position,
  size: Size
};


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

const player: Thing = {
  id: 0,
  speed: 300,
  moving: false,
  position: {
    x: defaultZoneSize.w / 2,
    y: defaultZoneSize.h / 2,
  },
  size: {h: 30, w: 30},
  color: "red",
  targetPosition:  {x: defaultZoneSize.w / 2, y: defaultZoneSize.h /2},
  rotationTarget: mousePosition,
  rotation: 0,
  rigidBody: {h: 30, w: 30}
};


const things: Thing[] = [];

function randomThingCreator(count: number){
  for(let i = 0; i < count; i++){
    things.push(
      {
        id: i + 2,
        speed: 170,
        moving: true,
        position: {x: Math.floor(Math.random()*defaultZoneSize.w), y: Math.floor(Math.random()*defaultZoneSize.h)},
        size: {h: 20, w: 20},
        color: `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`,
        targetPosition: player.position,
        rotationTarget: player.position,
        rotation: 0,
        rigidBody: {h: 30, w: 30}
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

function fR(
  ctx: CanvasRenderingContext2D,
  thing: Thing,
  position: Position,
  displace: {displaceX: number, displaceY: number}
) {
  const {size: {h, w}, color, rotation} = thing;
  const {x, y} = position;
  const {displaceX, displaceY} = displace;
  ctx.fillStyle = color;
  ctx.translate(x - displaceX, y - displaceY);
  ctx.rotate(rotation);
  ctx.fillRect(0, 0, w, h);
  ctx.rotate(-(rotation));
  ctx.translate(-(x - displaceX), - (y - displaceY));
}

function fRbg(
  ctx: CanvasRenderingContext2D,
){
  ctx.fillStyle = "magenta";
  ctx.fillRect(0, 0, defaultZoneSize.w, defaultZoneSize.h);
}

function positionZoneConverter({x, y}: Position){
  const convX = x * defaultZoneSize.w;
  const convY = y * defaultZoneSize.h;

  return {x: convX, y: convY};
}

function fRMbg(
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

function move(elapsedMS: number, thing: Thing){

  const omx = thing.moving ? (thing.targetPosition.x - thing.position.x) : 0;
  const omy = thing.moving ? (thing.targetPosition.y - thing.position.y) : 0;

  const magdeb = Math.sqrt(omx * omx + omy * omy);

  const nmx = magdeb >= 1 ? omx / magdeb : 0;
  const nmy = magdeb >= 1 ? omy / magdeb : 0;

  const movementX = (thing.speed * elapsedMS * nmx);
  const movementY = (thing.speed * elapsedMS * nmy);

  return {movementX, movementY};
  
}


function moveThings(elapsedMS: number, thing: Thing) {

  const {movementX, movementY} = move(elapsedMS, thing);

  thing.position.x += movementX;
  thing.position.y += movementY ;

}

function rotatospotatos(thing: Thing, position: Position, rotationTarget: Position){
  thing.rotation = (Math.atan2(rotationTarget.y - position.y, rotationTarget.x - position.x))-(Math.PI/4) ;
  if(thing.id === 0) getDebug(`${rotationTarget.x} ${rotationTarget.y} - ${position.x} ${position.y} ${thing.rotation}`);
}

function draw(ctx: CanvasRenderingContext2D, prevTime: number, timestamp: number) {
  const elapsed = timestamp - prevTime;
  const elapsedMS = elapsed / 1000;
  if(!paused){

    fRbg(
      ctx, 
    );

    map.forEach((zone)=> {
      fRMbg(ctx, zone);
    });

    setPlayerTarget();
    moveThings(elapsedMS, player);
    rotatospotatos(player, playerCentered, player.rotationTarget);
    fR(ctx, player, playerCentered, {displaceX: 0, displaceY: 0});

    const displace = playerZoneDisplace();
  
    things.forEach((thing) => {
      moveThings(elapsedMS, thing);
      rotatospotatos(thing, thing.position, thing.rotationTarget);
      fR(ctx, thing, thing.position, displace);
    });
  }

  requestAnimationFrame((ts) => draw(ctx, timestamp, ts));
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
  randomThingCreator(100);

  requestAnimationFrame((timestamp) => draw(ctx, 0, timestamp));
}

init();
