// Continuous infinite smooth line drawing - 3 parallel lines
const lines = [];
const MAX_POINTS_PER_LINE = 200; // Trail disappears after this many points
const FADE_START_POINT = 140; // Start fading out and dashing at this point count

function generateShapePoints(centerX, centerY, shapeType) {
  const size = 60 + Math.random() * 40;
  const points = [];
  
  if (shapeType === 'circle') {
    // Perfect circle with 120 points for smooth geometry
    for (let i = 0; i <= 120; i++) {
      const angle = (i / 120) * Math.PI * 2;
      points.push({
        x: centerX + Math.cos(angle) * size,
        y: centerY + Math.sin(angle) * size
      });
    }
  } else if (shapeType === 'rectangle') {
    const w = size * 1.3, h = size * 0.8;
    const cornerPoints = [
      [centerX - w/2, centerY - h/2],
      [centerX + w/2, centerY - h/2],
      [centerX + w/2, centerY + h/2],
      [centerX - w/2, centerY + h/2]
    ];
    
    // Draw each edge with interpolated points
    for (let i = 0; i < 4; i++) {
      const [x1, y1] = cornerPoints[i];
      const [x2, y2] = cornerPoints[(i + 1) % 4];
      const edgeSteps = 40;
      
      for (let j = 0; j < edgeSteps; j++) {
        const t = j / edgeSteps;
        points.push({
          x: x1 + (x2 - x1) * t,
          y: y1 + (y2 - y1) * t
        });
      }
    }
    // Close the rectangle
    points.push({
      x: centerX - w/2,
      y: centerY - h/2
    });
  } else if (shapeType === 'triangle') {
    const h = size * 1.2;
    const cornerPoints = [
      [centerX, centerY - h/2],
      [centerX + h/2, centerY + h/2],
      [centerX - h/2, centerY + h/2]
    ];
    
    // Draw each edge
    for (let i = 0; i < 3; i++) {
      const [x1, y1] = cornerPoints[i];
      const [x2, y2] = cornerPoints[(i + 1) % 3];
      const edgeSteps = 50;
      
      for (let j = 0; j < edgeSteps; j++) {
        const t = j / edgeSteps;
        points.push({
          x: x1 + (x2 - x1) * t,
          y: y1 + (y2 - y1) * t
        });
      }
    }
    // Close the triangle
    points.push({
      x: centerX,
      y: centerY - h/2
    });
  } else if (shapeType === 'square') {
    const half = size / 2;
    const cornerPoints = [
      [centerX - half, centerY - half],
      [centerX + half, centerY - half],
      [centerX + half, centerY + half],
      [centerX - half, centerY + half]
    ];
    
    // Draw each edge
    for (let i = 0; i < 4; i++) {
      const [x1, y1] = cornerPoints[i];
      const [x2, y2] = cornerPoints[(i + 1) % 4];
      const edgeSteps = 40;
      
      for (let j = 0; j < edgeSteps; j++) {
        const t = j / edgeSteps;
        points.push({
          x: x1 + (x2 - x1) * t,
          y: y1 + (y2 - y1) * t
        });
      }
    }
    // Close the square
    points.push({
      x: centerX - half,
      y: centerY - half
    });
  } else if (shapeType === 'trapezoid') {
    const topWidth = size * 0.6;
    const bottomWidth = size * 1.4;
    const height = size * 0.9;
    
    const cornerPoints = [
      [centerX - topWidth/2, centerY - height/2],
      [centerX + topWidth/2, centerY - height/2],
      [centerX + bottomWidth/2, centerY + height/2],
      [centerX - bottomWidth/2, centerY + height/2]
    ];
    
    // Draw each edge
    for (let i = 0; i < 4; i++) {
      const [x1, y1] = cornerPoints[i];
      const [x2, y2] = cornerPoints[(i + 1) % 4];
      const edgeSteps = 45;
      
      for (let j = 0; j < edgeSteps; j++) {
        const t = j / edgeSteps;
        points.push({
          x: x1 + (x2 - x1) * t,
          y: y1 + (y2 - y1) * t
        });
      }
    }
    // Close the trapezoid
    points.push({
      x: centerX - topWidth/2,
      y: centerY - height/2
    });
  } else if (shapeType === 'pentagon') {
    const cornerPoints = [];
    const numSides = 5;
    for (let i = 0; i < numSides; i++) {
      const angle = (i / numSides) * Math.PI * 2 - Math.PI / 2;
      cornerPoints.push([
        centerX + Math.cos(angle) * size,
        centerY + Math.sin(angle) * size
      ]);
    }
    
    // Draw each edge
    for (let i = 0; i < 5; i++) {
      const [x1, y1] = cornerPoints[i];
      const [x2, y2] = cornerPoints[(i + 1) % 5];
      const edgeSteps = 40;
      
      for (let j = 0; j < edgeSteps; j++) {
        const t = j / edgeSteps;
        points.push({
          x: x1 + (x2 - x1) * t,
          y: y1 + (y2 - y1) * t
        });
      }
    }
    // Close the pentagon
    const [x1, y1] = cornerPoints[0];
    points.push({ x: x1, y: y1 });
  }
  
  return points;
}

