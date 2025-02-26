const animationContainer = document.getElementById('animation-container');
const controlButton = document.getElementById('control-button');

// --- Constants ---
const NUM_CIRCLES = 25;
const NUM_BOUNCING_CIRCLES = 5; // Number of bouncing circles
const ANIMATION_SPEED = 0.1;
const MOUSE_INFLUENCE_RADIUS = 100;
const REACTIVE_PERCENTAGE = 0.1;
const REACTIVE_DURATION = 2000;
const REACTIVE_SPEED_MULTIPLIER = 0.3;
const REACTIVE_SPEED_RANDOMNESS = 0.5;
const SPEED_RANDOMNESS_FACTOR = 2;
const SOCIAL_BUTTON_SIZE = 100;
const BOUNCING_CIRCLE_SIZE = 50; // Default size for bouncing circles
const MIN_SIZE_PERCENTAGE = 0.05;
const MAX_SIZE_PERCENTAGE = 0.15;
const ABSOLUTE_MIN_SIZE = 20;
const RESIZE_DEBOUNCE_TIME = 250;
const INFLUENCE_FACTOR = 0.5;
const OVERLAP_SEPARATION_FACTOR = 0.5;
const GRID_CELL_SIZE = 150;
const BUTTON_SPEED = 0.5;
const CIRCLE_SPEED = 0.75; // Speed of the bouncing circles
const SOCIAL_BUTTON_MARGIN = SOCIAL_BUTTON_SIZE * 1.1;
const SPEED_LIMIT_MULTIPLIER = 5;
const BUTTON_BOUNDARY_RANDOMNESS = 0.2;
const CIRCLE_BOUNDARY_RANDOMNESS = 0.3; // Boundary Randomness Factor for Bouncing Circles
const SPREAD_FORCE_CONSTANT = 10; // Constant for distance-based spread force
const EDGE_REPULSION_FORCE = 0.5; // Strength of edge repulsion
const EDGE_REPULSION_DISTANCE = 100; // Distance from edge where repulsion starts
const DAMPING_FACTOR = 0.995; // Damping factor, applied each frame

let mouseX = -MOUSE_INFLUENCE_RADIUS * 2;
let mouseY = -MOUSE_INFLUENCE_RADIUS * 2;
let circles = [];
let bouncingCircles = []; // Array to hold bouncing circles
let animationRunning = false; //  set to false initially
let intervalId = null;
let linkedinButton = null;
let githubButton = null;
let resizeTimeout;
let grid = {};
let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;

// --- Circle Class ---
class Circle {
    constructor(x, y, size, moveXSpeed, moveYSpeed, hue) {
        this.x = x;  // vw
        this.y = y;  // vh
        this.size = size; // px
        this.moveXSpeed = moveXSpeed;
        this.moveYSpeed = moveYSpeed;
        this.hue = hue;
        this.element = document.createElement('div');
        this.element.classList.add('circle');
        this.element.style.backgroundColor = `hsl(${this.hue}, 100%, 50%)`;
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.isReactive = false;
        this.reactiveUntil = 0;
        this.gridX = 0;
        this.gridY = 0;

        this.updatePosition();
        animationContainer.appendChild(this.element);
    }

    updatePosition() {
        this.element.style.left = `${this.x}vw`;
        this.element.style.top = `${this.y}vh`;
    }

    update() {
        this.applySpreadForce();
        this.applyEdgeRepulsion(); // Apply edge repulsion
        this.handleCollisions();
        this.handleMouseInfluence(mouseX, mouseY);
        this.handleBoundaryCollisions();
        this.applyDamping();
        updateGrid(this);
        // Update x and y based on speed
        this.x += this.moveXSpeed;
        this.y += this.moveYSpeed;
        this.updatePosition();
        if (animationRunning) {
            requestAnimationFrame(() => this.update());
        }
    }

    updateGridPosition() {
        this.gridX = Math.floor((this.x / 100 * viewportWidth) / GRID_CELL_SIZE);
        this.gridY = Math.floor((this.y / 100 * viewportHeight) / GRID_CELL_SIZE);
    }

