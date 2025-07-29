import React, { useRef, useEffect, useState, useCallback } from 'react';
import './RayCanvas.css';

const RayCanvas = ({ 
  elementType, 
  focalLength, 
  objectDistance,
  showRays,
  imageProps,
  isAnimating = true,
  onObjectDistanceChange,
  visibleRays = { parallel: true, throughCenter: true, throughFocus: true }
}) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canvasInfo, setCanvasInfo] = useState({ centerX: 0, centerY: 0, scale: 5 });
  
  // Handle mouse down on the object
  const handleMouseDown = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const { centerX, scale } = canvasInfo;
    const objectX = centerX - objectDistance * scale;
    
    // Check if mouse is near the object (within a small radius)
    if (Math.abs(x - objectX) < 15 && Math.abs(y - (canvasInfo.centerY - 25)) < 50) {
      setIsDragging(true);
      canvas.style.cursor = 'grabbing';
    }
  }, [objectDistance, canvasInfo]);
  
  // Handle mouse move for dragging
  const handleMouseMove = useCallback((event) => {
    if (!isDragging || !onObjectDistanceChange) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    
    const { centerX, scale } = canvasInfo;
    const newObjectDistance = (centerX - x) / scale;
    
    // Constrain to reasonable values
    if (newObjectDistance >= 5 && newObjectDistance <= 50) {
      onObjectDistanceChange({ target: { value: newObjectDistance } });
    }
  }, [isDragging, onObjectDistanceChange, canvasInfo]);
  
  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'pointer';
      }
    }
  }, [isDragging]);
  
  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'default';
      }
    }
  }, [isDragging]);
    // Set up event handlers for mouse interactions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave]);
  
  // Draw ray diagram on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Set up coordinate system (center at origin)
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 5; // pixels per unit (cm)
    
    // Save canvas info for mouse interaction
    setCanvasInfo({ centerX, centerY, scale });
    
    // Animation constants
    const animationDuration = 800; // ms
    const startTime = performance.now();
    
    // Animation function
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = isAnimating ? Math.min(elapsed / animationDuration, 1) : 1;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw grid and axes
      drawGrid(ctx, width, height, centerX, centerY, scale, progress);
      
      // Draw principal axis with animation
      ctx.beginPath();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.moveTo(0, centerY);
      ctx.lineTo(width * progress, centerY);
      ctx.stroke();
      
      // Draw optical element at center with animation
      drawOpticalElement(ctx, elementType, centerX, centerY, height, progress);
      
      // Draw focal points with animation
      const isLens = ['convexLens', 'concaveLens'].includes(elementType);
      const f1 = centerX - focalLength * scale * (elementType === 'convexLens' || elementType === 'concaveMirror' ? 1 : -1);
      const f2 = centerX + focalLength * scale * (elementType === 'convexLens' || elementType === 'concaveMirror' ? 1 : -1);
      
      if (progress > 0.3) {
        const focalPointProgress = Math.min((progress - 0.3) / 0.7, 1);
        drawFocalPoints(ctx, isLens, f1, f2, centerY, focalPointProgress);
      }
      
      // Draw object with animation
      const objectX = centerX - objectDistance * scale;
      const objectHeight = 50;
      
      if (progress > 0.5) {
        const objectProgress = Math.min((progress - 0.5) / 0.5, 1);
        drawObject(ctx, objectX, centerY, objectHeight, objectProgress);
      }
      
      // Calculate and draw image if possible
      if (imageProps.distance && showRays && progress > 0.7) {
        const raysProgress = Math.min((progress - 0.7) / 0.3, 1);
        drawImage(ctx, centerX, centerY, objectX, objectHeight, imageProps, scale, raysProgress);
          // Draw rays
        if (showRays) {
          drawRays(ctx, centerX, centerY, objectX, objectHeight, f1, f2, isLens, width, imageProps, raysProgress, visibleRays);
        }
      }
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    requestAnimationFrame(animate);
    
  }, [elementType, focalLength, objectDistance, showRays, imageProps]);

  // Helper function to draw grid
  const drawGrid = (ctx, width, height, centerX, centerY, scale, progress) => {
    // Draw measurement ticks
    ctx.strokeStyle = '#e2e8f0';
    ctx.fillStyle = '#718096';
    ctx.textAlign = 'center';
    ctx.font = '10px Arial';
    
    // Draw vertical grid lines
    for (let x = -Math.floor((centerX / scale) / 5) * 5; x <= Math.floor((centerX / scale) / 5) * 5; x += 5) {
      if (x === 0) continue; // Skip origin
      
      const tickX = centerX + x * scale;
      const tickProgress = progress * (1 - Math.abs(x) / (width/scale));
      
      if (tickProgress <= 0) continue;
      
      // Vertical grid line
      ctx.beginPath();
      ctx.globalAlpha = 0.15 * tickProgress;
      ctx.moveTo(tickX, 0);
      ctx.lineTo(tickX, height);
      ctx.stroke();
      ctx.globalAlpha = 1;
      
      // Tick on x-axis
      ctx.beginPath();
      ctx.strokeStyle = '#a0aec0';
      ctx.lineWidth = 1;
      ctx.moveTo(tickX, centerY - 5);
      ctx.lineTo(tickX, centerY + 5);
      ctx.stroke();
      
      // Label ticks
      ctx.fillText(`${x}`, tickX, centerY + 15);
    }
    
    // Draw horizontal grid lines
    for (let y = -Math.floor((centerY / scale) / 5) * 5; y <= Math.floor((centerY / scale) / 5) * 5; y += 5) {
      if (y === 0) continue; // Skip origin
      
      const tickY = centerY + y * scale;
      const tickProgress = progress * (1 - Math.abs(y) / (height/scale));
      
      if (tickProgress <= 0) continue;
      
      // Horizontal grid line
      ctx.beginPath();
      ctx.globalAlpha = 0.15 * tickProgress;
      ctx.moveTo(0, tickY);
      ctx.lineTo(width, tickY);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  };

  // Helper function to draw optical element
  const drawOpticalElement = (ctx, elementType, centerX, centerY, height, progress) => {
    ctx.strokeStyle = '#3182ce'; // Blue color for optical elements
    ctx.lineWidth = 2;
    
    switch (elementType) {
      case 'convexLens':
        // Draw convex lens with animation
        const lensHeight = height / 3;
        const lensProgress = Math.min(progress * 1.5, 1);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - lensHeight * lensProgress / 2);
        ctx.quadraticCurveTo(
          centerX + 10 * lensProgress, 
          centerY, 
          centerX, 
          centerY + lensHeight * lensProgress / 2
        );
        ctx.quadraticCurveTo(
          centerX - 10 * lensProgress, 
          centerY, 
          centerX, 
          centerY - lensHeight * lensProgress / 2
        );
        ctx.stroke();
        break;
        
      case 'concaveLens':
        // Draw concave lens with animation
        const concaveLensHeight = height / 3;
        const concaveProgress = Math.min(progress * 1.5, 1);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - concaveLensHeight * concaveProgress / 2);
        ctx.quadraticCurveTo(
          centerX - 10 * concaveProgress, 
          centerY, 
          centerX, 
          centerY + concaveLensHeight * concaveProgress / 2
        );
        ctx.quadraticCurveTo(
          centerX + 10 * concaveProgress, 
          centerY, 
          centerX, 
          centerY - concaveLensHeight * concaveProgress / 2
        );
        ctx.stroke();
        break;
        
      case 'convexMirror':
        // Draw convex mirror with animation
        const convexMirrorProgress = Math.min(progress * 1.5, 1);
        ctx.beginPath();
        ctx.arc(
          centerX - 30, 
          centerY, 
          50 * convexMirrorProgress, 
          -Math.PI/4, 
          Math.PI/4
        );
        ctx.stroke();
        break;
        
      case 'concaveMirror':
        // Draw concave mirror with animation
        const concaveMirrorProgress = Math.min(progress * 1.5, 1);
        ctx.beginPath();
        ctx.arc(
          centerX + 30, 
          centerY, 
          50 * concaveMirrorProgress, 
          3*Math.PI/4, 
          5*Math.PI/4
        );
        ctx.stroke();
        break;
    }
  };

  // Helper function to draw focal points
  const drawFocalPoints = (ctx, isLens, f1, f2, centerY, progress) => {
    // Draw focal points with animation
    ctx.fillStyle = '#e53e3e'; // Red color for focal points
    
    // F1 point
    const f1Size = 4 * progress;
    ctx.beginPath();
    ctx.arc(f1, centerY, f1Size, 0, 2 * Math.PI);
    ctx.fill();
    
    // F1 label
    ctx.globalAlpha = progress;
    ctx.fillText('F₁', f1, centerY + 20);
    
    // F2 point for lenses
    if (isLens) {
      const f2Size = 4 * progress;
      ctx.beginPath();
      ctx.arc(f2, centerY, f2Size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillText('F₂', f2, centerY + 20);
    }
    
    ctx.globalAlpha = 1;
  };

  // Helper function to draw object
  const drawObject = (ctx, objectX, centerY, objectHeight, progress) => {
    // Draw object (arrow pointing up) with animation
    const animatedHeight = objectHeight * progress;
    
    ctx.strokeStyle = '#4c51bf'; // Indigo color for object
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(objectX, centerY);
    ctx.lineTo(objectX, centerY - animatedHeight);
    
    if (progress > 0.8) {
      // Draw arrowhead only when object is mostly drawn
      const arrowProgress = (progress - 0.8) * 5; // Scale to 0-1 for the last 20%
      
      ctx.lineTo(objectX - 5 * arrowProgress, centerY - animatedHeight + 10 * arrowProgress);
      ctx.moveTo(objectX, centerY - animatedHeight);
      ctx.lineTo(objectX + 5 * arrowProgress, centerY - animatedHeight + 10 * arrowProgress);
    }
    
    ctx.stroke();
    
    // Object label
    ctx.fillStyle = '#4c51bf';
    ctx.globalAlpha = progress;
    ctx.fillText('Object', objectX, centerY + 20);
    ctx.globalAlpha = 1;
  };

  // Helper function to draw image
  const drawImage = (ctx, centerX, centerY, objectX, objectHeight, imageProps, scale, progress) => {
    const imageX = centerX + imageProps.distance * scale;
    const imageHeight = objectHeight * Math.abs(imageProps.magnification);
    const imageY = imageProps.isInverted ? centerY + imageHeight * progress : centerY - imageHeight * progress;
    
    ctx.setLineDash([5, 3]); // Dashed line for virtual image
    ctx.strokeStyle = imageProps.isReal ? '#38a169' : '#805ad5'; // Green for real, purple for virtual
    ctx.lineWidth = 2 * progress;
    ctx.beginPath();
    ctx.moveTo(imageX, centerY);
    ctx.lineTo(imageX, imageY);
    
    if (progress > 0.8) {
      // Draw arrowhead only when image is mostly drawn
      const arrowProgress = (progress - 0.8) * 5; // Scale to 0-1 for the last 20%
      
      ctx.lineTo(
        imageX - 5 * arrowProgress, 
        imageY + (imageProps.isInverted ? -10 : 10) * arrowProgress
      );
      ctx.moveTo(imageX, imageY);
      ctx.lineTo(
        imageX + 5 * arrowProgress, 
        imageY + (imageProps.isInverted ? -10 : 10) * arrowProgress
      );
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Image label
    ctx.fillStyle = imageProps.isReal ? '#38a169' : '#805ad5';
    ctx.globalAlpha = progress;
    ctx.fillText('Image', imageX, centerY + 20);
    ctx.globalAlpha = 1;
  };
  // Helper function to draw rays
  const drawRays = (ctx, centerX, centerY, objectX, objectHeight, f1, f2, isLens, width, imageProps, progress, visibleRays = { parallel: true, throughCenter: true, throughFocus: true }) => {
    ctx.lineWidth = 1.5;
    
    // Ray 1: Parallel to principal axis, then through/away from focal point
    if (visibleRays.parallel) {
      const ray1Progress = Math.min(progress * 2, 1);
      ctx.strokeStyle = '#f56565'; // Red color
      ctx.beginPath();
      ctx.moveTo(objectX, centerY - objectHeight);
    
    // First segment - to the lens/mirror
    if (ray1Progress <= 0.5) {
      const x = objectX + (centerX - objectX) * (ray1Progress * 2);
      ctx.lineTo(x, centerY - objectHeight);
    } else {
      ctx.lineTo(centerX, centerY - objectHeight);
      
      // After refraction/reflection
      if (isLens) {
        // For lens: passes through second focal point
        const ray1EndX = centerX + (width - centerX) * ((ray1Progress - 0.5) * 2);
        const ray1EndY = centerY - objectHeight + 
          (objectHeight / ((centerX - objectX) / (f2 - centerX))) * ((ray1Progress - 0.5) * 2);
        
        ctx.lineTo(ray1EndX, ray1EndY);
      } else {
        // For mirror: reflects as if coming from focal point
        const ray1EndX = Math.max(0, centerX - (centerX - 0) * ((ray1Progress - 0.5) * 2));
        const slope = (centerY - objectHeight - centerY) / (f1 - centerX);
        const ray1EndY = centerY + slope * (ray1EndX - centerX) * ((ray1Progress - 0.5) * 2);
        ctx.lineTo(ray1EndX, ray1EndY);
      }
    }    ctx.stroke();
    }
    
    // Ray 2: Through center (no deviation)
    if (progress > 0.2 && visibleRays.throughCenter) {
      const ray2Progress = Math.min((progress - 0.2) * 1.25, 1);
      ctx.strokeStyle = '#68d391'; // Green color
      
      const ray2EndX = objectX + (width - objectX) * ray2Progress;
      const ray2EndY = centerY - objectHeight + (objectHeight / objectDistance) * (ray2EndX - objectX);
      
      ctx.beginPath();
      ctx.moveTo(objectX, centerY - objectHeight);
      ctx.lineTo(ray2EndX, ray2EndY);
      ctx.stroke();
    }
    
    // Ray 3: Through/away from focal point, then parallel to axis
    if (progress > 0.4 && visibleRays.throughFocus) {
      const ray3Progress = Math.min((progress - 0.4) * 1.67, 1);
      ctx.strokeStyle = '#4299e1'; // Blue color
      ctx.beginPath();
      ctx.moveTo(objectX, centerY - objectHeight);
      
      // Before refraction/reflection
      if (ray3Progress <= 0.5) {
        if (isLens) {
          // For lens: towards first focal point
          const ray3X = objectX + (centerX - objectX) * (ray3Progress * 2);
          const ray3Y = centerY - objectHeight + objectHeight * 
            ((ray3X - objectX) / (centerX - objectX)) * 
            ((centerX - f1) / (objectX - f1));
          
          ctx.lineTo(ray3X, ray3Y);
        } else {
          // For mirror: heads toward/away from focal point
          const slope = (centerY - (centerY - objectHeight)) / (f1 - objectX);
          const ray3X = objectX + (centerX - objectX) * (ray3Progress * 2);
          const ray3Y = centerY - objectHeight + slope * (ray3X - objectX);
          
          ctx.lineTo(ray3X, ray3Y);
        }
      } else {
        // After lens/mirror
        if (isLens) {
          // Complete path to lens
          const yAtLens = centerY + objectHeight * ((centerX - f1) / (objectX - f1));
          ctx.lineTo(centerX, yAtLens);
          
          // After refraction: parallel to axis
          const ray3EndX = centerX + (width - centerX) * ((ray3Progress - 0.5) * 2);
          ctx.lineTo(ray3EndX, yAtLens);
        } else {
          // For mirror
          const slope = (centerY - (centerY - objectHeight)) / (f1 - objectX);
          const yAtMirror = centerY - objectHeight + slope * (centerX - objectX);
          
          // Complete path to mirror
          ctx.lineTo(centerX, yAtMirror);
          
          // After reflection: parallel to axis
          const ray3EndX = centerX - (width - centerX) * ((ray3Progress - 0.5) * 2);
          ctx.lineTo(ray3EndX, yAtMirror);
        }
      }
      ctx.stroke();
    }
  };
  return (
    <div className="ray-canvas-container">
      <div className="canvas-tools">
        <button className="canvas-tool-button" title="Reset View">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"></path>
            <path d="M12 8v4l3 3"></path>
          </svg>
        </button>
        <div className="canvas-tooltip">
          <div className="tooltip-icon">?</div>
          <div className="tooltip-content">
            <p><strong>Tip:</strong> Click and drag the object to change its position.</p>
          </div>
        </div>
      </div>
      
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={400} 
        className="ray-canvas"
      />
      
      <div className="canvas-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#f56565' }}></div>
          <div className="legend-text">Parallel to axis ray</div>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#68d391' }}></div>
          <div className="legend-text">Through center ray</div>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#4299e1' }}></div>
          <div className="legend-text">Through focus ray</div>
        </div>
      </div>
    </div>
  );
};

export default RayCanvas;
