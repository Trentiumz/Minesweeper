class AI{
  constructor(){
    // Just setting up visuals for the user
    this.aiTable = document.createElement("div")
    document.getElementById("aiFormat").appendChild(this.aiTable)
    console.log("added")

    this.uncovered = []
    this.knownSquares = []
    this.isBorder = []
    this.borderLabelling = []
  }

  putVisuals(){
    var tableCopy = document.getElementById("gameTable").cloneNode(true)
    this.aiTable.innerHTML = ""
    this.aiTable.appendChild(tableCopy)
    console.log("changed")

    for(let r = 0; r < uncovered.length; ++r){
      for(let c = 0; c < uncovered[r].length; ++c){
        tableCopy.rows[r].cells[c].style.backgroundColor = this.isBorder[r][c] ? "pink" : this.uncovered[r][c] ? "lightblue" : "blue"
        if(this.borderLabelling[r][c] != -1)
          tableCopy.rows[r].cells[c].innerHTML = this.borderLabelling[r][c]
      }
    }
  }

  fillAdjacentBorders(startingCoords, label){
    [row, col] = startingCoords
    this.borderLabelling[row][col] = label
    var queue = [startingCoords]

    while(queue.length > 0){
      [r, c] = queue.shift()
      for(let rn = r - 1; rn <= r + 1; ++rn)
        for(let cn = c - 1; cn <= c + 1; ++cn)
          if(0 <= rn && rn < uncovered.length && 0 <= cn && cn < uncovered[rn].length)
            if(this.borderLabelling[rn][cn] == -1 && this.isBorder[rn][cn]){
              this.borderLabelling[rn][cn] = label
              queue.push([rn, cn])
            }else if(this.uncovered[rn][cn]){
              for(let rnn = rn - 1; rnn <= rn + 1; ++rnn)
                for(let cnn = cn - 1; cnn <= cn + 1; ++cnn)
                  if(0 <= rnn && rnn < uncovered.length && 0 <= cnn && cnn < uncovered[rn].length)
                    if(this.borderLabelling[rnn][cnn] == -1 && this.isBorder[rnn][cnn]){
                      this.borderLabelling[rnn][cnn] == label
                      queue.push([rnn, cnn])
                    }
            }
    }
  }

  labelBorders(){
    let currentLabel = 0
    for(let r = 0; r < this.uncovered.length; ++r)
      for(let c = 0; c < this.uncovered[r].length; ++c)
        if(this.isBorder[r][c] && this.borderLabelling[r][c] == -1){
          this.fillAdjacentBorders([r, c], currentLabel)
          ++currentLabel
        }
  }

  fillBorders(uncovered){
    for(let r = 0; r < uncovered.length; ++r)
      for(let c = 0; c < uncovered[r].length; ++c){
        if(uncovered[r][c])
          for(let rn = r - 1; rn <= r + 1; ++rn)
            for(let cn = c - 1; cn <= c + 1; ++cn){
              if(0 <= rn && rn < uncovered.length && 0 <= cn && cn < uncovered[rn].length && (!uncovered[rn][cn])){
                this.isBorder[rn][cn] = true;
              }
            }
    }
  }

  fillGrid(array, rows, columns, value){
    for(let r = 0; r < rows; ++r)
      array[r] = new Array(columns).fill(value)
  }

  getMove(uncovered, knownSquares){
    this.knownSquares = knownSquares;
    this.uncovered = uncovered;
    this.isBorder = []
    this.fillGrid(this.isBorder, uncovered.length, uncovered[0].length, false)
    this.fillGrid(this.borderLabelling, uncovered.length, uncovered[0].length, -1)

    this.fillBorders(uncovered)
    this.labelBorders()
    console.log(this.borderLabelling)

    this.putVisuals();
  }
}
