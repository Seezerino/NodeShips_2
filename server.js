const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')


// LogServer Function: 


// creates all Logs based on 3 inputs, message, socket and room

function logServer ( message, socketid, roomid ) {

    // get current time
    let hour = new Date().getHours();
    let minutes = new Date().getMinutes();
    console.log(`[${hour}:${minutes}] Socket: ${socketid}, in room: ${roomid} `);
    console.log(`[${hour}:${minutes}] Message was: ${message}`);
    console.log(); // just to make it a bit nicer to look at 
};

// // Declare globals
const PORT = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = socketio(server)
var playerCount = 0;

// Set static folder
app.use(express.static(path.join(__dirname, "public")))

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// Handle a socket connection request from web client
const connections = [null, null]
// const connections = [ connectionPairs ];

io.on('connection', socket => {
    // playerCount++;
    // logServer(`Player ${playerCount} joined!`);

  // Find an available player number
  let playerIndex = -1;
  for (const i in connections) {
    if (connections[i] === null) {
      playerIndex = i
      break
    }
  }

  // Tell the connecting client what player number they are
  socket.emit('player-number', playerIndex)

  logServer(`Player ${playerCount} has connected`)

  // Ignore player 3
  if (playerIndex === -1) return

  connections[playerIndex] = false

  // Tell eveyone what player number just connected
  socket.broadcast.emit('player-connection', playerIndex)

  // Handle Diconnect
  socket.on('disconnect', () => {
    logServer(`Player ${playerIndex} disconnected`)
    connections[playerIndex] = null
    //Tell everyone what player numbe just disconnected
    socket.broadcast.emit('player-connection', playerIndex)
  })

  // On Ready
  socket.on('player-ready', () => {
    socket.broadcast.emit('enemy-ready', playerIndex)
    connections[playerIndex] = true
  })

  // Check player connections
  socket.on('check-players', () => {
    const players = []
    for (const i in connections) {
      connections[i] === null ? players.push({connected: false, ready: false}) : players.push({connected: true, ready: connections[i]})
    }
    socket.emit('check-players', players)
  })

  // On Fire Received
  socket.on('fire', id => {
    logServer(`Shot fired from ${playerIndex}`, id)

    // Emit the move to the other player
    socket.broadcast.emit('fire', id)
  })

  // on Fire Reply
  socket.on('fire-reply', square => {
    logServer(square)

    // Forward the reply to the other player
    socket.broadcast.emit('fire-reply', square)
  })

  // Timeout connection
  setTimeout(() => {
    connections[playerIndex] = null
    socket.emit('timeout')
    socket.disconnect()
  }, 600000) // 10 minute limit per player
})