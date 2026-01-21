class BlindLabyrinth {
    constructor(size = 16) {
        this.size = size;
        this.mode = 'labyrinth'; // 'labyrinth' or 'classic'
        this.difficulty = 'medium';
        this.flagModeActive = false;
        this.reset();
    }

    reset() {
        if (this.mode === 'classic') {
            const configs = {
                easy: { size: 10, mines: 10 },
                medium: { size: 16, mines: 40 },
                hard: { size: 20, mines: 80 }
            };
            this.size = configs[this.difficulty].size;
            this.minesCount = configs[this.difficulty].mines;
        } else {
            this.size = 16;
        }

        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.hints = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.revealed = Array(this.size).fill().map(() => Array(this.size).fill(false));
        this.flags = Array(this.size).fill().map(() => Array(this.size).fill(false));
        this.isGameOver = false;

        if (this.mode === 'labyrinth') {
            this.hp = 3;
            this.scans = 3;
            this.playerPos = { x: 0, y: 0 };
            this.goalPos = { x: this.size - 1, y: this.size - 1 };
            this.grid = Array(this.size).fill().map(() => Array(this.size).fill(1)); // 1: Wall, 0: Path
            this.generateMaze();
            this.calculateHints();
            this.revealCell(0, 0);
            document.querySelector('.stats').style.display = 'flex';
            document.getElementById('scan-btn').style.display = 'inline-block';
        } else {
            this.playerPos = null;
            this.generateClassicMines();
            this.calculateHints();
            this.revealEdges(); // エッジの自動開放
            document.querySelector('.stats').style.display = 'none';
            document.getElementById('scan-btn').style.display = 'none';
        }

        this.updateBoard();
        this.updateStats();
        this.updateMessage(this.mode === 'labyrinth' ? "Good Luck, Explorer." : "Find the mines!");
    }

    generateClassicMines() {
        let placed = 0;
        while (placed < this.minesCount) {
            const x = Math.floor(Math.random() * this.size);
            const y = Math.floor(Math.random() * this.size);

            // 4辺（エッジ）には配置しない
            if (x === 0 || y === 0 || x === this.size - 1 || y === this.size - 1) continue;

            if (this.grid[y][x] === 0) {
                this.grid[y][x] = 1; // 1: Mine
                placed++;
            }
        }
    }

    revealEdges() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (x === 0 || y === 0 || x === this.size - 1 || y === this.size - 1) {
                    this.revealCell(x, y);
                }
            }
        }
    }

    generateMaze() {
        const startX = this.playerPos.x;
        const startY = this.playerPos.y;
        const stack = [{ x: startX, y: startY }];
        this.grid[startY][startX] = 0;
        const visited = new Set([`${startX},${startY}`]);

        while (stack.length > 0) {
            const curr = stack[stack.length - 1];
            const dirs = [
                { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
                { dx: 1, dy: 0 }, { dx: -1, dy: 0 }
            ].sort(() => Math.random() - 0.5);

            let found = false;
            for (const { dx, dy } of dirs) {
                const nx = curr.x + dx * 2;
                const ny = curr.y + dy * 2;

                if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && !visited.has(`${nx},${ny}`)) {
                    this.grid[curr.y + dy][curr.x + dx] = 0;
                    this.grid[ny][nx] = 0;
                    visited.add(`${nx},${ny}`);
                    stack.push({ x: nx, y: ny });
                    found = true;
                    break;
                }
            }
            if (!found) stack.pop();
        }

        // --- 戦略性向上のための改善: 壁の間引き ---
        // DFS迷路は一本道になりやすいため、ランダムに壁を壊して「分岐」や「広場」を作る
        for (let y = 1; y < this.size - 1; y++) {
            for (let x = 1; x < this.size - 1; x++) {
                if (this.grid[y][x] === 1) {
                    // 約20%の確率で壁を壊す
                    if (Math.random() < 0.2) { // 確率を少し上げてルートを増やす
                        this.grid[y][x] = 0;
                    }
                }
            }
        }

        // スタート周囲 (3x3) を確実に安全地帯にする
        for (let dy = 0; dy <= 2; dy++) {
            for (let dx = 0; dx <= 2; dx++) {
                if (dx < this.size && dy < this.size) {
                    this.grid[dy][dx] = 0;
                }
            }
        }

        // ゴール (15,15) への接続を確実に確保
        this.grid[this.goalPos.y][this.goalPos.x] = 0;
        if (Math.random() < 0.5) {
            this.grid[this.size - 1][this.size - 2] = 0; // 左から
        } else {
            this.grid[this.size - 2][this.size - 1] = 0; // 上から
        }
    }

    calculateHints() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.grid[y][x] === 1) continue;
                let count = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nx = x + dx, ny = y + dy;
                        if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
                            if (this.grid[ny][nx] === 1) count++;
                        }
                    }
                }
                this.hints[y][x] = count;
            }
        }
    }

    revealCell(x, y) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) return;
        if (this.revealed[y][x]) return;

        this.revealed[y][x] = true;
        this.flags[y][x] = false; // Reveal removes flag

        // --- マインスイーパー特有の連鎖開放 (Flood Fill) ---
        // 踏んだセルが「0」（周囲に壁がない）場合、周囲8マスも自動的に開く
        if (this.grid[y][x] === 0 && this.hints[y][x] === 0) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    this.revealCell(x + dx, y + dy);
                }
            }
        }
        if (this.mode === 'classic') this.checkWin();
    }

    checkWin() {
        if (this.isGameOver) return;
        let revealedSafe = 0;
        let totalSafe = 0;
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.grid[y][x] === 0) {
                    totalSafe++;
                    if (this.revealed[y][x]) revealedSafe++;
                }
            }
        }
        if (revealedSafe === totalSafe) {
            this.isGameOver = true;
            this.updateMessage("🎉 VICTORY! You cleared the field!");
            this.updateBoard();
        }
    }

    activateScan() {
        if (this.isGameOver || this.scans <= 0) return;

        this.scans--;
        this.updateMessage(`📡 Radar Scanned! Area Revealed.`);

        const range = 2; // 5x5 area
        for (let dy = -range; dy <= range; dy++) {
            for (let dx = -range; dx <= range; dx++) {
                const nx = this.playerPos.x + dx;
                const ny = this.playerPos.y + dy;
                if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
                    this.revealed[ny][nx] = true;
                    this.flags[ny][nx] = false;
                }
            }
        }
        this.updateBoard();
        this.updateStats();
    }

    move(dx, dy) {
        if (this.isGameOver || this.mode !== 'labyrinth') return;

        const newX = this.playerPos.x + dx;
        const newY = this.playerPos.y + dy;

        if (newX < 0 || newX >= this.size || newY < 0 || newY >= this.size) return;
        if (this.flags[newY][newX]) return;

        if (this.grid[newY][newX] === 1) {
            this.hp--;
            this.revealed[newY][newX] = true;
            this.updateStats();
            if (this.hp <= 0) {
                this.isGameOver = true;
                for (let y = 0; y < this.size; y++) {
                    for (let x = 0; x < this.size; x++) this.revealed[y][x] = true;
                }
                this.updateMessage("💥 BOOM! No more HP. GAME OVER.");
            } else { this.updateMessage(`⚠️ OUCH! Hit a wall. HP Left: ${this.hp}`); }
        } else {
            this.playerPos = { x: newX, y: newY };
            this.revealCell(newX, newY);
            if (newX === this.goalPos.x && newY === this.goalPos.y) {
                this.isGameOver = true;
                this.updateMessage("🎉 VICTORY! You reached the goal!");
            }
        }
        this.updateBoard();
    }

    toggleFlag(x, y) {
        if (this.isGameOver || this.revealed[y][x]) return;
        this.flags[y][x] = !this.flags[y][x];
        this.updateBoard();
    }

    handleCellClick(x, y) {
        if (this.isGameOver) return;
        if (this.flags[y][x]) return;

        if (this.grid[y][x] === 1) {
            this.isGameOver = true;
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) this.revealed[i][j] = true;
            }
            this.updateMessage("💥 KABOOM! You hit a mine. GAME OVER.");
        } else {
            this.revealCell(x, y);
        }
        this.updateBoard();
    }

    updateStats() {
        document.getElementById('hp-display').textContent = `❤️ HP: ${this.hp}`;
        document.getElementById('scans-display').textContent = `📡 Scans: ${this.scans}`;
    }

    updateBoard() {
        const board = document.getElementById('maze-board');
        board.innerHTML = '';
        board.className = `size-${this.size}`;
        board.style.gridTemplateColumns = `repeat(${this.size}, var(--cell-size))`;
        board.style.gridTemplateRows = `repeat(${this.size}, var(--cell-size))`;

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');

                if (this.flags[y][x]) {
                    cell.classList.add('flag');
                    cell.textContent = '🚩';
                } else if (!this.revealed[y][x]) {
                    // ゴール地点だけは常に場所がわかるように
                    if (this.mode === 'labyrinth' && x === this.goalPos.x && y === this.goalPos.y) {
                        cell.classList.add('goal');
                        cell.textContent = 'G';
                    } else {
                        cell.classList.add('hidden');
                    }
                } else {
                    if (this.grid[y][x] === 1) {
                        cell.classList.add(this.mode === 'labyrinth' ? 'wall' : 'mine');
                        cell.textContent = this.mode === 'labyrinth' ? '#' : '💣';
                    } else if (this.mode === 'labyrinth' && x === this.goalPos.x && y === this.goalPos.y) {
                        cell.classList.add('goal', 'revealed');
                        cell.textContent = 'G';
                    } else {
                        cell.classList.add('path');
                        cell.textContent = this.hints[y][x] || (this.mode === 'classic' ? '' : '0');
                        cell.setAttribute('data-hint', this.hints[y][x]);
                    }
                }

                if (this.mode === 'labyrinth' && x === this.playerPos.x && y === this.playerPos.y) {
                    cell.classList.add('player');
                    if (!this.isGameOver) {
                        cell.textContent = this.hints[y][x];
                        cell.setAttribute('data-hint', this.hints[y][x]);
                    } else if (this.grid[y][x] === 1) {
                        cell.textContent = 'X'; // Should not happen if game over is triggered on wall hit
                    }
                }

                // Long press and right click for flagging
                let touchTimer;
                let longPressPerformed = false;

                // 右クリック: フラッグ (Desktop)
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.toggleFlag(x, y);
                });

                // スマホ用: 長押しでフラッグ
                cell.addEventListener('touchstart', (e) => {
                    longPressPerformed = false;
                    touchTimer = setTimeout(() => {
                        this.toggleFlag(x, y);
                        longPressPerformed = true;
                        if (navigator.vibrate) navigator.vibrate(50);
                    }, 500);
                }, { passive: true });

                cell.addEventListener('touchend', (e) => {
                    if (longPressPerformed) e.preventDefault();
                    clearTimeout(touchTimer);
                });

                cell.addEventListener('touchmove', () => {
                    clearTimeout(touchTimer);
                });

                cell.addEventListener('click', (e) => {
                    if (longPressPerformed) return;
                    if (this.flagModeActive) {
                        this.toggleFlag(x, y);
                        return;
                    }
                    if (this.flags[y][x]) return;
                    if (this.mode === 'classic') {
                        this.handleCellClick(x, y);
                    } else {
                        const adx = Math.abs(x - this.playerPos.x);
                        const ady = Math.abs(y - this.playerPos.y);
                        if ((adx === 1 && ady === 0) || (adx === 0 && ady === 1)) {
                            this.move(x - this.playerPos.x, y - this.playerPos.y);
                        }
                    }
                });

                board.appendChild(cell);
            }
        }
    }

    updateMessage(msg) {
        const display = document.getElementById('game-message');
        display.textContent = msg;
        if (msg.includes("BOOM")) display.style.color = "var(--death-color)";
        else if (msg.includes("VICTORY")) display.style.color = "var(--victory-color)";
        else display.style.color = "var(--text-primary)";
    }
}

