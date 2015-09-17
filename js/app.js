//constants
var TILE_WIDTH = 101,
    TILE_HEIGHT = 83;


// Enemies our player must avoid
/**
 *
 * @param row - [1, 2, 3] bottom to top
 * @param speed - [1 - 4] 1 - slow, 4 - fast
 * @constructor - create a bug with certain row and speed or they will be random
 */
var Enemy = function(row, speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images

    this.sprite = 'images/enemy-bug.png';
    this.row = row || getRandomInt(1, 3);
    this.speed = speed || getRandomInt(1, 4);
    this.x = -100; // start position behind the screen
    // calculate y position based on row number
    // call this each time you change the row
    this.setY = function () {
        this.y = TILE_HEIGHT * (4 - this.row) - 20;
    };

    this.setY();
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = this.x + dt * this.speed*80;
    // draw a new enemy each time the enemy leaves the screen
    if (this.x > 505) {
        this.x = -100;
        this.row = getRandomInt(1, 3);
        this.speed = getRandomInt(1, 4);
        this.setY();
    }
    // check for collision with player
    if (collision(this)) {
        player.death();
    }
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
        this.sprite = 'images/char-boy.png';
    }

};
/**
 * check player state
 */
Player.prototype.update = function() {
    if (this.cellY === 5) {
        state.score += 50;
        this.setStartPosition();
    }

};

Player.prototype.render = function() {
    var x = TILE_WIDTH * this.cellX,
        y = TILE_HEIGHT  * (5-this.cellY) - 10;
    ctx.drawImage(Resources.get(this.sprite), x, y);
};
/**
 * move the player
 * @param key
 */
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
// return player to start position
Player.prototype.setStartPosition = function() {
    this.cellX = 2;
    this.cellY = 0;
};
// on death decrease lives or set gameOver phase
Player.prototype.death = function() {
    state.lives--;
    if (state.lives > 0) {
        this.setStartPosition();
    } else {
        state.phase = 'gameOver';
    }
};
/**
 * object to hold game information
 * @type {{score: number, lives: number, phase: String("init"), difficulty: number, roundTime: number, mainCallback: Function, render: Function, characters: string[], difficulties: string[], selectedCharacter: number, scoreRender: Function, initScreenRender: Function, gameOverRender: Function, initHandleInput: Function, gameOverHandleInput: Function}}
 */
var state = {
    score: 0,
    lives: 3,
    phase: 'init', // init | game | gameOver
    difficulty: 1, // 0 -easy, 1 - normal, 2 - hard
    roundTime: 0,
    mainCallback : undefined,
    /**
     * call different renderers depending on current game phase
     * @param mainCallback - need to call main function from engine.js
     */
    render : function(mainCallback){
        if (mainCallback) {
            this.mainCallback = mainCallback; // save callback when call renderer from engine.js
        }
        switch (this.phase) {
            case 'init':
                // reset game state
                this.score = 0;
                this.lives = 3;
                player.setStartPosition();
                // draw initial screen
                this.initScreenRender();
                break;
            case 'game':
                // init player and enemies
                player.sprite = this.characters[this.selectedCharacter];
                initEnemies();
                // run main game circle
                this.mainCallback();
                break;
            case 'gameOver' :
                // draw gameover screen
                this.gameOverRender();
                break;
        }
    },
    characters: [
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png'
    ],
    difficulties: [
        'easy',
        'normal',
        'hard'
    ],
    selectedCharacter: 0,
    scoreRender : function() {
        ctx.clearRect(0, 607, 505, 646);
        ctx.textAlign = "left";
        ctx.strokeStyle = "#F00";
        ctx.font = 'bold 30px sans-serif';
        ctx.strokeText("Score: " + this.score, 10, 640);
        //ctx.strokeText("Time: " + this.roundTime, 210, 640);
        ctx.strokeText("Lives: " + this.lives, 380, 640);
    },
    initScreenRender: function() {
        var i;
        ctx.clearRect(0, 0, 505, 646);
        // draw characters
        for (i = 0; i < 5; i++) {
            ctx.drawImage(Resources.get(this.characters[i]), i * TILE_WIDTH, 20);
        }
        // border for selected character
        ctx.beginPath();
        ctx.lineWidth="2";
        ctx.strokeStyle="red";
        ctx.rect(this.selectedCharacter*TILE_WIDTH, 60, TILE_WIDTH , 120);
        ctx.stroke();
        // difficulties
        ctx.textAlign = "center";
        for (i = 0; i < 3; i++) {
            ctx.strokeStyle = "#666";
            if (i === this.difficulty) {
                ctx.strokeStyle = "#F00";
            }
            ctx.font = 'bold 40px sans-serif';
            ctx.strokeText(this.difficulties[i], 252, 250 + i*50);
        }

        // help
        ctx.textAlign = "left";
        ctx.strokeStyle = "#666";
        ctx.font = 'bold 30px sans-serif';
        ctx.strokeText("left/right - select character", 0, 500);
        ctx.strokeText("up/down - select difficulty", 0, 540);
        ctx.strokeText("space - start", 0, 580);

    },
    gameOverRender : function() {
        // game over message
        ctx.textAlign = "center";
        ctx.strokeStyle = "#F00";
        ctx.font = 'bold 60px sans-serif';
        ctx.strokeText("GAME OVER", 250, 450);
        ctx.font = 'bold 30px sans-serif';
        ctx.strokeText("press space to play again", 250, 530);
    },
    /**
     * key handler for initial screen
     * @param key
     */
    initHandleInput : function(key) {
        switch (key) {
            case 'left':
                if (this.selectedCharacter > 0) {
                    this.selectedCharacter--;
                }
                break;
            case 'right':
                if (this.selectedCharacter < 4) {
                    this.selectedCharacter++;
                }
                break;
            case 'up':
                if (this.difficulty > 0) {
                    this.difficulty--;
                }
                break;
            case 'down':
                if (this.difficulty < 2) {
                    this.difficulty++;
                }
                break;
            case 'space' :
                this.phase = 'game';

        }
        this.render();
    },
    /**
     * key handler for game over screen
     * @param key
     */
    gameOverHandleInput : function(key) {
        if (key === 'space') {
            this.phase = 'init';
            this.render();
        }
    }
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var player = new Player();

var allEnemies = [];
/**
 *  add enemies depending on game difficulty
 */
function initEnemies() {
    allEnemies = [];
    // easy - 2 bugs, normal - 3 bugs, hard - 4 bugs
    for (var i = 0; i < state.difficulty + 2; i++) {
        allEnemies.push(new Enemy());
    }
}

// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * check collision between the enemy and the player
 * @param enemy
 * @returns {boolean}
 */
function collision(enemy) {
    if (enemy.row !== player.cellY-1) {
        return false; // is not same row
    }
    var playerLeftBorder = TILE_WIDTH * player.cellX + 16, // 16 - player sprite paddings
        playerRightBorder = playerLeftBorder + 70,  // 70 - player sprite width
        enemyLeftBorder = enemy.x + 2,
        enemyRightBorder = enemyLeftBorder + 98;

    return ( (playerLeftBorder > enemyLeftBorder && playerLeftBorder < enemyRightBorder ) ||
        (enemyLeftBorder > playerLeftBorder && enemyLeftBorder < playerRightBorder) );
}


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'space'
    };
    switch (state.phase) {
        case 'game' :
            player.handleInput(allowedKeys[e.keyCode]);
            break;
        case 'init' :
            state.initHandleInput(allowedKeys[e.keyCode]);
            break;
        case 'gameOver' :
            state.gameOverHandleInput(allowedKeys[e.keyCode]);
    }

});