    handleCircleCollision(other) {
        const otherLeft = other.x;
        const otherTop = other.y;
        const otherSize = other.size;

        const currentLeftPx = this.x / 100 * viewportWidth;
        const currentTopPx = this.y / 100 * viewportHeight;
        const otherLeftPx = otherLeft / 100 * viewportWidth;
        const otherTopPx = otherTop / 100 * viewportHeight;

        const dx = otherLeftPx - currentLeftPx;
        const dy = otherTopPx - currentTopPx;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (this.size / 2) + (otherSize / 2);

        if (distance < minDistance) {
            const nx = dx / distance;
            const ny = dy / distance;

            const relativeVelocityX = this.moveXSpeed - other.moveXSpeed;
            const relativeVelocityY = this.moveYSpeed - other.moveYSpeed;
            const dotProduct = relativeVelocityX * nx + relativeVelocityY * ny;

            if (dotProduct < 0) {
                const impulse = (2 * dotProduct) / (1 + 1);
                this.moveXSpeed -= impulse * nx;
                this.moveYSpeed -= impulse * ny;
                other.moveXSpeed += impulse * nx;
                other.moveYSpeed += impulse * ny;
            }

            const overlap = minDistance - distance;
            const separationX = nx * overlap * OVERLAP_SEPARATION_FACTOR;
            const separationY = ny * overlap * OVERLAP_SEPARATION_FACTOR;

            this.x -= (separationX / viewportWidth * 100);
            this.y -= (separationY / viewportHeight * 100);
            other.x += (separationX / viewportWidth * 100);
            other.y += (separationY / viewportHeight * 100);
            other.handleBoundaryCollisions();
        }
    }

     handleButtonCollision(other) {

        const otherLeft = other.x;
        const otherTop = other.y;
        const otherSize = other.size;

        const currentLeftPx = this.x / 100 * viewportWidth;
        const currentTopPx = this.y / 100 * viewportHeight;
        const otherLeftPx = otherLeft / 100 * viewportWidth;
        const otherTopPx = otherTop / 100 * viewportHeight;

        const dx = otherLeftPx - currentLeftPx;
        const dy = otherTopPx - currentTopPx;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (this.size / 2) + (otherSize / 2);

        if (distance < minDistance) {
            const nx = dx / distance;
            const ny = dy / distance;

            const overlap = minDistance - distance;
            this.x -= (nx * overlap) / viewportWidth * 100;
            this.y -= (ny * overlap) / viewportHeight * 100;

            const dotProduct = this.moveXSpeed * nx + this.moveYSpeed * ny;
            this.moveXSpeed -= 2 * dotProduct * nx;
            this.moveYSpeed -= 2 * dotProduct * ny;
            this.handleBoundaryCollisions();
        }
    }

    handleCollisions() {
        const neighbors = getNeighbors(this);

        for (const other of neighbors) {
            if (other === this) continue;

            if (other instanceof SocialButton) {
                this.handleButtonCollision(other);
            } else if (other instanceof BouncingCircle) {
                this.handleButtonCollision(other); // Treat collision with bouncing circles the same way
            }
            else {
                this.handleCircleCollision(other);
            }
        }
    }
    handleMouseInfluence(mouseX, mouseY) {
        const dx = (mouseX / viewportWidth * 100) - this.x;
        const dy = (mouseY / viewportHeight * 100) - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < MOUSE_INFLUENCE_RADIUS && this.isReactive) {
            const influence = (MOUSE_INFLUENCE_RADIUS - distance) / MOUSE_INFLUENCE_RADIUS;
            this.moveXSpeed += (dx / distance) * influence * INFLUENCE_FACTOR * REACTIVE_SPEED_MULTIPLIER * (1 + random(-REACTIVE_SPEED_RANDOMNESS, REACTIVE_SPEED_RANDOMNESS));
            this.moveYSpeed += (dy / distance) * influence * INFLUENCE_FACTOR * REACTIVE_SPEED_MULTIPLIER * (1 + random(-REACTIVE_SPEED_RANDOMNESS, REACTIVE_SPEED_RANDOMNESS));
        }

