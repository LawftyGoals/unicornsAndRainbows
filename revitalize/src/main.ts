import "./style.css";

type Position = {
  x: number;
  y: number;
};

type Size = {
  h: number;
  w: number;
};

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
}

type Zone = {
  position: Position,
  size: Size
};


const WorldPosition = {
  x: 0,
  y: 0,
}

const defaultZoneSize = {h: 720, w: 1280};

const map = [
  {position: {x:0, y:0}, size: defaultZoneSize},
  {position: {x:1, y:0}, size: defaultZoneSize},
  {position: {x:2, y:0}, size: defaultZoneSize},
  {position: {x:0, y:1}, size: defaultZoneSize},
  {position: {x:1, y:1}, size: defaultZoneSize},
  {position: {x:2, y:1}, size: defaultZoneSize},
  {position: {x:0, y:2}, size: defaultZoneSize},
  {position: {x:1, y:2}, size: defaultZoneSize},
  {position: {x:2, y:2}, size: defaultZoneSize}
];

function zoneIndexConverter({x, y}: Position){
  const convX = defaultZoneSize.w + (defaultZoneSize.w * x);
  return 
}


const cv = {
  position: {
    x: 0,
    y: 0,
  },
  size: {
    h: 720,
    w: 1280,
  }
};

let paused = true;


const mousePosition = { x: cv.size.w/2, y: cv.size.h/2 };

const player: Thing = {
  id: 0,
  speed: 300,
  moving: false,
  position: {
    x: cv.size.w / 2,
    y: cv.size.h / 2,
  },
  size: {h: 30, w: 30},
  color: "red",
  targetPosition:  {x: cv.size.w / 2, y: cv.size.h /2},
  rotationTarget: mousePosition,
  rotation: 0,
};


const things: Thing[] = [player];

function randomThingCreator(count: number){
  for(let i = 0; i < count; i++){
    things.push(
      {
        id: i + 2,
        speed: 170,
        moving: true,
        position: {x: Math.floor(Math.random()*cv.size.w), y: Math.floor(Math.random()*cv.size.h)},
        size: {h: 20, w: 20},
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

function fR(
  ctx: CanvasRenderingContext2D,
  thing: Thing
) {
  const {position: {x, y}, size: {h, w}, color, rotation} = thing;
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.rotate(rotation );
  ctx.fillRect(0, 0, w, h);
  ctx.rotate(-(rotation ));
  ctx.translate(-x,-y);
}

function fRbg(
  ctx: CanvasRenderingContext2D,
  thing: Thing
){
  const {position: {x, y}, size: {h, w}, color} = thing;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

let frameCount = 0;
const debugDiv = gEI("debug");

function getDebug(innerHtml: string) {
  if (frameCount == 3 && debugDiv) debugDiv.innerHTML = innerHtml;

  frameCount++;
  if (frameCount >= 10) frameCount = 0;
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

function move(elapsedMS: number, thing: Thing) {

  const omx = thing.moving ? (thing.targetPosition.x - thing.position.x) : 0;
  const omy = thing.moving ? (thing.targetPosition.y - thing.position.y) : 0;

  const magdeb = Math.sqrt(omx * omx + omy * omy);

  const nmx = magdeb >= 1 ? omx / magdeb : 0;
  const nmy = magdeb >= 1 ? omy / magdeb : 0;

  const movementX = (thing.speed * elapsedMS * nmx);
  const movementY = (thing.speed * elapsedMS * nmy);

  thing.position.x += movementX;
  thing.position.y += movementY ;

  //getDebug(`${thing.position.x} - ${thing.position.y} `);
}

function rotatospotatos(thing: Thing){
  thing.rotation = (Math.atan2(thing.rotationTarget.y - thing.position.y, thing.rotationTarget.x - thing.position.x))-(Math.PI/4) ;
  if(thing.id === 0) getDebug(`${thing.rotationTarget.x} ${thing.rotationTarget.y} - ${thing.position.x} ${thing.position.y} ${thing.rotation}`);
}


function draw(ctx: CanvasRenderingContext2D, prevTime: number, timestamp: number) {
  const elapsed = timestamp - prevTime;
  const elapsedMS = elapsed / 1000;
  if(!paused){

    //TODO(Lawfty): don't like this passing around thing thing.
    fRbg(
      ctx, 
      {
        id:-1, 
        color: "rebeccapurple",
        moving: false,
        position: { x: 0, y: 0 }, 
        speed: 0,
        size: { w: cv.size.w, h: cv.size.h },
        targetPosition: {x:0,y:0},
        rotationTarget: {x:0,y:0},
        rotation: 0,
      }
    );

    setPlayerTarget();
  
    things.forEach((thing, idx) => {
      if(true || thing.moving){
        move(elapsedMS, thing);
      }
      
      rotatospotatos(thing);
      fR(ctx, thing);
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
