// Thiết lập canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const scoreElement = document.getElementById('score');
let score = 0;

// Tàu của người chơi
const ship = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 40,
    height: 30,
    speed: 5
};

// Kho báu (từ OCEAN)
let treasures = [];
const treasureSize = 20;

// Chướng ngại vật
let obstacles = [];
const obstacleSize = 30;

// Điều khiển tàu
let keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

function moveShip() {
    if (keys['ArrowLeft'] && ship.x > ship.width / 2) ship.x -= ship.speed;
    if (keys['ArrowRight'] && ship.x < canvas.width - ship.width / 2) ship.x += ship.speed;
}

// Gọi API OCEAN với token
async function fetchOceanData() {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJsZXZhbnRhbi52aW5hMTE3MTcwQGdtYWlsLmNvbSIsImlhdCI6MTc0MDgwOTAxMH0.6F2roc8bpAXbpnQdaJL4NpBIllOcMAOoTi6PnTdBKB4";
    try {
        const response = await fetch('https://api.ocean.o.xyz/v1/treasures', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        treasures = data.map((item, i) => ({
            x: Math.random() * (canvas.width - treasureSize),
            y: -treasureSize - i * 100,
            collected: false
        }));
    } catch (error) {
        console.error('Lỗi khi gọi API OCEAN:', error);
        treasures = Array(5).fill().map((_, i) => ({
            x: Math.random() * (canvas.width - treasureSize),
            y: -treasureSize - i * 100,
            collected: false
        }));
    }
}

// Tạo chướng ngại vật
function spawnObstacles() {
    obstacles.push({
        x: Math.random() * (canvas.width - obstacleSize),
        y: -obstacleSize
    });
}

// Vẽ cảnh nền đại dương
function drawBackground() {
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 50 + i * 100);
        ctx.quadraticCurveTo(canvas.width / 2, 20 + i * 100, canvas.width, 50 + i * 100);
        ctx.stroke();
    }
}

// Vẽ tàu
function drawShip() {
    ctx.font = '30px Arial';
    ctx.fillText('⛵', ship.x - ship.width / 2, ship.y + 10);
}

// Vẽ kho báu
function drawTreasures() {
    treasures.forEach(t => {
        if (!t.collected) {
            ctx.font = '20px Arial';
            ctx.fillText('💰', t.x - treasureSize / 2, t.y);
        }
    });
}

// Vẽ chướng ngại vật (sửa lỗi: thay emoji bằng hình tam giác)
function drawObstacles() {
    obstacles.forEach(o => {
        ctx.fillStyle = 'gray';
        ctx.beginPath();
        ctx.moveTo(o.x, o.y); // Đỉnh tam giác
        ctx.lineTo(o.x - obstacleSize / 2, o.y + obstacleSize); // Góc trái dưới
        ctx.lineTo(o.x + obstacleSize / 2, o.y + obstacleSize); // Góc phải dưới
        ctx.closePath();
        ctx.fill();
    });
}

// Vẽ toàn bộ game
function draw() {
    drawBackground();
    drawShip();
    drawTreasures();
    drawObstacles();
}

// Cập nhật game
function update() {
    moveShip();

    // Cập nhật kho báu
    treasures.forEach(t => {
        if (!t.collected) {
            t.y += 2;
            if (t.y > canvas.height) t.y = -treasureSize;
            if (Math.abs(t.x - ship.x) < treasureSize && Math.abs(t.y - ship.y) < treasureSize) {
                t.collected = true;
                score += 10;
                scoreElement.textContent = `Score: ${score}`;
            }
        }
    });

    // Cập nhật chướng ngại vật
    obstacles.forEach(o => {
        o.y += 3;
        if (o.y > canvas.height) o.y = -obstacleSize;
        if (Math.abs(o.x - ship.x) < obstacleSize && Math.abs(o.y - ship.y) < obstacleSize) {
            alert('Game Over! Final Score: ' + score);
            score = 0;
            scoreElement.textContent = `Score: ${score}`;
            obstacles = [];
            treasures.forEach(t => t.collected = false);
        }
    });

    draw();
    requestAnimationFrame(update);
}

// Khởi động game
fetchOceanData().then(() => {
    setInterval(spawnObstacles, 2000);
    update();
});
