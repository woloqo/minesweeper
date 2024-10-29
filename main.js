let h           = 10;
let w           = 10;
let bombs       = 10;
let cellSize    = 50;
let isFirstClick = true;

let canvas = document.getElementById('c');
canvas.width = w*cellSize;
canvas.height = h*cellSize;
let ctx = canvas.getContext('2d');

class Cell{
    constructor(x, y){
        this.bomb       = false;
        this.flagged    = false;
        this.open       = false;
        this.y          = y;
        this.x          = x;
    }

    draw(ctx, field){
        ctx.save();
        ctx.translate(this.x*cellSize, this.y*cellSize);
        ctx.fillStyle = this.open ? '#eee' : '#bbb';
        ctx.fillRect(1, 1, cellSize-2, cellSize-2);

        let s = '';
        if(this.flagged){
            ctx.fillStyle = '#00f';
            s = 'F';
        }
        else if(this.open){
            let bombsAround = this.cellsAround(field).filter(c => c.bomb).length;
            if(this.bomb){
                ctx.fillStyle = '#f00';
                s = '*';
            }
            else if(bombsAround > 0){
                ctx.fillStyle = '#000';
                s = bombsAround;
            }
        }

        ctx.textAlign = 'center';
        ctx.font = '20px Verdana';
        ctx.fillText(s, cellSize/2, cellSize/2+10) 
        ctx.restore();

    }

    cellsAround(field){
        let c = [];
        for(var i = -1; i <= 1; i++){
            let cy = this.y+i;
            if(cy < 0 || cy >= h) continue;
            for(let j = -1; j <= 1; j++){
                if(j == 0 && i == 0) continue;
                let cx = this.x+j;
                if(cx < 0 || cx >= w) continue;
                c.push(field[cy][cx]);
            }
        }
        //console.log(c);
        return c;
    }

    flag(){
        if(!this.open){
            if(this.flagged) this.flagged = false;
            else this.flagged = true;
        }
        return true;
    }

    click(field){
        // if(isFirstClick){
        //     this.protected = true;
        //     field = init();
        //     isFirstClick = false;
        // }
        if(this.flagged) return true;
        if(this.open) return true;
        if(this.bomb) return false;
        this.open = true;
        let cells = this.cellsAround(field);
        //draw();
        if(cells.filter(c => c.bomb).length == 0){
            console.log(cells);
            cells.forEach(c => c.click(field));
        }
        return true;
    }
}

function init(){

    let f = []
    for(let i = 0; i < h; i++){
        let r = [];
        for(let j = 0; j < w; j++) r.push(new Cell(j, i));
        f.push(r);
    }
    for(let i = 0; i < bombs; i++){
        while(true){
            let x = Math.floor(w*Math.random());
            let y = Math.floor(h*Math.random());
            if(!f[y][x].bomb){
                f[y][x].bomb = true;
                break;
            }
        }
    }
    return f;

}

function eachCell(fn){
    for(let y = 0; y < h; y++){
        for(let x = 0; x < w; x++){
            fn(field[y][x]);
        }
    }
}

function gameWon(){
    let found = 0;
    eachCell(cell => {if(cell.bomb && cell.flagged) found++})
    return bombs == found;
}

function finishGame(text){
    openAll();
    draw();
    setTimeout(function(){
        alert(text);
        window.location.reload();
    }, 50)
}

function draw(){
    eachCell(cell => cell.draw(ctx, field));
}

function openAll(){
    eachCell(cell => cell.open = true)
}

function processAction(x, y, fn){
    let cell = field[Math.floor(y/cellSize)][Math.floor(x/cellSize)];
    let aux = fn(cell);
    draw();
    if(!aux) finishGame('Game over :(');
    if(gameWon()) finishGame('You won :)');
}

canvas.addEventListener('click', function(e){
    processAction(e.offsetX, e.offsetY, cell => cell.click(field))
})
canvas.addEventListener('contextmenu', function(e){
    e.preventDefault();
    processAction(e.offsetX, e.offsetY, cell => cell.flag());
})

let field = init();
//openAll();
draw();
