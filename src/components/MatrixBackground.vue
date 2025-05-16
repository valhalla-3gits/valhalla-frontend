<template>
  <div class="matrix-background-container">
    <canvas ref="matrixCanvas" class="matrix-canvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

// Define a type for the canvas context for better type safety
type CanvasContext = CanvasRenderingContext2D | null;

export default defineComponent({
  name: 'MatrixBackground',

  data() {
    return {
      // Store interval ID for cleanup
      intervalId: null as number | null,
      // Store canvas context
      ctx: null as CanvasContext,
      // Store canvas dimensions
      canvasWidth: 0,
      canvasHeight: 0,
      // Store column positions
      ypos: [] as number[],
      cols: 0,
      // Store computed styles
      backgroundColor: '#050C05', // Default fallback
      textColor: '#01FF00',       // Default fallback
      fontFamily: 'monospace',    // Default fallback
      fontSize: '15pt',           // Keep font size configurable here or via prop if needed
      // Resize observer for handling window resize
      resizeObserver: null as ResizeObserver | null,
    };
  },

  mounted() {
    // Ensure canvas is available
    const canvas = this.$refs.matrixCanvas as HTMLCanvasElement;
    if (!canvas) {
      console.error('Matrix canvas element not found.');
      return;
    }
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) {
      console.error('Could not get 2D context for matrix canvas.');
      return;
    }

    // Get computed styles using global CSS variables
    this.fetchComputedStyles();

    // Initial setup
    this.setupCanvas();

    // Start the animation loop
    this.startAnimation();

    // Set up resize observer
    this.setupResizeObserver();
  },

  beforeUnmount() {
    // Clear the interval when the component is destroyed
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    // Disconnect the resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  },

  methods: {
    /**
     * Fetches the computed style values for CSS variables.
     */
    fetchComputedStyles() {
      if (!this.$el) return; // Ensure component element exists
      const computedStyles = getComputedStyle(this.$el);
      this.backgroundColor = computedStyles.getPropertyValue('--color-background-dark').trim() || this.backgroundColor;
      this.textColor = computedStyles.getPropertyValue('--color-primary-green').trim() || this.textColor;
      this.fontFamily = computedStyles.getPropertyValue('--font-family-monospace').trim() || this.fontFamily;
      // Note: We construct the RGBA for fading background and text color inside the draw method
    },

    /**
     * Sets up canvas dimensions, initial fill, and column positions.
     */
    setupCanvas() {
      const canvas = this.$refs.matrixCanvas as HTMLCanvasElement;
      const container = this.$el as HTMLElement; // Use component's root element
      if (!canvas || !this.ctx || !container) return;

      // Set canvas dimensions based on its container
      this.canvasWidth = canvas.width = container.offsetWidth;
      this.canvasHeight = canvas.height = container.offsetHeight;

      // Initial background fill using fetched variable
      this.ctx.fillStyle = this.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      // Calculate columns and initialize y positions
      this.cols = Math.floor(this.canvasWidth / 20) + 1; // Using 20px column width from original code
      this.ypos = Array(this.cols).fill(0);
    },

    /**
     * Draws a single frame of the matrix animation.
     */
    drawMatrix() {
      if (!this.ctx) return;

      // --- Fading Effect ---
      // Need to convert hex background to rgba for transparency
      // Basic hex to rgb conversion (can be made more robust)
      let r = 0, g = 0, b = 0;
      if (this.backgroundColor.startsWith('#')) {
        const bigint = parseInt(this.backgroundColor.slice(1), 16);
        r = (bigint >> 16) & 255;
        g = (bigint >> 8) & 255;
        b = bigint & 255;
      }
      // Draw semi-transparent background rectangle
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.10)`; // Alpha ~10% for fade
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      // --- Draw Characters ---
      // Set text color (using fetched variable) and font
      // Using fixed alpha from original code, adjust if needed
      this.ctx.fillStyle = this.textColor; // Apply alpha directly if needed: e.g., convert hex to rgba(r,g,b, 0.76)
      this.ctx.font = `${this.fontSize} ${this.fontFamily}`;

      // Define Rune character range (as in original code)
      const runeStart = 0x16A0;
      const runeEnd = 0x16F0;
      const rangeSize = runeEnd - runeStart + 1;

      // Draw a character in each column
      this.ypos.forEach((y, ind) => {
        const randomRuneCode = Math.floor(Math.random() * rangeSize) + runeStart;
        const text = String.fromCharCode(randomRuneCode);
        const x = ind * 20; // Column width 20px

        this.ctx!.fillText(text, x, y); // Use non-null assertion as ctx is checked

        // Move column down or reset randomly
        if (y > 100 + Math.random() * 10000) {
          this.ypos[ind] = 0;
        } else {
          this.ypos[ind] = y + 20; // Step size 20px
        }
      });
    },

    /**
     * Starts the animation interval.
     */
    startAnimation() {
      if (this.intervalId !== null) {
        clearInterval(this.intervalId); // Clear existing interval if any
      }
      // Using bind(this) or arrow function ensures 'this' context is correct
      this.intervalId = window.setInterval(this.drawMatrix, 50); // 50ms = 20 FPS
    },

    /**
     * Sets up a ResizeObserver to re-initialize the canvas on resize.
     */
    setupResizeObserver() {
      if (!this.$el) return;
      this.resizeObserver = new ResizeObserver(() => {
        // Debounce or throttle this if resize events are frequent/heavy
        this.setupCanvas();
        // Optionally restart animation immediately or let interval continue
        // If cols/ypos change significantly, restarting might be smoother
        // this.startAnimation(); // Uncomment if restart is desired
      });
      this.resizeObserver.observe(this.$el);
    }
  },
});
</script>

<style scoped>
.matrix-background-container {
  position: absolute; /* Or fixed, relative depending on layout needs */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* Hide anything exceeding the container */
  z-index: -1; /* Place it behind other content */
  background-color: var(--color-background-dark); /* Ensure container bg matches */
}

.matrix-canvas {
  display: block; /* Remove extra space below canvas */
  width: 100%;
  height: 100%;
}
</style>