        const speedLimit = ANIMATION_SPEED * (this.isReactive ? SPEED_LIMIT_MULTIPLIER * REACTIVE_SPEED_MULTIPLIER : SPEED_LIMIT_MULTIPLIER);
        this.moveXSpeed = Math.max(-speedLimit, Math.min(speedLimit, this.moveXSpeed));
        this.moveYSpeed = Math.max(-speedLimit, Math.min(speedLimit, this.moveYSpeed));
    }


    handleBoundaryCollisions() {
        if (this.x < 0 || this.x > 100 - (this.size / viewportWidth * 100)) this.moveXSpeed *= -1;
        if (this.y < 0 || this.y > 100 - (this.size / viewportHeight * 100)) this.moveYSpeed *= -1;
        this.x = Math.max(0, Math.min(100 - (this.size / viewportWidth * 100), this.x));
        this.y = Math.max(0, Math.min(100 - (this.size / viewportHeight * 100), this.y));
    }

    applySpreadForce() {
        for (const other of circles) {
            if (other === this) continue;

            const dx = (other.x - this.x);
            const dy = (other.y - this.y);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                const nx = dx / distance;
                const ny = dy / distance;
                // Force is inversely proportional to the square of the distance.
                const force = SPREAD_FORCE_CONSTANT / (distance * distance);
                this.moveXSpeed -= nx * force;
                this.moveYSpeed -= ny * force;
            }
        }
    }

    applyEdgeRepulsion() {
        const left = this.x / 100 * viewportWidth;
        const top = this.y / 100 * viewportHeight;

        // Left edge
        if (left < EDGE_REPULSION_DISTANCE) {
            this.moveXSpeed += EDGE_REPULSION_FORCE * (1 - left / EDGE_REPULSION_DISTANCE);
        }
        // Right edge
        if (viewportWidth - left - this.size < EDGE_REPULSION_DISTANCE) {
            this.moveXSpeed -= EDGE_REPULSION_FORCE * (1 - (viewportWidth - left - this.size) / EDGE_REPULSION_DISTANCE);
        }
        // Top edge
        if (top < EDGE_REPULSION_DISTANCE) {
            this.moveYSpeed += EDGE_REPULSION_FORCE * (1 - top / EDGE_REPULSION_DISTANCE);
        }
        // Bottom edge
        if (viewportHeight - top - this.size < EDGE_REPULSION_DISTANCE) {
            this.moveYSpeed -= EDGE_REPULSION_FORCE * (1 - (viewportHeight - top - this.size) / EDGE_REPULSION_DISTANCE);
        }
    }
    applyDamping() {
        this.moveXSpeed *= DAMPING_FACTOR;
        this.moveYSpeed *= DAMPING_FACTOR;
    }
}

// --- Bouncing Circle Class ---
class BouncingCircle {
    constructor(x, y, size, moveXSpeed, moveYSpeed, hue) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.moveXSpeed = moveXSpeed;
        this.moveYSpeed = moveYSpeed;
        this.hue = hue;
        this.element = document.createElement('div');
        this.element.classList.add('bouncing-circle'); // Use a different class for styling
        this.element.style.backgroundColor = `hsl(${this.hue}, 100%, 50%)`;
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.gridX = 0;
        this.gridY = 0;
        this.updatePosition();
        animationContainer.appendChild(this.element);
    }

    updatePosition() {
        this.element.style.left = `${this.x}vw`;
        this.element.style.top = `${this.y}vh`;
    }

    update() {
        this.handleBoundaryCollisions();
        this.handleCollisions(); // Enable collisions with circles
        this.x += this.moveXSpeed;
        this.y += this.moveYSpeed;
        updateGrid(this);
        this.updatePosition();

        if (animationRunning) {
            requestAnimationFrame(() => this.update());
        }
    }

    updateGridPosition() {
        this.gridX = Math.floor((this.x / 100 * viewportWidth) / GRID_CELL_SIZE);
        this.gridY = Math.floor((this.y / 100 * viewportHeight) / GRID_CELL_SIZE);
    }

    handleBoundaryCollisions() {
        if (this.x < 0 || this.x > 100 - (this.size / viewportWidth * 100)) {
            this.moveXSpeed = -this.moveXSpeed + random(-CIRCLE_BOUNDARY_RANDOMNESS, CIRCLE_BOUNDARY_RANDOMNESS);
        }
        if (this.y < 0 || this.y > 100 - (this.size / viewportHeight * 100)) {
            this.moveYSpeed = -this.moveYSpeed + random(-CIRCLE_BOUNDARY_RANDOMNESS, CIRCLE_BOUNDARY_RANDOMNESS);
        }

        this.x = Math.max(0, Math.min(100 - (this.size / viewportWidth * 100), this.x));
        this.y = Math.max(0, Math.min(100 - (this.size / viewportHeight * 100), this.y));
    }


    handleCircleCollision(other) {
        const otherLeft = other.x;
        const otherTop = other.y;
        const otherSize = other.size;

        const currentLeftPx = this.x / 100 * viewportWidth;
        const currentTopPx = this.y / 100 * viewportHeight;
        const otherLeftPx = otherLeft / 100 * viewportWidth;
        const otherTopPx = otherTop / 100 * viewportHeight;

        const dx = otherLeftPx - currentLeftPx;
        const dy = otherTopPx - currentTopPx;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (this.size / 2) + (otherSize / 2);

        if (distance < minDistance) {
            const nx = dx / distance;
            const ny = dy / distance;

            const relativeVelocityX = this.moveXSpeed - other.moveXSpeed;
            const relativeVelocityY = this.moveYSpeed - other.moveYSpeed;
            const dotProduct = relativeVelocityX * nx + relativeVelocityY * ny;

            if (dotProduct < 0) {
                const impulse = (2 * dotProduct) / (1 + 1);
                this.moveXSpeed -= impulse * nx;
                this.moveYSpeed -= impulse * ny;
                other.moveXSpeed += impulse * nx;
                other.moveYSpeed += impulse * ny;
            }

            const overlap = minDistance - distance;
             const separationX = nx * overlap * OVERLAP_SEPARATION_FACTOR;
            const separationY = ny * overlap * OVERLAP_SEPARATION_FACTOR;

            this.x += (separationX / viewportWidth * 100);
            this.y += (separationY / viewportHeight * 100);
            other.x -= (separationX / viewportWidth * 100);
            other.y -= (separationY / viewportHeight * 100);
            other.handleBoundaryCollisions();
        }
    }
     handleCollisions() {
        const neighbors = getNeighbors(this);

        for (const other of neighbors) {
            if (other === this) continue;

            if (other instanceof SocialButton) {
                this.handleCircleCollision(other);
            }
           else if (other instanceof Circle) {
                this.handleCircleCollision(other);
            }
             else if (other instanceof BouncingCircle) {
                this.handleCircleCollision(other);
            }
        }
    }
}