// Initialize Game
const game = new BlindLabyrinth();

// Event Listeners
window.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': game.move(0, -1); break;
        case 's': case 'arrowdown': game.move(0, 1); break;
        case 'a': case 'arrowleft': game.move(-1, 0); break;
        case 'd': case 'arrowright': game.move(1, 0); break;
    }
});

// モード切り替え
document.getElementById('mode-labyrinth').addEventListener('click', (e) => {
    game.mode = 'labyrinth';
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    document.getElementById('difficulty-group').style.display = 'none';
    game.reset();
});

document.getElementById('mode-classic').addEventListener('click', (e) => {
    game.mode = 'classic';
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    document.getElementById('difficulty-group').style.display = 'flex';
    game.reset();
});

document.getElementById('difficulty-select').addEventListener('change', (e) => {
    game.difficulty = e.target.value;
    game.reset();
});

// Controls
document.getElementById('move-up').addEventListener('click', () => game.move(0, -1));
document.getElementById('move-down').addEventListener('click', () => game.move(0, 1));
document.getElementById('move-left').addEventListener('click', () => game.move(-1, 0));
document.getElementById('move-right').addEventListener('click', () => game.move(1, 0));
document.getElementById('reset-btn').addEventListener('click', () => game.reset());
document.getElementById('scan-btn').addEventListener('click', () => game.activateScan());
document.getElementById('flag-mode-btn').addEventListener('click', (e) => {
    game.flagModeActive = !game.flagModeActive;
    e.target.textContent = `Flag Mode: ${game.flagModeActive ? "ON" : "OFF"}`;
    e.target.style.background = game.flagModeActive ? "#f59e0b" : "#334155";
});
document.getElementById('maze-board').addEventListener('contextmenu', (e) => e.preventDefault());
