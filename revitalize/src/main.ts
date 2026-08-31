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


const EnumThingVariant = {
  player: 0,
  enemy: 1,
  wall: 2,
  attack: 3
};


type ThingVariantKey = keyof typeof EnumThingVariant;
type ThingVariant = typeof EnumThingVariant[ThingVariantKey];

type Attack = {
  variant: ThingVariant,
  damage: number,
  elapsed: number,
  cooldown: number,
  leadUp: number,
  duration: number,
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
  innerRange: number,
  outerRange: number,
  thingAttacked: Set<Thing>,
}


const EnumAttackVariant = {
  melee: 0,
  ranged: 1
}

type AttackVariantKey = keyof typeof EnumAttackVariant;
type AttackVariant = typeof EnumAttackVariant[AttackVariantKey];
  

type Thing = {
  id: number,
  active: boolean,
  variant: ThingVariant,
  hp: number,
  maxHp: number,
  attack: Attack,
  speed: number,
  slowed: number,
  moving: boolean,
  position: Position,
  nmx: number,
  nmy: number,
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
let RUNNING = true;

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

function createAttack(newAttack: Attack ): Thing{
  newAttack.thingAttacked.clear();
  
  GLOBALID++;
  return {
    id: GLOBALID,
    active: true,
    variant: EnumThingVariant.attack,
    hp: 1,
    maxHp: 0,
    attack: newAttack,
    speed: 0,
    slowed: 0,
    moving: newAttack.moving,
    position: newAttack.position,
    distanceX: 0,
    distanceY: 0,
    nmx: 0,
    nmy: 0,
    size: newAttack.size,
    collisionLayer: new Set(newAttack.collisionLayer),
    targetCollisionLayer: new Set(newAttack.targetCollisionLayer),
    color: newAttack.color,
    targetPosition: newAttack.targetPosition,
    rotationTarget: newAttack.rotationTarget,
    rotation: newAttack.rotation,
  };

}

function createPlayer(): Thing {
  return {
    id: 0,
    active: true,
    variant: EnumThingVariant.player,
    hp: 500,
    maxHp: 500,
    attack: {
      variant: EnumAttackVariant.melee,
      elapsed: 100, 
      damage: 100, 
      cooldown: 1, 
      leadUp: 0,
      duration: 0.3, 
      ammunition: Infinity, 
      speed: 600, 
      moving: true, 
      position: {} as Position, 
      size: {w: 60, h: 60, halfSizeW: 30, halfSizeH: 30}, 
      collisionLayer: new Set([3]), 
      targetCollisionLayer: new Set([1]), 
      color: "rgba(10, 32, 255, 0.3)", 
      targetPosition: {} as Position, 
      rotationTarget: {} as Position, 
      rotation: 0, 
      innerRange: 0, 
      outerRange: 60,
      thingAttacked: new Set()
    },
    speed: 300,
    slowed: 0,
    moving: false,
    position: {
      x: defaultZoneSize.w / 2,
      y: defaultZoneSize.h / 2,
    },
    collisionLayer: new Set([0]),
    targetCollisionLayer: new Set([1]),
    nmx: 0,
    nmy: 0,
    distanceX: 0,
    distanceY: 0,
    size: {h: 30, w: 30, halfSizeH: 15, halfSizeW: 15},
    color: "red",
    targetPosition:  {x: defaultZoneSize.w / 2, y: defaultZoneSize.h /2},
    rotationTarget: mousePosition,
    rotation: 0,
  };
}

let globalPlayer: Thing = {
  id: 0,
  active: true,
  variant: EnumThingVariant.player,
  hp: 500,
  maxHp: 500,
  attack: {
    variant: EnumAttackVariant.melee,
    elapsed: 100,
    leadUp: 0,
    damage: 100, 
    cooldown: 1, 
    duration: 0.3, 
    ammunition: Infinity, 
    speed: 600, 
    moving: true, 
    position: {} as Position, 
    size: {w: 60, h: 60, halfSizeW: 30, halfSizeH: 30}, 
    collisionLayer: new Set([3]), 
    targetCollisionLayer: new Set([1]), 
    color: "rgba(10, 32, 255, 0.3)", 
    targetPosition: {} as Position, 
    rotationTarget: {} as Position, 
    rotation: 0, 
    innerRange: 0, 
    outerRange: 60,
    thingAttacked: new Set()
  },
  speed: 300,
  slowed: 0,
  moving: false,
  position: {
    x: defaultZoneSize.w / 2,
    y: defaultZoneSize.h / 2,
  },
  collisionLayer: new Set([0]),
  targetCollisionLayer: new Set([1]),
  nmx: 0,
  nmy: 0,
  distanceX: 0,
  distanceY: 0,
  size: {h: 30, w: 30, halfSizeH: 15, halfSizeW: 15},
  color: "red",
  targetPosition:  {x: defaultZoneSize.w / 2, y: defaultZoneSize.h /2},
  rotationTarget: mousePosition,
  rotation: 0,
};


//const globalThings = [globalPlayer];

function swapWithLastAndPop(things: Thing[], idx: number){
  if(idx !== things.length - 1){
    const lastThing = things[things.length - 1];
    things[idx] = lastThing;
  }
  things.pop();
}

function randomThingCreator(things: Thing[], count: number, playerTarget: Thing){
  for(let i = 1; i < count+1; i++){
    GLOBALID++;
    things.push(
      {
        id: GLOBALID,
        active: true,
        variant: EnumThingVariant.enemy,
        hp: 50,
        maxHp: 50,
        attack: { 
          variant: EnumAttackVariant.melee,
          elapsed: 100, 
          damage: 10, 
          cooldown: 3, 
          leadUp: 0.5,
          duration: 0.3, 
          ammunition: Infinity, 
          speed: 600, 
          moving: true, 
          position: {} as Position, 
          size: {
            w: 20, 
            h: 20, 
            halfSizeW: 10, 
            halfSizeH: 10
          }, 
          collisionLayer: new Set([3]), 
          targetCollisionLayer: new Set([0]), 
          color: "darkslategray", 
          targetPosition: {} as Position, 
          rotationTarget: {} as Position, 
          rotation: 0, 
          innerRange: 0, 
          outerRange: 40,
          thingAttacked: new Set()
        },
        speed: 200,
        slowed: 0,
        moving: true,
        nmx: 0,
        nmy: 0,
        distanceX: 0,
        distanceY: 0,
        position: {x: Math.floor(Math.random()*defaultZoneSize.w), y: Math.floor(Math.random()*defaultZoneSize.h)},
        size: {h: 20, w: 20, halfSizeH: 10, halfSizeW: 10},
        collisionLayer: new Set([1]),
        targetCollisionLayer: new Set([0, 1]),
        color: `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`,
        targetPosition: playerTarget.position,
        rotationTarget: playerTarget.position,
        rotation: 0,
      }
    )
  }
}

const activeKeys = new Set();

function gEI(id: string) {
  return document.getElementById(id);
}

function playerZoneDisplace(player: Thing){
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
  zone: Zone,
  player: Thing
){
  const {position, size: {h, w}, color} = zone;
  const {x, y} = positionZoneConverter(position);
  const {displaceX, displaceY} = playerZoneDisplace(player);
  ctx.fillStyle = color;
  ctx.translate(x - displaceX, y - displaceY);
  ctx.fillRect(0, 0, w, h);
  ctx.translate(-(x - displaceX), -(y - displaceY));

}

function sH(keyCode: string) {
  return activeKeys.has(keyCode);
}

const movementKeys = new Set(['KeyA', 'KeyS', 'KeyD', 'KeyW']);

function processPlayerInput(player: Thing, things: Thing[]){
  if(activeKeys.intersection(movementKeys).size > 0){
    player.moving = true;
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
  } else {
    player.moving = false;
  }

  if(sH('KeyP')){
    console.log("keyp")
    if(player.active) paused = !paused;
    activeKeys.delete('KeyP')
  }



  if(sH('ML')){
    if(player.attack.elapsed >= player.attack.cooldown){
      const {displaceX, displaceY} = playerZoneDisplace(player);
      configureAttack(things, player, displaceX, displaceY, mousePosition);
    }
  }
}

function configureAttack(things: Thing[], thing:Thing, displaceX:number, displaceY:number, targetPosition: Position){
      const {nmx, nmy} = normalizeMagnitude(thing.position, true, {x: displaceX + targetPosition.x, y: displaceY + targetPosition.y});
      const positionX = thing.position.x + (nmx * (thing.size.halfSizeW + thing.attack.size.halfSizeW));
      const positionY = thing.position.y + (nmy * (thing.size.halfSizeH + thing.attack.size.halfSizeH));
      const attack = {...thing.attack, position: {x: positionX, y: positionY}};
      thing.attack.elapsed = 0;
      things.push(createAttack(attack));
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

function getMagnitudeXY(position: Position, moving: boolean, targetPosition: Position){

  const omx = moving ? (targetPosition.x - position.x) : 0;
  const omy = moving ? (targetPosition.y - position.y) : 0;

  return Math.sqrt(omx * omx + omy * omy);
}


function normalizeMagnitude(position: Position, moving: boolean, targetPosition: Position){
  const omx = moving ? (targetPosition.x - position.x) : 0;
  const omy = moving ? (targetPosition.y - position.y) : 0;
  
  const magdeb = Math.sqrt(omx * omx + omy * omy);

  const nmx = magdeb >= 1 ? omx / magdeb : 0;
  const nmy = magdeb >= 1 ? omy / magdeb : 0;
  return {nmx, nmy};

}

function getDistanceFromThing(elapsedS: number, thing: Thing, targetPosition: Position){
  const {nmx, nmy} = normalizeMagnitude(thing.position, thing.moving, targetPosition);

  const velocityX = thing.speed * nmx * (1 - thing.slowed);
  const velocityY = thing.speed * nmy * (1 - thing.slowed);

  return {x: velocityX * elapsedS, y: velocityY * elapsedS};
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



function moveAndCollide(elapsedS: number, thing: Thing, things: Thing[]){

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
    if(thing.id !== otherThing.id && otherThing.active){
      const collisionDetected = collisionDetector(thing, {x: targetPositionX, y: targetPositionY}, otherThing);
      if(collisionDetected){
        const dist = getDistanceFromThing(elapsedS, thing, otherThing.position);
        const absX = Math.abs(dist.x);
        const absY = Math.abs(dist.y);
        switch(otherThing.variant){
          case EnumThingVariant.player:
            //TODO: This needs to be moved to action. otherThing.slowed = 0.7;
            if(absX < 12 && absY < 12){
              distanceX = 0;
              distanceY = 0;
            } else {
              distanceX = -(distanceX*2);
              distanceY = -(distanceY*2);
            }
          break;
          case EnumThingVariant.enemy:
            if(thing.variant === EnumThingVariant.enemy){
              if(absX < 0.5 && absY < 0.5){
                dist.x = thing.size.w;
                dist.y = thing.size.h;
              }
              distanceX = -dist.x;
              distanceY = -dist.y;
            }
            if(thing.variant === EnumThingVariant.player){
              if(distanceX > distanceY){
                otherThing.position.x += distanceX*2
              }
              else {
                otherThing.position.y += distanceY*2;
              }
            }
            break;
        }
      }
    }
  }
  const barrierCol = detectBarrierCollision(thing, {x:targetPositionX, y: targetPositionY });

  if(barrierCol.collision){
    if(thing.variant === EnumThingVariant.player){
      if(barrierCol.collT || barrierCol.collB){
        distanceY = 0;
      }
      if(barrierCol.collL || barrierCol.collR){
        distanceX = 0;
      }

    } else {
      
      if(barrierCol.collT){
        distanceY = thing.size.halfSizeH;
      }
      if(barrierCol.collB){
        distanceY = -thing.size.halfSizeH;
      }
      if(barrierCol.collL){
        distanceX = thing.size.halfSizeW;
      }
      if(barrierCol.collR){
        distanceX = -thing.size.halfSizeW;
      }

    }
  }

  return {distanceX, distanceY};

 
}

function moveThings(elapsedS: number, thing: Thing, things: Thing[]) {
  if(thing.active){
    const {distanceX, distanceY} = moveAndCollide(elapsedS, thing, things);
    thing.position.x += distanceX;
    thing.position.y += distanceY;
    thing.distanceX = distanceX;
    thing.distanceY = distanceY;

  }
}

function rotatospotatos(thing: Thing, position: Position, rotationTarget: Position){
  thing.rotation = (Math.atan2(rotationTarget.y - position.y, rotationTarget.x - position.x))-(Math.PI/4) ;
}

function action(elapsedS: number, thing: Thing, things: Thing[], thingIdx: number){
  if(thing.active){
    switch(thing.variant){
      case EnumThingVariant.player:
        //TODO: See if this can be optimized
        const playerAttack = thing.attack;
        playerAttack.elapsed += elapsedS;
        if(thing.hp <= 0){
          thing.active = false;
          RUNNING = false;
          getDebug(`${"You have been moiderd."}`);
        }
        break;
      case EnumThingVariant.enemy:
        if(thing.hp <= 0){
          thing.active = false;
        } else {
          const tAtk = thing.attack
          tAtk.elapsed += elapsedS;
          const distanceToPlayer = getMagnitudeXY(thing.position, thing.moving, thing.targetPosition);
          if(distanceToPlayer - thing.size.halfSizeW - globalPlayer.size.w < 3 && tAtk.elapsed >= (tAtk.cooldown + tAtk.leadUp)){
            tAtk.elapsed = 0;
            configureAttack(things, thing, 0, 0, thing.targetPosition);
          }
        }
        
        break;
      case EnumThingVariant.attack:
        const attack = thing.attack;
        attack.elapsed += elapsedS;
        if(attack.variant === EnumAttackVariant.melee && attack.elapsed > attack.duration) {
          thing.hp = 0;
          thing.active = false;
        }

        things.forEach(otherThing => {
          if(
            thing.id !== otherThing.id 
          && collisionDetector(thing, thing.position, otherThing) 
          && !(attack.thingAttacked.has(otherThing))){ // TODO: Can collision detection be unified?
            if((thing.targetCollisionLayer.intersection(otherThing.collisionLayer)).size){
              attack.thingAttacked.add(otherThing);
              otherThing.hp -= attack.damage;
            }
          }

        })
        break;
    }
  } else {
    swapWithLastAndPop(things, thingIdx);
  }
}

function renderUI(ctx: CanvasRenderingContext2D, player: Thing){
  const maxHP = player.maxHp;
  const hp = player.hp;
  const percentage = hp / maxHP;

  const gradient = ctx.createLinearGradient(0, 20, 0, 40);

  gradient.addColorStop(0, "red");
  gradient.addColorStop(0.16, "orange");
  gradient.addColorStop(0.32, "yellow");
  gradient.addColorStop(0.48, "green");
  gradient.addColorStop(0.64, "blue");
  gradient.addColorStop(0.80, "indigo");
  gradient.addColorStop(1, "violet");
  
  ctx.fillStyle = gradient;

  ctx.fillRect(20, 20, 200*percentage, 20)


}

function run(ctx: CanvasRenderingContext2D, prevTime: number, timestamp: number, things: Thing[],player: Thing) {
  const elapsed = timestamp - prevTime;
  const elapsedS = elapsed / 1000;
  processPlayerInput(player, things);
  if(!paused){

    things.forEach((thing, idx) => {
      action(elapsedS, thing, things, idx);
    });

    //CALCULATIONS AND PHYSICS
    moveThings(elapsedS, player, things);
    rotatospotatos(player, playerCentered, player.rotationTarget);

    const displace = playerZoneDisplace(player);
    for(let idx = 1; idx < (things.length); idx++){
      const thing = things[idx];
      if (thing.active){
        if(thing.moving) moveThings(elapsedS, thing, things);
        rotatospotatos(thing, thing.position, thing.rotationTarget);
      }
    };


    //RENDER
    ctx.clearRect(0,0, defaultZoneSize.w, defaultZoneSize.h);
    map.forEach((zone)=> {
      drawBg(ctx, zone, player);
    });
    drawThing(ctx, player, playerCentered, {displaceX: 0, displaceY: 0});
    for(let idx = 1; idx < (things.length); idx++){
      const thing = things[idx];
      drawThing(ctx, thing, thing.position, displace);
    };

    renderUI(ctx, player);
  }

  if(RUNNING)requestAnimationFrame((ts) => run(ctx, timestamp, ts, things, player));
}

function addEL(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D){

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
    switch(event.button){
      case 0:
        activeKeys.delete("ML");
        break;
      case 2:
        activeKeys.delete("MR");
        break;
    }
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

  const keyMaps = new Set(['KeyA', 'KeyS', 'KeyD', 'KeyW']);
  addEventListener("keydown", (event) => {
    if(keyMaps.has(event.code))
      activeKeys.add(event.code);
  });
  addEventListener("keyup", (event) => {
    switch (event.code){
      case 'KeyP': 

        activeKeys.add(event.code);
        break;
      case 'KeyR':
        if(!RUNNING){ 
        //TODO: THIS DOESNT WORK
          init(ctx, false);
          getDebug("");
        }
        else {
          getDebug("Press R again to restart game.");
          RUNNING = false;
        }
        break;
    }
    if(keyMaps.has(event.code)) activeKeys.delete(event.code);
  });
}


function init(ctx: CanvasRenderingContext2D, pause: boolean) {
  RUNNING = true;
  const player = createPlayer();
  const things = [player];
  paused = pause;

  randomThingCreator(things, INITTHINGSNOTPLAYER, player);

  requestAnimationFrame((timestamp) => run(ctx, 0, timestamp, things, player));
  return 0;
}

function config(){
  const canvas = gEI("cv") as HTMLCanvasElement | null;
  if (!canvas) return 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error(
      "Canvas could not be found or context could not be initialized",
    );
    return 1;
  }
  addEL(canvas, ctx);

  init(ctx, true);
  
}

config();
