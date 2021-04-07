// arr[i] = [rows, columns]
const dimensForLevel = [
  [10, 10],
  [20, 20],
  [50, 50]
];
const minesForLevel = [8, 20, 300]

var rows, columns;
var mineCount;

// map[row][column]
var map = [];
var mineMap = [];
var uncovered = []
var flagged = []

var initialized = false;


window.onload = function() {
  document.getElementById("easyGameStart").onclick = () => start(0);
  document.getElementById("mediumGameStart").onclick = () => start(1);
  document.getElementById("hardGameStart").onclick = () => start(2);

  document.getElementById("winScreen").onclick = () => restart();
  document.getElementById("loseScreen").onclick = () => restart();

  initializeImages();
  update()
}

function restart(){
  document.getElementById("startingFormat").hidden = false;
  document.getElementById("aiFormat").hidden = true;
  document.getElementById("winScreen").hidden = true;
  document.getElementById("loseScreen").hidden = true;

  initialized = false;
}

function update(){
  if(initialized)
    renderMap(uncovered, map, mineMap, flagged);
  setTimeout(update, 50)
}

function start(level) {
  document.getElementById("startingFormat").hidden = true;
  document.getElementById("aiFormat").hidden = false;
  [rows, columns] = dimensForLevel[level];
  mineCount = minesForLevel[level];

  initializeTable();
}

function initializeMap(notAllowed, map, mineMap, uncovered, flagged) {
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

function click(coordinates, map, mineMap, uncovered, flagged) {
  console.log(coordinates)
  var [row, col] = coordinates
  if (!initialized) {
    initializeMap(coordinates, map, mineMap, uncovered, flagged);
    initialized = true;
  }
  if(mineMap[row][col])
    document.getElementById("loseScreen").hidden = false;
  uncoverAdjacents(map, uncovered, coordinates)
}

function rightClick(coordinates, flagged){
  [row, column] = coordinates
  flagged[row][column] = true
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
