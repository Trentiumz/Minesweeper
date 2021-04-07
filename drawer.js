var imageID = {
  "bomb": "bombIMG",
  "flag": "flagIMG"
}
var images = {}

function initializeImages(){
  for(let key in imageID){
    images[key] = document.getElementById(imageID[key])
  }
}

function renderMap(uncovered, map, mineMap, flagged) {
  for (let r = 0; r < rows; ++r) {
    for (let c = 0; c < columns; ++c) {
      let element = document.getElementById("gameTable").rows[r].cells[c];
      element.innerHTML = ""
      if(!uncovered[r][c]){
        if(flagged[r][c]){
          var image = images.flag.cloneNode(false)
          element.appendChild(image)
        }
        element.className = "coveredCell"
        continue
      }
      element.className = "emptyCell"
      if(mineMap[r][c]){
        element.appendChild(images.bomb.cloneNode(false))
      }else{
        element.innerHTML = map[r][c];
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
      element.onmousedown = (event) => {
        if(event.button == 0)
          click([r, c], map, mineMap, uncovered, flagged);
        else if(event.button == 2)
          rightClick([r, c], flagged)
      }
      element.oncontextmenu = function(event){
        return false
      }
      row.appendChild(element);
    }
    document.getElementById("gameTable").appendChild(row);
  }
}
