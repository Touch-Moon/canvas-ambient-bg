# Canvas Ambient Background

Apple Podcasts "Now Playing" 배경 효과 — Canvas 2D API 구현체.

![demo](sample.jpg)

## 동작 원리

| 단계 | 설명 |
|------|------|
| **Canvas** | 아트워크 이미지를 4개 스프라이트로 복사해 각각 다른 위치·속도로 회전 |
| **CSS filter** | `blur(60px) saturate(2.75) brightness(0.7) contrast(1.9)` — Apple Podcasts 소스 실측값 |
| **Scrim** | `rgba(0,0,0,0.38)` 오버레이로 가독성 확보 |
| **Reduced motion** | `prefers-reduced-motion: reduce` 감지 시 회전 정지 |

## 파일 구조

```
canvas-ambient-bg/
  ambient-canvas.js   ← 핵심 클래스 (프레임워크 독립)
  index.html          ← 데모 (URL 입력으로 이미지 교체 가능)
  sample.jpg          ← 샘플 아트워크
```

## 사용법

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

  // 정지 / 재개
  ac.stop();
  ac.start();

  // 이미지 교체
  ac.load('new-artwork.jpg');

  // 컴포넌트 제거 시
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

## CSS filter 값 출처

Apple Podcasts 소스(`scene~7b5c360cee.js`)에서 직접 추출:

```js
// ColorMatrixFilter
c.saturation = 2.75
c.brightness  = 0.7
c.contrast    = 1.9

// BlurFilter × 5 (5 / 10 / 20 / 40 / 80px) → CSS blur(60px)으로 근사
// ZoomBlur (angle: -3.25, radius: 900) → 원본은 PixiJS WebGL 사용
```

원본은 PixiJS + WebGL이지만 이 구현은 Canvas 2D + CSS filter로 동등한 시각 효과를 냅니다.

## 데모 실행

```bash
# 로컬 서버가 필요합니다 (ES Module 사용)
npx serve .
# → http://localhost:3000
```
