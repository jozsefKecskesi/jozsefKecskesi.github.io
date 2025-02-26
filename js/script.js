const animationContainer = document.getElementById('animation-container');

// --- Constants ---
const SOCIAL_BUTTON_SIZE = 100;
const BASE_BUTTON_SPEED = 0.3;
const BUTTON_BOUNDARY_RANDOMNESS = 0.05;
const OVERLAP_SEPARATION_FACTOR = 0.4;
const COLLISION_DAMPING = 0.85;
const MIN_SPEED = 0.2;
const MAX_SPEED = 0.5;

let animationRunning = true;
let linkedinButton = null;
let githubButton = null;
let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;
let animationFrameId = null;

// --- Welcome Textbox ---
let welcomeTextbox = document.getElementById('welcome-textbox');
let textboxWidth = 300;  //Fixed px size from css
let textboxHeight = welcomeTextbox.offsetHeight; //Get dynamically

let textboxX = viewportWidth / 2 - textboxWidth / 2; //Initial horizontal center position
let textboxY = viewportHeight / 2 - textboxHeight / 2; //Initial vertical center position

let textboxMoveXSpeed = 0.05; // Very slow speed
let textboxMoveYSpeed = 0.03; // Very slow speed
const TEXTBOX_BOUNDARY_MARGIN = 50;  //Pixels away from edge

// Set initial position
welcomeTextbox.style.left = textboxX + 'px';
welcomeTextbox.style.top = textboxY + 'px';


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

        // Add event listeners for hover/touch
        this.element.addEventListener('mouseover', this.stopMovement.bind(this));
        this.element.addEventListener('mouseout', this.startMovement.bind(this));
        this.element.addEventListener('touchstart', this.stopMovement.bind(this));
        this.element.addEventListener('touchend', this.startMovement.bind(this));

        this.isHovered = false;
    }

    updatePosition() {
        this.element.style.left = `${this.x}vw`;
        this.element.style.top = `${this.y}vh`;
    }

    update() {
        if (!this.isHovered) {
            this.handleBoundaryCollisions();
            this.handleCollisions();
            this.x += this.moveXSpeed;
            this.y += this.moveYSpeed;
        }
        this.updatePosition();

        if (animationRunning) {
            animationFrameId = requestAnimationFrame(() => this.update());
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
        // (Collision logic from previous example remains largely the same)
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

                this.moveXSpeed *= COLLISION_DAMPING;
                this.moveYSpeed *= COLLISION_DAMPING;
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

        // Collision with textbox
        const currentLeftPx = this.x / 100 * viewportWidth;
        const currentTopPx = this.y / 100 * viewportHeight;

        const dx = textboxX + textboxWidth/2 - currentLeftPx;
        const dy = textboxY + textboxHeight/2 - currentTopPx;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (this.size / 2) + (Math.min(textboxWidth, textboxHeight) / 2); //Approximate with circle

        if (distance < minDistance) {
            //Basic collision handling
            const nx = dx / distance;
            const ny = dy / distance;
            const dotProduct = this.moveXSpeed * nx + this.moveYSpeed * ny;

            this.moveXSpeed -= 2 * dotProduct * nx;
            this.moveYSpeed -= 2 * dotProduct * ny;

            this.moveXSpeed *= COLLISION_DAMPING;
            this.moveYSpeed *= COLLISION_DAMPING;

            this.maintainSpeed();

            //Simple overlap resolution
            this.x -= (nx * (minDistance - distance) / viewportWidth * 100);
            this.y -= (ny * (minDistance - distance) / viewportHeight * 100);
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
    }

    stopMovement() {
        this.isHovered = true;
    }

    startMovement() {
        this.isHovered = false;
    }
}

// --- Helper Functions ---
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// --- Animation Control ---
function stopAnimation() {
    if (!animationRunning) return;
    animationRunning = false;
    cancelAnimationFrame(animationFrameId);
}

function startAnimation() {
    if (animationRunning) return;
    animationRunning = true;
    linkedinButton.update();
    githubButton.update();
    updateTextboxPosition(); // Start updating textbox
}

// --- Main Animation Loop ---
function animateButtons() {
    animationContainer.innerHTML = '';

    const buttonSize = SOCIAL_BUTTON_SIZE;
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

//Textbox movement and edge bouncing

function updateTextboxPosition() {
    // Move the textbox
    textboxX += textboxMoveXSpeed;
    textboxY += textboxMoveYSpeed;


    // Handle boundary collisions
    if (textboxX < TEXTBOX_BOUNDARY_MARGIN) {
        textboxMoveXSpeed = Math.abs(textboxMoveXSpeed);  // Reverse direction
        textboxX = TEXTBOX_BOUNDARY_MARGIN;
    }
    if (textboxX + textboxWidth > viewportWidth - TEXTBOX_BOUNDARY_MARGIN) {
        textboxMoveXSpeed = -Math.abs(textboxMoveXSpeed); // Reverse direction
        textboxX = viewportWidth - textboxWidth - TEXTBOX_BOUNDARY_MARGIN;
    }
    if (textboxY < TEXTBOX_BOUNDARY_MARGIN) {
        textboxMoveYSpeed = Math.abs(textboxMoveYSpeed);  // Reverse direction
        textboxY = TEXTBOX_BOUNDARY_MARGIN;
    }
    if (textboxY + textboxHeight > viewportHeight - TEXTBOX_BOUNDARY_MARGIN) {
        textboxMoveYSpeed = -Math.abs(textboxMoveYSpeed); // Reverse direction
        textboxY = viewportHeight - textboxHeight - TEXTBOX_BOUNDARY_MARGIN;
    }

    // Update textbox position
    welcomeTextbox.style.left = textboxX + 'px';
    welcomeTextbox.style.top = textboxY + 'px';

    if (animationRunning) {
        requestAnimationFrame(updateTextboxPosition);
    }
}


// --- Event Listeners ---
window.addEventListener('resize', () => {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    stopAnimation();
    animateButtons();
    textboxX = viewportWidth / 2 - textboxWidth / 2; //Reset position
    textboxY = viewportHeight / 2 - textboxHeight / 2;
    welcomeTextbox.style.left = textboxX + 'px';
    welcomeTextbox.style.top = textboxY + 'px';
    startAnimation();
});

// --- Initialization ---
animateButtons();
startAnimation();