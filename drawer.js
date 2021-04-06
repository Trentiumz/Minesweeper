var imageID = {
  "bomb": "bombIMG"
}
var images = {}

function initializeImages(){
  for(let key in imageID){
    images[key] = document.getElementById(imageID[key])
  }
}

function renderMap(uncovered, map, mineMap) {
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

function initializeTable(){
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
