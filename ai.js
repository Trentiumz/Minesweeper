const adjacents = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1]
]

class AI {
  // Version 1:
  // Get all "bordering cells", which are uncovered cells that are at the edge
  // For some arbitrary "border cell", get all adjacent covered cells
  // For each adjacent cell, get nearby "border cells"
  // Rinse and repeat, there should be a few cells who have all of their nearby covered cells "in the set"
  // Iterate through all possibilities for the covered cells in the set, see which values are forced for the hidden cells
  // Using that, compile the decisions.


  constructor(rows, columns, maxConsider) {
    // Just setting up visuals for the user
    this.aiTable = document.createElement("div")
    this.nodesChosen = []
    this.bordersFilled = []

    this.rows = rows;
    this.columns = columns;
    this.bruteForceNodes = maxConsider

    // coordinates[r][c] = [r, c]; the difference is that it's just one object for each coord
    this.coordinates = range(0, rows).map((row, rInd) => range(0, columns).map((obj, cInd) => [rInd, cInd]))

    document.getElementById("aiFormat").appendChild(this.aiTable)
    console.log("added")
  }

  putVisuals(isBorder, uncovered, isSafe, isBomb) {
    var tableCopy = document.getElementById("gameTable").cloneNode(true)
    this.aiTable.innerHTML = ""
    this.aiTable.appendChild(tableCopy)
    console.log("changed")

    for (let r = 0; r < this.rows; ++r) {
      for (let c = 0; c < this.columns; ++c) {
        let color = ""
        if(isBomb[r][c]){
          color = "#E97451"
        }else if(isSafe[r][c]){
          color = "#ADFF2F"
        }else if(this.nodesChosen[r][c]){
          color = "pink"
        }else if(this.bordersFilled[r][c]){
          color = "#388E8E"
        }else if(uncovered[r][c]){
          color = "#8DEEEE"
        }else{
          color = "blue"
        }
        tableCopy.rows[r].cells[c].style.backgroundColor = color
      }
    }
  }

  getBorders(knownSquares, coordinates) {
    return knownSquares.map((row, rInd) => row.map(function(obj, cInd) {
      if (obj > 0) {
        coordinates.push([rInd, cInd])
        return true;
      }
      return false;
    }))
  }

  getBorderComparator(rows, columns) {
    return function(first, second) {
      let [fr, fc] = first
      let [sr, sc] = second

      let fCount = 0
      let sCount = 0
      for (let rd = -1; rd <= 1; ++rd)
        for (let cd = -1; cd <= 1; ++cd) {
          let nr = fr + rd,
            nc = fc + cd
          if (0 <= nr && nr < rows && 0 <= nc && nc < columns && !uncovered[nr][nc])
            ++fCount
          nr = sr + rd, nc = sc + cd
          if (0 <= nr && nr < rows && 0 <= nc && nc < columns && !uncovered[nr][nc])
            ++sCount
        }
      return fCount - sCount
    }
  }

  getConsiderSet(startingBorder, borders, uncovered) {
    var toConsiderNode = fillMultidimensional(false, this.rows, this.columns)
    var borderConsidered = fillMultidimensional(false, this.rows, this.columns)

    var considerNodes = []

    var queue = [startingBorder]
    while (queue.length > 0 && considerNodes.length < this.bruteForceNodes) {
      // For all borders, add it to the ones considered in the border
      let [row, col] = queue.shift()
      borderConsidered[row][col] = true

      // get adjacent covered
      for (let covCoord of getAdjacents(row, col, this.rows, this.columns)) {
        let [r, c] = covCoord

        if (!uncovered[r][c] && !toConsiderNode[r][c]) {
          // If is covered and we haven't added it yet, add it to coveredConsider
          toConsiderNode[r][c] = true
          considerNodes.push([r, c])

          // Add all of its adjacent borders to the queue
          for (let borderCoord of getAdjacents(r, c, this.rows, this.columns)) {
            let [br, bc] = borderCoord
            if (uncovered[br][bc] && !borderConsidered[br][bc]) {
              queue.push(this.coordinates[br][bc])
              borderConsidered[br][bc] = true
            }
          }
        }
      }
    }

    // These are list versions holding coordinates
    var borderFilled = []
    var coveredConsider = []
    for (let r = 0; r < this.rows; ++r) {
      for (let c = 0; c < this.columns; ++c) {
        // If it's a border
        if (borders[r][c]) {
          let isFilled = true
          // We get each of the adjacents, if there is any covered cell that we don't consider, then we don't add it
          for (let adjCoord of getAdjacents(r, c, this.rows, this.columns)) {
            let [ar, ac] = adjCoord
            if (!uncovered[ar][ac] && !toConsiderNode[ar][ac]) {
              isFilled = false
              break
            }
          }
          // Otherwise, we add the coordinates
          if (isFilled) {
            borderFilled.push([r, c])
          }
        }
      }
    }

    return [considerNodes, borderFilled]
  }