function startContinuousDrawing() {
  const svg = document.getElementById('shape-overlay');
  if (!svg) return;
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  const shapeTypes = ['circle', 'rectangle', 'triangle', 'square', 'trapezoid', 'pentagon'];
  
  // Create 3 independent lines
  for (let lineIdx = 0; lineIdx < 3; lineIdx++) {
    const line = {
      points: [],
      x: Math.random() * (width - 600) + 300,
      y: Math.random() * (height - 600) + 300,
      angle: Math.random() * Math.PI * 2,
      polyline: null,
      fadedPolyline: null,
      state: 'roaming',
      shapePoints: [],
      shapeIndex: 0,
      shapeStartCounter: Math.random() * 200 + 100
    };
    
    line.points.push({ x: line.x, y: line.y });
    
    // Create SVG polyline for solid main part
    line.polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    line.polyline.setAttribute('points', `${line.x},${line.y}`);
    line.polyline.setAttribute('stroke', 'rgba(0, 0, 0, 0.2)');
    line.polyline.setAttribute('stroke-width', '1.5');
    line.polyline.setAttribute('stroke-linecap', 'round');
    line.polyline.setAttribute('stroke-linejoin', 'round');
    line.polyline.setAttribute('fill', 'none');
    svg.appendChild(line.polyline);
    
    // Create separate SVG polyline for faded dashed part
    line.fadedPolyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    line.fadedPolyline.setAttribute('points', `${line.x},${line.y}`);
    line.fadedPolyline.setAttribute('stroke', 'rgba(0, 0, 0, 0.2)');
    line.fadedPolyline.setAttribute('stroke-width', '1.5');
    line.fadedPolyline.setAttribute('stroke-linecap', 'round');
    line.fadedPolyline.setAttribute('stroke-linejoin', 'round');
    line.fadedPolyline.setAttribute('fill', 'none');
    svg.appendChild(line.fadedPolyline);
    
    lines.push(line);
  }
  
  // Continuously update all 4 lines
  const drawLoop = setInterval(() => {
    lines.forEach(line => {
      if (line.state === 'roaming') {
        // Slight random angle change for organic curves
        line.angle += (Math.random() - 0.5) * 0.3;
        
        // Move forward with reduced speed
        const speed = 2.4 + Math.random() * 2.4;
        line.x += Math.cos(line.angle) * speed;
        line.y += Math.sin(line.angle) * speed;
        
        // Bounce off edges
        if (line.x < 50) line.angle = Math.PI - line.angle;
        if (line.x > width - 50) line.angle = Math.PI - line.angle;
        if (line.y < 50) line.angle = -line.angle;
        if (line.y > height - 50) line.angle = -line.angle;
        
        // Clamp to bounds
        line.x = Math.max(50, Math.min(width - 50, line.x));
        line.y = Math.max(50, Math.min(height - 50, line.y));
        
        // Randomly decide to start drawing a shape
        line.shapeStartCounter--;
        if (line.shapeStartCounter <= 0) {
          line.state = 'drawing_shape';
          const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
          line.shapePoints = generateShapePoints(line.x, line.y, shapeType);
          line.shapeIndex = 0;
          line.shapeStartCounter = Math.random() * 300 + 200;
        }
      } else if (line.state === 'drawing_shape') {
        // Follow shape points
        if (line.shapeIndex < line.shapePoints.length) {
          const target = line.shapePoints[line.shapeIndex];
          const dx = target.x - line.x;
          const dy = target.y - line.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 3) {
            line.angle = Math.atan2(dy, dx);
            const speed = 3 + Math.random() * 1;
            line.x += Math.cos(line.angle) * speed;
            line.y += Math.sin(line.angle) * speed;
            line.shapeIndex++;
          } else {
            line.shapeIndex++;
          }
          
          // Abandon shape at 80-95% completion
          const completionRatio = line.shapeIndex / line.shapePoints.length;
          if (completionRatio > (0.8 + Math.random() * 0.15)) {
            line.state = 'roaming';
            line.angle = Math.random() * Math.PI * 2;
          }
        }
      }
      
      // Add point
      line.points.push({ x: line.x, y: line.y });
      
      // Remove old points to create trail deletion effect
      if (line.points.length > MAX_POINTS_PER_LINE) {
        line.points.shift();
      }
      
      // Update polylines - solid part and faded dashed part
      const solidCutoff = FADE_START_POINT;
      
      // Solid part (recent points)
      const solidPoints = line.points.slice(Math.max(0, line.points.length - solidCutoff));
      const solidPointsStr = solidPoints.map(p => `${p.x},${p.y}`).join(' ');
      line.polyline.setAttribute('points', solidPointsStr);
      
      // Faded dashed part (older points being removed)
      const fadeRange = line.points.length - solidCutoff;
      if (fadeRange > 0) {
        const fadedPoints = line.points.slice(0, fadeRange);
        const fadedPointsStr = fadedPoints.map(p => `${p.x},${p.y}`).join(' ');
        
        const progressToEnd = fadeRange / (MAX_POINTS_PER_LINE - FADE_START_POINT);
        
        // Gradually increase dash pattern and reduce opacity
        const dashSize = Math.round(progressToEnd * 8);
        const dashPattern = dashSize > 0 ? `${dashSize},${dashSize}` : 'none';
        const opacity = 0.2 * progressToEnd;
        
        line.fadedPolyline.setAttribute('points', fadedPointsStr);
        line.fadedPolyline.setAttribute('stroke-dasharray', dashPattern);
        line.fadedPolyline.setAttribute('stroke', `rgba(0, 0, 0, ${opacity})`);
      } else {
        line.fadedPolyline.setAttribute('points', '');
        line.fadedPolyline.setAttribute('stroke-dasharray', 'none');
      }
    });
  }, 50);
}

