/* function to calculate x position from column integer. There is 0-4 columns
 *
 * The 101 constant used is the column width
 * @param {number} col - integer representing the column
 * @return {number} - the x position to place the entity at
 */
function colToX(col) {
    if(col < 0)
        return - 101;
    return col * 101;
}

/* function to calculate y position from row integer. There is 0-5 rows
 *
 * The 83 constant used is the row height. -21 is because the graphics is a little bit
 * of so this is used to center it on the row.
 * @param {number} row - integer representing the row
 * @return {number} - the y position to place the entity at
 */
function rowToY(row) {
    return -21 + (row * 83);
}

/* function to restart the game
 *
 * deletes all enemier and player and create new ones 
 */
function restartGame(){
    allEnemies = [];
    allEnemies.push(new Enemy(1,-1));
    allEnemies.push(new Enemy(2,2));
    allEnemies.push(new Enemy(3,3));

    player = new Player(5,2);
}

/** Class representing an entity */
class Entity {
    /* Construct an identity
     * @param {number} row - the row where the entity should start at. Theres 0-5 rows
     * @param {number} col - the column where the entity should start at. Theres 0-4
     * columns
     * @param {object} boundingRect - bounding rect for the graphics of the Entity.
     * Relative to the graphics itself.
     */
    constructor(row, col, sprite, boundingRect) {
        this.x = colToX(col);
        this.y = rowToY(row);
        this.sprite = sprite;
        _setupBoundingRectProxy(boundingRect);
    }

    /* render the entity to context
     */
    render(){
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    /* check for bounding box collision with other entity
     * @param {object} other - the other entity instance to check for collision with
     * @return {boolean} true if there is a collision false if not.
     */
    checkCollision(other){
        let a = this.boundingRectProxy;
        let b = other.boundingRectProxy;

        if (a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y){
            return true;
        }
        return false;
    }

    /* setup the bounding rect proxy that will calculate the x and y relative to where
     * the entity is located
     * @param {object} boundingRect - the bounding rect object with x,y, w (width) and
     * h (height)
     */
    _setupBoundingRectProxy(boundingRect){
        let boundingRectHandler = {
            get: (obj, prop) => {
                if(prop == 'x')
                    return this.x + obj[prop];
                else if(prop == 'y')
                    return this.y + obj[prop];
                return obj[prop];
            }
        }
        this.boundingRectProxy = new Proxy(boundingRect, boundingRectHandler);
    }

    /* Debug functions to render the bounding rect. Add this to the render function
     */
    static _renderBoundingRect(){
        ctx.beginPath();
        ctx.rect(this.boundingRect.x,
                 this.boundingRect.y,
                 this.boundingRect.w,
                 this.boundingRect.h);
        ctx.stroke();
        ctx.closePath();
    }
}

/* Class representing an Enemy
 * @extends Entity
 */
class Enemy extends Entity {
    /* construct a Enemy
     * @param {number} row - the row where the entity should start at. Theres 0-5 rows
     * @param {number} col - the column where the entity should start at. Theres 0-4
     * columns
     */
    constructor(row, col){
        let boundingRect = { x: 0, y: 78, w: 99,  h: 65 };
        super(row, col, 'images/enemy-bug.png', boundingRect);
        this._newSpeed();
    }

    /* update function for the Enemy. Called by the engine every logic update
     * 
     * moves the enemy from left to right. When outside the screen on right side it
     * will move it to the left side
     * and set a new random speed and row
     * @param {number} dt - delta time from last logic update
     */
    update(dt){
        this.x += 3 * this.speed;
        if(this.x > 505){
            this.x = -101;
            this._newSpeed();
            this._newRow();
        }
    }

    /* function to calculate a random speed between and including 1 and 5
     */
    _newSpeed() {
        this.speed = Math.floor((Math.random() * 5) + 1);
    }

    /* function to calculate a random row between and including 1 and 3
     */
    _newRow(){
        let randomRow = Math.floor((Math.random() * 3) + 1);
        this.y = rowToY(randomRow);
    }
}

/* Class representing a player
 * @extends Entity
 */
class Player extends Entity {
    /* construct a Player
     * @param {number} row - the row where the entity should start at. Theres 0-5 rows
     * @param {number} col - the column where the entity should start at. Theres 0-4
     * columns
     */
    constructor(row, col){
        let boundingRect = { x: 17, y: 65, w: 67,  h: 75 };
        super(row, col, 'images/char-boy.png', boundingRect);
        this.row = row;
        this.col = col;
    }

    /* update function for the Player. Called by the engine every logic update
     *
     * check for collision with all Enemies. Restart if there is a collision or if the
     * player has reached the top row and won the game
     * @param {number} dt - delta time from last logic update
     */
    update(dt){
        for(let enemy of allEnemies)
            if(this.checkCollision(enemy)){
                restartGame();
            }

        if(this.row == 0)
            restartGame();
    }

    /* Handles the input from the user
     *
     * If the player is not at the edge of the context it moves the player to the
     * direction of the key pressed.
     * @param {string} key - the key that was pressed (left, right, up, down)
     */
    handleInput(key){
        switch(key) {
            case 'left':
                if(this.col != 0){
                    --this.col;
                    this.x = colToX(this.col);
                }
                break;
            case 'up':
                if(this.row != 0){
                    --this.row;
                    this.y = rowToY(this.row);
                }
                break;
            case 'right':
                if(this.col != 4){
                    ++this.col;
                    this.x = colToX(this.col);
                }
                break;
            case 'down':
                if(this.row != 5){
                    ++this.row;
                    this.y = rowToY(this.row)
                }
                break;
            default:
                break;
        }
    }
}



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

//variable to store our player
let player;
//array to store all enemies
let allEnemies = [];
restartGame();
