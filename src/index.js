const path = require('path');
const http = require('http');
const express = require('express')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
  console.log('New WebSocket connection')

  socket.on('join', (Options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...Options })

    if(error) {
      return callback(error)
    }

    socket.join(user.room)

    socket.emit('message', generateMessage('Welcome!'))
    socket.broadcast.to(user.room).emit('message', generateMessage(`${username} has joined!`))

    callback()
  })

  socket.on('sendMessage', (message, callback) => {
    io.to('Center City').emit('message', generateMessage(message))
    callback()
  })

  socket.on('sendLocation', (coords, callback) => {
    io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if(user) {
      io.to(room.user).emit('message', `${user.username} has left!`)
    }
  })
})

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
})