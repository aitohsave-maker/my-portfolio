class Block {
    constructor(colorId) {
        this.colorId = colorId;
        this.offsetX = 0;
        this.offsetY = 0;
        this.scale = 1.0;
        this.isMatched = false;
        this.isNew = false;
    }
}

class Grid {
    constructor(rows, cols, cellSize) {
        this.rows = rows;
        this.cols = cols;
        this.cellSize = cellSize;
        this.cells = []; // 2D array: [row][col] (holding Block objects or null)
        this.colors = ['#FF5252', '#448AFF', '#69F0AE', '#FFD740', '#E040FB'];

        // initialize empty
        for (let r = 0; r < this.rows; r++) {
            let row = [];
            for (let c = 0; c < this.cols; c++) {
                row.push(null);
            }
            this.cells.push(row);
        }
    }

    getRandomColor() {
        return Math.floor(Math.random() * this.colors.length) + 1;
    }

    getColorCode(id) {
        if (!id) return null;
        return this.colors[id - 1];
    }

    // Move blocks logically and set visual offsets
    applyGravity(dirX, dirY) {
        let changed = false;

        // Determine traversal order to process blocks from the "bottom" up
        const rStart = (dirY === 1) ? this.rows - 1 : (dirY === -1) ? 0 : 0;
        const rEnd = (dirY === 1) ? -1 : (dirY === -1) ? this.rows : this.rows;
        const rStep = (dirY === 1) ? -1 : (dirY === -1) ? 1 : 1;

        const cStart = (dirX === 1) ? this.cols - 1 : (dirX === -1) ? 0 : 0;
        const cEnd = (dirX === 1) ? -1 : (dirX === -1) ? this.cols : this.cols;
        const cStep = (dirX === 1) ? -1 : (dirX === -1) ? 1 : 1;

        // We need to iterate multiple times or use a "slide" algorithm.
        // A simple bubble sort-like pass for gravity is enough if we scan correctly.
        // But for "falling", checking empty spaces in direction of gravity is easiest.

        // Re-implementing with accurate traversal (slide into Empty)
        // Similar to 2048 logic but without merging
        if (dirX === 0 && dirY === 1) { // Down: process from bottom row up
            for (let c = 0; c < this.cols; c++) {
                for (let r = this.rows - 2; r >= 0; r--) {
                    if (this.cells[r][c]) {
                        let target = r;
                        while (target + 1 < this.rows && this.cells[target + 1][c] === null) {
                            target++;
                        }
                        if (target !== r) {
                            this.moveBlock(r, c, target, c);
                            changed = true;
                        }
                    }
                }
            }
        } else if (dirX === 0 && dirY === -1) { // Up: process from top down
            for (let c = 0; c < this.cols; c++) {
                for (let r = 1; r < this.rows; r++) {
                    if (this.cells[r][c]) {
                        let target = r;
                        while (target - 1 >= 0 && this.cells[target - 1][c] === null) {
                            target--;
                        }
                        if (target !== r) {
                            this.moveBlock(r, c, target, c);
                            changed = true;
                        }
                    }
                }
            }
        } else if (dirX === 1 && dirY === 0) { // Right: process from right left
            for (let r = 0; r < this.rows; r++) {
                for (let c = this.cols - 2; c >= 0; c--) {
                    if (this.cells[r][c]) {
                        let target = c;
                        while (target + 1 < this.cols && this.cells[r][target + 1] === null) {
                            target++;
                        }
                        if (target !== c) {
                            this.moveBlock(r, c, r, target);
                            changed = true;
                        }
                    }
                }
            }
        } else if (dirX === -1 && dirY === 0) { // Left: process from left right
            for (let r = 0; r < this.rows; r++) {
                for (let c = 1; c < this.cols; c++) {
                    if (this.cells[r][c]) {
                        let target = c;
                        while (target - 1 >= 0 && this.cells[r][target - 1] === null) {
                            target--;
                        }
                        if (target !== c) {
                            this.moveBlock(r, c, r, target);
                            changed = true;
                        }
                    }
                }
            }
        }
        return changed;
    }

