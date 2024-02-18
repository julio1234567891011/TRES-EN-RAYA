const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

var activePlayers = 0;
var currentPlayer = 'X';
var ganador = '';
var uwu = false;
var jugadores = {};
var gameBoard = [
    ['','',''],
    ['','',''],
    ['','',''],
];

//logica del juego
app.use(express.static('public'));

io.on('connection',(socket)=>{
    //obtener el ID del cliente que se acaba de conectar
    const clientId = socket.id;
    console.log('nuevo cliente conectado: ',clientId);

    if(activePlayers < 2){
        activePlayers++;
        console.log('jugador conectado: '+clientId+' jugadores conectados: '+activePlayers);
        
        const playerSymbol = activePlayers === 1 ? 'X' : 'O';
        jugadores[clientId] = playerSymbol;
        console.log(jugadores);

        socket.emit('startGame',{id: clientId, symbol: playerSymbol});

        if (activePlayers === 2){
            io.emit('mensaje','Empieza el jugador: X');
        };

        socket.on('move', (data)=>{
            var row = data.row;
            var col = data.col;
            if(gameBoard[row][col] === '' && !uwu && data.symbol === currentPlayer &&  activePlayers === 2){
                gameBoard[row][col] = currentPlayer;
                uwu = checkWinner();

                io.emit('update',{row: row, col: col, symbol: currentPlayer});
                tooglePlayer();
                if (uwu === false){
                    io.emit('mensaje','Es el turno del jugador: '+currentPlayer);
                };
                
            };

        });
    } else {
        console.log('El juego ya está en progreso. No se permiten más jugadores.');
        socket.emit('gameInProgress', 'El juego ya está en progreso. Intenta más tarde.');
        socket.disconnect(true);  // Desconectar al jugador adicional
    }

    socket.on('disconnect',()=>{
        activePlayers--;
        gameBoard = [
            ['','',''],
            ['','',''],
            ['','',''],
        ];
        uwu=false;
        currentPlayer='X';
        //cuando un jugador se desconecte se le elimara del objeto jugadores
        delete jugadores[clientId];
        const keys = Object.keys(jugadores);
        const key=keys[0];
        console.log(key);
        if ( key != undefined){
            jugadores[key] = 'X';
        };
        //----------------------------------------------------------------------
        io.emit('startGame',{id: key, symbol: 'X'});
        io.emit('recargar');
        io.emit('mensaje','Esperando al siguiente jugador...');
        console.log(`Jugador ${clientId} desconectado. Jugadores activos: ${activePlayers}`);
    });
});


//funciones que se utilizaran para la logica del juego

function tooglePlayer(){
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
};

//verificar si hay un ganador
function checkWinner() {
    //verifica columnas, filas y diagonales
    for (let i=0; i<3; i++){
        if(checkLine(gameBoard[i]) || checkLine([gameBoard[0][i],gameBoard[1][i],gameBoard[2][i]])) {
            mensaje = `El ganador es el jugador: ${currentPlayer}`;
            io.emit('mensaje',mensaje);
            return true;
        };
    };

    if (checkLine([gameBoard[0][0],gameBoard[1][1],gameBoard[2][2]]) || checkLine([gameBoard[0][2],gameBoard[1][1],gameBoard[2][0]])) {
        mensaje = `El ganador es el jugador: ${currentPlayer}`;
        io.emit('mensaje',mensaje);
        return true;
    };

    return false;
};

//verifica si todos los elementos de la linea son iguales al simbolo que marcó el jugador
function checkLine(line) {
    
    return line.every(cell=> cell === currentPlayer);
};


//-------------------------------------------------------------------------------------------------
//servidor
const PORT = process.env.PORT || 3000;

server.listen(PORT,()=> {
    console.log('servidor ecuchando en el puerto: '+PORT);
});


