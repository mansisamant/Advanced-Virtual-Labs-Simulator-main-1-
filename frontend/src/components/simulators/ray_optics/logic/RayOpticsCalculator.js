/**
 * Ray Optics Physics Calculator
 * This module handles the calculations for ray optics physics problems.
 */

/**
 * Calculate image properties based on object distance and focal length
 * @param {number} objectDistance - Distance from object to optical element (u)
 * @param {number} focalLength - Focal length of the lens/mirror (f)
 * @param {boolean} isLens - Whether the optical element is a lens (true) or mirror (false)
 * @returns {Object} Image properties including distance, magnification, and type
 */
export const calculateImageProperties = (objectDistance, focalLength, isLens) => {
  // Prevent division by zero or invalid inputs
  if (objectDistance === 0 || focalLength === 0) {
    return { 
      distance: null, 
      magnification: null,
      isReal: null,
      isInverted: null,
      isEnlarged: null,
    };
  }
  
  let imageDistance;
  
  // Apply the lens/mirror equation
  if (isLens) {
    // For lenses: 1/v = 1/f + 1/u
    imageDistance = 1 / ((1 / focalLength) - (1 / objectDistance));
  } else {
    // For mirrors: 1/v = 1/f - 1/u
    imageDistance = 1 / ((1 / focalLength) + (1 / objectDistance));
  }
  
  // Calculate magnification: M = -v/u
  const magnification = -imageDistance / objectDistance;
  
  return {
    distance: imageDistance,
    magnification: magnification,
    isReal: imageDistance > 0,
    isInverted: magnification < 0,
    isEnlarged: Math.abs(magnification) > 1,
  };
};

/**
 * Get ray path coordinates for different optical elements
 * @param {string} elementType - Type of optical element ('convexLens', 'concaveLens', 'concaveMirror', 'convexMirror')
 * @param {number} objectDistance - Distance from object to optical element
 * @param {number} focalLength - Focal length of the element
 * @param {number} centerX - X coordinate of the center of the optical element
 * @param {number} centerY - Y coordinate of the center of the optical element
 * @param {number} objectHeight - Height of the object
 * @param {number} scale - Pixels per cm scale factor
 * @returns {Object} Coordinates for drawing the rays
 */
export const calculateRayPaths = (elementType, objectDistance, focalLength, centerX, centerY, objectHeight, scale) => {
  const objectX = centerX - objectDistance * scale;
  const objectTop = centerY - objectHeight;
  
  const isLens = ['convexLens', 'concaveLens'].includes(elementType);
  const f1 = centerX - focalLength * scale * (elementType === 'convexLens' || elementType === 'concaveMirror' ? 1 : -1);
  const f2 = centerX + focalLength * scale * (elementType === 'convexLens' || elementType === 'concaveMirror' ? 1 : -1);
  
  // Calculate image properties
  const imageProps = calculateImageProperties(
    objectDistance, 
    focalLength, 
    isLens
  );
  
  // Ray 1: Parallel to principal axis, then through focus
  const ray1 = {
    start: { x: objectX, y: objectTop },
    lens: { x: centerX, y: objectTop },
  };
  
  // Ray 2: Through center (no deviation)
  const ray2Slope = (objectTop - centerY) / (objectX - centerX);
  const ray2 = {
    start: { x: objectX, y: objectTop },
    end: { x: centerX * 2, y: centerY + ray2Slope * centerX },
  };
  
  // Ray 3: Through/away from focus, then parallel
  const ray3 = {
    start: { x: objectX, y: objectTop },
  };
  
  // Calculate specific endpoints based on element type
  if (isLens) {
    // For lenses
    
    // Ray 1: After lens, through second focal point
    const ray1Slope = (objectTop - (centerY + (objectHeight / ((centerX - objectX) / (f2 - centerX))))) / 
                      (centerX - (centerX * 2));
    ray1.end = { 
      x: centerX * 2,
      y: objectTop + ray1Slope * centerX
    };
    
    // Ray 3: Through first focal point, then parallel
    const ray3Slope = (objectTop - (centerY + objectHeight * ((centerX - f1) / (objectX - f1)))) /
                      (objectX - centerX);
    ray3.lens = {
      x: centerX,
      y: centerY + objectHeight * ((centerX - f1) / (objectX - f1))
    };
    ray3.end = {
      x: centerX * 2,
      y: ray3.lens.y
    };
  } else {
    // For mirrors
    
    // Ray 1: After reflection, away from focal point
    const ray1Slope = (centerY - objectTop) / (centerX - f1);
    ray1.end = {
      x: 0,
      y: centerY + ray1Slope * centerX
    };
    
    // Ray 3: Towards/away from focal point, then parallel
    const ray3Slope = (centerY - objectTop) / (f1 - objectX);
    ray3.lens = {
      x: centerX,
      y: objectTop + ray3Slope * (centerX - objectX)
    };
    ray3.end = {
      x: 0,
      y: ray3.lens.y
    };
  }
  
  return {
    ray1,
    ray2,
    ray3,
    image: {
      x: centerX + imageProps.distance * scale,
      y: imageProps.isInverted ? 
        centerY + objectHeight * Math.abs(imageProps.magnification) : 
        centerY - objectHeight * Math.abs(imageProps.magnification),
      height: objectHeight * Math.abs(imageProps.magnification),
    },
    properties: imageProps
  };
};

