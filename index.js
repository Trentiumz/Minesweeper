// arr[i] = [rows, columns]
const dimensForLevel = [
  [10, 10],
  [14, 18],
  [20, 28]
];
const minesForLevel = [10, 40, 100]

const aiConsider = 10

var rows, columns;
var mineCount;

// map[row][column]
var map = [];
var mineMap = [];
var uncovered = []
var flagged = []

var initialized = false;
var finished = false;
var startTime = -1;

var ai;

window.onload = function() {
  document.getElementById("easyGameStart").onclick = () => start(0);
  document.getElementById("mediumGameStart").onclick = () => start(1);
  document.getElementById("hardGameStart").onclick = () => start(2);

  document.getElementById("winScreen").onclick = restart;
  document.getElementById("loseScreen").onclick = restart;

  document.getElementById("restartGame").onclick = restart;
  document.getElementById("aiMove").onclick = doMove;

  initializeImages();
}

function restart(){
  document.getElementById("startingFormat").hidden = false;
  document.getElementById("aiFormat").hidden = true;
  document.getElementById("winScreen").hidden = true;
  document.getElementById("loseScreen").hidden = true;

  initialized = false;
  finished = false;
}

function start(level) {
  document.getElementById("startingFormat").hidden = true;
  document.getElementById("aiFormat").hidden = false;
  [rows, columns] = dimensForLevel[level];
  mineCount = minesForLevel[level];

  document.getElementById("bombs").innerHTML = mineCount
  startTime = new Date().getTime();
  updateTimer();

  ai = new AI(rows, columns, aiConsider)

  initializeTable();
}

function initializeMap(notAllowed) {
  map.splice(0, map.length);
  mineMap.splice(0, mineMap.length);
  uncovered.splice(0, uncovered.length)
  flagged.splice(0, flagged.length)

  // Set where the mines are
  var [safeRow, safeCol] = notAllowed
  let coordinates = new Set();
  while (coordinates.size < mineCount) {
    coordinates.add(Math.floor(Math.random() * rows * columns));
    coordinates.delete(safeRow * columns + safeCol);
  }
  for (let r = 0; r < rows; ++r) {
    var rowInfo = []
    for (let c = 0; c < columns; ++c) {
      rowInfo.push(coordinates.has(r * columns + c))
    }
    mineMap.push(rowInfo)
  }

  // Set whether or not the current tile has been uncovered
  for (let r = 0; r < rows; ++r) {
    var add = []
    for (let c = 0; c < columns; ++c) {
      add.push(false)
    }
    uncovered.push(add)
  }

  // Get information on the mines
  // Add's a "border of falses" around the current array
  let altered = [Array(columns + 3).fill(false)].concat(mineMap.map(row => [false].concat(row).concat([false, false]))).concat([Array(columns + 3).fill(false), Array(columns + 3).fill(false)])
  let topLeft = altered[1][1] + altered[1][2] + altered[2][1] + altered[2][2]
  for (let r = 1; r <= rows; ++r) {
    let slide = topLeft
    var rowInfo = []
    for (let c = 1; c <= columns; ++c) {
      rowInfo.push(slide)
      slide += altered[r - 1][c + 2] + altered[r][c + 2] + altered[r + 1][c + 2]
      slide -= altered[r - 1][c - 1] + altered[r][c - 1] + altered[r + 1][c - 1]
    }
    map.push(rowInfo)
    topLeft += altered[r + 2][1] + altered[r + 2][2]
    topLeft -= altered[r - 1][1] + altered[r - 1][2]
  }

  for(let r = 0; r < rows; ++r){
    var row = []
    for(let c = 0; c < columns; ++c){
      row.push(false)
    }
    flagged.push(row)
  }
}

function click(coordinates) {
  tapCell(coordinates)
  renderMap(uncovered, map, mineMap, flagged)
}

// only renders logic when a cell is tapped
function tapCell(coordinates){
  if(finished)
    return;
  if (!initialized) {
    initializeMap(coordinates);
    initialized = true;
  }
  var [row, col] = coordinates
  if(flagged.length > 0 && flagged[row][col])
    return;

  if(mineMap[row][col]){
    revealResult("loseScreen")
  }
  uncoverAdjacents(map, uncovered, coordinates)

  updateUserMineCount();

  let allUncovered = true;
  uncovered.forEach(function(row, rInd) { row.forEach(function(obj, cInd){
    allUncovered = allUncovered && (obj || mineMap[rInd][cInd])
  })})
  if(allUncovered){
    revealResult("winScreen")
  }
}

function rightClick(coordinates){
  if(finished)
    return;
  [row, column] = coordinates
  flagged[row][column] = !flagged[row][column]

  updateUserMineCount();
  renderMap(uncovered, map, mineMap, flagged)
}

function uncoverAdjacents(map, uncovered, currentCoord){
  [row, col] = currentCoord
  uncovered[row][col] = true

  var zeros = map[row][col] > 0 ? [] : [currentCoord]
  while(zeros.length > 0){
    [r, c] = zeros.shift()
    for(let ri = r - 1; ri < r + 2; ++ri){
      for(let ci = c - 1; ci < c + 2; ++ci){
        if(0 <= ri && ri < rows && 0 <= ci && ci < columns && !uncovered[ri][ci]){
          uncovered[ri][ci] = true
          if(map[ri][ci] == 0)
            zeros.push([ri, ci]);
        }
      }
    }
  }
}

function revealResult(screenID){
  document.getElementById(screenID).hidden = false;
  finished = true;
}

function doMove(){
  if(!initialized || finished){
    return;
  }

  var uncoveredInfo = map.map((row, rInd) => row.map((element, cInd) => uncovered[rInd][cInd] ? element : -1))
  let [forcedSafe, forcedFlags, leastLikelyBomb] = ai.getMove(uncovered, uncoveredInfo, flagged);

  if(forcedSafe.length == 0 && !forcedFlags.some((coord) => !flagged[coord[0]][coord[1]]) && leastLikelyBomb.length > 0){
    if(confirm("Oh No! It seems ml^3 couldn't make a definite decision... would you like to proceed with a cell that has a " + Math.floor(leastLikelyBomb[0][1] * 100) + "% chance of being a bomb")){
      tapCell(leastLikelyBomb[0][0])
    }
  }
  forcedFlags.forEach((coord) => flagged[coord[0]][coord[1]] = true)
  forcedSafe.forEach((coord) => tapCell(coord))

  console.log(leastLikelyBomb)
  renderMap(uncovered, map, mineMap, flagged)
}
