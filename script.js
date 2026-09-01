const canvas = document.getElementById("poolTable");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const resetButton = document.getElementById("reset");
const powerSlider = document.getElementById("power");

let score = 0;
let balls = [];
let pockets = [];

let mouse = {
    x: 0,
    y: 0,
    down: false
};

let aiming = false;

const BALL_RADIUS = 13;
const FRICTION = 0.985;
const MIN_SPEED = 0.05;

// --------------------------------------------------
// TAMANHO DO CANVAS
// --------------------------------------------------

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width - 36;
    canvas.height = rect.height - 36;

    createPockets();

    if (balls.length === 0) {
        createBalls();
    }
}

window.addEventListener("resize", resizeCanvas);

// --------------------------------------------------
// CAÇAPAS
// --------------------------------------------------

function createPockets() {
    const r = 27;

    pockets = [
        { x: 0, y: 0, r },
        { x: canvas.width / 2, y: 0, r },
        { x: canvas.width, y: 0, r },
        { x: 0, y: canvas.height, r },
        { x: canvas.width / 2, y: canvas.height, r },
        { x: canvas.width, y: canvas.height, r }
    ];
}

// --------------------------------------------------
// CRIAÇÃO DAS BOLAS
// --------------------------------------------------

function createBalls() {
    balls = [];

    // Bola branca
    balls.push({
        x: canvas.width * 0.25,
        y: canvas.height / 2,
        vx: 0,
        vy: 0,
        color: "#ffffff",
        number: 0,
        type: "cue"
    });

    const colors = [
        "#f1c40f",
        "#2980b9",
        "#e74c3c",
        "#8e44ad",
        "#e67e22",
        "#27ae60",
        "#922b21",
        "#111111",
        "#f1c40f",
        "#2980b9",
        "#e74c3c",
        "#8e44ad",
        "#e67e22",
        "#27ae60",
        "#922b21"
    ];

    let startX = canvas.width * 0.72;
    let startY = canvas.height / 2;

    let index = 0;

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col <= row; col++) {

            balls.push({
                x: startX + row * BALL_RADIUS * 1.8,
                y: startY + (col - row / 2) * BALL_RADIUS * 2.1,
                vx: 0,
                vy: 0,
                color: colors[index],
                number: index + 1,
                type: "object"
            });

            index++;
        }
    }
}

// --------------------------------------------------
// DESENHAR MESA
// --------------------------------------------------

function drawTable() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mesa
    ctx.fillStyle = "#087a45";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Linhas decorativas
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Caçapas
    pockets.forEach(pocket => {

        ctx.beginPath();
        ctx.arc(
            pocket.x,
            pocket.y,
            pocket.r,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#050505";
        ctx.fill();
    });
}

// --------------------------------------------------
// DESENHAR BOLAS
// --------------------------------------------------