/**
 * Get human-readable description of the image
 * @param {Object} imageProps - The image properties object
 * @returns {string} Human-readable description of the image type
 */
export const getImageDescription = (imageProps) => {
  if (!imageProps || !imageProps.distance) {
    return 'No image formed';
  }
  
  const realVirtual = imageProps.isReal ? 'Real' : 'Virtual';
  const orientation = imageProps.isInverted ? 'Inverted' : 'Upright';
  const size = imageProps.isEnlarged ? 'Enlarged' : 'Diminished';
  
  return `${realVirtual}, ${orientation}, ${size}`;
};

/**
 * Get tips or explanations based on the current setup
 * @param {string} elementType - Type of optical element
 * @param {number} objectDistance - Distance from object to element
 * @param {number} focalLength - Focal length of the element
 * @returns {string} Tip or explanation text
 */
export const getExplanationTip = (elementType, objectDistance, focalLength) => {
  const isLens = ['convexLens', 'concaveLens'].includes(elementType);
  
  // Special cases
  if (objectDistance === focalLength) {
    return `Object placed at focal point (${focalLength} cm): Image forms at infinity`;
  }
  
  if (isLens) {
    if (elementType === 'convexLens') {
      if (objectDistance < focalLength) {
        return 'Object inside focal length: Virtual, upright, enlarged image';
      } else if (objectDistance < 2 * focalLength) {
        return 'Object between F and 2F: Real, inverted, enlarged image';
      } else if (objectDistance === 2 * focalLength) {
        return 'Object at 2F: Real, inverted, same size image';
      } else {
        return 'Object beyond 2F: Real, inverted, diminished image';
      }
    } else { // concave lens
      return 'Concave lens always forms virtual, upright, diminished images';
    }
  } else { // mirrors
    if (elementType === 'concaveMirror') {
      if (objectDistance < focalLength) {
        return 'Object inside focal length: Virtual, upright, enlarged image';
      } else if (objectDistance < 2 * focalLength) {
        return 'Object between F and C: Real, inverted, enlarged image';
      } else if (objectDistance === 2 * focalLength) {
        return 'Object at center of curvature: Real, inverted, same size image';
      } else {
        return 'Object beyond C: Real, inverted, diminished image';
      }
    } else { // convex mirror
      return 'Convex mirror always forms virtual, upright, diminished images';
    }
  }
};

export default {
  calculateImageProperties,
  calculateRayPaths,
  getImageDescription,
  getExplanationTip
};
