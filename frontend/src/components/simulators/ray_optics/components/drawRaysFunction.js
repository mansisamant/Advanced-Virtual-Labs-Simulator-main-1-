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
      }
      ctx.stroke();
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