function drawBalls() {

    balls.forEach(ball => {

        if (ball.pocketed) return;

        ctx.beginPath();

        ctx.arc(
            ball.x,
            ball.y,
            BALL_RADIUS,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = ball.color;
        ctx.fill();

        ctx.strokeStyle = "#111";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Número
        if (ball.number !== 0) {

            ctx.fillStyle = "#fff";
            ctx.font = "bold 9px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.fillText(
                ball.number,
                ball.x,
                ball.y
            );
        }

        // Brilho
        ctx.beginPath();

        ctx.arc(
            ball.x - 4,
            ball.y - 4,
            3,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fill();
    });
}

// --------------------------------------------------
// POSIÇÃO DO MOUSE
// --------------------------------------------------

function getMousePosition(event) {

    const rect = canvas.getBoundingClientRect();

    return {
        x: (event.clientX - rect.left) *
            (canvas.width / rect.width),

        y: (event.clientY - rect.top) *
            (canvas.height / rect.height)
    };
}

canvas.addEventListener("mousemove", event => {

    const position = getMousePosition(event);

    mouse.x = position.x;
    mouse.y = position.y;
});

canvas.addEventListener("mousedown", event => {

    if (!allBallsStopped()) return;

    const cue = balls.find(ball => ball.type === "cue");

    if (!cue || cue.pocketed) return;

    const distance = Math.hypot(
        mouse.x - cue.x,
        mouse.y - cue.y
    );

    if (distance < 100) {
        aiming = true;
        mouse.down = true;
    }
});

canvas.addEventListener("mouseup", () => {

    if (!aiming) return;

    aiming = false;
    mouse.down = false;

    shoot();
});

// --------------------------------------------------
// TACADA
// --------------------------------------------------

function shoot() {

    const cue = balls.find(ball => ball.type === "cue");

    if (!cue || cue.pocketed) return;

    const dx = cue.x - mouse.x;
    const dy = cue.y - mouse.y;

    const distance = Math.hypot(dx, dy);

    if (distance < 5) return;

    const power = Number(powerSlider.value);

    cue.vx = (dx / distance) * power;
    cue.vy = (dy / distance) * power;
}

// --------------------------------------------------
// COLISÃO COM PAREDES
// --------------------------------------------------

function wallCollision(ball) {

    if (ball.x - BALL_RADIUS <= 0) {

        ball.x = BALL_RADIUS;
        ball.vx *= -0.9;
    }

    if (ball.x + BALL_RADIUS >= canvas.width) {

        ball.x = canvas.width - BALL_RADIUS;
        ball.vx *= -0.9;
    }

    if (ball.y - BALL_RADIUS <= 0) {

        ball.y = BALL_RADIUS;
        ball.vy *= -0.9;
    }

    if (ball.y + BALL_RADIUS >= canvas.height) {

        ball.y = canvas.height - BALL_RADIUS;
        ball.vy *= -0.9;
    }
}

// --------------------------------------------------
// COLISÃO ENTRE BOLAS
// --------------------------------------------------

function ballCollision(a, b) {

    if (a.pocketed || b.pocketed) return;

    const dx = b.x - a.x;
    const dy = b.y - a.y;

    const distance = Math.hypot(dx, dy);

    const minDistance = BALL_RADIUS * 2;

    if (distance === 0 || distance >= minDistance) return;

    const nx = dx / distance;
    const ny = dy / distance;

    const overlap = minDistance - distance;

    a.x -= nx * overlap / 2;
    a.y -= ny * overlap / 2;

    b.x += nx * overlap / 2;
    b.y += ny * overlap / 2;

    const relativeVelocity =
        (b.vx - a.vx) * nx +
        (b.vy - a.vy) * ny;

    if (relativeVelocity > 0) return;

    const impulse = relativeVelocity;

    a.vx += impulse * nx;
    a.vy += impulse * ny;

    b.vx -= impulse * nx;
    b.vy -= impulse * ny;
}

// --------------------------------------------------
// CAÇAPAS
// --------------------------------------------------

function checkPockets() {

    balls.forEach(ball => {

        if (ball.pocketed) return;

        pockets.forEach(pocket => {

            const distance = Math.hypot(
                ball.x - pocket.x,
                ball.y - pocket.y
            );

            if (distance < pocket.r) {

                ball.pocketed = true;
                ball.vx = 0;
                ball.vy = 0;

                if (ball.type === "object") {

                    score++;
                    scoreElement.textContent = score;

                } else {

                    // Recolocar a branca
                    setTimeout(() => {

                        ball.pocketed = false;

                        ball.x = canvas.width * 0.25;
                        ball.y = canvas.height / 2;

                    }, 700);
                }
            }
        });
    });
}

// --------------------------------------------------
// FÍSICA
// --------------------------------------------------

function updatePhysics() {

    balls.forEach(ball => {

        if (ball.pocketed) return;

        ball.x += ball.vx;
        ball.y += ball.vy;

        ball.vx *= FRICTION;
        ball.vy *= FRICTION;

        if (Math.abs(ball.vx) < MIN_SPEED) {
            ball.vx = 0;
        }

        if (Math.abs(ball.vy) < MIN_SPEED) {
            ball.vy = 0;
        }

        wallCollision(ball);
    });

    for (let i = 0; i < balls.length; i++) {

        for (let j = i + 1; j < balls.length; j++) {

            ballCollision(
                balls[i],
                balls[j]
            );
        }
    }

    checkPockets();
}

// --------------------------------------------------
// VERIFICAR SE PAROU
// --------------------------------------------------

function allBallsStopped() {

    return balls.every(ball => {

        if (ball.pocketed) return true;

        return Math.abs(ball.vx) < 0.1 &&
               Math.abs(ball.vy) < 0.1;
    });
}

// --------------------------------------------------
// MIRA
// --------------------------------------------------

function drawAim() {

    if (!aiming) return;

    const cue = balls.find(ball => ball.type === "cue");

    if (!cue || cue.pocketed) return;

    const dx = cue.x - mouse.x;
    const dy = cue.y - mouse.y;

    const distance = Math.hypot(dx, dy);

    if (distance < 5) return;

    const angleX = dx / distance;
    const angleY = dy / distance;

    const lineLength = 160;

    ctx.beginPath();

    ctx.moveTo(cue.x, cue.y);

    ctx.lineTo(
        cue.x + angleX * lineLength,
        cue.y + angleY * lineLength
    );

    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 2;

    ctx.setLineDash([8, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Linha atrás da branca
    ctx.beginPath();

    ctx.moveTo(
        cue.x - angleX * 100,
        cue.y - angleY * 100
    );

    ctx.lineTo(
        cue.x,
        cue.y
    );

    ctx.strokeStyle = "#d8a35d";
    ctx.lineWidth = 5;

    ctx.stroke();
}

// --------------------------------------------------
// LOOP DO JOGO
// --------------------------------------------------

function gameLoop() {

    drawTable();
    updatePhysics();
    drawBalls();
    drawAim();

    requestAnimationFrame(gameLoop);
}

// --------------------------------------------------
// NOVA PARTIDA
// --------------------------------------------------

resetButton.addEventListener("click", () => {

    score = 0;
    scoreElement.textContent = score;

    createBalls();
});

// --------------------------------------------------
// INICIAR
// --------------------------------------------------

resizeCanvas();
gameLoop();