function drawJiggedLine(svg, startX, startY, endX, endY) {
  const lineType = Math.floor(Math.random() * 4); // 0: spiral, 1: curve, 2: squiggle, 3: wavy
  const steps = 40 + Math.floor(Math.random() * 40);
  const points = [];
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let x = startX + (endX - startX) * t;
    let y = startY + (endY - startY) * t;
    
    if (lineType === 0) {
      // Spiral: gradually rotating offset
      const spiralAngle = t * Math.PI * 3;
      const spiralRadius = t * 40;
      x += Math.cos(spiralAngle) * spiralRadius;
      y += Math.sin(spiralAngle) * spiralRadius;
    } else if (lineType === 1) {
      // Smooth curve: sine wave perpendicular to line
      const lineAngle = Math.atan2(endY - startY, endX - startX);
      const perpAngle = lineAngle + Math.PI / 2;
      const curveAmount = Math.sin(t * Math.PI) * 50;
      x += Math.cos(perpAngle) * curveAmount;
      y += Math.sin(perpAngle) * curveAmount;
    } else if (lineType === 2) {
      // Squiggle: rapid random oscillations
      const squiggleFreq = 12;
      const squiggleAmp = Math.sin(t * Math.PI * squiggleFreq) * 20;
      const lineAngle = Math.atan2(endY - startY, endX - startX);
      const perpAngle = lineAngle + Math.PI / 2;
      x += Math.cos(perpAngle) * squiggleAmp;
      y += Math.sin(perpAngle) * squiggleAmp;
    } else {
      // Wavy: random perpendicular offset at each step
      const lineAngle = Math.atan2(endY - startY, endX - startX);
      const perpAngle = lineAngle + Math.PI / 2;
      const wave = (Math.random() - 0.5) * 30;
      x += Math.cos(perpAngle) * wave;
      y += Math.sin(perpAngle) * wave;
    }
    
    points.push({ x, y });
  }
  
  // Draw the line as connected segments with animation
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', p1.x);
    line.setAttribute('y1', p1.y);
    line.setAttribute('x2', p1.x);
    line.setAttribute('y2', p1.y);
    line.setAttribute('stroke', 'rgba(0, 0, 0, 0.2)');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-linecap', 'round');
    svg.appendChild(line);
    
    gsap.to(line, {
      attr: {
        x2: p2.x,
        y2: p2.y
      },
      duration: 0.3,
      delay: i * 0.05,
      ease: 'power2.inOut'
    });
  }
}