// --- Social Button Class ---
class SocialButton {
    constructor(x, y, size, moveXSpeed, moveYSpeed, href, imgSrc, imgAlt) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.moveXSpeed = moveXSpeed;
        this.moveYSpeed = moveYSpeed;
        this.href = href;
        this.element = document.createElement('a');
        this.element.classList.add('social-button');
        this.element.href = href;
        this.element.target = '_blank';
        this.element.rel = "noopener noreferrer";
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = imgAlt;
        this.element.appendChild(img);
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.gridX = 0;
        this.gridY = 0;
        this.updatePosition();
        animationContainer.appendChild(this.element);
    }

    updatePosition() {
        this.element.style.left = `${this.x}vw`;
        this.element.style.top = `${this.y}vh`;
    }

    update() {
        this.handleBoundaryCollisions();
        this.handleCollisions(); // Enable collisions with circles
        this.x += this.moveXSpeed;
        this.y += this.moveYSpeed;
        updateGrid(this);
        this.updatePosition();

        if (animationRunning) {
            requestAnimationFrame(() => this.update());
        }
    }

    updateGridPosition() {
        this.gridX = Math.floor((this.x / 100 * viewportWidth) / GRID_CELL_SIZE);
        this.gridY = Math.floor((this.y / 100 * viewportHeight) / GRID_CELL_SIZE);
    }

    handleBoundaryCollisions() {
        if (this.x < 0 || this.x > 100 - (this.size / viewportWidth * 100)) {
            this.moveXSpeed = -this.moveXSpeed + random(-BUTTON_BOUNDARY_RANDOMNESS, BUTTON_BOUNDARY_RANDOMNESS);
        }
        if (this.y < 0 || this.y > 100 - (this.size / viewportHeight * 100)) {
            this.moveYSpeed = -this.moveYSpeed + random(-BUTTON_BOUNDARY_RANDOMNESS, BUTTON_BOUNDARY_RANDOMNESS);
        }

        this.x = Math.max(0, Math.min(100 - (this.size / viewportWidth * 100), this.x));
        this.y = Math.max(0, Math.min(100 - (this.size / viewportHeight * 100), this.y));
    }

    handleCircleCollision(other) {
        const otherLeft = other.x;
        const otherTop = other.y;
        const otherSize = other.size;

        const currentLeftPx = this.x / 100 * viewportWidth;
        const currentTopPx = this.y / 100 * viewportHeight;
        const otherLeftPx = otherLeft / 100 * viewportWidth;
        const otherTopPx = otherTop / 100 * viewportHeight;

        const dx = otherLeftPx - currentLeftPx;
        const dy = otherTopPx - currentTopPx;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (this.size / 2) + (otherSize / 2);

        if (distance < minDistance) {
            const nx = dx / distance;
            const ny = dy / distance;

            const relativeVelocityX = this.moveXSpeed - other.moveXSpeed;
            const relativeVelocityY = this.moveYSpeed - other.moveYSpeed;
            const dotProduct = relativeVelocityX * nx + relativeVelocityY * ny;

            if (dotProduct < 0) {
                const impulse = (2 * dotProduct) / (1 + 1);
                this.moveXSpeed -= impulse * nx;
                this.moveYSpeed -= impulse * ny;
                other.moveXSpeed += impulse * nx;
                other.moveYSpeed += impulse * ny;
            }

            const overlap = minDistance - distance;
            const separationX = nx * overlap * OVERLAP_SEPARATION_FACTOR;
            const separationY = ny * overlap * OVERLAP_SEPARATION_FACTOR;

            this.x += (separationX / viewportWidth * 100);
            this.y += (separationY / viewportHeight * 100);
            other.x -= (separationX / viewportWidth * 100);
            other.y -= (separationY / viewportHeight * 100);
            other.handleBoundaryCollisions();
        }
    }

     handleCollisions() {
        const neighbors = getNeighbors(this);

        for (const other of neighbors) {
            if (other === this) continue;
             if (other instanceof BouncingCircle) {
                this.handleCircleCollision(other);
            }
           else if (other instanceof Circle) {
                this.handleCircleCollision(other);
            }
        }
    }
}

