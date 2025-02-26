const animationContainer = document.getElementById('animation-container');
const controlButton = document.getElementById('control-button');

// --- Constants ---
const SOCIAL_BUTTON_SIZE = 100;
const BASE_BUTTON_SPEED = 0.3; // Base speed
const BUTTON_SPEED_RANGE = 0.1; // Range around the base speed
const BUTTON_BOUNDARY_RANDOMNESS = 0.05; // Further reduced randomness for more stability
const OVERLAP_SEPARATION_FACTOR = 0.4;
const COLLISION_DAMPING = 0.85; // Increased damping for more energy loss
const MIN_SPEED = 0.2; // Minimum speed after collision
const MAX_SPEED = 0.5; // Maximum speed after collision

let animationRunning = false;
let linkedinButton = null;
let githubButton = null;
let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;
let animationFrameId = null; // Changed from intervalId

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
        this.updatePosition();
        animationContainer.appendChild(this.element);
    }

    updatePosition() {
        this.element.style.left = `${this.x}vw`;
        this.element.style.top = `${this.y}vh`;
    }

    update() {
        this.handleBoundaryCollisions();
        this.handleCollisions();
        this.x += this.moveXSpeed;
        this.y += this.moveYSpeed;
        this.updatePosition();

        if (animationRunning) {
            animationFrameId = requestAnimationFrame(() => this.update()); // Use requestAnimationFrame
        }
    }

    handleBoundaryCollisions() {
        if (this.x < 0 || this.x > 100 - (this.size / viewportWidth * 100)) {
            this.moveXSpeed = -this.moveXSpeed + random(-BUTTON_BOUNDARY_RANDOMNESS, BUTTON_BOUNDARY_RANDOMNESS);
            this.moveXSpeed *= COLLISION_DAMPING;
            this.maintainSpeed();
        }
        if (this.y < 0 || this.y > 100 - (this.size / viewportHeight * 100)) {
            this.moveYSpeed = -this.moveYSpeed + random(-BUTTON_BOUNDARY_RANDOMNESS, BUTTON_BOUNDARY_RANDOMNESS);
            this.moveYSpeed *= COLLISION_DAMPING;
            this.maintainSpeed();
        }

        this.x = Math.max(0, Math.min(100 - (this.size / viewportWidth * 100), this.x));
        this.y = Math.max(0, Math.min(100 - (this.size / viewportHeight * 100), this.y));
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

            const relativeVelocityX = this.moveXSpeed - other.moveXSpeed;
            const relativeVelocityY = this.moveYSpeed - other.moveYSpeed;
            const dotProduct = relativeVelocityX * nx + relativeVelocityY * ny;

            if (dotProduct < 0) {
                const impulse = (2 * dotProduct) / (1 + 1);
                this.moveXSpeed -= impulse * nx;
                this.moveYSpeed -= impulse * ny;
                other.moveXSpeed += impulse * nx;
                other.moveYSpeed += impulse * ny;

                this.moveXSpeed *= COLLISION_DAMPING; // Apply damping
                this.moveYSpeed *= COLLISION_DAMPING; // Apply damping
                other.moveXSpeed *= COLLISION_DAMPING;
                other.moveYSpeed *= COLLISION_DAMPING;

                this.maintainSpeed();
                other.maintainSpeed();

            }

            const overlap = minDistance - distance;
            const separationX = nx * overlap * OVERLAP_SEPARATION_FACTOR;
            const separationY = ny * overlap * OVERLAP_SEPARATION_FACTOR;

            this.x -= (separationX / viewportWidth * 100);
            this.y -= (separationY / viewportHeight * 100);
            other.x += (separationX / viewportWidth * 100);
            other.y += (separationY / viewportHeight * 100);
        }
    }

    handleCollisions() {
        if (linkedinButton && this !== linkedinButton) {
            this.handleButtonCollision(linkedinButton);
        }
        if (githubButton && this !== githubButton) {
            this.handleButtonCollision(githubButton);
        }
    }

    maintainSpeed() {
        const currentSpeed = Math.sqrt(this.moveXSpeed * this.moveXSpeed + this.moveYSpeed * this.moveYSpeed);

        if (currentSpeed < MIN_SPEED) {
            const scaleFactor = MIN_SPEED / currentSpeed;
            this.moveXSpeed *= scaleFactor;
            this.moveYSpeed *= scaleFactor;
        } else if (currentSpeed > MAX_SPEED) {
            const scaleFactor = MAX_SPEED / currentSpeed;
            this.moveXSpeed *= scaleFactor;
            this.moveYSpeed *= scaleFactor;
        }

        // Another possible alternative
        /*
        const currentSpeed = Math.sqrt(this.moveXSpeed * this.moveXSpeed + this.moveYSpeed * this.moveYSpeed);
        let targetSpeed = BASE_BUTTON_SPEED;

        if (currentSpeed < targetSpeed) {
            const scaleFactor = targetSpeed / currentSpeed;
            this.moveXSpeed *= scaleFactor;
            this.moveYSpeed *= scaleFactor;
        }
        */
    }
}

// --- Helper Functions ---

function random(min, max) {
    return Math.random() * (max - min) + min;
}

// --- Animation Control ---

function startAnimation() {
    if (animationRunning) return;
    animationRunning = true;
    controlButton.textContent = 'Stop Animation';
    linkedinButton.update();
    githubButton.update();

}

function stopAnimation() {
    if (!animationRunning) return;
    animationRunning = false;
    controlButton.textContent = 'Start Animation';
    cancelAnimationFrame(animationFrameId); // Use cancelAnimationFrame
}

// --- Main Animation Loop ---

function animateButtons() {
    animationContainer.innerHTML = '';

    const buttonSize = SOCIAL_BUTTON_SIZE; // Use consistent size
    const minX = buttonSize / viewportWidth * 100;
    const minY = buttonSize / viewportHeight * 100;
    const maxX = 100 - minX;
    const maxY = 100 - minY;

    // Initial positions (avoid overlap)
    const linkedinX = random(minX, maxX / 2 - 5);
    const linkedinY = random(minY, maxY);
    const githubX = random(maxX / 2 + 5, maxX);
    const githubY = random(minY, maxY);

    // Create the buttons
    linkedinButton = new SocialButton(
        linkedinX,
        linkedinY,
        buttonSize,
        random(-1, 1) * BASE_BUTTON_SPEED,
        random(-1, 1) * BASE_BUTTON_SPEED,
        'https://www.linkedin.com/in/jozsefkecskesi/',
        "img/linkedin.png",
        "LinkedIn"
    );

    githubButton = new SocialButton(
        githubX,
        githubY,
        buttonSize,
        random(-1, 1) * BASE_BUTTON_SPEED,
        random(-1, 1) * BASE_BUTTON_SPEED,
        'https://github.com/jozsefKecskesi',
        "img/github.png",
        "GitHub"
    );
}

// --- Event Listeners ---

controlButton.addEventListener('click', () => {
    animationRunning ? stopAnimation() : startAnimation();
});

window.addEventListener('resize', () => {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    stopAnimation();
    animateButtons();
    startAnimation();
});

// --- Initialization ---
animateButtons();
startAnimation();