function generateSingleRandomLine() {
  const svg = document.getElementById('shape-overlay');
  if (!svg) return;
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Random start position
  const startX = Math.random() * (width - 400) + 200;
  const startY = Math.random() * (height - 400) + 200;
  
  // Check center avoidance
  const centerX = width / 2;
  const centerY = height / 2;
  const centerRadius = 400;
  const distToCenter = Math.sqrt(
    Math.pow(startX - centerX, 2) + Math.pow(startY - centerY, 2)
  );
  
  if (distToCenter <= centerRadius) {
    return; // Skip this line if too close to center
  }
  
  // Random end position
  const angle = Math.random() * Math.PI * 2;
  const distance = 150 + Math.random() * 200;
  const endX = startX + Math.cos(angle) * distance;
  const endY = startY + Math.sin(angle) * distance;
  
  drawJiggedLine(svg, startX, startY, endX, endY);
}

function generateRandomLines() {
  const svg = document.getElementById('shape-overlay');
  if (!svg) return;
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  let linesGenerated = 0;
  
  // Generate initial set of random lines
  for (let i = 0; i < LINES_COUNT; i++) {
    generateSingleRandomLine();
    linesGenerated++;
  }
  
  console.log(`Generated initial ${linesGenerated} jigged lines`);
}

function startContinuousLineGeneration() {
  // Generate new lines continuously, one every 2-4 seconds
  setInterval(() => {
    generateSingleRandomLine();
  }, 2000 + Math.random() * 2000);
}

// Generate lines on page load
window.addEventListener('load', () => {
  const svg = document.getElementById('shape-overlay');
  if (svg) {
    svg.setAttribute('width', window.innerWidth);
    svg.setAttribute('height', window.innerHeight);
    // Wait 3 seconds before starting continuous drawing
    setTimeout(() => {
      startContinuousDrawing();
    }, 3000);
  } else {
    console.error('shape-overlay SVG not found');
  }
});

// Regenerate on window resize (optional)
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const svg = document.getElementById('shape-overlay');
    if (svg) svg.innerHTML = '';
    generateRandomShapes();
  }, 500);
});