// --- Helper Functions ---

function random(min, max) {
    return Math.random() * (max - min) + min;
}

// --- Grid-based Spatial Partitioning ---

function clearGrid() {
    grid = {};
}

function addToGrid(item) {
    item.updateGridPosition();
    const { gridX, gridY } = item;
    if (!grid[gridX]) {
        grid[gridX] = {};
    }
    if (!grid[gridX][gridY]) {
        grid[gridX][gridY] = [];
    }
    grid[gridX][gridY].push(item);
}

function updateGrid(item) {
    removeFromGrid(item);
    addToGrid(item);
}

function removeFromGrid(item) {
    const { gridX, gridY } = item;
    if (grid[gridX] && grid[gridX][gridY]) {
        grid[gridX][gridY] = grid[gridX][gridY].filter(other => other !== item);
        if (grid[gridX][gridY].length === 0) {
            delete grid[gridX][gridY];
            if (Object.keys(grid[gridX]).length === 0) {
                delete grid[gridX];
            }
        }
    }
}

function getNeighbors(item) {
    const { gridX, gridY } = item;
    const neighbors = [];
    for (let x = Math.max(0, gridX - 1); x <= gridX + 1; x++) {
        for (let y = Math.max(0, gridY - 1); y <= gridY + 1; y++) {
            if (grid[x] && grid[x][y]) {
                neighbors.push(...grid[x][y]);
            }
        }
    }
    return neighbors;
}

// --- Animation Control ---
function chooseReactiveCircles() {
    for (const circle of circles) {
        circle.isReactive = false;
    }
    const numReactive = Math.floor(NUM_CIRCLES * REACTIVE_PERCENTAGE);
    for (let i = 0; i < numReactive; i++) {
        const randomIndex = Math.floor(Math.random() * circles.length);
        if (!circles[randomIndex].isReactive) {
            circles[randomIndex].isReactive = true;
            circles[randomIndex].reactiveUntil = Date.now() + REACTIVE_DURATION;
        }
    }
}

function startAnimation() {
    if (animationRunning) return;
    animationRunning = true;
    controlButton.textContent = 'Stop Animation';
    for (const circle of circles) {
        circle.update();
    }
     for (const bCircle of bouncingCircles) {
        bCircle.update();
    }
    if (linkedinButton) linkedinButton.update();
    if (githubButton) githubButton.update();
    intervalId = setInterval(chooseReactiveCircles, REACTIVE_DURATION);
}

function stopAnimation() {
    if (!animationRunning) return;
    animationRunning = false;
    controlButton.textContent = 'Start Animation';
    clearInterval(intervalId);
}

// --- Main Animation Loop ---

