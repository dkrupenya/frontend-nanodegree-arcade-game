// Enemies our player must avoid
var Enemy = function(row, speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images

    this.sprite = 'images/enemy-bug.png';
    this.row = 1; // [1, 2, 3] bottom to top
    this.speed = 1; // [1 - 4] 1 - slow, 4 - fast
    this.x = -100;
    this.setY = function () {
        this.y = 83 * (4 - this.row) - 20;
    };

    if (row === undefined) {
        this.row = getRandomInt(1, 3);
    } else {
        this.row = row;
    }
    if (speed === undefined) {
        this.speed = getRandomInt(1, 4);
    } else {
        this.speed = speed;
    }
    this.setY();
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = this.x + dt * this.speed*80;
    if (this.x > 505) {
        this.x = -100;
        this.row = getRandomInt(1, 3);
        this.speed = getRandomInt(1, 4);
        this.setY();
    }
    if (collision(this)) player.death()
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(sprite) {
    this.cellX = 2; // column number [0..4] left-to-right
    this.cellY = 0; // row number [0..5] bottom-to-top
    this.sprite = '';

    if (sprite) {
        this.sprite = sprite;
    } else {
        this.sprite = 'images/char-boy.png'
    }

};

Player.prototype.update = function(dt) {
    if (this.cellY == 5) {
        state.score += 50;
        this.setStartPosition();
    }

};

Player.prototype.render = function() {
    var x = 101 * this.cellX,
        y = 83  * (5-this.cellY) - 10;
    ctx.drawImage(Resources.get(this.sprite), x, y);
};

Player.prototype.handleInput =  function(key) {
    switch (key) {
        case 'left':
            if (this.cellX > 0) {
                this.cellX--;
            }
            break;
        case 'right':
            if (this.cellX < 4) {
                this.cellX++;
            }
            break;
        case 'up':
            if (this.cellY < 5) {
                this.cellY++;
            }
            break;
        case 'down':
            if (this.cellY > 0) {
                this.cellY--;
            }
            break;
    }
};
Player.prototype.setStartPosition = function() {
    this.cellX = 2;
    this.cellY = 0;
};
Player.prototype.death = function() {
    state.lives--;
    this.setStartPosition();
};

var state = {
    score: 0,
    lives: 3,
    phase: 'init',
    roundTime: 0,
    scoreRender : function() {
        ctx.strokeStyle = "#F00";
        ctx.font = 'bold 30px sans-serif';
        ctx.clearRect(0, 607, 505, 646);
        ctx.strokeText("Score: " + this.score, 10, 640);
        ctx.strokeText("Time: " + this.roundTime, 210, 640);
        ctx.strokeText("Lives: " + this.lives, 380, 640);
    }
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var player = new Player();

var allEnemies = [];

function addEnemy(enemy) {
    allEnemies.push(enemy);
}

/* not in use now */
//function deleteEnemy(enemy){
//    var i = allEnemies.indexOf(enemy);
//    if (i == -1) throw new Error("can't find enemy in allEnemies array");
//    allEnemies.splice(i,1);
//}

// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function collision(enemy) {
    if (enemy.row != player.cellY-1) return false; // is not same row
    var playerLeftBorder = 101 * player.cellX + 16, // 16 - player sprite paddings
        playerRightBorder = playerLeftBorder + 70,  // 70 - player sprite width
        enemyLeftBorder = enemy.x + 2,
        enemyRightBorder = enemyLeftBorder + 98;

    return ( (playerLeftBorder > enemyLeftBorder && playerLeftBorder < enemyRightBorder ) ||
        (enemyLeftBorder > playerLeftBorder && enemyLeftBorder < playerRightBorder) )
}

addEnemy (new Enemy(1,1));
addEnemy (new Enemy(2,2));
addEnemy (new Enemy(3,4));



// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
