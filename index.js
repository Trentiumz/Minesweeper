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

var initialized = false;

var imageID = {
  "bomb": "bombIMG"
}
var images = {}

window.onload = function() {
  element("easyGameStart").onclick = () => start(0);
  element("mediumGameStart").onclick = () => start(1);
  element("hardGameStart").onclick = () => start(2);

  initializeImages();
}

function initializeImages(){
  for(let key in imageID){
    images[key] = document.getElementById(imageID[key])
  }
}

function start(level) {
  document.getElementById("startingFormat").hidden = true;
  document.getElementById("aiFormat").hidden = false;
  [rows, columns] = dimensForLevel[level];
  mineCount = minesForLevel[level];

  for (let r = 0; r < rows; ++r) {
    var row = document.createElement("tr")
    for (let c = 0; c < columns; ++c) {
      var element = document.createElement("td");
      element.className = "coveredCell"
      element.onclick = () => click([r, c], map, mineMap, uncovered)
      row.appendChild(element);
    }
    document.getElementById("gameTable").appendChild(row);
  }
}

function initializeMap(notAllowed, map, mineMap, uncovered) {
  // Set where the mines are
  [safeRow, safeCol] = notAllowed
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
}

function click(coordinates, map, mineMap, uncovered) {
  console.log(coordinates)
  var [row, col] = coordinates
  if (!initialized) {
    initializeMap(coordinates, map, mineMap, uncovered);
    renderMap();
    initialized = true;
  }else{
    uncovered[row][col] = true;
    renderMap();
  }
}

function renderMap() {
  for (let r = 0; r < rows; ++r) {
    for (let c = 0; c < columns; ++c) {
      let element = document.getElementById("gameTable").rows[r].cells[c];
      element.innerHTML = ""
      if(!uncovered[r][c]){
        element.className = "coveredCell"
        continue
      }
      element.className = "emptyCell"
      if(mineMap[r][c]){
        element.appendChild(images.bomb.cloneNode(false))
      }else{
        element.innerHTML = map[r][c]
      }
    }
  }
}

function element(id) {
  return document.getElementById(id)
}