function animateCircles() {
    if (!viewportWidth || !viewportHeight) return;

    animationContainer.innerHTML = '';
    circles = [];
    bouncingCircles = []; // Clear bouncing circles
    clearGrid();

    const smallerDimension = Math.min(viewportWidth, viewportHeight);
    const minCircleSize = smallerDimension * MIN_SIZE_PERCENTAGE;
    const maxCircleSize = smallerDimension * MAX_SIZE_PERCENTAGE;
    const adjustedMinCircleSize = Math.max(minCircleSize, ABSOLUTE_MIN_SIZE);

    for (let i = 0; i < NUM_CIRCLES - NUM_BOUNCING_CIRCLES; i++) {
        const size = random(adjustedMinCircleSize, maxCircleSize);
        const x = random(0, 100 - (size / viewportWidth * 100));
        const y = random(0, 100 - (size / viewportHeight * 100));
        const moveXSpeed = random(-ANIMATION_SPEED, ANIMATION_SPEED) * SPEED_RANDOMNESS_FACTOR;
        const moveYSpeed = random(-ANIMATION_SPEED, ANIMATION_SPEED) * SPEED_RANDOMNESS_FACTOR;
        const hue = random(180, 240);
        const circle = new Circle(x, y, size, moveXSpeed, moveYSpeed, hue);
        circles.push(circle);
        addToGrid(circle);
    }

    // Create bouncing circles
    for (let i = 0; i < NUM_BOUNCING_CIRCLES; i++) {
        const x = random(0, 100 - (BOUNCING_CIRCLE_SIZE / viewportWidth * 100));
        const y = random(0, 100 - (BOUNCING_CIRCLE_SIZE / viewportHeight * 100));
        const moveXSpeed = random(-1, 1) * CIRCLE_SPEED;
        const moveYSpeed = random(-1, 1) * CIRCLE_SPEED;
        const hue = random(0, 360); // Different hue range for distinction
        const bCircle = new BouncingCircle(x, y, BOUNCING_CIRCLE_SIZE, moveXSpeed, moveYSpeed, hue);
        bouncingCircles.push(bCircle);
        addToGrid(bCircle);
    }

    // Ensure social buttons don't spawn too close to the edges
    if (!linkedinButton) {
        const linkedinX = random(SOCIAL_BUTTON_MARGIN / viewportWidth * 100, 100 - (SOCIAL_BUTTON_MARGIN / viewportWidth * 100));
        const linkedinY = random(SOCIAL_BUTTON_MARGIN / viewportHeight * 100, 100 - (SOCIAL_BUTTON_MARGIN / viewportHeight * 100));
        linkedinButton = new SocialButton(
            linkedinX,
            linkedinY,
            SOCIAL_BUTTON_SIZE,
            random(-1, 1) * BUTTON_SPEED,
            random(-1, 1) * BUTTON_SPEED,
            'https://www.linkedin.com/in/jozsefkecskesi/',
            "img/linkedin.png",
            "LinkedIn"
        );
        addToGrid(linkedinButton);
    }

    if (!githubButton) {
        const githubX = random(SOCIAL_BUTTON_MARGIN / viewportWidth * 100, 100 - (SOCIAL_BUTTON_MARGIN / viewportWidth * 100));
        const githubY = random(SOCIAL_BUTTON_MARGIN / viewportHeight * 100, 100 - (SOCIAL_BUTTON_MARGIN / viewportHeight * 100));
        githubButton = new SocialButton(
            githubX,
            githubY,
            SOCIAL_BUTTON_SIZE,
            random(-1, 1) * BUTTON_SPEED,
            random(-1, 1) * BUTTON_SPEED,
            'https://github.com/jozsefKecskesi',
            "img/github.png",
            "GitHub"
        );
        addToGrid(githubButton);
    }

    chooseReactiveCircles();
    //if (animationRunning) startAnimation(); //remove if statement
    startAnimation(); //call it unconditionally to start on load.
}

// --- Event Listeners ---

controlButton.addEventListener('click', () => {
    animationRunning ? stopAnimation() : startAnimation();
});

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

document.addEventListener('mouseleave', () => {
    mouseX = -MOUSE_INFLUENCE_RADIUS * 2;
    mouseY = -MOUSE_INFLUENCE_RADIUS * 2;
});

window.addEventListener('resize', () => {
    viewportWidth = window.innerWidth; // Update cached dimensions
    viewportHeight = window.innerHeight;
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (animationRunning) {
            stopAnimation();
            animateCircles();
        }
    }, RESIZE_DEBOUNCE_TIME);
});

// --- Initialization ---
animateCircles();