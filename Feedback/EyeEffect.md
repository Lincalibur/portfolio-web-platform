That is a beautiful piece of creative coding! The interactive ASCII eye effect created by Christopher Akroyd is achieved through a mix of a monospace text grid, trigonometry, and distance-based rendering.

Here is exactly how this effect is built behind the scenes:

### 1. The Monospace Text Grid

The entire canvas is just a large block of text—a grid consisting of fixed rows and columns (e.g., 80 characters wide by 40 rows deep).

* A **monospace font** is strictly required so that every single character (whether it's an `M`, an `@`, or a `.`) occupies the exact same width and height. This prevents the eye shape from distorting as the characters change or move.
* The grid is constantly re-rendered (often at 60 frames per second using JavaScript's `requestAnimationFrame`).

### 2. Tracking the Mouse & Calculating the Pupil

To make the eye "look" at your cursor, the script needs to know where the eye's center is and where your mouse is.

* **The Angle:** The script calculates the angle from the center of the eye to the cursor using the arc tangent function:

$$\theta = \text{atan2}(\Delta y, \Delta x)$$


* **The Distance:** It calculates how far the mouse is from the eye center.
* **The Constraint:** The pupil can't just fly out of the eye socket to touch your cursor. The code clamps the pupil's offset to a **maximum radius** (the `Pupil Radius: 65` setting mentioned on his site). If the mouse goes further than that, the pupil stays pinned to the edge of its allowed boundary.

### 3. Rendering via Distance Math

Every single frame, the code loops through every single character coordinate $(x, y)$ in the grid and calculates two things:

1. **Is this coordinate inside the eye socket?** (Usually calculated using an ellipse equation to form the almond shape of the eyelid).
2. **How far is this coordinate from the *shifted* pupil center?**

Based on these distance checks, the script decides how to draw that specific character:

* **Background:** If the coordinate is outside the eye socket ellipse, it's rendered with very low opacity (almost invisible).
* **Sclera (The White of the Eye):** If it's inside the eye socket but far from the pupil, it's rendered with standard brightness.
* **The Pupil:** If the coordinate falls within a certain small radius of the moving pupil center, it's darkened or given a different set of characters to create the hollow iris/pupil effect.

### 4. Character Selection & Dynamic Noise

If you look closely at the image, the characters themselves aren't static—they are a constantly shifting soup of random letters and symbols.

* Instead of using a static image, the code generates random characters for the grid on every frame.
* The "shape" of the eye isn't drawn by moving the characters themselves, but rather by dynamically changing the **color/opacity** of the random characters that happen to be passing through that region of space at that exact millisecond.

---

### Want to try it yourself? (Simplified Blueprint)

If you wanted to recreate a basic version in JavaScript, your loop for each character position would look something like this:

```javascript
// Pseudo-code logic for a single frame loop
for (let y = 0; y < gridHeight; y++) {
  for (let x = 0; x < gridWidth; x++) {
    
    let distToPupil = getDistance(x, y, pupilX, pupilY);
    let insideEyelids = checkIfInsideEllipse(x, y);

    if (!insideEyelids) {
      printFaintCharacter(); // Background
    } else if (distToPupil < pupilRadius) {
      printDarkCharacter();  // Pupil / Iris
    } else {
      printBrightCharacter(); // Sclera (White of eye)
    }
  }
}

```

It’s an elegant illusion where the text itself never actually moves left or right; rather, a "wave" of brightness and darkness washes over a static grid of text based on where your mouse is pointing!