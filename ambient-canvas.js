/**
 * AmbientCanvas
 *
 * Renders podcast / album artwork onto a <canvas> as a slowly rotating
 * ambient background — based on the Apple Podcasts "Now Playing" effect.
 *
 * How it works
 * ────────────
 * 1. Draws 4 copies of the artwork at different offscreen positions & rotations.
 * 2. Each sprite rotates at its own speed (alternating CW / CCW).
 * 3. CSS filter on the <canvas> element handles blur + colour grading
 *    (values reverse-engineered from Apple Podcasts source):
 *      blur(60px) saturate(2.75) brightness(0.7) contrast(1.9)
 * 4. Respects `prefers-reduced-motion`.
 *
 * Usage
 * ─────
 *   import { AmbientCanvas } from './ambient-canvas.js';
 *
 *   const ac = new AmbientCanvas(document.querySelector('canvas'));
 *   ac.load('artwork.jpg');
 *
 *   // later…
 *   ac.destroy();
 */
export class AmbientCanvas {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.rafId  = null;
    this.img    = null;

    // 4 sprites: offset from centre (fraction of w/h) + individual rotation speed
    this.sprites = [
      { ox:  0,     oy:  0,    rot: 0,              speed:  0.004  },
      { ox:  0.35,  oy: -0.25, rot: Math.PI * 0.5,  speed: -0.003  },
      { ox: -0.25,  oy:  0.35, rot: Math.PI,         speed:  0.0035 },
      { ox:  0.2,   oy:  0.3,  rot: Math.PI * 1.5,  speed: -0.004  },
    ];

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this._draw   = this._draw.bind(this);
    this._resize = this._resize.bind(this);

    this.ro = new ResizeObserver(this._resize);
    this.ro.observe(canvas);
    this._resize();
  }

  /**
   * Load an image and start (or restart) the animation.
   * @param {string} src  URL or path to artwork
   * @returns {this}
   */
  load(src) {
    this.stop();
    this.img = new Image();
    this.img.crossOrigin = 'anonymous';
    this.img.src = src;
    this.img.onload = () => this.start();
    if (this.img.complete && this.img.naturalWidth > 0) this.start();
    return this;
  }

  /** Start / resume animation. */
  start() {
    this.stop();
    this.rafId = requestAnimationFrame(this._draw);
    return this;
  }

  /** Pause animation (keeps last frame visible). */
  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    return this;
  }

  /** Stop animation and disconnect ResizeObserver. */
  destroy() {
    this.stop();
    this.ro.disconnect();
  }

  // ── private ────────────────────────────────────────────────────────────────

  _resize() {
    this.canvas.width  = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  _draw() {
    const { canvas, ctx, img, sprites, reducedMotion } = this;
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    if (img && img.complete && img.naturalWidth > 0) {
      const size = Math.max(width, height) * 1.8;

      for (const sp of sprites) {
        const cx = width  * (0.5 + sp.ox);
        const cy = height * (0.5 + sp.oy);
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.translate(cx, cy);
        ctx.rotate(sp.rot);
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
        ctx.restore();
      }

      if (!reducedMotion) {
        for (const sp of sprites) sp.rot += sp.speed;
      }
    }

    this.rafId = requestAnimationFrame(this._draw);
  }
}