  // Params: The nodes to iterate all possibilities for, the borders to consider, # of mines information
  convertToLinear(nodesToBruteForce, bordersToConsider, knownNumbers){
    var affects = nodesToBruteForce.map(function(coord){
      let [fr, fc] = coord
      var toreturn = []
      for(let i = 0; i < bordersToConsider.length; ++i){
        let [sr, sc] = bordersToConsider[i]
        if(Math.abs(sr - fr) <= 1 && Math.abs(sc - fc) <= 1){
          toreturn.push(i)
        }
      }
      return toreturn
    })

    var maximums = bordersToConsider.map((coord) => knownNumbers[coord[0]][coord[1]])

    return [affects, maximums]
  }

  // Returns number of iterations
  // Initialize iterationsWith & currentMinesNear all to 0's
  getPossibilities(affects, currentMinesNear, maximums, iterationsWith, currentIndex){
    // Base case: currentIndex = last element
    if(currentIndex == affects.length - 1){
      // If nothing changes, are the values equal?
      let noChangeWorks = currentMinesNear.every((element, index) => maximums[index] == element)

      // Add the mine, see if everything works, undo changes
      affects[currentIndex].forEach((element) => ++currentMinesNear[element])
      let addMineWorks = currentMinesNear.every((element, index) => maximums[index] == element)
      affects[currentIndex].forEach((element) => --currentMinesNear[element])

      iterationsWith[currentIndex] += addMineWorks;

      return noChangeWorks + addMineWorks
    }

    // With a mine
    var totalPossibilities = 0

    // See if adding a mine will keep all of the # of mines below the maximum
    let canBeMine = true;
    for(let affect of affects[currentIndex]){
      if(currentMinesNear[affect] >= maximums[affect]){
        canBeMine = false
        break
      }
    }

    // If we can add a mine, then we add it, see how many possibilities there are and update the iterations with the mine there.
    if(canBeMine){
      affects[currentIndex].forEach((val) => ++currentMinesNear[val])
      let diff = this.getPossibilities(affects, currentMinesNear, maximums, iterationsWith, currentIndex + 1)
      iterationsWith[currentIndex] += diff
      totalPossibilities += diff
      // make sure to undo changes
      affects[currentIndex].forEach((val) => --currentMinesNear[val])
    }

    // Without a mine
    // We go straight to the next index, and add to the total possibilities
    let diff = this.getPossibilities(affects, currentMinesNear, maximums, iterationsWith, currentIndex + 1)
    totalPossibilities += diff

    return totalPossibilities
  }

  getMove(uncovered, knownSquares, flagged) {
    var borderingCoordinates = []
    var isBorder = this.getBorders(knownSquares, borderingCoordinates);

    borderingCoordinates.sort(this.getBorderComparator(this.rows, this.columns))

    var chosenBorder = borderingCoordinates[0]
    var [nodesBruteForce, bordersConsider] = this.getConsiderSet(chosenBorder, isBorder, uncovered)
    this.nodesChosen = fillMultidimensional(false, this.rows, this.columns)
    this.bordersFilled = fillMultidimensional(false, this.rows, this.columns)
    for(let coord of nodesBruteForce)
      this.nodesChosen[coord[0]][coord[1]] = true
    for(let coord of bordersConsider)
      this.bordersFilled[coord[0]][coord[1]] = true

    var [affects, maximums] = this.convertToLinear(nodesBruteForce, bordersConsider, knownSquares)

    var possibilitiesWith = new Array(nodesBruteForce.length).fill(0)
    var totalPossibilities = this.getPossibilities(affects, new Array(maximums.length).fill(0), maximums, possibilitiesWith, 0)

    var forcedSafe = possibilitiesWith.map((value, ind) => value == 0 ? ind : -1).filter((index) => index != -1).map((value) => nodesBruteForce[value]);
    var forcedFlag = possibilitiesWith.map((value, ind) => value == totalPossibilities ? ind : -1).filter((index) => index != -1).map((value) => nodesBruteForce[value]);

    var isSafe = fillMultidimensional(false, this.rows, this.columns)
    forcedSafe.forEach((coord) => isSafe[coord[0]][coord[1]] = true);
    var isBomb = fillMultidimensional(false, this.rows, this.columns)
    forcedFlag.forEach((coord) => isBomb[coord[0]][coord[1]] = true)

    this.putVisuals(isBorder, uncovered, isSafe, isBomb);

    return [forcedSafe, forcedFlag]
  }
}

function fillMultidimensional(defaultValue, ...args) {
  if (args.length == 0) {
    return defaultValue;
  }
  var toreturn = []
  let dimen = args.shift()
  for (let i = 0; i < dimen; ++i) {
    toreturn.push(fillMultidimensional(defaultValue, ...args))
  }
  return toreturn;
}

function range(start, end) {
  var toreturn = []
  for (; start < end; ++start) {
    toreturn.push(start)
  }
  return toreturn
}

function flatten2d(arr) {
  var toreturn = []
  for (let part of arr) {
    toreturn = toreturn.concat(part)
  }
  return toreturn
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function getAdjacents(row, col, totalRows, totalCols) {
  return adjacents.map(diff => [row + diff[0], col + diff[1]]).filter(coord => 0 <= coord[0] && 0 <= coord[1] && coord[0] < totalRows && coord[1] < totalCols)
}
