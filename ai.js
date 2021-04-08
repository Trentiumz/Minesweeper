class AI{
  // Version 1:
  // Get all "bordering cells", which are uncovered cells that are at the edge
  // For some arbitrary "border cell", get all adjacent covered cells
  // For each adjacent cell, get nearby "border cells"
  // Rinse and repeat, there should be a few cells who have all of their nearby covered cells "in the set"
  // Iterate through all possibilities for the covered cells in the set, see which values are forced for the hidden cells
  // Using that, compile the decisions.


  constructor(rows, columns){
    // Just setting up visuals for the user
    this.aiTable = document.createElement("div")
    this.rows = rows;
    this.columns = columns;

    document.getElementById("aiFormat").appendChild(this.aiTable)
    console.log("added")
  }

  putVisuals(isBorder, uncovered){
    var tableCopy = document.getElementById("gameTable").cloneNode(true)
    this.aiTable.innerHTML = ""
    this.aiTable.appendChild(tableCopy)
    console.log("changed")

    for(let r = 0; r < this.rows; ++r){
      for(let c = 0; c < this.columns; ++c){
        tableCopy.rows[r].cells[c].style.backgroundColor = isBorder[r][c] ? "pink" : uncovered[r][c] ? "lightblue" : "blue"
      }
    }
  }

  getBorders(knownSquares, coordinates){
    return knownSquares.map((row, rInd) => row.map(function(obj, cInd){
      if(obj > 0){
        coordinates.push([rInd, cInd])
        return true;
      }
      return false;
    }))
  }

  getBorderComparator(rows, columns){
    return function(first, second){
      let [fr, fc] = first
      let [sr, sc] = second

      let fCount = 0
      let sCount = 0
      for(let rd = -1; rd <= 1; ++rd)
        for(let cd = -1; cd <= 1; ++cd){
          let nr = fr + rd, nc = fc + cd
          if(0 <= nr && nr < rows && 0 <= nc && nc < columns && !uncovered[nr][nc])
            ++fCount
          nr = sr + rd, nc = sc + cd
          if(0 <= nr && nr < rows && 0 <= nc && nc < columns && !uncovered[nr][nc])
            ++sCount
        }
      return fCount - sCount
    }
  }

  getMove(uncovered, knownSquares, flagged){
    var borderingCoordinates = []
    var isBorder = this.getBorders(knownSquares, borderingCoordinates);

    console.log(borderingCoordinates)
    borderingCoordinates.sort(this.getBorderComparator(this.rows, this.columns))
    console.log(borderingCoordinates)

    this.putVisuals(isBorder, uncovered);
  }
}

function fillMultidimensional(defaultValue, ...args){
  if(args.length == 0){
    return defaultValue;
  }
  var toreturn = []
  let dimen = args.shift()
  for(let i = 0; i < dimen; ++i){
    toreturn.push(fillMultidimensional(defaultValue, ...args))
  }
  return toreturn;
}

function range(start, end){
  var toreturn = []
  for(; start < end; ++start){
    toreturn.push(start)
  }
  return toreturn
}

function flatten2d(arr){
  var toreturn = []
  for(let part of arr){
    toreturn = toreturn.concat(part)
  }
  return toreturn
}
