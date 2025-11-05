import { Node, Position } from 'reactflow';

// Helper to get the position of the handle based on node position and type
// Smart handle selection to avoid overlapping edges
function getHandlePosition(
  nodeA: Node,
  nodeB: Node,
  sourceType?: string,
  targetType?: string
): { source: Position; target: Position; sourceHandleId: string; targetHandleId: string } {
  const centerA = {
    x: nodeA.position.x + (nodeA.width || 200) / 2,
    y: nodeA.position.y + (nodeA.height || 120) / 2,
  };

  const centerB = {
    x: nodeB.position.x + (nodeB.width || 200) / 2,
    y: nodeB.position.y + (nodeB.height || 120) / 2,
  };

  const dx = centerB.x - centerA.x;
  const dy = centerB.y - centerA.y;

  // Calculate absolute differences
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // Determine primary direction based on which distance is greater
  const isHorizontalPrimary = absDx > absDy;

  // Smart handle selection based on relative positions
  if (isHorizontalPrimary) {
    // Horizontal connection is clearer
    if (dx > 0) {
      // B is to the right of A
      return {
        source: Position.Right,
        target: Position.Left,
        sourceHandleId: 'right-source',
        targetHandleId: 'left-target'
      };
    } else {
      // B is to the left of A
      return {
        source: Position.Left,
        target: Position.Right,
        sourceHandleId: 'left-source',
        targetHandleId: 'right-target'
      };
    }
  } else {
    // Vertical connection is clearer (default for hierarchical layouts)
    if (dy > 0) {
      // B is below A
      return {
        source: Position.Bottom,
        target: Position.Top,
        sourceHandleId: 'bottom-source',
        targetHandleId: 'top-target'
      };
    } else {
      // B is above A
      return {
        source: Position.Top,
        target: Position.Bottom,
        sourceHandleId: 'top-source',
        targetHandleId: 'bottom-target'
      };
    }
  }
}

// Get the actual coordinates for the edge connection points
export function getEdgeParams(sourceNode: any, targetNode: any) {
  // Handle internal node structure from useStore - fallback to positionAbsolute if position is not available
  const sourcePos = sourceNode.position || sourceNode.positionAbsolute;
  const targetPos = targetNode.position || targetNode.positionAbsolute;
  
  const sourceNodeData = {
    position: sourcePos,
    width: sourceNode.width || 200,
    height: sourceNode.height || 120,
  };
  
  const targetNodeData = {
    position: targetPos,
    width: targetNode.width || 200,
    height: targetNode.height || 120,
  };

  const {
    source: sourceHandlePos,
    target: targetHandlePos,
    sourceHandleId,
    targetHandleId
  } = getHandlePosition(
    sourceNodeData as Node,
    targetNodeData as Node,
    sourceNode.type,
    targetNode.type
  );

  const sourceWidth = sourceNode.width || 200;
  const sourceHeight = sourceNode.height || 120;
  const targetWidth = targetNode.width || 200;
  const targetHeight = targetNode.height || 120;

  const sourceX = sourcePos.x;
  const sourceY = sourcePos.y;
  const targetX = targetPos.x;
  const targetY = targetPos.y;

  // Calculate handle positions based on the determined positions
  let sx = sourceX;
  let sy = sourceY;
  let tx = targetX;
  let ty = targetY;

  switch (sourceHandlePos) {
    case Position.Top:
      sx = sourceX + sourceWidth / 2;
      sy = sourceY;
      break;
    case Position.Bottom:
      sx = sourceX + sourceWidth / 2;
      sy = sourceY + sourceHeight;
      break;
    case Position.Left:
      sx = sourceX;
      sy = sourceY + sourceHeight / 2;
      break;
    case Position.Right:
      sx = sourceX + sourceWidth;
      sy = sourceY + sourceHeight / 2;
      break;
  }

  switch (targetHandlePos) {
    case Position.Top:
      tx = targetX + targetWidth / 2;
      ty = targetY;
      break;
    case Position.Bottom:
      tx = targetX + targetWidth / 2;
      ty = targetY + targetHeight;
      break;
    case Position.Left:
      tx = targetX;
      ty = targetY + targetHeight / 2;
      break;
    case Position.Right:
      tx = targetX + targetWidth;
      ty = targetY + targetHeight / 2;
      break;
  }

  return {
    sx,
    sy,
    tx,
    ty,
    sourcePos: sourceHandlePos,
    targetPos: targetHandlePos,
    sourceHandleId,
    targetHandleId
  };
}