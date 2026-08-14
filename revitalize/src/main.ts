import "./style.css";

const cv = {
  width: 1280,
  height: 720,
};

type Position = {
  x: number;
  y: number;
};

type Size = {
  h: number;
  w: number;
};

const player = {
  speed: 200,
  position: {
    x: cv.width / 2,
    y: cv.height / 2,
  },
};
const mousePosition = { x: 0, y: 0 };

const activeKeys = new Set();

function gEI(id: string) {
  return document.getElementById(id);
}

function fR(
  ctx: CanvasRenderingContext2D,
  color: string,
  position: Position,
  size: Size,
) {
  ctx.fillStyle = color;
  ctx.fillRect(position.x, position.y, size.w, size.h);
}

let frameCount = 0;
const debugDiv = gEI("debug");

function getDebug(innerHtml: string) {
  if (frameCount == 3 && debugDiv) debugDiv.innerHTML = innerHtml;

  frameCount++;
  if (frameCount >= 10) frameCount = 0;
}

function move(elapsedMS: number) {
  function sH(keyCode: number) {
    return activeKeys.has(keyCode);
  }

  const omx = mousePosition.x - player.position.x;
  const omy = mousePosition.y - player.position.y;

  const magdeb = Math.sqrt(omx * omx + omy * omy);

  const nmx = omx / magdeb;
  const nmy = omy / magdeb;

  const movementX = player.speed * elapsedMS * nmx;
  const movementY = player.speed * elapsedMS * nmy;

  if (magdeb >= 1) {
    player.position.x += movementX;
    player.position.y += movementY;
  }

  getDebug(`${player.position.x} - ${player.position.y} `);

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

type Time = { prevTime: number };

function draw(ctx: CanvasRenderingContext2D, time: Time, timestamp: number) {
  const elapsed = timestamp - time.prevTime;
  const elapsedMS = elapsed / 1000;
  move(elapsedMS);

  //TODO(Lawfty): don't like this passing around thing thing.
  fR(ctx, "rebeccapurple", { x: 0, y: 0 }, { w: cv.width, h: cv.height });
  fR(ctx, "red", player.position, { w: 30, h: 30 });

  time.prevTime = timestamp;
  requestAnimationFrame((timestamp) => draw(ctx, time, timestamp));
}

function addEL(canvas: HTMLCanvasElement) {
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

  const time = { prevTime: 0 };
  requestAnimationFrame((timestamp) => draw(ctx, time, timestamp));
}

init();
