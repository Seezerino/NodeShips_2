// logs messages to the user
var log = {
  logs: [''],
  logCounter: 0,
};
function logUser( message ) {
  let logLen = log.logs.length - 1;
  log.logCounter++; // Count all messages

  message = log.logCounter.toString() + ': ' + message;

  log.logs.unshift(message); //logend the message to the beginning of array

  if (logLen >= 5){ //wait till logs are filled in the array  
    //Deletes the oldest log 
    log.logs.pop();    
  }

  // Now Loop to output the logs
  for (let i = logLen; i >= 0  ;i--){

    // Delete the already existing logs in the UI
    var delLog = document.querySelector(`#log${i}`);
    if ( delLog != null ) {
      delLog.remove();
    }
    // build up the HTML
    if ( i === 0){
      var html = `<h6 id="log${i}" class="w3-hover w3-round w3-center w3-animate-opacity	"> ${log.logs[i]}</h6> `;
    } else {
      var html = `<h6 id="log${i}" class="w3-round w3-center"> ${log.logs[i]}</h6> `;
    }
    // Now create the log in the UI
    document.querySelector('#gamestatus').insertAdjacentHTML('afterbegin', html);
    // Log also in Console
  }
  console.log(message);
}

document.addEventListener('DOMContentLoaded', () => {
  const userGrid    = document.querySelector('.grid-user')
  const computerGrid = document.querySelector('.grid-computer')
  const turnDisplay = document.querySelector('#whose-go')

  /////////////////////////////////////////////////////////////////////

  const startBtn    =  document.querySelector('#start');   //if all ships are placed player can start
  const rotateBtn   =  document.querySelector('#rotate'); //rotates ships
  
  //-> general all ships
  const ships       =  document.querySelectorAll('.ship');

  //-> -> the specific ships
  const L4_1        =  document.querySelector('.L4_1-container'); //battleship

  const L3_1        =  document.querySelector('.L3_1-container'); //carrier
  const L3_2        =  document.querySelector('.L3_2-container'); //

  const L2_1        =  document.querySelector('.L2_1-container'); //
  const L2_2        =  document.querySelector('.L2_2-container');
  const L2_3        =  document.querySelector('.L2_3-container');

  const L1_1        =  document.querySelector('.L1_1-container'); //submarine
  const L1_2        =  document.querySelector('.L1_2-container');
  const L1_3        =  document.querySelector('.L1_3-container');
  const L1_4        =  document.querySelector('.L1_4-container');

  const all_ships   = [L4_1, L3_1, L3_2, L2_1, L2_2, L2_3, L1_1, L1_2, L1_3, L1_4];

  // -> Grids
  const serverGrid  =  document.querySelector('.grid-server'); // changed from computer to server
  const displayGrid =  document.querySelector('.grid-display');
  const clientGrid  =  document.querySelector('.grid-client'); // from user to client 


  var app = {
    // variables for the game
    playWidth: 12,
    won: false,            //did the player win?--*
    gameOver: false,
    round: 0,              //counter of rounds
    shipsHorizontal: true,
    shipsPlaced: false,
    shipsPlacedamount: 0,
    firedShots: 0,
    currPlayer: 'user',

    // ki data
    kiHits: 0,
    kiLeft: 0,
    kiRight: 0,
    kiTop: 0,
    kiBot: 0,
    kiLastHit: 0,

    // variables for the player/client
    roomid: '',            //set the ID
    role: '',              //host or player, host will always start the game
    socket: '',            //socketid
    ready: false,          //is the player ready
    
    // ships destroyed by player
    L1_sunk: 0, // 4
    L2_sunk: 0, // 6
    L3_sunk: 0, // 6
    L4_sunk: 0, // 4
    total_sunk: 0, //Total amount is 4 * 1, 3 * 2, 2 * 3, 1 * 4 = 20
    
    // ships destroyed by  ki
    ki_L1_sunk: 0, // 4
    ki_L2_sunk: 0, // 6
    ki_L3_sunk: 0, // 6
    ki_L4_sunk: 0, // 4
    ki_total_sunk: 0, //Total amount is 4 * 1, 3 * 2, 2 * 3, 1 * 4 = 20
  };

  const userSquares = []
  const computerSquares = []

  //Ships
  const shipArray = [
    {
      name: 'L1',
      directions: [
        [0], //, 1],
        [0]
      ]
    },
    {
      name: 'L2',
      directions: [
        [0, 1],//, 2],
        [0, app.playWidth] // , app.playWidth*2]
      ]
    },
    {
      name: 'L3',
      directions: [
        [0, 1, 2], //, 3],
        [0, app.playWidth, app.playWidth*2] //, app.playWidth*3]
      ]
    },
    {
      name: 'L4',
      directions: [
        [0, 1, 2, 3], //, 4],
        [0, app.playWidth, app.playWidth*2, app.playWidth*3] //, app.playWidth*4]
      ]
    },
  ]


  // DEBUGG!!!!!!!!!!!
  // app.shipsPlaced = true;



  // DEBUG END


  createBoard(userGrid, userSquares)
  createBoard(computerGrid, computerSquares)

  // changeStartBtn('notready')
  // Single Player
  function generateenemy() {
    let shipCount = shipArray.length;

    console.log(shipCount)
    
    for(i = 0; i < 4; i++ ) {
      
    //  built in if condition to check if ship x was already placedv TODO
      console.log('I is', i);
      for(j = 0 ; j < shipCount; j++)
      { 
        console.log('>J is', j);
        generate(shipArray[i]);
      }
      shipCount--;
    }    
  }

  function changeStartBtn(type) {
    startBtn.classList.remove('w3-black');
    startBtn.classList.remove('w3-green');
    startBtn.classList.remove('w3-hover-green');

    console.log('startbtn changed');

    if( type === 'ready') {
      startBtn.classList.add('w3-green');

    } else if ( type === 'started') {
      startBtn.classList.add('w3-black');
      
    } else if ( type === 'notready') {  
      startBtn.classList.add('w3-red');

    }
  };
//  !!!!!!!!!!!!!!!!!!!!!!!!!! ADD IF AGAIN 

  startBtn.addEventListener('click', () => {
    //check that all ships have been placed. 
    console.log("Start")


    if (app.shipsPlaced === true)
    {
      logUser(`You started the Game!`);

      generateenemy();

      playGameSingle();

    } else {

      logUser('Place all ships to start the Game.');

    };
  })

  // Game Logic for Single Player
  function playGameSingle() {

    if (app.gameOver) return
    if (app.currPlayer === 'user') {
      turnDisplay.innerHTML = 'Your Go'

      computerSquares.forEach(square => square.addEventListener('click', function(e) {
        app.firedShots = square.dataset.id;

        console.log('I AM SQUARE:', square.dataset.id)

        revealSquare(square.classList, square.dataset.id)
      }))
    }
    if (app.currPlayer === 'enemy') {
      turnDisplay.innerHTML = 'Computers Go'
      logUser("Enemys Turn")
      setTimeout(enemyGo, 500)
    }
  }



  //Create Board for player or enemy
  function createBoard(grid, squares) {
    for (let i = 0; i < app.playWidth*app.playWidth; i++) {
      const square = document.createElement('div')

      square.dataset.id = i

      grid.appendChild(square)
      squares.push(square)
    }
  }

  //Place computers ships 
  function generate(ship) {
    console.log(ship)

    let randomDirection = Math.floor(Math.random() * ship.directions.length)
    let current = ship.directions[randomDirection]
    if (randomDirection === 0) direction = 1
    if (randomDirection === 1) direction = 12
    let randomStart = Math.abs(Math.floor(Math.random() * computerSquares.length - (ship.directions[0].length * direction)))

    const isTaken = current.some(index => computerSquares[randomStart + index].classList.contains('taken'))

    const isAtLeftEdge = current.some(index => (randomStart + index) % app.playWidth === 0)
    const isAtRightEdge = current.some(index => (randomStart + index) % app.playWidth === app.playWidth - 1)
    

    if (!isTaken && !isAtRightEdge && !isAtLeftEdge) {
      console.log('Placing succesful!')
      current.forEach(index => computerSquares[randomStart + index].classList.add('taken', ship.name))


    } else {
      console.log('Placing was not succesful');  
      generate(ship) //if placing was not succesful try again
    }    
  }
  



  //Rotate the ships
  function rotate() {

    logUser(`You rotated your ships!`);

    all_ships.forEach( element => {
      let classname = element.classList[1]


    classname += '-vertical'

    if(app.shipsHorizontal){
      element.classList.add(classname)

    } else {
      element.classList.remove(classname)

    }}); 
    // sets always to the opposite to change the direction
    app.shipsHorizontal = !app.shipsHorizontal;
  }

  rotateBtn.addEventListener('click', rotate)

  //move around user ship
  ships.forEach(ship => ship.addEventListener('dragstart', dragStart)) //reacts for all kinds of ships
  userSquares.forEach(square => square.addEventListener('dragstart', dragStart))
  userSquares.forEach(square => square.addEventListener('dragover', dragOver))
  userSquares.forEach(square => square.addEventListener('dragenter', dragEnter))
  userSquares.forEach(square => square.addEventListener('dragleave', dragLeave))
  userSquares.forEach(square => square.addEventListener('drop', dragDrop))
  userSquares.forEach(square => square.addEventListener('dragend', dragEnd))

  let selectedShipNameWithIndex
  let draggedShip
  let draggedShipLength

  ships.forEach(ship => ship.addEventListener('mousedown', (e) => {
    selectedShipNameWithIndex = e.target.id

    console.log(e.target)
     console.log(selectedShipNameWithIndex)
  }))

  function dragStart() {
    draggedShip = this
    draggedShipLength = this.childNodes.length-2
    console.log(this.childNodes)
    console.log(draggedShip)
  }

  function dragOver(e) {
    e.preventDefault()
  }

  function dragEnter(e) {
    e.preventDefault()
  }

  function dragLeave() {
    console.log('drag leave')
  }

  function dragDrop() {

    let shipNameWithLastId = draggedShip.lastElementChild.id
    let shiplength = draggedShipLength
    
    console.log(draggedShip.lastElementChild)
    console.log(draggedShip.lastElementChild.id)
    
    // console.log(shipNameWithLastId)
    let shipClass = shipNameWithLastId.slice(0, -2)

    

    let lastShipIndex = parseInt(shipNameWithLastId.substr(-1))
    let shipLastId = lastShipIndex + parseInt(this.dataset.id)

    const notAllowedHorizontal = [0,10,20,30,40,50,60,70,80,90,1,11,21,31,41,51,61,71,81,91,2,22,32,42,52,62,72,82,92,3,13,23,33,43,53,63,73,83,93]
    const notAllowedVertical = [99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72,71,70,69,68,67,66,65,64,63,62,61,60]
    
    let newNotAllowedHorizontal = notAllowedHorizontal.splice(0, 10 * lastShipIndex)
    let newNotAllowedVertical = notAllowedVertical.splice(0, 10 * lastShipIndex)

    selectedShipIndex = parseInt(selectedShipNameWithIndex.substr(-1))

    shipLastId = shipLastId - selectedShipIndex

    // check for already placed ships here
    // for(let i=0; i < draggedShipLength; i++){ 
    //   let directionClass
    //     if (i === 0) directionClass = 'start'
    //     if (i === draggedShipLength - 1) directionClass = 'end'
    //     userSquares[parseInt(this.dataset.id) - selectedShipIndex + i].classList

    // }


    // const obj = userSquares[parseInt(this.dataset.id) - selectedShipIndex].classList.includes('taken');
    // if (userSquares[parseInt(this.dataset.id) - selectedShipIndex].classList.includes('taken')) {
      // console.log('feld')
      // console.log(userSquares[parseInt(this.dataset.id)])

    // // if (obj.includes('taken')) {
    //   console.log('already taken');
    //   return;
    // }


    if (app.shipsHorizontal && !newNotAllowedHorizontal.includes(shipLastId)) {
      
      if ( draggedShipLength === 1)
      {
        userSquares[parseInt(this.dataset.id) - selectedShipIndex].classList.add('taken', 'horizontal', 'start', 'end', shipClass)

      } else {

        for (let i=0; i < draggedShipLength; i++) {
          let directionClass
          if (i === 0) directionClass = 'start'
          if (i === draggedShipLength - 1) directionClass = 'end'
          console.log(i)
          userSquares[parseInt(this.dataset.id) - selectedShipIndex + i].classList.add('taken', 'horizontal', directionClass, shipClass)
        }
      }
      //As long as the index of the ship you are dragging is not in the newNotAllowedVertical array! This means that sometimes if you drag the ship by its
      //index-1 , index-2 and so on, the ship will rebound back to the displayGrid.
      } else if (!app.shipsHorizontal && !newNotAllowedVertical.includes(shipLastId)) {
        for (let i=0; i < draggedShipLength; i++) {
          let directionClass
          if (i === 0) directionClass = 'start'
          if (i === draggedShipLength - 1) directionClass = 'end'
          userSquares[parseInt(this.dataset.id) - selectedShipIndex + app.playWidth*i].classList.add('taken', 'vertical', directionClass, shipClass)
        }
      } else return;
    
      app.shipsPlacedamount++;
      console.log(app.shipsPlacedamount);
      displayGrid.removeChild(draggedShip);

    if(!displayGrid.querySelector('.ship')) {
      app.shipsPlaced = true;
      logUser('You placed all ships. Hit Start.');
      changeStartBtn('ready');
    }
  }



  function dragEnd() {
    // console.log('dragend')
  }


  function revealSquare(classList) {
    const enemySquare = computerGrid.querySelector(`div[data-id='${app.firedShots}']`);
     
    const obj = Object.values(classList);

    // console.log(enemySquare);
    if (!enemySquare.classList.contains('boom') && app.currPlayer === 'user' && !app.gameOver) {
      

      if (obj.includes('L1')) app.L1_sunk++
      if (obj.includes('L2')) app.L2_sunk++
      if (obj.includes('L3')) app.L3_sunk++
      if (obj.includes('L4')) app.L4_sunk++
    }
    if (!(obj.includes('boom') || obj.includes('miss'))) {
      if (obj.includes('taken')) {
        enemySquare.classList.add('boom')
        logUser(`You hit the Square ${ app.firedShots}`,);
        app.total_sunk++;

      } else {
        enemySquare.classList.add('miss')
        logUser('You missed.');
       } 

        checkForWins();
        app.currPlayer = 'enemy';
        playGameSingle();
    }
  }


  function enemyGo(square) {

    square = Math.floor(Math.random() * userSquares.length)

    console.log(`Enemy tries to hit`, square)

      if (!userSquares[square].classList.contains('boom')) {

        const hit = userSquares[square].classList.contains('taken')
        userSquares[square].classList.add(hit ? 'boom' : 'miss')

        if ( userSquares[square].classList.contains('boom')) {
          logUser(` ${app.currPlayer} hit your ship at ${square}`);
          app.kiHits =+ 1;
          app.ki_total_sunk++;
          app.kiLastHit = square;
        } 
        
        countShip(square);
        checkForWins();

      } else { enemyGo() } // if player is playing the ki responds

    app.currPlayer = 'user';

    turnDisplay.innerHTML = 'Your Go';

    }
  
  function countShip(square) {

    // count ships Length 1
    if (userSquares[square].classList.contains('L1_1')) app.ki_L1_sunk++
    if (userSquares[square].classList.contains('L1_2')) app.ki_L1_sunk++
    if (userSquares[square].classList.contains('L1_3')) app.ki_L1_sunk++
    if (userSquares[square].classList.contains('L1_4')) app.ki_L1_sunk++
    
    // count ships Length 2
    if (userSquares[square].classList.contains('L2_1')) app.ki_L2_sunk++
    if (userSquares[square].classList.contains('L2_2')) app.ki_L2_sunk++
    if (userSquares[square].classList.contains('L2_3')) app.ki_L2_sunk++

    // count ships Length 3
    if (userSquares[square].classList.contains('L3_1')) app.ki_L3_sunk++
    if (userSquares[square].classList.contains('L3_2')) app.ki_L3_sunk++

    // count ships Length 4
    if (userSquares[square].classList.contains('L4_1')) app.ki_L4_sunk++

  }

  function checkForWins() {
    let enemy = 'computer'

    // app.ki_total_sunk = app.ki_L1_sunk + app.ki_L2_sunk + app.ki_L3_sunk + app.ki_L4_sunk ;
    // app.total_sunk =  app.L1_sunk + app.L2_sunk + app.L3_sunk + app.L4_sunk;

    console.log("Points player: ", app.total_sunk)
    console.log("Points ki: ", app.ki_total_sunk)

    if ( app.total_sunk === 20 ) {
      
      turnDisplay.innerHTML = "!! YOU WON !!"
      gameOver()
    }
    if ( app.ki_total_sunk === 20 ) {
      turnDisplay.innerHTML = `${enemy.toUpperCase()} WINS`
      gameOver()
    }
  }

  function gameOver() {
    app.gameOver = true
    startBtn.removeEventListener('click', playGameSingle)
  }
})
