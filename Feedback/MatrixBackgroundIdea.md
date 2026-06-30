Here is the exact implementation description and structured technical requirement to add to your website change document, followed by a lightweight, high-performance code template you can drop straight into your project.

---

### **DOCUMENT ADDENDUM: FULL-SCREEN MATRIX BACKGROUND SPECIFICATION**

* **Visual Behavior:** A subtle, low-opacity digital rain texture that cascades infinitely behind the UI layers.


* **Layering Hierarchy ($z$-index):**
* `z-index: -1` $\rightarrow$ Canvas Background Layer (The Matrix Rain)
* `z-index: 1` $\rightarrow$ Foreground Interface Layer (Story Blocks, Code Windows, Terminals)




* **Aesthetic Constraints:**
* **Opacity:** Locked between $5\%$ and $8\%$ to prevent visual noise and protect text readability.


* **Color Profile:** Primary theme green (`#00ff66` or matching your current UI accent color) fading smoothly into absolute black (`#0d1117` or your current layout background).


* **Card Styling:** Foreground interface containers (`image_545621.png`, `image_545df7.png`, `image_545e18.png`) must utilize a semi-transparent background combined with a CSS backdrop blur to stand out sharply against the moving environment text.





---

### **THE CODING IMPLEMENTATION PIPELINE**

You can implement this with standard HTML5, CSS, and vanilla JavaScript. It dynamically calculates screen size and handles resizing automatically without lagging the browser.

#### **1. HTML Structure**

Place this canvas element at the very top of your `<body>` tag, completely outside your main layout wrappers.

```html
<canvas id="matrix-bg"></canvas>

```

#### **2. CSS Layering & Glassmorphism**

This ensures the canvas stays locked in the background while your actual portfolio cards stay highly readable.

```css
/* Fixes the canvas to the viewport behind all content */
#matrix-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  background-color: #0d1117; /* Match your existing theme background */
  opacity: 0.06; /* Keeps it subtle so recruiters can read the text */
  pointer-events: none; /* Allows users to click through to elements beneath */
}

/* Update your existing card styles (Story Blocks, Terminals) to look incredible over it */
.story-block-card {
  background: rgba(22, 27, 34, 0.8); /* Semi-transparent background */
  backdrop-filter: blur(8px); /* Frosty glass effect over the falling code */
  border: 1px solid rgba(240, 246, 252, 0.1);
}

```

#### **3. Lightweight Vanilla JavaScript Engine**

Add this script before your closing `</body>` tag. It uses a clean calculation grid based on font size to render the streams efficiently.

```javascript
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

// Handle responsive window sizing
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Configuration
const katakana = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const alphabet = katakana.split('');
const fontSize = 16;

// Determine columns based on screen width
let columns = canvas.width / fontSize;
let rainDrops = Array(Math.floor(columns)).fill(1);

function draw() {
    // Subtle trailing fade to create the falling stream effect
    ctx.fillStyle = 'rgba(13, 17, 23, 0.05)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Terminal green stream color
    ctx.fillStyle = '#00ff66'; 
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < rainDrops.length; i++) {
        // Pick a random matrix character
        const text = alphabet[Math.floor(Math.random() * alphabet.length)];
        
        // Render character
        const x = i * fontSize;
        const y = rainDrops[i] * fontSize;
        ctx.fillText(text, x, y);

        // Reset drop position to top with a randomized delay once it hits screen bottom
        if (y > canvas.height && Math.random() > 0.975) {
            rainDrops[i] = 0;
        }
        rainDrops[i]++;
    }
}

// Set continuous loop (roughly 30 frames per second for ultra-smooth performance)
setInterval(draw, 33);

```