    moveBlock(r1, c1, r2, c2) {
        const block = this.cells[r1][c1];
        this.cells[r2][c2] = block;
        this.cells[r1][c1] = null;

        // Setup animation offset: 
        // Current Visual Position was (r1 * size, c1 * size)
        // New Logical Position is (r2 * size, c2 * size)
        // We want visual to start at (r1, c1), so offset = (r1-r2)*size

        // Add to existing offset in case multiple moves happen quickly (though we lock input)
        block.offsetY += (r1 - r2) * this.cellSize;
        block.offsetX += (c1 - c2) * this.cellSize;
    }

    spawnBlocks(gravity) {
        let spawned = false;
        // Spawn Only ONE layer to avoid filling everything
        if (gravity.y === 1) { // Down -> Top
            for (let c = 0; c < this.cols; c++) {
                if (this.cells[0][c] === null) {
                    this.cells[0][c] = new Block(this.getRandomColor());
                    this.cells[0][c].offsetY = -this.cellSize; // Slide from above
                    spawned = true;
                }
            }
        } else if (gravity.y === -1) { // Up -> Bottom
            for (let c = 0; c < this.cols; c++) {
                if (this.cells[this.rows - 1][c] === null) {
                    this.cells[this.rows - 1][c] = new Block(this.getRandomColor());
                    this.cells[this.rows - 1][c].offsetY = this.cellSize; // Slide from below
                    spawned = true;
                }
            }
        } else if (gravity.x === 1) { // Right -> Left
            for (let r = 0; r < this.rows; r++) {
                if (this.cells[r][0] === null) {
                    this.cells[r][0] = new Block(this.getRandomColor());
                    this.cells[r][0].offsetX = -this.cellSize; // Slide from left
                    spawned = true;
                }
            }
        } else if (gravity.x === -1) { // Left -> Right
            for (let r = 0; r < this.rows; r++) {
                if (this.cells[r][this.cols - 1] === null) {
                    this.cells[r][this.cols - 1] = new Block(this.getRandomColor());
                    this.cells[r][this.cols - 1].offsetX = this.cellSize; // Slide from right
                    spawned = true;
                }
            }
        }
        return spawned;
    }

    findMatches() {
        let matched = new Set();
        // Horizontal
        for (let r = 0; r < this.rows; r++) {
            let matchLength = 1;
            for (let c = 0; c < this.cols; c++) {
                if (c < this.cols - 1 &&
                    this.cells[r][c] && this.cells[r][c + 1] &&
                    this.cells[r][c].colorId === this.cells[r][c + 1].colorId &&
                    !this.cells[r][c].isMatched && !this.cells[r][c + 1].isMatched // Don't re-match already dying blocks
                ) {
                    matchLength++;
                } else {
                    if (matchLength >= 3) {
                        for (let k = 0; k < matchLength; k++) matched.add(`${r},${c - k}`);
                    }
                    matchLength = 1;
                }
            }
        }
        // Vertical
        for (let c = 0; c < this.cols; c++) {
            let matchLength = 1;
            for (let r = 0; r < this.rows; r++) {
                if (r < this.rows - 1 &&
                    this.cells[r][c] && this.cells[r + 1][c] &&
                    this.cells[r][c].colorId === this.cells[r + 1][c].colorId &&
                    !this.cells[r][c].isMatched && !this.cells[r + 1][c].isMatched
                ) {
                    matchLength++;
                } else {
                    if (matchLength >= 3) {
                        for (let k = 0; k < matchLength; k++) matched.add(`${r - k},${c}`);
                    }
                    matchLength = 1;
                }
            }
        }

        const matchArray = Array.from(matched).map(str => {
            const [r, c] = str.split(',').map(Number);
            return { r, c };
        });

        // Mark blocks
        matchArray.forEach(({ r, c }) => {
            if (this.cells[r][c]) this.cells[r][c].isMatched = true;
        });

        return matchArray.length;
    }

