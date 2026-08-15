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
  color: string
}


const cv = {
  width: 1280,
  height: 720,
};

let paused = true;


const mousePosition = { x: cv.width/2, y: cv.height/2 };

const player: Thing = {
  id: 0,
  speed: 200,
  moving: false,
  position: {
    x: cv.width / 2,
    y: cv.height / 2,
  },
  size: {h: 30, w: 30},
  color: "red",
  targetPosition:  mousePosition
};

const follower: Thing = {
  id: 1,
  speed:170,
  moving: true,
  position: {x: 0, y: 0},
  size: {h: 20, w: 20},
  color: "yellow",
  targetPosition: player.position
}


const things: Thing[] = [player, follower];

function randomThingCreator(count: number){
  for(let i = 0; i < count; i++){
    things.push(
      {
        id: i + 2,
        speed: 170,
        moving: true,
        position: {x: Math.floor(Math.random()*cv.width), y: Math.floor(Math.random()*cv.height)},
        size: {h: 20, w: 20},
        color: `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`,
        targetPosition: player.position
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
  const {position: {x, y}, size: {h, w}, color } = thing;
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

function move(elapsedMS: number, thing: Thing, targetPosition: Position) {
  function sH(keyCode: number) {
    return activeKeys.has(keyCode);
  }

  const omx = targetPosition.x - thing.position.x;
  const omy = targetPosition.y - thing.position.y;

  const magdeb = Math.sqrt(omx * omx + omy * omy);

  const nmx = omx / magdeb;
  const nmy = omy / magdeb;

  const movementX = thing.speed * elapsedMS * nmx;
  const movementY = thing.speed * elapsedMS * nmy;

  if (magdeb >= 1) {
    thing.position.x += movementX;
    thing.position.y += movementY;
  }

  //getDebug(`${thing.position.x} - ${thing.position.y} `);

  if (sH(65)) {
    //A
    player.position.x -= player.speed * elapsedMS;
  }
  if (sH(68)) {
    //D
    player.position.x++;
  }
  if (sH(83)) {
    //S
    player.position.y++;
  }
  if (sH(87)) {
    //W
    player.position.y--;
  }
}


function draw(ctx: CanvasRenderingContext2D, prevTime: number, timestamp: number) {
  const elapsed = timestamp - prevTime;
  const elapsedMS = elapsed / 1000;
  if(!paused){
    //TODO(Lawfty): don't like this passing around thing thing.
    fR(ctx, {id:1, color: "rebeccapurple", position: { x: 0, y: 0 }, speed:0, size: { w: cv.width, h: cv.height }});
  
    things.forEach((thing, idx) => {
      if(thing.moving){
        move(elapsedMS, thing, thing.targetPosition);
      }
      
      fR(ctx, thing);
    });
  }

  requestAnimationFrame((ts) => draw(ctx, timestamp, ts));
}

function addEL(canvas: HTMLCanvasElement) {

  canvas.addEventListener("mousedown", (event => {
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
  }));

  canvas.addEventListener("contextmenu", (event => {
    event.preventDefault();
  }));


  canvas.addEventListener("mousemove", (event) => {
    const canvasRect = canvas.getClientRects()[0];
    const x = Math.round(event.clientX - canvasRect.left);
    const y = Math.round(event.clientY - canvasRect.top);
    mousePosition.x = x < 1 ? 0 : x;
    mousePosition.y = y < 1 ? 0 : y;
  });

  addEventListener("keydown", (event) => {
    activeKeys.add(event.keyCode);
  });
  addEventListener("keyup", (event) => {
    switch (event.keyCode){
      case 80:
        paused = !paused;
        break;
    }
    activeKeys.delete(event.keyCode);
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
