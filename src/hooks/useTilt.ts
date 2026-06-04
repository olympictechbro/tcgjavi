import { useRef, useCallback } from 'react';

export function useTilt(maxDeg = 14) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -maxDeg;
    const rotY = ((x - cx) / cx) * maxDeg;

    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.06,1.06,1.06)`;
    el.style.boxShadow = `
      ${-rotY * 0.8}px ${rotX * 0.8}px 30px rgba(0,204,68,0.25),
      0 20px 40px rgba(0,0,0,0.6)
    `;

    // Shine position
    const shineEl = el.querySelector('.card-shine') as HTMLElement | null;
    if (shineEl) {
      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;
      shineEl.style.setProperty('--shine-x', `${px}%`);
      shineEl.style.setProperty('--shine-y', `${py}%`);
    }
  }, [maxDeg]);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    el.style.boxShadow = '';
    el.style.transition = 'transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease';
    setTimeout(() => { if (el) el.style.transition = ''; }, 400);
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
