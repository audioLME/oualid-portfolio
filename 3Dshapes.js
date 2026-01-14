// 3D room grid setup (viewport adaptive)
(function() {
  let isInitialized = false;

  function addLines(plane, width, height, spacing) {
    for (let x = -width / 2; x <= width / 2; x += spacing) {
      const line = document.createElement('div');
      line.className = 'grid-line vertical';
      line.style.left = `${(width / 2) + x}px`;
      line.style.top = '0';
      plane.appendChild(line);
    }

    for (let y = -height / 2; y <= height / 2; y += spacing) {
      const line = document.createElement('div');
      line.className = 'grid-line horizontal';
      line.style.top = `${(height / 2) + y}px`;
      line.style.left = '0';
      plane.appendChild(line);
    }
  }

  function buildRoom(skipAnimation) {
    const container = document.getElementById('grid-container');
    if (!container) return;
    container.innerHTML = '';

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const roomWidth = vw * 1.25;
    const roomDepth = vw * 1.25;
    const roomHeight = vh * 0.85;
    const spacing = Math.max(42, Math.min(96, Math.min(vw, vh) / 10));

    const planes = [
      { cls: 'floor',   w: roomWidth, h: roomDepth,  transform: `translate3d(-50%, -50%, 0) translateY(${roomHeight / 2}px) rotateX(90deg)` },
      { cls: 'ceiling', w: roomWidth, h: roomDepth,  transform: `translate3d(-50%, -50%, 0) translateY(${-roomHeight / 2}px) rotateX(-90deg)` },
      { cls: 'wall wall-left',  w: roomDepth, h: roomHeight, transform: `translate3d(-50%, -50%, 0) translateX(${-roomWidth / 2}px) rotateY(90deg)` },
      { cls: 'wall wall-right', w: roomDepth, h: roomHeight, transform: `translate3d(-50%, -50%, 0) translateX(${roomWidth / 2}px) rotateY(-90deg)` },
      { cls: 'wall wall-back',  w: roomWidth, h: roomHeight, transform: `translate3d(-50%, -50%, ${-roomDepth / 2}px)` }
    ];

    planes.forEach(cfg => {
      const plane = document.createElement('div');
      plane.className = `grid-plane ${cfg.cls}`;
      plane.style.width = `${cfg.w}px`;
      plane.style.height = `${cfg.h}px`;
      plane.style.transform = cfg.transform;
      addLines(plane, cfg.w, cfg.h, spacing);
      
      // On resize, show immediately without animation
      if (skipAnimation) {
        plane.style.opacity = '1';
      }
      
      container.appendChild(plane);
    });
  }

  function init() {
    buildRoom(false);
    isInitialized = true;

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => buildRoom(true), 200);
    });
  }

  window.init3DRoomGrid = init;
})();
