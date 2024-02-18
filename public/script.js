document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    
    var simbolo='';
    
    socket.on('startGame',(data) => {
        console.log(data);
        console.log('este es mi id: '+socket.id);
        if (data.id === socket.id){
            console.log('tu simbolo es '+data.symbol)
            simbolo = data.symbol;
            const player= document.getElementById('jugador-simbolo');
            player.innerHTML = 'eres el jugador: '+simbolo;
        };
    });
    
    window.makeMove = function(row,col) {
        socket.emit('move',{row: row, col: col, symbol: simbolo});
        
    };
    
    socket.on('update',(data)=>{
            updateGameBoard(data.row, data.col, data.symbol);
            console.log(data.row, data.col,data.symbol);
    });
    
    socket.on('recargar',()=>{
        const elementosBoardCell = document.querySelectorAll('.board-cell');
    
        elementosBoardCell.forEach((elemento)=>{
            while(elemento.firstElementChild){
                elemento.removeChild(elemento.firstElementChild);
            };
        });
    });
    
    socket.on('mensaje',(data)=>{
        const mensaje = document.getElementById('mensaje');
        mensaje.innerHTML = data;
    });
    
    socket.on('gameInProgress',(data)=>{
        console.log(data);
    });
    
    
    
    
    
    
    function updateGameBoard(row,col,symbol) {
        var celda = document.getElementById('cell'+row+col);
        var marca = document.createElement('b');
        marca.innerHTML = symbol;
        celda.appendChild(marca); 
      }
    });
    
    
    //socket.on('connect', () => {
    //    console.log(`Conectado al servidor con ID: ${socket.id}`);
    //});
    
    