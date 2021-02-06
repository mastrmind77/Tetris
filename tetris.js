const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
var paused = false;

//const pauseKey : false;
//const enterKey : false;

context.scale(20, 20);

//Toggles game state to paused
// function togglePause() {
//     if (!paused)
//     {
//         paused = true;
//     } else if (paused)
//     {
//        paused= false;
//     }
//
// }

function togglePause() {
  paused = !paused
  var x = document.getElementById("status");
  if (paused) {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
    update();
}

function startGame() {
  playerReset();
}

// function pauseGame() {
//     paused = !paused; // toggle the paused value (false <-> true)
//     if (!paused) loop(); // restart loop
// }

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length -1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;

    player.score += rowCount * 10;
    rowCount *= 2;
  }
  updateScore();
}


//matrix defining shapes
const matrix = [
  [0,0,0],
  [1,1,1],
  [0,1,0],
];


//determine if player piece will collide with item on board
function collide(arena, player) {
  const[m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length;++x) {
      if (m[y][x] !== 0 &&
          (arena[y + o.y] &&
          arena[y + o.y][x + o.x]) !== 0) {
            return true;
          }
    }
  }
  return false;
}

//creates the board
function createMatrix(w, h){
  const matrix = [];
  while (h--){
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  if (type === 'T') {
    return [
      [0,0,0],
      [1,1,1],
      [0,1,0],
    ];
} else if (type === 'O') {
    return [
      [2,2],
      [2,2],
    ];
} else if (type === 'L') {
    return [
      [0,3,0],
      [0,3,0],
      [0,3,3],
    ];
} else if (type === 'J') {
    return [
      [0,4,0],
      [0,4,0],
      [4,4,0],
    ];
} else if (type === 'I') {
    return [
      [0,5,0,0],
      [0,5,0,0],
      [0,5,0,0],
      [0,5,0,0],
    ];
} else if (type === 'S') {
    return [
      [0,6,6],
      [6,6,0],
      [0,0,0],
    ];
} else if (type === 'Z') {
    return [
      [7,7,0],
      [0,7,7],
      [0,0,0],
    ];
  }
}

//clears old position and draws new piece position and draws the board
function draw() {
  context.fillStyle = '#000';
  context.fillRect(0,0,canvas.width, canvas.height);

  drawMatrix(arena, {x:0, y:0})
  drawMatrix(player.matrix, player.pos);

}

//function that draws pieces on screen
function drawMatrix(matrix, offset){
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x,
                         y + offset.y,
                         1, 1);
      }
    });
  });
}

//puts the pieces into position on the board
function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;

      }
    })
  })
}

//drops the pieces
function playerDrop(){
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

//Allows a piece to rotate in either direction
function rotate(matrix, dir) {
  for (let y=0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [
        matrix[x][y],
        matrix[y][x],
      ] = [
        matrix[y][x],
        matrix[x][y],
      ];
    }
  }

  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

//moves piece and checks for collisions
function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

//creates a random piece at the top middle of the board
function playerReset() {
  const pieces = 'ILJOTSZ';
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
                 (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

//Performs the piece rotation
function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}


let dropCounter = 0;
let dropInterval = 1000;


let lastTime = 0;

//draws the animation frames
function update(time = 0){
//    currentState(); // call the current game state
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    if (!paused) {
      requestAnimationFrame(update);
  }

}

//Updates the score in the HTML
function updateScore() {
  document.getElementById('score').innerText = player.score;
}


const colors = [
  null,
  'red',
  'blue',
  'violet',
  'green',
  'yellow',
  'orange',
  'pink',
];

const arena = createMatrix(12, 20);
//console.log(arena); console.table(arena);

//this is the current piece
const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0,
}

//player controls
document.addEventListener('keydown', event => {
  if (event.keyCode === 37) {
    playerMove(-1);
  } else if (event.keyCode === 39) {
    playerMove(+1);
  } else if (event.keyCode === 40) {
      playerDrop();
  } else if (event.keyCode === 81) {
      playerRotate(-1);
  } else if (event.keyCode === 87) {
      playerRotate(1);
  } else if (event.keyCode === 80) {
      togglePause(); //Press P to pause
  } else if (event.keyCode === 27) {
      startGame(); //Press P to pause
  }
});

//game pause if P is pressed
//document.addEventListener('keydown'), event => {
//  if (event.keycode === 80) {
//    togglePause();
//  }
//};


// set up keyboard IO
// const keys = {
//     KeyP : false,
//     Enter : false,
//     listener(e){
//        if(keys[e.code] !== undefined){
//            keys[e.code] = e.type === "keydown";
//            e.preventDefault();
//         }
//     }
// }
// addEventListener("keydown",keys.listener);
// addEventListener("keyup",keys.listener);


// the current game state
// var currentState = startGame;
//
// function startGame (){
//     // code to do a single frame of start game
//    // display press enter to start
//    if(keys.Enter){
//       keys.Enter = false;
//       currentState = game;  // start the game
//    }
// }
// function pause(){
//     // code to do a single frame of pause
//    // display pause
//     if(pauseKey = true){
//        currentState = pause;   // resume game
//     }
//
// }
// function game(){
//     // code to do a single frame of game
//     if(keys.KeyP){
//        keys.KeyP = false; // turn off key
//        currentState = pause;  // pause game
//     }
// }
// function mainLoop(time){
//     currentState(); // call the current game state
//     requestAnimationFrame(mainLoop);
// }

playerReset();
updateScore();

  update();