    removeMatchedBlocks() {
        let count = 0;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.cells[r][c] && this.cells[r][c].isMatched) {
                    this.cells[r][c] = null;
                    count++;
                }
            }
        }
        return count;
    }
}

class Renderer {
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.grid = grid;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Grid Lines (optional, implies background)
        // this.drawGridLines();

        // Draw Blocks
        for (let r = 0; r < this.grid.rows; r++) {
            for (let c = 0; c < this.grid.cols; c++) {
                const block = this.grid.cells[r][c];
                if (block) {
                    const x = c * this.grid.cellSize + block.offsetX;
                    const y = r * this.grid.cellSize + block.offsetY;
                    const size = this.grid.cellSize;

                    const center = size / 2;
                    const drawSize = size * block.scale;
                    const offset = (size - drawSize) / 2;

                    this.ctx.fillStyle = this.grid.getColorCode(block.colorId);

                    // Main Box
                    this.ctx.fillRect(x + offset + 2, y + offset + 2, drawSize - 4, drawSize - 4);

                    // Bevel/Highlight
                    this.ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(x + offset + 2, y + offset + 2, drawSize - 4, drawSize - 4);

                    if (block.isMatched) {
                        this.ctx.fillStyle = 'white';
                        this.ctx.globalAlpha = 0.5;
                        this.ctx.fillRect(x + offset + 2, y + offset + 2, drawSize - 4, drawSize - 4);
                        this.ctx.globalAlpha = 1.0;
                    }
                }
            }
        }
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.cellSize = this.canvas.width / 8;
        this.grid = new Grid(8, 8, this.cellSize);
        this.renderer = new Renderer(this.canvas, this.grid);
        this.gravity = { x: 0, y: 1 };
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('gravitySwapHighScore')) || 0;

        this.state = 'IDLE'; // IDLE, ANIMATING, MATCHING, GAME_OVER
        this.lastTime = 0;

        this.updateScore(0);
        this.updateHighScoreDisplay();

        // Init some blocks
        this.grid.spawnBlocks({ x: 0, y: -1 }); // Fill top
        this.grid.spawnBlocks({ x: 0, y: -1 }); // Fill top
        this.grid.spawnBlocks({ x: 0, y: -1 }); // Fill top
        this.grid.applyGravity(0, 1);

        this.inputHandler();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    updateScore(points) {
        this.score += points;
        const scoreEl = document.getElementById('currentScore');
        if (scoreEl) scoreEl.innerText = this.score;
        else document.getElementById('status').innerText = `Score: ${this.score}`; // Fallback
    }

    updateHighScoreDisplay() {
        const hsEl = document.getElementById('highScore');
        if (hsEl) hsEl.innerText = this.highScore;
    }

    gameOver() {
        this.state = 'GAME_OVER';
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('gravitySwapHighScore', this.highScore);
            this.updateHighScoreDisplay();
        }
    }

    resetGame() {
        this.score = 0;
        this.updateScore(0);
        this.state = 'IDLE';

        // Clear grid
        for (let r = 0; r < this.grid.rows; r++) {
            for (let c = 0; c < this.grid.cols; c++) {
                this.grid.cells[r][c] = null;
            }
        }

        // Spawn initial
        this.grid.spawnBlocks({ x: 0, y: -1 });
        this.grid.spawnBlocks({ x: 0, y: -1 });
        this.grid.spawnBlocks({ x: 0, y: -1 });
        this.grid.applyGravity(0, 1);
    }

    inputHandler() {
        window.addEventListener('keydown', (e) => {
            if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
                e.preventDefault();
            }

            if (this.state === 'GAME_OVER') {
                if (e.key === ' ') {
                    this.resetGame();
                }
                return;
            }

            if (this.state !== 'IDLE') return;

            switch (e.key) {
                case 'ArrowUp': this.handleGravityChange(0, -1); break;
                case 'ArrowDown': this.handleGravityChange(0, 1); break;
                case 'ArrowLeft': this.handleGravityChange(-1, 0); break;
                case 'ArrowRight': this.handleGravityChange(1, 0); break;
                case ' ': this.handleSpawn(); break;
            }
        });
    }

    handleGravityChange(x, y) {
        this.gravity = { x, y };
        const changed = this.grid.applyGravity(x, y);
        if (changed) {
            this.state = 'ANIMATING';
        }
    }

    handleSpawn() {
        const spawned = this.grid.spawnBlocks(this.gravity);
        if (spawned) {
            this.grid.applyGravity(this.gravity.x, this.gravity.y);
            this.state = 'ANIMATING';
        } else {
            // Check if full
            let full = true;
            for (let r = 0; r < this.grid.rows; r++) {
                for (let c = 0; c < this.grid.cols; c++) {
                    if (!this.grid.cells[r][c]) {
                        full = false;
                        break;
                    }
                }
                if (!full) break;
            }
            if (full) {
                this.gameOver();
            }
        }
    }

    update(dt) {
        if (this.state === 'GAME_OVER') return;

        const speed = 15;
        let moving = false;

        // 1. Handle Movement Animations
        for (let r = 0; r < this.grid.rows; r++) {
            for (let c = 0; c < this.grid.cols; c++) {
                const block = this.grid.cells[r][c];
                if (block) {
                    if (Math.abs(block.offsetX) > 1) {
                        block.offsetX += (block.offsetX > 0 ? -1 : 1) * speed * dt;
                        if (Math.abs(block.offsetX) < speed * dt) block.offsetX = 0;
                        moving = true;
                    } else {
                        block.offsetX = 0;
                    }

                    if (Math.abs(block.offsetY) > 1) {
                        block.offsetY += (block.offsetY > 0 ? -1 : 1) * speed * dt;
                        if (Math.abs(block.offsetY) < speed * dt) block.offsetY = 0;
                        moving = true;
                    } else {
                        block.offsetY = 0;
                    }
                }
            }
        }

        // 2. Handle Match Animations
        if (this.state === 'MATCHING') {
            let animatingMatch = false;
            for (let r = 0; r < this.grid.rows; r++) {
                for (let c = 0; c < this.grid.cols; c++) {
                    const block = this.grid.cells[r][c];
                    if (block && block.isMatched) {
                        block.scale -= 0.005 * dt;
                        if (block.scale <= 0) block.scale = 0;
                        else animatingMatch = true;
                    }
                }
            }
            if (!animatingMatch) {
                const count = this.grid.removeMatchedBlocks();
                this.updateScore(count * 10);
                const fell = this.grid.applyGravity(this.gravity.x, this.gravity.y);
                if (fell) {
                    this.state = 'ANIMATING';
                } else {
                    const matches = this.grid.findMatches();
                    if (matches > 0) this.state = 'MATCHING';
                    else this.state = 'IDLE';
                }
            }
            return;
        }

        // 3. State Transitions
        if (this.state === 'ANIMATING' && !moving) {
            const matches = this.grid.findMatches();
            if (matches > 0) {
                this.state = 'MATCHING';
            } else {
                this.state = 'IDLE';
            }
        }
    }

    loop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(dt);
        this.renderer.draw();

        if (this.state === 'GAME_OVER') {
            const ctx = this.renderer.ctx;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            ctx.fillStyle = 'white';
            ctx.font = '40px sans-serif'; // Segoe UI or default
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);

            ctx.font = '20px sans-serif';
            ctx.fillText('Press SPACE to Restart', this.canvas.width / 2, this.canvas.height / 2 + 30);

            ctx.font = '16px sans-serif';
            ctx.fillStyle = '#FFD740';
            ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 60);
        }

        requestAnimationFrame(this.loop);
    }
}

window.onload = () => {
    new Game();
};
