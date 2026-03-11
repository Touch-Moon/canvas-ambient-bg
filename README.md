# Canvas Ambient Background

Apple Podcasts "Now Playing" background effect — Canvas 2D API implementation.

![demo](sample.jpg)

## How It Works

| Step | Description |
|------|-------------|
| **Canvas** | Copies the artwork image into 4 sprites, each rotating at a different position and speed |
| **CSS filter** | `blur(60px) saturate(2.75) brightness(0.7) contrast(1.9)` — values reverse-engineered from Apple Podcasts source |
| **Scrim** | `rgba(0,0,0,0.38)` overlay for readability |
| **Reduced motion** | Rotation stops when `prefers-reduced-motion: reduce` is detected |

## File Structure

```
canvas-ambient-bg/
  ambient-canvas.js   ← core class (framework-agnostic)
  index.html          ← demo (swap image via URL input)
  sample.jpg          ← sample artwork
```

## Usage

### Vanilla JS (ES Module)

```html
<canvas id="canvas" style="
  position:fixed; inset:0; width:100%; height:100%;
  filter: blur(60px) saturate(2.75) brightness(0.7) contrast(1.9);
  transform: scale(1.08);
"></canvas>

<script type="module">
  import { AmbientCanvas } from './ambient-canvas.js';

  const ac = new AmbientCanvas(document.getElementById('canvas'));
  ac.load('artwork.jpg');

  // stop / resume
  ac.stop();
  ac.start();

  // swap image
  ac.load('new-artwork.jpg');

  // cleanup
  ac.destroy();
</script>
```

### React (useEffect)

```tsx
useEffect(() => {
  const ac = new AmbientCanvas(canvasRef.current!);
  ac.load(artworkSrc);
  return () => ac.destroy();
}, [artworkSrc]);
```

## CSS Filter Values — Source

Extracted directly from Apple Podcasts source (`scene~7b5c360cee.js`):

```js
// ColorMatrixFilter
c.saturation = 2.75
c.brightness  = 0.7
c.contrast    = 1.9

// BlurFilter × 5 (5 / 10 / 20 / 40 / 80px) → approximated as CSS blur(60px)
// ZoomBlur (angle: -3.25, radius: 900) → original uses PixiJS WebGL
```

The original uses PixiJS + WebGL; this implementation achieves an equivalent visual result using Canvas 2D + CSS filter.

## Run the Demo

```bash
# Requires a local server (ES Module)
npx serve .
# → http://localhost:3000
```
