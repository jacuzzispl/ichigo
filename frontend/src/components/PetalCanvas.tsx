import React, { useEffect, useRef } from 'react';

interface PetalCanvasProps {
  density?: 'off' | 'subtle' | 'breeze' | 'blizzard';
}

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  flip: number;
  flipSpeed: number;
  opacity: number;
  color: string;
}

export const PetalCanvas: React.FC<PetalCanvasProps> = ({ density = 'subtle' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (density === 'off') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Count based on density
    const count = density === 'subtle' ? 18 : density === 'breeze' ? 36 : 70;

    const colors = [
      'rgba(255, 230, 235, ',
      'rgba(252, 215, 225, ',
      'rgba(247, 200, 215, ',
      'rgba(255, 240, 245, ',
      'rgba(235, 190, 205, ',
    ];

    const petals: Petal[] = [];
    for (let i = 0; i < count; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 6,
        speedX: Math.random() * 1.2 - 0.3,
        speedY: Math.random() * 1.1 + 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        flip: Math.random(),
        flipSpeed: Math.random() * 0.03 + 0.01,
        opacity: Math.random() * 0.5 + 0.25,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(Math.cos(p.flip), 1);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(p.size * 0.6, -p.size * 0.8, p.size * 1.1, -p.size * 0.3, p.size * 0.7, p.size * 0.6);
      ctx.bezierCurveTo(p.size * 0.4, p.size * 1.1, -p.size * 0.4, p.size * 1.1, -p.size * 0.7, p.size * 0.6);
      ctx.bezierCurveTo(-p.size * 1.1, -p.size * 0.3, -p.size * 0.6, -p.size * 0.8, 0, 0);
      ctx.fillStyle = `${p.color}${p.opacity})`;
      ctx.fill();

      // Delicate petal central vein / contour
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, p.size * 0.55);
      ctx.strokeStyle = `rgba(210, 150, 170, ${p.opacity * 0.4})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.x += p.speedX + Math.sin(p.y * 0.005) * 0.6;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.flip += p.flipSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) {
          p.x = -20;
        } else if (p.x < -20) {
          p.x = width + 20;
        }

        drawPetal(p);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density]);

  if (density === 'off') return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10 h-full w-full"
      aria-hidden="true"
    />
  );
};
