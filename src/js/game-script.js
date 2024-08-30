        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const startButton = document.getElementById('startButton');
        const linkOverlay = document.getElementById('linkOverlay');
        const gameResult = document.getElementById('gameResult');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const backgroundMusic = document.getElementById('backgroundMusic');
        
        const WIN_SCORE = 69;
        
        let primeagen = {
            x: 0.5,
            y: 0.875,
            width: 40,
            height: 60,
            speed: 0.01,
            targetX: 0.5
        };
        
        let fallingObjects = [];
        let score = 0;
        let gameOver = false;
        let countdown = 5;
        let gameStarted = false;
        let gameLoop;
        let objectInterval;
        let countdownTimeout;
        let backgroundImage;
        
        const errorTypes = ['TypeError', 'SyntaxError', 'ReferenceError', 'RangeError'];
        
        function loadBackground() {
            backgroundImage = new Image();
            backgroundImage.src = "media/images/background-image.png";
            backgroundImage.onload = function() {
                drawStartScreen();
            };
        }
        
        function drawBackground() {
            if (backgroundImage && backgroundImage.complete) {
                ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
            }
        }
        
        function resizeCanvas() {
            const container = document.getElementById('gameContainer');
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            
            if (!gameStarted && !gameOver) {
                drawStartScreen();
            }
        }
        
        function drawPrimeagen() {
            const width = primeagen.width * (canvas.width / 600);
            const height = primeagen.height * (canvas.height / 400);
            const x = primeagen.x * canvas.width;
            const y = primeagen.y * canvas.height;
        
            ctx.fillStyle = '#333333';
            ctx.fillRect(x, y, width, height);
            
            // Face
            ctx.fillStyle = '#FFA07A';
            ctx.fillRect(x + width * 0.125, y + height * 0.25, width * 0.75, height * 0.5);
            
            // Eyes
            ctx.fillStyle = '#000000';
            ctx.fillRect(x + width * 0.25, y + height * 0.4167, width * 0.125, height * 0.0833);
            ctx.fillRect(x + width * 0.625, y + height * 0.4167, width * 0.125, height * 0.0833);
            
            // Mouth
            ctx.fillRect(x + width * 0.375, y + height * 0.6667, width * 0.25, height * 0.0333);
            
            // Mustache
            ctx.fillRect(x + width * 0.25, y + height * 0.5833, width * 0.5, height * 0.0833);
            
            // Headphones
            ctx.fillStyle = '#666666';
            ctx.fillRect(x - width * 0.125, y + height * 0.0833, width * 0.125, height * 0.3333);
            ctx.fillRect(x + width, y + height * 0.0833, width * 0.125, height * 0.3333);
            
            // Tiny hands
            ctx.fillStyle = '#FFA07A';
            ctx.fillRect(x - width * 0.125, y + height * 0.6667, width * 0.125, height * 0.0833);
            ctx.fillRect(x + width, y + height * 0.6667, width * 0.125, height * 0.0833);
        }
        
        function drawObject(obj) {
            ctx.font = `${16 * (canvas.width / 600)}px Courier New`;
            ctx.fillStyle = obj.type === 'class' ? '#FF0000' : '#00FF00';
            ctx.fillText(obj.text, obj.x * canvas.width, obj.y * canvas.height);
        }
        
        function createObject() {
            const isClass = Math.random() < 0.3; 
            fallingObjects.push({
                x: Math.random() * 0.8333,
                y: 0,
                speed: isClass ? 0.0025 : Math.random() * 0.00375 + 0.00125,
                type: isClass ? 'class' : 'error',
                text: isClass ? 'class' : errorTypes[Math.floor(Math.random() * errorTypes.length)]
            });
        }
        
        function drawCenteredText(text, y, fontSize = 20, maxWidth = canvas.width - 40) {
            ctx.font = `${fontSize * (canvas.width / 600)}px Courier New`;
            const words = text.split(' ');
            let line = '';
            let lines = [];
        
            for (let word of words) {
                const testLine = line + word + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
        
                if (testWidth > maxWidth && line !== '') {
                    lines.push(line);
                    line = word + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line);
        
            let lineHeight = fontSize * 1.2 * (canvas.height / 400);
            let startY = y * canvas.height - (lineHeight * (lines.length - 1)) / 2;
        
            for (let i = 0; i < lines.length; i++) {
                const lineWidth = ctx.measureText(lines[i]).width;
                const x = (canvas.width - lineWidth) / 2;
                ctx.fillText(lines[i], x, startY + (i * lineHeight));
            }
        
            return (startY + lines.length * lineHeight) / canvas.height;
        }
        
        function showGameOverScreen() {
            gameResult.textContent = score >= WIN_SCORE ? 'You Win!' : 'You Lose';
            scoreDisplay.textContent = `Errors Collected: ${score}`;
            linkOverlay.style.display = 'flex';
        }
        
        function updateGame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            drawBackground();
            drawPrimeagen();
            
            if (!gameStarted) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#00FF00';
                drawCenteredText(`Starting in ${countdown}`, 0.5, 40);
                return;
            }
            
            if (gameOver) {
                showGameOverScreen();
                return;
            }
            
            
            let dx = primeagen.targetX - primeagen.x;
            primeagen.x += dx * 0.1; 
            primeagen.x = Math.max(0, Math.min(1 - primeagen.width / canvas.width, primeagen.x));
            
            fallingObjects.forEach((obj, index) => {
                obj.y += obj.speed;
                drawObject(obj);
                
                if (obj.y > 1) {
                    fallingObjects.splice(index, 1);
                }
                
                const objWidth = ctx.measureText(obj.text).width / canvas.width;
                if (obj.x < primeagen.x + primeagen.width / canvas.width &&
                    obj.x + objWidth > primeagen.x &&
                    obj.y > primeagen.y &&
                    obj.y < primeagen.y + primeagen.height / canvas.height) {
                    if (obj.type === 'error') {
                        score++;
                        fallingObjects.splice(index, 1);
                    } else if (obj.type === 'class') {
                        endGame();
                    }
                }
            });
            
            ctx.fillStyle = '#00FF00';
            ctx.font = `${20 * (canvas.width / 600)}px Courier New`;
            ctx.fillText(`Errors Collected: ${score}/${WIN_SCORE}`, 10, 30 * (canvas.height / 400));
        
            if (score >= WIN_SCORE) {
                endGame();
            }
        }
        
        function endGame() {
            gameOver = true;
            clearInterval(objectInterval);
            cancelAnimationFrame(gameLoop);
            showGameOverScreen();
        }
        
        function resetGame() {
            if (objectInterval) clearInterval(objectInterval);
            if (gameLoop) cancelAnimationFrame(gameLoop);
            if (countdownTimeout) clearTimeout(countdownTimeout);
            
            gameOver = false;
            gameStarted = false;
            score = 0;
            fallingObjects = [];
            countdown = 5;
            primeagen.x = 0.5;
            primeagen.targetX = 0.5;
            linkOverlay.style.display = 'none';
        }
        
        function startGame() {
            resetGame();
            resizeCanvas();
            backgroundMusic.play();
            
            function startCountdown() {
                if (countdown > 0) {
                    updateGame();
                    countdown--;
                    countdownTimeout = setTimeout(startCountdown, 1000);
                } else {
                    gameStarted = true;
                    objectInterval = setInterval(createObject, 1000);
                    gameLoop = requestAnimationFrame(gameLoopFunction);
                }
            }
            
            startCountdown();
        }
        
        function gameLoopFunction() {
            updateGame();
            if (!gameOver) {
                gameLoop = requestAnimationFrame(gameLoopFunction);
            }
        }
        
        document.addEventListener('keydown', (e) => {
            if (gameStarted && !gameOver) {
                if (e.key === 'ArrowLeft') {
                    primeagen.targetX = Math.max(0, primeagen.x - primeagen.speed);
                } else if (e.key === 'ArrowRight') {
                    primeagen.targetX = Math.min(1 - primeagen.width / canvas.width, primeagen.x + primeagen.speed);
                }
            } else if (gameOver && e.key === ' ') {
                startGame();
            }
        });
        
        function handlePointerMove(e) {
            if (gameStarted && !gameOver) {
                e.preventDefault();
                const rect = canvas.getBoundingClientRect();
                const root = document.documentElement;
                const mouseX = ((e.clientX || e.touches[0].clientX) - rect.left - root.scrollLeft) / canvas.width;
                primeagen.targetX = mouseX - (primeagen.width / canvas.width) / 2;
            }
        }
        
        canvas.addEventListener('mousemove', handlePointerMove);
        canvas.addEventListener('touchmove', handlePointerMove);
        
        startButton.addEventListener('click', startGame);
        linkOverlay.addEventListener('click', (e) => {
            if (e.target.tagName !== 'A') {
                startGame();
            }
        });
        
        function drawStartScreen() {
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00FF00';
            let y = 0.1;
            y = drawCenteredText("Welcome to Vim Carrey's Error Collection Adventure!", y, 24);
            y += 0.075;
            y = drawCenteredText("There are 2 things we know about Vim Carrey,", y, 20);
            y = drawCenteredText("he has tiny hands & loves JS", y, 20);
            y += 0.075;
            y = drawCenteredText(`Mission: Collect ${WIN_SCORE} errors but avoid touching any classes!`, y, 20);
            y += 0.075;
            y = drawCenteredText("Instructions:", y, 20);
            y = drawCenteredText("1. Use mouse or touch to move", y, 20);
            y = drawCenteredText("2. Catch falling errors", y, 20);
            y = drawCenteredText("3. Avoid red 'class' objects", y, 20);
            y += 0.075;
            drawCenteredText("Click 'Start Game' when ready to debug!", y, 20);
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        drawStartScreen();
        loadBackground();

        console.log(`
            /\\_/\\  
           ( o.o ) 
            > ^ <  woof!
`);