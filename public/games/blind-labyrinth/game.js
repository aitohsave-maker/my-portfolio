class BlindLabyrinth {
    constructor() {
        this.mode = 'labyrinth';
        this.difficulty = 'medium';
        this.labDifficulty = 'medium';
        this.flagModeActive = false;

        // Timer and Scoring
        this.timer = null;
        this.seconds = 0;
        this.score = 0;
        this.goalScanCount = 0;
        this.isScanActive = false;
        this.scanTimer = null;
        this.minesLeft = 0;

        this.init();
    }

    init() {
        this.reset();
        this.setupListeners();
    }

    reset() {
        this.stopTimer();
        this.seconds = 0;
        this.score = 0;
        this.goalScanCount = 0;
        this.isScanActive = false;
        clearTimeout(this.scanTimer);

        const arrow = document.getElementById('goal-arrow');
        if (arrow) arrow.classList.add('invisible-hint');

        if (this.mode === 'classic') {
            const configs = {
                easy: { size: 10, mines: 10 },
                medium: { size: 16, mines: 40 },
                hard: { size: 20, mines: 80 }
            };
            this.size = configs[this.difficulty].size;
            this.minesCount = configs[this.difficulty].mines;
        } else if (this.mode === 'chaos') {
            this.chaosCellCount = parseInt(document.getElementById('chaos-cells').value) || 50;
            this.chaosMineCountValue = parseInt(document.getElementById('chaos-mines').value) || 8;
            this.size = 20;
            this.minesCount = this.chaosMineCountValue;
        } else if (this.mode === 'labyrinth') {
            const configs = {
                easy: { size: 30, minDist: 10, maxDist: 15 },
                medium: { size: 50, minDist: 20, maxDist: 30 },
                hard: { size: 100, minDist: 40, maxDist: 60 }
            };
            const config = configs[this.labDifficulty];
            this.size = config.size;
            this.hp = 3;
            this.scans = 5;

            this.playerPos = { x: Math.floor(this.size / 2), y: Math.floor(this.size / 2) };
            this.placeGoal(config.minDist, config.maxDist);
        }

        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.hints = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.revealed = Array(this.size).fill().map(() => Array(this.size).fill(false));
        this.flags = Array(this.size).fill().map(() => Array(this.size).fill(false));
        this.chaosNodes = [];
        this.isGameOver = false;
        this.minesLeft = this.minesCount || 0;

        if (this.mode === 'labyrinth') {
            this.generateLabyrinthMines();
            this.calculateHints();
            this.revealCell(this.playerPos.x, this.playerPos.y);
            this.updateNavigation();
            if (this.labDifficulty === 'easy' && arrow) {
                arrow.classList.remove('invisible-hint');
            }
        } else if (this.mode === 'chaos') {
            this.generateChaosLayout();
            this.calculateChaosHints();
            this.revealChaosSafeNodes();
            this.minesLeft = this.chaosNodes.filter(n => n.isMine).length;
        } else {
            this.generateClassicMines();
            this.calculateHints();
            this.revealEdges();
        }

        this.updateUI();
        this.updateBoard();
        this.showHighScore();
    }

    placeGoal(minDist, maxDist) {
        let placed = false;
        while (!placed) {
            const angle = Math.random() * Math.PI * 2;
            const dist = minDist + Math.random() * (maxDist - minDist);
            const gx = Math.floor(this.playerPos.x + Math.cos(angle) * dist);
            const gy = Math.floor(this.playerPos.y + Math.sin(angle) * dist);

            if (gx >= 2 && gx < this.size - 2 && gy >= 2 && gy < this.size - 2) {
                this.goalPos = { x: gx, y: gy };
                placed = true;
            }
        }
    }

    generateLabyrinthMines() {
        const startX = this.playerPos.x, startY = this.playerPos.y;
        const goalX = this.goalPos.x, goalY = this.goalPos.y;
        const maxDist = Math.hypot(goalX - startX, goalY - startY);

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (Math.abs(x - startX) <= 1 && Math.abs(y - startY) <= 1) continue;
                if (x === goalX && y === goalY) continue;

                const dist = Math.hypot(x - startX, y - startY);
                const density = 0.05 + (dist / maxDist) * 0.25;
                if (Math.random() < density) this.grid[y][x] = 1;
            }
        }

        let adjMines = 0;
        const neighbors = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        neighbors.forEach(([dx, dy]) => {
            const nx = goalX + dx, ny = goalY + dy;
            if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.grid[ny][nx] === 1) adjMines++;
        });

        while (adjMines > 3) {
            const n = neighbors[Math.floor(Math.random() * neighbors.length)];
            const nx = goalX + n[0], ny = goalY + n[1];
            if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.grid[ny][nx] === 1) {
                this.grid[ny][nx] = 0;
                adjMines--;
            }
        }
    }

    generateClassicMines() {
        let placed = 0;
        while (placed < this.minesCount) {
            const x = Math.floor(Math.random() * this.size);
            const y = Math.floor(Math.random() * this.size);
            if (x === 0 || y === 0 || x === this.size - 1 || y === this.size - 1) continue;
            if (this.grid[y][x] === 0) { this.grid[y][x] = 1; placed++; }
        }
    }

    // === CHAOS MODE METHODS ===
    generateChaosLayout() {
        this.chaosNodes = [];
        const visited = new Set();
        const queue = [{ x: 0, y: 0 }];
        visited.add('0,0');

        while (this.chaosNodes.length < this.chaosCellCount && queue.length > 0) {
            const idx = Math.floor(Math.random() * queue.length);
            const { x, y } = queue.splice(idx, 1)[0];

            const isMine = this.chaosNodes.length > 5 && Math.random() < (this.chaosMineCountValue / this.chaosCellCount);
            this.chaosNodes.push({ gx: x, gy: y, isMine, isRevealed: false, isFlagged: false, hint: 0, neighbors: [] });

            const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]];
            dirs.sort(() => Math.random() - 0.5);
            for (const [dx, dy] of dirs) {
                const nx = x + dx, ny = y + dy;
                const key = `${nx},${ny}`;
                if (!visited.has(key) && this.chaosNodes.length + queue.length < this.chaosCellCount * 1.5) {
                    visited.add(key);
                    queue.push({ x: nx, y: ny });
                }
            }
        }

        // Ensure exact mine count
        let mineCount = this.chaosNodes.filter(n => n.isMine).length;
        while (mineCount < this.chaosMineCountValue) {
            const candidates = this.chaosNodes.filter(n => !n.isMine && n !== this.chaosNodes[0]);
            if (candidates.length === 0) break;
            candidates[Math.floor(Math.random() * candidates.length)].isMine = true;
            mineCount++;
        }
        while (mineCount > this.chaosMineCountValue) {
            const mines = this.chaosNodes.filter(n => n.isMine);
            if (mines.length === 0) break;
            mines[Math.floor(Math.random() * mines.length)].isMine = false;
            mineCount--;
        }

        // Build neighbor relationships
        this.chaosNodes.forEach((node, i) => {
            this.chaosNodes.forEach((other, j) => {
                if (i === j) return;
                const dist = Math.abs(node.gx - other.gx) + Math.abs(node.gy - other.gy);
                if (dist === 1 || (Math.abs(node.gx - other.gx) === 1 && Math.abs(node.gy - other.gy) === 1)) {
                    node.neighbors.push(j);
                }
            });
        });
    }

    calculateChaosHints() {
        this.chaosNodes.forEach(node => {
            if (node.isMine) return;
            node.hint = node.neighbors.filter(idx => this.chaosNodes[idx].isMine).length;
        });
    }

    revealChaosSafeNodes() {
        // Reveal the first node only
        if (this.chaosNodes.length > 0) {
            this.chaosNodes[0].isRevealed = true;
            if (this.chaosNodes[0].hint === 0) {
                this.revealChaosCell(0);
            }
        }
    }

    revealChaosCell(idx) {
        const node = this.chaosNodes[idx];
        if (!node || node.isRevealed) return;
        node.isRevealed = true;
        if (node.isFlagged) {
            node.isFlagged = false;
            this.minesLeft++;
            this.updateStats();
        }
        if (!node.isMine && node.hint === 0) {
            node.neighbors.forEach(ni => {
                if (!this.chaosNodes[ni].isRevealed && !this.chaosNodes[ni].isFlagged) {
                    this.revealChaosCell(ni);
                }
            });
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
                        if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.grid[ny][nx] === 1) count++;
                    }
                }
                this.hints[y][x] = count;
            }
        }
    }

    revealCell(x, y) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size || this.revealed[y][x]) return;
        this.revealed[y][x] = true;
        if (this.flags[y][x]) {
            this.flags[y][x] = false;
            this.minesLeft++;
            this.updateStats();
        }
        if (this.grid[y][x] === 0 && this.hints[y][x] === 0) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx !== 0 || dy !== 0) this.revealCell(x + dx, y + dy);
                }
            }
        }
        if (this.mode === 'classic') this.checkWin();
    }

    revealEdges() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (x === 0 || y === 0 || x === this.size - 1 || y === this.size - 1) this.revealCell(x, y);
            }
        }
    }

    updateNavigation() {
        if (this.mode !== 'labyrinth') return;
        const dx = this.goalPos.x - this.playerPos.x, dy = this.goalPos.y - this.playerPos.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const sector = Math.round(angle / 22.5);
        const snappedAngle = sector * 22.5 + 90;
        const arrow = document.getElementById('goal-arrow');
        if (arrow) arrow.style.transform = `rotate(${snappedAngle}deg)`;
    }

    updateViewport() {
        if (this.mode !== 'labyrinth') return null;
        let sx = Math.max(0, this.playerPos.x - 3);
        let sy = Math.max(0, this.playerPos.y - 3);
        if (sx + 8 > this.size) sx = this.size - 8;
        if (sy + 8 > this.size) sy = this.size - 8;
        return { x: sx, y: sy };
    }

    move(dx, dy) {
        if (this.isGameOver || this.mode !== 'labyrinth') return;
        const nx = this.playerPos.x + dx, ny = this.playerPos.y + dy;
        if (nx < 0 || nx >= this.size || ny < 0 || ny >= this.size || this.flags[ny][nx]) return;

        if (this.seconds === 0 && !this.timer) this.startTimer();

        if (this.grid[ny][nx] === 1) {
            if (this.revealed[ny][nx]) { this.updateMessage("🛑 そこは地雷です。"); return; }
            this.hp--;
            this.revealed[ny][nx] = true;
            this.updateStats();
            if (this.hp <= 0) {
                this.isGameOver = true; this.stopTimer(); this.revealAll(); this.updateMessage("💥 爆発！GAME OVER.");
            } else this.updateMessage(`⚠️ 地雷を踏みました！残りHP: ${this.hp}`);
        } else {
            this.playerPos = { x: nx, y: ny };
            this.revealCell(nx, ny);
            this.updateNavigation();
            this.calculateScore();
        }
        this.updateBoard();
    }

    triggerGoalScan() {
        if (this.isGameOver || this.mode !== 'labyrinth' || this.isScanActive) return;
        this.goalScanCount++;
        this.isScanActive = true;
        const arrow = document.getElementById('goal-arrow'), countdown = document.getElementById('scan-countdown');
        if (arrow) arrow.classList.remove('invisible-hint');

        let timeLeft = 5;
        const updateText = () => { if (countdown) countdown.textContent = `Goal Scan: ${timeLeft}s`; };
        updateText();

        const interval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(interval);
                if (arrow && this.labDifficulty !== 'easy') arrow.classList.add('invisible-hint');
                if (countdown) countdown.textContent = "Find the Goal!";
                this.isScanActive = false;
            } else updateText();
        }, 1000);
        this.calculateScore();
        this.updateUI();
    }

    plantGoalFlag() {
        if (this.isGameOver || this.mode !== 'labyrinth') return;
        if (this.playerPos.x === this.goalPos.x && this.playerPos.y === this.goalPos.y) {
            this.isGameOver = true; this.stopTimer(); this.calculateScore(true); this.saveHighScore();
            const goalCell = document.querySelector('.cell.player');
            if (goalCell) goalCell.classList.add('victory-show');
            this.updateMessage("🎉 クリア！ゴールフラッグ正解です！");
        } else {
            this.hp--; this.updateStats();
            if (this.hp <= 0) {
                this.isGameOver = true; this.stopTimer(); this.revealAll(); this.updateMessage("💥 お手つき！HP切れでGAME OVER.");
            } else this.updateMessage(`❌ そこはゴールではありません！残りHP: ${this.hp}`);
        }
        this.updateBoard();
    }

    toggleFlag(x, y) {
        if (this.isGameOver || this.revealed[y][x]) return;
        this.flags[y][x] = !this.flags[y][x];
        this.minesLeft += this.flags[y][x] ? -1 : 1;
        this.updateStats();
        this.updateBoard();
    }

    calculateScore(isWin = false) {
        if (this.mode !== 'labyrinth') return;
        const difficultyBonus = { easy: 1000, medium: 3000, hard: 10000 }[this.labDifficulty];
        const hpBonus = this.hp * 1000, scanBonus = this.scans * 500, scanPenalty = this.goalScanCount * 200, timePenalty = this.seconds * 10, winBonus = isWin ? 5000 : 0;
        this.score = Math.max(0, difficultyBonus + hpBonus + scanBonus + winBonus - scanPenalty - timePenalty);
        document.getElementById('score-display').textContent = `✨ Score: ${this.score}`;
    }

    activateScan() {
        if (this.isGameOver || this.scans <= 0 || this.mode !== 'labyrinth') return;
        this.scans--;
        const r = 2;
        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                const nx = this.playerPos.x + dx, ny = this.playerPos.y + dy;
                if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
                    this.revealCell(nx, ny);
                }
            }
        }
        this.calculateScore(); this.updateBoard(); this.updateStats();
    }

    checkWin() {
        if (this.isGameOver) return;
        let revealedSafe = 0, totalSafe = 0;
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.grid[y][x] === 0) { totalSafe++; if (this.revealed[y][x]) revealedSafe++; }
            }
        }
        if (revealedSafe === totalSafe) {
            this.isGameOver = true;
            this.stopTimer();
            this.saveHighScore(); // Classic uses time record
            this.updateMessage("🎉 VICTORY! You cleared the field!");
            this.updateBoard();
        }
    }

    handleCellClick(x, y) {
        if (this.isGameOver || this.flags[y][x]) return;
        if (this.seconds === 0 && !this.timer) this.startTimer();
        if (this.grid[y][x] === 1) {
            this.isGameOver = true; this.stopTimer(); this.revealAll(); this.updateMessage("💥 爆発！GAME OVER.");
        } else this.revealCell(x, y);
        this.updateBoard();
    }

    updateUI() {
        const isLab = this.mode === 'labyrinth', isChaos = this.mode === 'chaos', isClassic = this.mode === 'classic';

        // Update header title and subtitle based on mode
        const titles = {
            labyrinth: { title: "Blind Labyrinth", subtitle: "数字をヒントに、暗闇の迷路を抜け出せ。" },
            classic: { title: "Classic Minesweeper", subtitle: "地雷を避けて、全てのマスを開け。" },
            chaos: { title: "Chaos Mode", subtitle: "不規則なマップを攻略せよ。" }
        };
        const headerData = titles[this.mode] || titles.labyrinth;
        document.getElementById('game-title').textContent = headerData.title;
        document.getElementById('game-subtitle').textContent = headerData.subtitle;

        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`mode-${this.mode}`);
        if (activeBtn) activeBtn.classList.add('active');

        document.getElementById('labyrinth-difficulty-group').style.display = isLab ? 'flex' : 'none';
        document.getElementById('difficulty-group').style.display = isClassic ? 'flex' : 'none';
        document.getElementById('chaos-group').style.display = isChaos ? 'flex' : 'none';

        document.querySelector('.d-pad').style.display = isLab ? 'flex' : 'none';
        document.getElementById('navigation-hint').style.display = isLab ? 'flex' : 'none';
        document.getElementById('goal-scan-btn').style.display = isLab ? 'inline-block' : 'none';
        document.getElementById('plant-flag-btn').style.display = isLab ? 'inline-block' : 'none';
        document.getElementById('scan-btn').style.display = isLab ? 'inline-block' : 'none';

        document.getElementById('highscore-bar').style.display = (isLab || isClassic) ? 'flex' : 'none';
        this.updateStats();
    }

    updateStats() {
        document.getElementById('hp-display').style.display = (this.mode === 'labyrinth') ? 'inline-block' : 'none';
        document.getElementById('hp-display').textContent = `❤️ HP: ${this.hp || 0}`;

        document.getElementById('bombs-display').style.display = (this.mode !== 'labyrinth') ? 'inline-block' : 'none';
        document.getElementById('bombs-display').textContent = `💣 Bombs: ${this.minesLeft}`;

        document.getElementById('scans-display').style.display = (this.mode === 'labyrinth') ? 'inline-block' : 'none';
        document.getElementById('scans-display').textContent = `📡 Area Scans: ${this.scans || 0}`;

        document.getElementById('timer-display').textContent = `⏱️ ${this.formatTime(this.seconds)}`;
    }

    formatTime(s) {
        const min = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${min}:${sec}`;
    }

    updateBoard() {
        const board = document.getElementById('maze-board');
        board.innerHTML = '';
        if (this.mode === 'chaos') this.updateChaosBoard(board);
        else this.updateGridBoard(board);
    }

    updateGridBoard(board) {
        const view = this.updateViewport();
        const renderSize = view ? 8 : this.size;
        board.className = view ? 'viewport-8' : `size-${this.size}`;

        if (!view) {
            board.style.gridTemplateColumns = `repeat(${this.size}, var(--cell-size))`;
            board.style.gridTemplateRows = `repeat(${this.size}, var(--cell-size))`;
            if (this.size > 16) board.style.setProperty('--cell-size', 'min(4vw, 25px)');
            else board.style.setProperty('--cell-size', 'min(8vw, 40px)');
        } else {
            board.style.gridTemplateColumns = ""; board.style.gridTemplateRows = "";
        }

        for (let iy = 0; iy < renderSize; iy++) {
            for (let ix = 0; ix < renderSize; ix++) {
                const x = view ? view.x + ix : ix, y = view ? view.y + iy : iy;
                const cell = document.createElement('div');
                cell.classList.add('cell');

                if (this.flags[y][x]) cell.classList.add('flag');
                else if (!this.revealed[y][x]) cell.classList.add('hidden');
                else {
                    if (this.grid[y][x] === 1) { cell.classList.add('mine'); cell.textContent = '💣'; }
                    else {
                        cell.classList.add('path');
                        cell.textContent = this.hints[y][x] || '';
                        cell.setAttribute('data-hint', this.hints[y][x]);
                    }
                }

                if (this.mode === 'labyrinth' && x === this.playerPos.x && y === this.playerPos.y) {
                    cell.classList.add('player'); cell.textContent = this.hints[y][x]; cell.setAttribute('data-hint', this.hints[y][x]);
                }

                if (this.mode === 'labyrinth' && x === this.goalPos.x && y === this.goalPos.y && this.isGameOver && this.score > 0) {
                    cell.classList.add('victory-show'); cell.textContent = '🚩';
                }

                this.addCellInteractions(cell, x, y);
                board.appendChild(cell);
            }
        }
    }

    updateChaosBoard(board) {
        board.className = 'chaos-board';
        board.style.display = 'block'; board.style.position = 'relative';
        board.style.width = '100%'; board.style.height = '400px';

        const minX = Math.min(...this.chaosNodes.map(n => n.gx)), maxX = Math.max(...this.chaosNodes.map(n => n.gx));
        const minY = Math.min(...this.chaosNodes.map(n => n.gy)), maxY = Math.max(...this.chaosNodes.map(n => n.gy));
        const rangeX = maxX - minX + 1, rangeY = maxY - minY + 1;
        const containerW = board.offsetWidth || 500;
        const nodeSize = Math.min(50, Math.min((containerW - 20) / rangeX, 380 / rangeY));
        const offsetX = (containerW - rangeX * nodeSize) / 2, offsetY = (400 - rangeY * nodeSize) / 2;

        this.chaosNodes.forEach((node, idx) => {
            const cell = document.createElement('div');
            cell.classList.add('cell', 'chaos-node');
            cell.style.position = 'absolute';
            cell.style.left = `${offsetX + (node.gx - minX) * nodeSize}px`;
            cell.style.top = `${offsetY + (node.gy - minY) * nodeSize}px`;
            cell.style.width = cell.style.height = `${nodeSize - 2}px`;
            cell.style.fontSize = `${nodeSize * 0.5}px`;

            if (node.isFlagged) cell.classList.add('flag');
            else if (!node.isRevealed) cell.classList.add('hidden');
            else {
                if (node.isMine) { cell.classList.add('mine'); cell.textContent = '💣'; }
                else { cell.classList.add('path'); cell.textContent = node.hint || ''; cell.setAttribute('data-hint', node.hint); }
            }
            this.addNodeInteractions(cell, idx);
            board.appendChild(cell);
        });
    }

    addCellInteractions(cell, x, y) {
        let touchTimer;
        let isLongPress = false;

        cell.addEventListener('contextmenu', (e) => { e.preventDefault(); this.toggleFlag(x, y); });

        cell.addEventListener('touchstart', (e) => {
            isLongPress = false;
            touchTimer = setTimeout(() => {
                isLongPress = true;
                this.toggleFlag(x, y);
                if (navigator.vibrate) navigator.vibrate(60);
            }, 500);
        }, { passive: true });

        cell.addEventListener('touchmove', (e) => { clearTimeout(touchTimer); });

        cell.addEventListener('touchend', (e) => {
            clearTimeout(touchTimer);
            if (isLongPress) {
                e.preventDefault(); // Stop click if long pressed
            }
        });

        cell.addEventListener('click', (e) => {
            if (isLongPress) return;
            if (this.flagModeActive) { this.toggleFlag(x, y); return; }
            if (this.flags[y][x]) return;
            if (this.mode === 'classic') this.handleCellClick(x, y);
            else if (this.mode === 'labyrinth') {
                const adx = Math.abs(x - this.playerPos.x), ady = Math.abs(y - this.playerPos.y);
                if ((adx === 1 && ady === 0) || (adx === 0 && ady === 1)) this.move(x - this.playerPos.x, y - this.playerPos.y);
            }
        });
    }

    addNodeInteractions(cell, idx) {
        let touchTimer;
        let isLongPress = false;

        cell.addEventListener('contextmenu', (e) => { e.preventDefault(); this.toggleChaosFlag(idx); });

        cell.addEventListener('touchstart', () => {
            isLongPress = false;
            touchTimer = setTimeout(() => {
                isLongPress = true;
                this.toggleChaosFlag(idx);
                if (navigator.vibrate) navigator.vibrate(60);
            }, 500);
        }, { passive: true });

        cell.addEventListener('touchend', () => clearTimeout(touchTimer));
        cell.addEventListener('touchmove', () => clearTimeout(touchTimer));

        cell.addEventListener('click', () => {
            if (isLongPress) return;
            if (this.flagModeActive || this.isGameOver) { this.toggleChaosFlag(idx); return; }
            if (this.chaosNodes[idx].isFlagged) return;
            if (this.chaosNodes[idx].isMine) {
                this.isGameOver = true; this.stopTimer(); this.chaosNodes.forEach(n => n.isRevealed = true); this.updateMessage("💥 爆発！GAME OVER.");
            } else this.revealChaosCell(idx);
            this.updateBoard();
        });
    }

    toggleChaosFlag(idx) {
        if (this.isGameOver || this.chaosNodes[idx].isRevealed) return;
        this.chaosNodes[idx].isFlagged = !this.chaosNodes[idx].isFlagged;
        this.minesLeft += this.chaosNodes[idx].isFlagged ? -1 : 1;
        this.updateStats();
        this.updateBoard();
    }

    revealAll() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) this.revealed[y][x] = true;
        }
    }

    startTimer() {
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            this.seconds = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateTimerDisplay(); this.calculateScore();
        }, 1000);
    }

    stopTimer() { clearInterval(this.timer); this.timer = null; }

    updateTimerDisplay() {
        document.getElementById('timer-display').textContent = `⏱️ ${this.formatTime(this.seconds)}`;
    }

    saveHighScore() {
        let key, val;
        if (this.mode === 'labyrinth') {
            key = `lab_highscore_${this.labDifficulty}`; val = this.score;
            const currentBest = localStorage.getItem(key);
            if (!currentBest || val > parseInt(currentBest)) localStorage.setItem(key, val);
        } else if (this.mode === 'classic') {
            key = `classic_besttime_${this.difficulty}`; val = this.seconds;
            const currentBest = localStorage.getItem(key);
            if (!currentBest || val < parseInt(currentBest)) localStorage.setItem(key, val);
        }
        this.showHighScore();
    }

    showHighScore() {
        const display = document.getElementById('highscore-display');
        if (this.mode === 'labyrinth') {
            const key = `lab_highscore_${this.labDifficulty}`;
            const best = localStorage.getItem(key) || 0;
            display.textContent = `🏆 High Score: ${best}`;
        } else if (this.mode === 'classic') {
            const key = `classic_besttime_${this.difficulty}`;
            const best = localStorage.getItem(key);
            display.textContent = `🏆 Best Time: ${best ? this.formatTime(best) : '--:--'}`;
        } else {
            display.textContent = `🏆 ---`;
        }
    }

    updateMessage(msg) {
        const display = document.getElementById('game-message');
        display.textContent = msg;
        display.style.color = msg.includes("爆発") || msg.includes("ハズレ") ? "var(--death-color)" : (msg.includes("クリア") || msg.includes("VICTORY") ? "var(--victory-color)" : "var(--text-primary)");
    }

    setupListeners() {
        document.getElementById('mode-labyrinth').addEventListener('click', () => { this.mode = 'labyrinth'; this.reset(); });
        document.getElementById('mode-chaos').addEventListener('click', () => { this.mode = 'chaos'; this.reset(); });
        document.getElementById('mode-classic').addEventListener('click', () => { this.mode = 'classic'; this.reset(); });

        document.getElementById('lab-difficulty-select').addEventListener('change', (e) => { this.labDifficulty = e.target.value; this.reset(); });
        document.getElementById('difficulty-select').addEventListener('change', (e) => { this.difficulty = e.target.value; this.reset(); });

        ['chaos-cells', 'chaos-mines'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => this.reset());
        });

        document.getElementById('move-up').addEventListener('click', () => this.move(0, -1));
        document.getElementById('move-down').addEventListener('click', () => this.move(0, 1));
        document.getElementById('move-left').addEventListener('click', () => this.move(-1, 0));
        document.getElementById('move-right').addEventListener('click', () => this.move(1, 0));
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        document.getElementById('scan-btn').addEventListener('click', () => this.activateScan());

        document.getElementById('goal-scan-btn').addEventListener('click', () => this.triggerGoalScan());
        document.getElementById('plant-flag-btn').addEventListener('click', () => this.plantGoalFlag());

        document.getElementById('flag-mode-btn').addEventListener('click', (e) => {
            this.flagModeActive = !this.flagModeActive;
            e.target.textContent = `Flag Mode: ${this.flagModeActive ? "ON" : "OFF"}`;
            e.target.style.background = this.flagModeActive ? "#f59e0b" : "#334155";
        });

        document.getElementById('maze-board').addEventListener('contextmenu', (e) => e.preventDefault());

        window.addEventListener('keydown', (e) => {
            if (this.mode !== 'labyrinth') return;
            switch (e.key.toLowerCase()) {
                case 'w': case 'arrowup': this.move(0, -1); break;
                case 's': case 'arrowdown': this.move(0, 1); break;
                case 'a': case 'arrowleft': this.move(-1, 0); break;
                case 'd': case 'arrowright': this.move(1, 0); break;
            }
        });
    }
}

const game = new BlindLabyrinth();
