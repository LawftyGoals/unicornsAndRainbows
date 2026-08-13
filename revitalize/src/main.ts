import './style.css'


const cv = {
  width: 1280,
  height: 720
};

type Position = {
  x: number,
  y: number
};

type Size = {
  h: number,
  w: number

};

const player = {
  speed: 100,
  position: {
    x: cv.width / 2,
    y: cv.height / 2
  }
};
const mousePosition = {x: 0, y: 0};

const activeKeys = new Set();

function getKeyPresses(){
  

}

function gEI(id: string) {
  return document.getElementById(id);
}

function fR(ctx: Context, color: string, position: Position, size: Size ){
  ctx.fillStyle=color;
  ctx.fillRect(position.x, position.y, size.w, size.h);
}



function move(elapsedMS: number){
  function sH(keyCode: number){
    return activeKeys.has(keyCode);
  }


  // a^2 = b^2 + c^2
  // aa = bb + cc
  // aa/aa = bb/aa + cc/aa

  const omx = mousePosition.x - player.position.x;
  const omy = mousePosition.y - player.position.y;
  const magnitude = (omx * omx) + (omy * omy);
  
  const mxr = (omx / Math.abs(omx));
  const myr = (omy / Math.abs(omy));

  const nmx = mxr * (omx*omx)/magnitude;
  const nmy = myr * (omy*omy)/magnitude;

  const tot = (omx*omx)/magnitude + (omy*omy)/magnitude;

  console.log(tot);


  player.position.x += player.speed * elapsedMS * nmx;
  player.position.y += player.speed * elapsedMS * nmy;


  if(sH(65)){
    //A
    player.position.x -= player.speed * elapsedMS;
    console.log("A")
  }
  if(sH(68)){
    //D
    player.position.x++;
  }
  if(sH(83)){
    //S
    player.position.y++;
  }
  if(sH(87)){
    //W
    player.position.y--;
  }
  
}

type Time = { prevTime: number };

function draw(ctx: Context, time: Time, timestamp: number){
  const elapsed = timestamp - time.prevTime;
  const elapsedMS = elapsed / 1000;
  move(elapsedMS);


  //TODO(Lawfty): don't like this passing around thing thing.
  fR(ctx, "rebeccapurple", {x: 0, y: 0}, {w: cv.width, h: cv.height});
  fR(ctx, "red", player.position, {w:30, h:30});


  time.prevTime = timestamp;
  requestAnimationFrame((timestamp)=>draw(ctx, time, timestamp));

}

function addEL(canvas: HTMLCanvas){

  canvas.addEventListener("mousemove",
    (event)=>{
      const canvasRect = canvas.getClientRects()[0];
      const x = Math.round(event.clientX - canvasRect.left);
      const y = Math.round(event.clientY - canvasRect.top);
      mousePosition.x = x < 1 ? 0 : x;
      mousePosition.y = y < 1 ? 0 : y;
    }
                         )

  addEventListener("keydown", (event)=>{
    activeKeys.add(event.keyCode);
    
  })
  addEventListener("keyup", (event)=> {
    activeKeys.delete(event.keyCode);
  })
}



function init() {
  const canvas = gEI("cv");
  const ctx = canvas.getContext("2d");
  addEL(canvas);
  if(!ctx){
    console.error("Canvas could not be found or context could not be initialized");
  }

  const time = {prevTime: 0};
  requestAnimationFrame((timestamp)=>draw(ctx, time, timestamp));

}





init();

