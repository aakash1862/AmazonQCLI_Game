document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const messageEl = document.getElementById('message');
    const player1ScoreEl = document.getElementById('player1-score');
    const player2ScoreEl = document.getElementById('player2-score');
    const singlePlayerBtn = document.getElementById('single-player-btn');
    const twoPlayerBtn = document.getElementById('two-player-btn');
    const modeSelection = document.getElementById('mode-selection');
    const gameInterface = document.getElementById('game-interface');
    const singlePlayerInstructions = document.getElementById('single-player-instructions');
    const twoPlayerInstructions = document.getElementById('two-player-instructions');
    const backBtn = document.getElementById('back-btn');
    
    // Game constants
    const GRID_SIZE = 20;
    const GRID_COUNT = canvas.width / GRID_SIZE;
    
    // Game variables
    let gameRunning = false;
    let gameOver = false;
    let gameLoop;
    let foodCount = 0;
    let colorSchemeIndex = 0;
    let gameMode = ''; // 'single' or 'two'
    
    // Color schemes for background and snakes
    const colorSchemes = [
        { bg: '#222', snake1: '#4CAF50', snake2: '#2196F3' },
        { bg: '#003366', snake1: '#FF5733', snake2: '#DAF7A6' },
        { bg: '#330033', snake1: '#FFC300', snake2: '#FF5733' },
        { bg: '#003300', snake1: '#C70039', snake2: '#FFC300' },
        { bg: '#330000', snake1: '#581845', snake2: '#C70039' }
    ];
    
    // Snake 1 (Player 1)
    let snake1 = {
        body: [
            { x: 5, y: 10 },
            { x: 4, y: 10 },
            { x: 3, y: 10 }
        ],
        direction: 'right',
        nextDirection: 'right',
        color: colorSchemes[0].snake1,
        score: 0,
        foodEaten: 0,
        isWinner: false
    };
    
    // Snake 2 (Player 2 or AI)
    let snake2 = {
        body: [
            { x: GRID_COUNT - 6, y: 10 },
            { x: GRID_COUNT - 5, y: 10 },
            { x: GRID_COUNT - 4, y: 10 }
        ],
        direction: 'left',
        nextDirection: 'left',
        color: colorSchemes[0].snake2,
        score: 0,
        foodEaten: 0,
        isWinner: false,
        isAI: false
    };
    
    // Food
    let food = { x: 0, y: 0 };
    
    // Initialize game
    function init() {
        gameRunning = false;
        gameOver = false;
        colorSchemeIndex = 0;
        
        // Reset snakes
        snake1 = {
            body: [
                { x: 5, y: 10 },
                { x: 4, y: 10 },
                { x: 3, y: 10 }
            ],
            direction: 'right',
            nextDirection: 'right',
            color: colorSchemes[0].snake1,
            score: 0,
            foodEaten: 0,
            isWinner: false
        };
        
        snake2 = {
            body: [
                { x: GRID_COUNT - 6, y: 10 },
                { x: GRID_COUNT - 5, y: 10 },
                { x: GRID_COUNT - 4, y: 10 }
            ],
            direction: 'left',
            nextDirection: 'left',
            color: colorSchemes[0].snake2,
            score: 0,
            foodEaten: 0,
            isWinner: false,
            isAI: gameMode === 'single'
        };
        
        // Reset food
        generateFood();
        
        // Reset UI
        messageEl.textContent = '';
        player1ScoreEl.textContent = 'Player 1: 0';
        
        if (gameMode === 'two') {
            player2ScoreEl.textContent = 'Player 2: 0';
            player2ScoreEl.style.display = 'block';
        } else {
            player2ScoreEl.style.display = 'none';
        }
        
        // Set initial background color
        canvas.style.backgroundColor = colorSchemes[0].bg;
        document.body.style.backgroundColor = '#f0f0f0';
        
        // Draw initial state
        draw();
    }
    
    // Generate food at random position
    function generateFood() {
        let validPosition = false;
        
        while (!validPosition) {
            food.x = Math.floor(Math.random() * GRID_COUNT);
            food.y = Math.floor(Math.random() * GRID_COUNT);
            
            validPosition = true;
            
            // Check if food is on snake1
            for (let segment of snake1.body) {
                if (segment.x === food.x && segment.y === food.y) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check if food is on snake2
            if (validPosition) {
                for (let segment of snake2.body) {
                    if (segment.x === food.x && segment.y === food.y) {
                        validPosition = false;
                        break;
                    }
                }
            }
        }
    }
    
    // Draw everything
    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw food
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(
            food.x * GRID_SIZE + GRID_SIZE / 2,
            food.y * GRID_SIZE + GRID_SIZE / 2,
            GRID_SIZE / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Draw snake1
        drawSnake(snake1);
        
        // Draw snake2 (only in two-player mode)
        if (gameMode === 'two') {
            drawSnake(snake2);
        }
    }
    
    // Draw a snake
    function drawSnake(snake) {
        ctx.fillStyle = snake.color;
        
        for (let i = 0; i < snake.body.length; i++) {
            const segment = snake.body[i];
            
            if (i === 0) {
                // Draw head
                ctx.fillRect(
                    segment.x * GRID_SIZE,
                    segment.y * GRID_SIZE,
                    GRID_SIZE,
                    GRID_SIZE
                );
                
                // Draw eyes
                ctx.fillStyle = '#000';
                
                // Position eyes based on direction
                if (snake.direction === 'right') {
                    ctx.fillRect(
                        segment.x * GRID_SIZE + GRID_SIZE - 5,
                        segment.y * GRID_SIZE + 5,
                        4,
                        4
                    );
                    ctx.fillRect(
                        segment.x * GRID_SIZE + GRID_SIZE - 5,
                        segment.y * GRID_SIZE + GRID_SIZE - 9,
                        4,
                        4
                    );
                } else if (snake.direction === 'left') {
                    ctx.fillRect(
                        segment.x * GRID_SIZE + 1,
                        segment.y * GRID_SIZE + 5,
                        4,
                        4
                    );
                    ctx.fillRect(
                        segment.x * GRID_SIZE + 1,
                        segment.y * GRID_SIZE + GRID_SIZE - 9,
                        4,
                        4
                    );
                } else if (snake.direction === 'up') {
                    ctx.fillRect(
                        segment.x * GRID_SIZE + 5,
                        segment.y * GRID_SIZE + 1,
                        4,
                        4
                    );
                    ctx.fillRect(
                        segment.x * GRID_SIZE + GRID_SIZE - 9,
                        segment.y * GRID_SIZE + 1,
                        4,
                        4
                    );
                } else if (snake.direction === 'down') {
                    ctx.fillRect(
                        segment.x * GRID_SIZE + 5,
                        segment.y * GRID_SIZE + GRID_SIZE - 5,
                        4,
                        4
                    );
                    ctx.fillRect(
                        segment.x * GRID_SIZE + GRID_SIZE - 9,
                        segment.y * GRID_SIZE + GRID_SIZE - 5,
                        4,
                        4
                    );
                }
                
                // Reset fill color for body
                ctx.fillStyle = snake.color;
            } else {
                // Draw body segment
                ctx.fillRect(
                    segment.x * GRID_SIZE + 1,
                    segment.y * GRID_SIZE + 1,
                    GRID_SIZE - 2,
                    GRID_SIZE - 2
                );
            }
        }
        
        // Draw special features for winner (Anaconda)
        if (snake.isWinner) {
            ctx.fillStyle = '#FFD700'; // Gold color for patterns
            
            // Draw patterns on the snake to make it look like an anaconda
            for (let i = 1; i < snake.body.length; i += 2) {
                const segment = snake.body[i];
                
                // Draw diamond pattern
                ctx.beginPath();
                ctx.moveTo(segment.x * GRID_SIZE + GRID_SIZE / 2, segment.y * GRID_SIZE + 2);
                ctx.lineTo(segment.x * GRID_SIZE + GRID_SIZE - 2, segment.y * GRID_SIZE + GRID_SIZE / 2);
                ctx.lineTo(segment.x * GRID_SIZE + GRID_SIZE / 2, segment.y * GRID_SIZE + GRID_SIZE - 2);
                ctx.lineTo(segment.x * GRID_SIZE + 2, segment.y * GRID_SIZE + GRID_SIZE / 2);
                ctx.closePath();
                ctx.fill();
            }
        }
    }
    
    // Update game state
    function update() {
        if (!gameRunning || gameOver) return;
        
        // Update snake1 direction
        snake1.direction = snake1.nextDirection;
        
        // Update snake2 direction (only in two-player mode)
        if (gameMode === 'two') {
            snake2.direction = snake2.nextDirection;
        }
        
        // Move snake1
        moveSnake(snake1);
        
        // Move snake2 (only in two-player mode)
        if (gameMode === 'two') {
            moveSnake(snake2);
        }
        
        // Check collisions
        checkCollisions();
        
        // Update UI
        player1ScoreEl.textContent = `Player 1: ${snake1.score}`;
        
        if (gameMode === 'two') {
            player2ScoreEl.textContent = `Player 2: ${snake2.score}`;
        }
        
        // Draw everything
        draw();
    }
    
    // AI logic for snake2 in single-player mode
    function updateAI() {
        // Simple AI that tries to avoid walls and itself
        const head = snake2.body[0];
        const possibleDirections = [];
        
        // Check which directions are safe
        if (snake2.direction !== 'down' && isSafeMove(head.x, head.y - 1)) {
            possibleDirections.push('up');
        }
        if (snake2.direction !== 'up' && isSafeMove(head.x, head.y + 1)) {
            possibleDirections.push('down');
        }
        if (snake2.direction !== 'right' && isSafeMove(head.x - 1, head.y)) {
            possibleDirections.push('left');
        }
        if (snake2.direction !== 'left' && isSafeMove(head.x + 1, head.y)) {
            possibleDirections.push('right');
        }
        
        // If there are safe directions, choose one
        if (possibleDirections.length > 0) {
            // Prefer directions that lead to food
            const foodDirections = possibleDirections.filter(dir => {
                if (dir === 'up' && head.y > food.y) return true;
                if (dir === 'down' && head.y < food.y) return true;
                if (dir === 'left' && head.x > food.x) return true;
                if (dir === 'right' && head.x < food.x) return true;
                return false;
            });
            
            if (foodDirections.length > 0) {
                snake2.nextDirection = foodDirections[Math.floor(Math.random() * foodDirections.length)];
            } else {
                snake2.nextDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
            }
        }
        // If no safe directions, continue in current direction
    }
    
    // Check if a move is safe for AI
    function isSafeMove(x, y) {
        // Check if out of bounds
        if (x < 0 || x >= GRID_COUNT || y < 0 || y >= GRID_COUNT) {
            return false;
        }
        
        // Check if collides with snake1
        for (let segment of snake1.body) {
            if (x === segment.x && y === segment.y) {
                return false;
            }
        }
        
        // Check if collides with itself
        for (let segment of snake2.body) {
            if (x === segment.x && y === segment.y) {
                return false;
            }
        }
        
        return true;
    }
    
    // Move a snake
    function moveSnake(snake) {
        // Get head position
        const head = { x: snake.body[0].x, y: snake.body[0].y };
        
        // Update head position based on direction
        switch (snake.direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }
        
        // Add new head to the beginning of the snake
        snake.body.unshift(head);
        
        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
            // Increase score
            snake.score += 10;
            snake.foodEaten++;
            
            // Generate new food
            generateFood();
            
            // Check if we need to change colors
            if (snake.foodEaten % 5 === 0) {
                changeColors();
            }
        } else {
            // Remove tail segment
            snake.body.pop();
        }
    }
    
    // Change colors of background and snakes
    function changeColors() {
        colorSchemeIndex = (colorSchemeIndex + 1) % colorSchemes.length;
        const scheme = colorSchemes[colorSchemeIndex];
        
        // Update background color
        canvas.style.backgroundColor = scheme.bg;
        document.body.style.backgroundColor = lightenColor(scheme.bg, 80);
        
        // Update snake colors
        snake1.color = scheme.snake1;
        snake2.color = scheme.snake2;
    }
    
    // Helper function to lighten a color
    function lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }
    
    // Check for collisions
    function checkCollisions() {
        const head1 = snake1.body[0];
        
        // Check if snake1 hit the wall
        if (
            head1.x < 0 ||
            head1.x >= GRID_COUNT ||
            head1.y < 0 ||
            head1.y >= GRID_COUNT
        ) {
            endGame(null);
            return;
        }
        
        // Check if snake1 hit itself
        for (let i = 1; i < snake1.body.length; i++) {
            if (head1.x === snake1.body[i].x && head1.y === snake1.body[i].y) {
                endGame(null);
                return;
            }
        }
        
        // In two-player mode, check additional collisions
        if (gameMode === 'two') {
            const head2 = snake2.body[0];
            
            // Check if snake2 hit the wall
            if (
                head2.x < 0 ||
                head2.x >= GRID_COUNT ||
                head2.y < 0 ||
                head2.y >= GRID_COUNT
            ) {
                endGame(snake1);
                return;
            }
            
            // Check if snake2 hit itself
            for (let i = 1; i < snake2.body.length; i++) {
                if (head2.x === snake2.body[i].x && head2.y === snake2.body[i].y) {
                    endGame(snake1);
                    return;
                }
            }
            
            // Check if snake1 hit snake2
            for (let segment of snake2.body) {
                if (head1.x === segment.x && head1.y === segment.y) {
                    endGame(snake2);
                    return;
                }
            }
            
            // Check if snake2 hit snake1
            for (let segment of snake1.body) {
                if (head2.x === segment.x && head2.y === segment.y) {
                    endGame(snake1);
                    return;
                }
            }
        }
    }
    
    // End the game
    function endGame(winner) {
        gameRunning = false;
        gameOver = true;
        
        // Display message
        if (gameMode === 'single') {
            messageEl.textContent = `Game Over! Your score: ${snake1.score}`;
        } else {
            // Set winner
            if (winner) {
                winner.isWinner = true;
                
                if (winner === snake1) {
                    messageEl.textContent = 'Player 1 wins! Their snake has evolved into an Anaconda!';
                } else {
                    messageEl.textContent = 'Player 2 wins! Their snake has evolved into an Anaconda!';
                }
            } else {
                messageEl.textContent = 'Game Over! It\'s a tie!';
            }
        }
        
        // Draw final state
        draw();
        
        // Clear game loop
        clearInterval(gameLoop);
    }
    
    // Handle keyboard input
    document.addEventListener('keydown', (e) => {
        if (!gameRunning && !gameOver && e.key === ' ') {
            // Space to start game when not running
            gameRunning = true;
            gameLoop = setInterval(update, 150);
            return;
        }
        
        if (gameOver && e.key === ' ') {
            // Space to restart game when game over
            clearInterval(gameLoop);
            init();
            return;
        }
        
        if (!gameRunning) return;
        
        // Single player controls (Arrow keys)
        if (gameMode === 'single') {
            switch (e.key) {
                case 'ArrowUp':
                    if (snake1.direction !== 'down') {
                        snake1.nextDirection = 'up';
                    }
                    break;
                case 'ArrowDown':
                    if (snake1.direction !== 'up') {
                        snake1.nextDirection = 'down';
                    }
                    break;
                case 'ArrowLeft':
                    if (snake1.direction !== 'right') {
                        snake1.nextDirection = 'left';
                    }
                    break;
                case 'ArrowRight':
                    if (snake1.direction !== 'left') {
                        snake1.nextDirection = 'right';
                    }
                    break;
            }
        } else {
            // Two player mode
            // Player 1 controls (WASD)
            switch (e.key.toLowerCase()) {
                case 'w':
                    if (snake1.direction !== 'down') {
                        snake1.nextDirection = 'up';
                    }
                    break;
                case 's':
                    if (snake1.direction !== 'up') {
                        snake1.nextDirection = 'down';
                    }
                    break;
                case 'a':
                    if (snake1.direction !== 'right') {
                        snake1.nextDirection = 'left';
                    }
                    break;
                case 'd':
                    if (snake1.direction !== 'left') {
                        snake1.nextDirection = 'right';
                    }
                    break;
            }
            
            // Player 2 controls (Arrow keys)
            switch (e.key) {
                case 'ArrowUp':
                    if (snake2.direction !== 'down') {
                        snake2.nextDirection = 'up';
                    }
                    break;
                case 'ArrowDown':
                    if (snake2.direction !== 'up') {
                        snake2.nextDirection = 'down';
                    }
                    break;
                case 'ArrowLeft':
                    if (snake2.direction !== 'right') {
                        snake2.nextDirection = 'left';
                    }
                    break;
                case 'ArrowRight':
                    if (snake2.direction !== 'left') {
                        snake2.nextDirection = 'right';
                    }
                    break;
            }
        }
    });
    
    // Mode selection handlers
    singlePlayerBtn.addEventListener('click', () => {
        gameMode = 'single';
        modeSelection.style.display = 'none';
        gameInterface.style.display = 'block';
        singlePlayerInstructions.style.display = 'block';
        twoPlayerInstructions.style.display = 'none';
        player2ScoreEl.style.display = 'none';
        init();
    });
    
    twoPlayerBtn.addEventListener('click', () => {
        gameMode = 'two';
        modeSelection.style.display = 'none';
        gameInterface.style.display = 'block';
        singlePlayerInstructions.style.display = 'none';
        twoPlayerInstructions.style.display = 'block';
        player2ScoreEl.style.display = 'block';
        init();
    });
    
    // Back button handler
    backBtn.addEventListener('click', () => {
        clearInterval(gameLoop);
        gameInterface.style.display = 'none';
        modeSelection.style.display = 'block';
    });
    
    // Start button click handler
    startBtn.addEventListener('click', () => {
        if (!gameRunning && !gameOver) {
            gameRunning = true;
            gameLoop = setInterval(update, 150);
        }
    });
    
    // Restart button click handler
    restartBtn.addEventListener('click', () => {
        clearInterval(gameLoop);
        init();
    });
});
