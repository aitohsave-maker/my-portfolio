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
        this.gravity = { x: 0, y: 1 };

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

    // Move blocks logically by 1 step in gravity direction
    applyGravity(dirX, dirY) {
        let changed = false;

        // Determine traversal order to process blocks from the "bottom" up relative to gravity
        // Down (0,1): Scan Bottom-Up (rows-1 to 0)
        // Up (0,-1): Scan Top-Down (0 to rows-1)
        // Right (1,0): Scan Right-Left (cols-1 to 0)
        // Left (-1,0): Scan Left-Right (0 to cols-1)

        if (dirX === 0 && dirY === 1) { // Down
            for (let c = 0; c < this.cols; c++) {
                for (let r = this.rows - 2; r >= 0; r--) { // Start from second last row
                    if (this.cells[r][c] && this.cells[r + 1][c] === null) {
                        this.moveBlock(r, c, r + 1, c);
                        changed = true;
                    }
                }
            }
        } else if (dirX === 0 && dirY === -1) { // Up
            for (let c = 0; c < this.cols; c++) {
                for (let r = 1; r < this.rows; r++) { // Start from second row
                    if (this.cells[r][c] && this.cells[r - 1][c] === null) {
                        this.moveBlock(r, c, r - 1, c);
                        changed = true;
                    }
                }
            }
        } else if (dirX === 1 && dirY === 0) { // Right
            for (let r = 0; r < this.rows; r++) {
                for (let c = this.cols - 2; c >= 0; c--) {
                    if (this.cells[r][c] && this.cells[r][c + 1] === null) {
                        this.moveBlock(r, c, r, c + 1);
                        changed = true;
                    }
                }
            }
        } else if (dirX === -1 && dirY === 0) { // Left
            for (let r = 0; r < this.rows; r++) {
                for (let c = 1; c < this.cols; c++) {
                    if (this.cells[r][c] && this.cells[r][c - 1] === null) {
                        this.moveBlock(r, c, r, c - 1);
                        changed = true;
                    }
                }
            }
        }
        return changed; // Return true if ANY block moved
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

        // Draw Gravity Indicator (Overlay)
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 10;
        this.ctx.lineCap = 'round';
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        const len = 100;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy);
        this.ctx.lineTo(cx + this.grid.gravity.x * len, cy + this.grid.gravity.y * len);
        this.ctx.stroke();

        // Arrowhead
        const headLen = 20;
        const angle = Math.atan2(this.grid.gravity.y, this.grid.gravity.x);
        this.ctx.moveTo(cx + this.grid.gravity.x * len, cy + this.grid.gravity.y * len);
        this.ctx.lineTo(cx + this.grid.gravity.x * len - headLen * Math.cos(angle - Math.PI / 6), cy + this.grid.gravity.y * len - headLen * Math.sin(angle - Math.PI / 6));
        this.ctx.moveTo(cx + this.grid.gravity.x * len, cy + this.grid.gravity.y * len);
        this.ctx.lineTo(cx + this.grid.gravity.x * len - headLen * Math.cos(angle + Math.PI / 6), cy + this.grid.gravity.y * len - headLen * Math.sin(angle + Math.PI / 6));
        this.ctx.stroke();
        this.ctx.restore();
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.cellSize = this.canvas.width / 8;
        this.grid = new Grid(8, 8, this.cellSize);
        this.renderer = new Renderer(this.canvas, this.grid);
        this.gravity = { x: 0, y: 1 }; // Default Down
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('gravitySwapHighScore')) || 0;

        this.state = 'MENU'; // MENU, PLAYING, GAME_OVER
        this.mode = 'REALTIME'; // REALTIME, SETTLED, MANUAL
        this.lastTime = 0;

        // Timers
        this.flowTimer = 0;
        this.flowInterval = 400; // Slower flow (400ms)
        this.spawnTimer = 0;
        this.spawnInterval = 4000; // Slower spawn (4s)
        this.settleTimer = 0; // For SETTLED mode
        this.settleThreshold = 500; // Wait 500ms after settling to spawn

        this.renderer.draw(); // Draw initial empty
        this.inputHandler();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);

        // Expose to window for HTML buttons
        window.game = this;
    }

    startGame(mode) {
        this.mode = mode;
        this.resetGame();
        document.getElementById('modeSelection').style.display = 'none';

        // Update Action Button based on mode
        const btn = document.getElementById('actionBtn');
        if (mode === 'MANUAL') {
            btn.style.display = 'block';
            btn.innerText = "SPAWN BLOCK";
        } else {
            btn.style.display = 'none';
        }
    }

    updateScore(points) {
        this.score += points;
        const scoreEl = document.getElementById('currentScore');
        if (scoreEl) scoreEl.innerText = this.score;

        // Difficulty scaling
        const scaling = Math.floor(this.score / 100) * 100; // Scale slower
        this.spawnInterval = Math.max(1000, 4000 - scaling);
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
        const btn = document.getElementById('actionBtn');
        if (btn) {
            btn.style.display = 'block';
            btn.innerText = "RESTART GAME";
        }
    }

    resetGame() {
        this.score = 0;
        this.updateScore(0);
        this.state = 'PLAYING';
        this.spawnTimer = 0;
        this.flowTimer = 0;
        this.settleTimer = 0;
        this.gravity = { x: 0, y: 1 };

        // Clear grid
        for (let r = 0; r < this.grid.rows; r++) {
            for (let c = 0; c < this.grid.cols; c++) {
                this.grid.cells[r][c] = null;
            }
        }

        this.grid.spawnBlocks({ x: 0, y: -1 });
        this.grid.spawnBlocks({ x: 0, y: -1 });
    }

    inputHandler() {
        window.addEventListener('keydown', (e) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
                e.preventDefault();
            }

            if (this.state === 'GAME_OVER' && e.code === 'Space') {
                this.state = 'MENU';
                document.getElementById('modeSelection').style.display = 'block';
                document.getElementById('actionBtn').style.display = 'none';
                return;
            }

            if (this.state !== 'PLAYING') return;

            // Just set gravity direction, do NOT move immediately
            switch (e.key) {
                case 'ArrowUp':
                    this.gravity = { x: 0, y: -1 };
                    if (this.mode === 'MANUAL') this.grid.applyGravity(0, -1);
                    break;
                case 'ArrowDown':
                    this.gravity = { x: 0, y: 1 };
                    if (this.mode === 'MANUAL') this.grid.applyGravity(0, 1);
                    break;
                case 'ArrowLeft':
                    this.gravity = { x: -1, y: 0 };
                    if (this.mode === 'MANUAL') this.grid.applyGravity(-1, 0);
                    break;
                case 'ArrowRight':
                    this.gravity = { x: 1, y: 0 };
                    if (this.mode === 'MANUAL') this.grid.applyGravity(1, 0);
                    break;
            }
        });

        // Touch
        let startX = 0;
        let startY = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                e.preventDefault();
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            if (this.state !== 'PLAYING') return;
            if (e.changedTouches.length > 0) {
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                const diffX = endX - startX;
                const diffY = endY - startY;
                const absX = Math.abs(diffX);
                const absY = Math.abs(diffY);

                if (Math.max(absX, absY) > 30) {
                    let gx = 0, gy = 0;
                    if (absX > absY) {
                        if (diffX > 0) gx = 1; else gx = -1;
                    } else {
                        if (diffY > 0) gy = 1; else gy = -1;
                    }
                    this.gravity = { x: gx, y: gy };
                    if (this.mode === 'MANUAL') this.grid.applyGravity(gx, gy);
                }
            }
        });

        const btn = document.getElementById('actionBtn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.target.blur();
                if (this.state === 'GAME_OVER') {
                    this.state = 'MENU';
                    document.getElementById('modeSelection').style.display = 'block';
                    btn.style.display = 'none';
                } else if (this.state === 'PLAYING' && this.mode === 'MANUAL') {
                    this.handleSpawn();
                }
            });
        }
    }

    handleGravityChange(x, y) {
        // Unused in this version, kept for legacy if needed or removed
    }

    handleSpawn() {
        const spawned = this.grid.spawnBlocks(this.gravity);
        if (!spawned) {
            let full = true;
            for (let r = 0; r < 8; r++) { for (let c = 0; c < 8; c++) { if (!this.grid.cells[r][c]) { full = false; break; } } }
            if (full) this.gameOver();
        }
    }

    update(dt) {
        if (this.state !== 'PLAYING') return;

        // Sync gravity for renderer
        this.grid.gravity = this.gravity;

        let moved = false;

        // --- Logic based on MODE ---
        if (this.mode === 'MANUAL') {
            // No auto flow, check matches on move (handled in input? No, check here or after input)
            // Actually manual move is instant in input handler.
            // We should check matches here to handle "falling after match" if we want that?
            // User requested: "Key press = 1 step down". Matches?
            // Let's assume matches happen after move.
            // In tick loop, we can just check matches constantly or throttle.
            const matches = this.grid.findMatches();
            if (matches > 0) {
                const count = this.grid.removeMatchedBlocks();
                this.updateScore(count * 10);
            }
        } else {
            // AUTO MODES (REALTIME / SETTLED)
            this.flowTimer += dt;
            if (this.flowTimer >= this.flowInterval) {
                this.flowTimer = 0;
                moved = this.grid.applyGravity(this.gravity.x, this.gravity.y);

                if (!moved) {
                    const matches = this.grid.findMatches();
                    if (matches > 0) {
                        const count = this.grid.removeMatchedBlocks();
                        this.updateScore(count * 10);
                        moved = true; // effectively something changed
                    }
                }
            }
        }

        // --- SPAWN LOGIC ---
        if (this.mode === 'REALTIME') {
            this.spawnTimer += dt;
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnTimer = 0;
                this.handleSpawn();
            }
        } else if (this.mode === 'SETTLED') {
            // Spawn only if NOT moved for some time
            // We need to know if it moved in the last tick.
            // But tick is periodic.
            // Logic: Reset settleTimer if moved. Increment if not.
            if (moved) {
                this.settleTimer = 0;
            } else {
                this.settleTimer += dt;
                if (this.settleTimer > this.settleThreshold) {
                    // It has settled! Spawn now.
                    // But we don't want to spawn EVERY frame after settling.
                    // We spawn once, then reset settleTimer? 
                    // Or we need a flag "waitingToSpawn".
                    // Actually, if we spawn, it might fill top.
                    this.settleTimer = 0;
                    this.handleSpawn();
                }
            }
        }
        // MANUAL mode spawns only on Button/Space (handled in Input)

        // Visual Interpolation (Shared)
        const speed = 20;
        for (let r = 0; r < this.grid.rows; r++) {
            for (let c = 0; c < this.grid.cols; c++) {
                const block = this.grid.cells[r][c];
                if (block) {
                    if (block.offsetX !== 0) {
                        const sign = Math.sign(block.offsetX);
                        block.offsetX -= sign * speed * dt;
                        if ((sign > 0 && block.offsetX < 0) || (sign < 0 && block.offsetX > 0)) block.offsetX = 0;
                    }
                    if (block.offsetY !== 0) {
                        const sign = Math.sign(block.offsetY);
                        block.offsetY -= sign * speed * dt;
                        if ((sign > 0 && block.offsetY < 0) || (sign < 0 && block.offsetY > 0)) block.offsetY = 0;
                    }
                }
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

// Initialize immediately as script is at end of body
window.game = new Game();
