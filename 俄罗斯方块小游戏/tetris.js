// tetris.js

// 游戏区域尺寸
const COLS = 10; // 列数
const ROWS = 20; // 行数
const BLOCK_SIZE = 30; // 每格像素

// 俄罗斯方块的形状和颜色
const SHAPES = [
  // I
  [
    [[0,1],[1,1],[2,1],[3,1]],
    [[2,0],[2,1],[2,2],[2,3]],
    [[0,2],[1,2],[2,2],[3,2]],
    [[1,0],[1,1],[1,2],[1,3]]
  ],
  // J
  [
    [[0,0],[0,1],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[1,2]],
    [[0,1],[1,1],[2,1],[2,2]],
    [[1,0],[1,1],[0,2],[1,2]]
  ],
  // L
  [
    [[2,0],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[1,2],[2,2]],
    [[0,1],[1,1],[2,1],[0,2]],
    [[0,0],[1,0],[1,1],[1,2]]
  ],
  // O
  [
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]]
  ],
  // S
  [
    [[1,0],[2,0],[0,1],[1,1]],
    [[1,0],[1,1],[2,1],[2,2]],
    [[1,1],[2,1],[0,2],[1,2]],
    [[0,0],[0,1],[1,1],[1,2]]
  ],
  // T
  [
    [[1,0],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[2,1],[1,2]],
    [[0,1],[1,1],[2,1],[1,2]],
    [[1,0],[0,1],[1,1],[1,2]]
  ],
  // Z
  [
    [[0,0],[1,0],[1,1],[2,1]],
    [[2,0],[1,1],[2,1],[1,2]],
    [[0,1],[1,1],[1,2],[2,2]],
    [[1,0],[0,1],[1,1],[0,2]]
  ]
];
const COLORS = [
  '#00f0f0', // I
  '#0000f0', // J
  '#f0a000', // L
  '#f0f000', // O
  '#00f000', // S
  '#a000f0', // T
  '#f00000'  // Z
];

// 游戏状态
let board = [];
let current, next;
let score = 0;
let gameOver = false;
let dropInterval = 500; // 下落间隔（毫秒）
let dropTimer = null;

// 获取 canvas 和上下文
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextCtx = nextCanvas.getContext('2d');

// 初始化游戏
function init() {
  // 初始化棋盘
  board = Array.from({length: ROWS}, () => Array(COLS).fill(null));
  score = 0;
  gameOver = false;
  document.getElementById('score').innerText = score;
  // 生成当前和下一个方块
  next = randomPiece();
  newPiece();
  // 启动下落定时器
  if (dropTimer) clearInterval(dropTimer);
  dropTimer = setInterval(drop, dropInterval);
  draw();
}

// 生成随机方块
function randomPiece() {
  const type = Math.floor(Math.random() * SHAPES.length);
  return {
    type,
    shape: SHAPES[type],
    dir: 0, // 旋转方向
    x: 3,   // 初始横坐标
    y: 0    // 初始纵坐标
  };
}

// 生成新方块
function newPiece() {
  current = next;
  current.x = 3;
  current.y = 0;
  next = randomPiece();
  // 如果新方块一生成就冲突，游戏结束
  if (collide(current.x, current.y, current.shape[current.dir])) {
    gameOver = true;
    clearInterval(dropTimer);
    alert('游戏结束！');
  }
  draw();
  drawNext();
}

// 检查碰撞
function collide(x, y, shape) {
  for (let i = 0; i < shape.length; i++) {
    const [dx, dy] = shape[i];
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return true;
    if (board[ny][nx] !== null) return true;
  }
  return false;
}

// 固定方块到棋盘
function fixPiece() {
  const shape = current.shape[current.dir];
  for (let i = 0; i < shape.length; i++) {
    const [dx, dy] = shape[i];
    const nx = current.x + dx;
    const ny = current.y + dy;
    if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
      board[ny][nx] = current.type;
    }
  }
}

// 消除满行
function clearLines() {
  let lines = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== null)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(null));
      lines++;
      y++; // 检查新移下来的这一行
    }
  }
  if (lines > 0) {
    // 计分规则：1行100分，2行300分，3行700分，4行1500分
    const points = [0, 100, 300, 700, 1500];
    score += points[lines];
    document.getElementById('score').innerText = score;
  }
}

// 方块下落
function drop() {
  if (gameOver) return;
  if (!collide(current.x, current.y + 1, current.shape[current.dir])) {
    current.y++;
  } else {
    fixPiece();
    clearLines();
    newPiece();
  }
  draw();
}

// 方块移动
function move(dx) {
  if (!collide(current.x + dx, current.y, current.shape[current.dir])) {
    current.x += dx;
    draw();
  }
}

// 方块旋转
function rotate() {
  const nextDir = (current.dir + 1) % 4;
  if (!collide(current.x, current.y, current.shape[nextDir])) {
    current.dir = nextDir;
    draw();
  }
}

// 快速下落
function fastDrop() {
  while (!collide(current.x, current.y + 1, current.shape[current.dir])) {
    current.y++;
  }
  drop();
}

// 画游戏区域
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 画已固定的方块
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x] !== null) {
        drawBlock(x, y, COLORS[board[y][x]]);
      }
    }
  }
  // 画当前下落的方块
  const shape = current.shape[current.dir];
  for (let i = 0; i < shape.length; i++) {
    const [dx, dy] = shape[i];
    drawBlock(current.x + dx, current.y + dy, COLORS[current.type]);
  }
}

// 画单个方块
function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  ctx.strokeStyle = '#222';
  ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// 画下一个方块
function drawNext() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const shape = next.shape[0];
  for (let i = 0; i < shape.length; i++) {
    const [dx, dy] = shape[i];
    // 居中显示
    drawNextBlock(dx + 1, dy + 1, COLORS[next.type]);
  }
}
function drawNextBlock(x, y, color) {
  nextCtx.fillStyle = color;
  nextCtx.fillRect(x * 30, y * 30, 30, 30);
  nextCtx.strokeStyle = '#222';
  nextCtx.strokeRect(x * 30, y * 30, 30, 30);
}

// 键盘事件
document.addEventListener('keydown', function(e) {
  if (gameOver) return;
  switch (e.key) {
    case 'ArrowLeft':
      move(-1);
      break;
    case 'ArrowRight':
      move(1);
      break;
    case 'ArrowDown':
      drop();
      break;
    case 'ArrowUp':
      rotate();
      break;
    case ' ':
      fastDrop();
      break;
  }
});

// 重新开始按钮
document.getElementById('restart').onclick = function() {
  init();
};

// 启动游戏
init(); 