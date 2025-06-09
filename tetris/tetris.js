class Tetris {
    constructor() {
        this.COLS = 10;
        this.ROWS = 20;
        this.grid = document.getElementById('grid');
        this.nextGrid = document.getElementById('next-grid');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.linesElement = document.getElementById('lines');
        this.startButton = document.getElementById('start-button');
        this.pauseButton = document.getElementById('pause-button');

        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.isPaused = false;

        // Piece shape definitions
        this.shapes = {
            'I': [
                [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
                [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
                [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
                [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]
            ],
            'O': [
                [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]]
            ],
            'T': [
                [[0,1,0,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
                [[0,1,0,0], [0,1,1,0], [0,1,0,0], [0,0,0,0]],
                [[0,0,0,0], [1,1,1,0], [0,1,0,0], [0,0,0,0]],
                [[0,1,0,0], [1,1,0,0], [0,1,0,0], [0,0,0,0]]
            ],
            'S': [
                [[0,1,1,0], [1,1,0,0], [0,0,0,0], [0,0,0,0]],
                [[0,1,0,0], [0,1,1,0], [0,0,1,0], [0,0,0,0]],
                [[0,0,0,0], [0,1,1,0], [1,1,0,0], [0,0,0,0]],
                [[1,0,0,0], [1,1,0,0], [0,1,0,0], [0,0,0,0]]
            ],
            'Z': [
                [[1,1,0,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
                [[0,0,1,0], [0,1,1,0], [0,1,0,0], [0,0,0,0]],
                [[0,0,0,0], [1,1,0,0], [0,1,1,0], [0,0,0,0]],
                [[0,1,0,0], [1,1,0,0], [1,0,0,0], [0,0,0,0]]
            ],
            'J': [
                [[1,0,0,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
                [[0,1,1,0], [0,1,0,0], [0,1,0,0], [0,0,0,0]],
                [[0,0,0,0], [1,1,1,0], [0,0,1,0], [0,0,0,0]],
                [[0,1,0,0], [0,1,0,0], [1,1,0,0], [0,0,0,0]]
            ],
            'L': [
                [[0,0,1,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
                [[0,1,0,0], [0,1,0,0], [0,1,1,0], [0,0,0,0]],
                [[0,0,0,0], [1,1,1,0], [1,0,0,0], [0,0,0,0]],
                [[1,1,0,0], [0,1,0,0], [0,1,0,0], [0,0,0,0]]
            ]
        };

        this.colors = {
            'I': 'cyan',
            'O': 'yellow',
            'T': 'purple',
            'S': 'green',
            'Z': 'red',
            'J': 'blue',
            'L': 'orange'
        };

        this.currentPiece = null;
        this.nextPiece = null;
        this.board = Array(this.ROWS).fill().map(() => Array(this.COLS).fill(0));
        
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        // Create game grid
        this.grid.innerHTML = '';
        for (let i = 0; i < this.ROWS; i++) {
            for (let j = 0; j < this.COLS; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell empty';
                this.grid.appendChild(cell);
            }
        }

        // Create preview grid
        this.nextGrid.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell empty';
                this.nextGrid.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.startButton.addEventListener('click', () => this.startGame());
        this.pauseButton.addEventListener('click', () => this.togglePause());
    }

    startGame() {
        if (this.gameOver) {
            this.resetGame();
        }
        this.gameOver = false;
        this.isPaused = false;
        this.startButton.disabled = true;
        this.pauseButton.disabled = false;
        
        if (!this.currentPiece) {
            this.generateNewPiece();
            this.gameLoop();
        }
    }

    resetGame() {
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.board = Array(this.ROWS).fill().map(() => Array(this.COLS).fill(0));
        this.updateScore();
        this.initializeGame();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseButton.textContent = this.isPaused ? 'Resume' : 'Pause';
    }

    generateNewPiece() {
        const pieces = Object.keys(this.shapes);
        if (!this.nextPiece) {
            this.nextPiece = pieces[Math.floor(Math.random() * pieces.length)];
        }
        
        this.currentPiece = {
            shape: this.nextPiece,
            x: Math.floor(this.COLS / 2) - 2,
            y: 0,
            rotation: 0
        };

        this.nextPiece = pieces[Math.floor(Math.random() * pieces.length)];
        this.updateNextPieceDisplay();

        if (this.checkCollision(this.currentPiece)) {
            this.gameOver = true;
            this.startButton.disabled = false;
            this.pauseButton.disabled = true;
            this.startButton.textContent = 'Restart';
            alert('Game Over! Score: ' + this.score);
        }
    }

    updateNextPieceDisplay() {
        const nextShape = this.shapes[this.nextPiece][0];
        const cells = this.nextGrid.getElementsByClassName('cell');
        
        Array.from(cells).forEach(cell => cell.className = 'cell empty');
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (nextShape[i][j]) {
                    cells[i * 4 + j].className = `cell ${this.nextPiece}`;
                }
            }
        }
    }

    checkCollision(piece) {
        const shape = this.shapes[piece.shape][piece.rotation];
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (shape[y][x]) {
                    const newX = piece.x + x;
                    const newY = piece.y + y;
                    if (newX < 0 || newX >= this.COLS || newY >= this.ROWS || 
                        (newY >= 0 && this.board[newY][newX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    movePiece(dx, dy) {
        if (this.gameOver || this.isPaused) return;
        
        const newPiece = {
            ...this.currentPiece,
            x: this.currentPiece.x + dx,
            y: this.currentPiece.y + dy
        };

        if (!this.checkCollision(newPiece)) {
            this.currentPiece = newPiece;
            this.draw();
        } else if (dy > 0) {
            this.lockPiece();
            this.clearLines();
            this.generateNewPiece();
        }
    }

    rotatePiece() {
        if (this.gameOver || this.isPaused) return;

        const newRotation = (this.currentPiece.rotation + 1) % this.shapes[this.currentPiece.shape].length;
        const newPiece = {
            ...this.currentPiece,
            rotation: newRotation
        };

        if (!this.checkCollision(newPiece)) {
            this.currentPiece = newPiece;
            this.draw();
        }
    }

    lockPiece() {
        const shape = this.shapes[this.currentPiece.shape][this.currentPiece.rotation];
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    if (boardY >= 0) {
                        this.board[boardY][this.currentPiece.x + x] = this.currentPiece.shape;
                    }
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.ROWS - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.COLS).fill(0));
                linesCleared++;
                y++; // Check the same row again (since rows above have moved down)
            }
        }

        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += this.calculateScore(linesCleared);
            this.level = Math.floor(this.lines / 10) + 1;
            this.updateScore();
        }
    }

    calculateScore(lines) {
        const basePoints = [0, 40, 100, 300, 1200];
        return basePoints[lines] * this.level;
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.linesElement.textContent = this.lines;
    }

    draw() {
        // Clear grid
        const cells = this.grid.getElementsByClassName('cell');
        Array.from(cells).forEach((cell, i) => {
            const row = Math.floor(i / this.COLS);
            const col = i % this.COLS;
            cell.className = `cell ${this.board[row][col] || 'empty'}`;
        });

        // Draw current piece
        if (this.currentPiece) {
            const shape = this.shapes[this.currentPiece.shape][this.currentPiece.rotation];
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 4; x++) {
                    if (shape[y][x]) {
                        const boardY = this.currentPiece.y + y;
                        const boardX = this.currentPiece.x + x;
                        if (boardY >= 0 && boardY < this.ROWS && boardX >= 0 && boardX < this.COLS) {
                            cells[boardY * this.COLS + boardX].className = `cell ${this.currentPiece.shape}`;
                        }
                    }
                }
            }
        }
    }

    handleKeyPress(event) {
        if (this.gameOver || this.isPaused) return;

        switch (event.keyCode) {
            case 37: // Left arrow
                this.movePiece(-1, 0);
                break;
            case 39: // Right arrow
                this.movePiece(1, 0);
                break;
            case 40: // Down arrow
                this.movePiece(0, 1);
                break;
            case 38: // Up arrow
                this.rotatePiece();
                break;
            case 32: // Space
                this.hardDrop();
                break;
            case 80: // P key
                this.togglePause();
                break;
        }
    }

    hardDrop() {
        if (this.gameOver || this.isPaused) return;
        
        while (!this.checkCollision({
            ...this.currentPiece,
            y: this.currentPiece.y + 1
        })) {
            this.currentPiece.y++;
        }
        this.movePiece(0, 0);
    }

    gameLoop() {
        if (!this.gameOver && !this.isPaused) {
            this.movePiece(0, 1);
        }
        this.draw();
        setTimeout(() => this.gameLoop(), 1000 - (this.level - 1) * 50);
    }
}

// Initialize game
window.addEventListener('load', () => {
    new Tetris();
});