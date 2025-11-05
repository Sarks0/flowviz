import dagre from 'dagre';
import { Node, Edge, Position } from 'reactflow';
import { LAYOUT_CONFIG } from '../constants';

// Helper function to determine smart handle IDs based on node positions
function getSmartHandleIds(sourceNode: Node, targetNode: Node): { sourceHandle: string; targetHandle: string } {
  const centerA = {
    x: sourceNode.position.x + (sourceNode.width || LAYOUT_CONFIG.nodeWidth) / 2,
    y: sourceNode.position.y + (sourceNode.height || LAYOUT_CONFIG.nodeHeight) / 2,
  };

  const centerB = {
    x: targetNode.position.x + (targetNode.width || LAYOUT_CONFIG.nodeWidth) / 2,
    y: targetNode.position.y + (targetNode.height || LAYOUT_CONFIG.nodeHeight) / 2,
  };

  const dx = centerB.x - centerA.x;
  const dy = centerB.y - centerA.y;

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // Determine primary direction based on which distance is greater
  const isHorizontalPrimary = absDx > absDy;

  if (isHorizontalPrimary) {
    // Horizontal connection is clearer
    if (dx > 0) {
      // B is to the right of A
      return {
        sourceHandle: 'right-source',
        targetHandle: 'left-target'
      };
    } else {
      // B is to the left of A
      return {
        sourceHandle: 'left-source',
        targetHandle: 'right-target'
      };
    }
  } else {
    // Vertical connection is clearer (default for hierarchical layouts)
    if (dy > 0) {
      // B is below A
      return {
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target'
      };
    } else {
      // B is above A
      return {
        sourceHandle: 'top-source',
        targetHandle: 'bottom-target'
      };
    }
  }
}

export const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: LAYOUT_CONFIG.rankdir,
    ranksep: LAYOUT_CONFIG.ranksep,
    nodesep: LAYOUT_CONFIG.nodesep,
    edgesep: LAYOUT_CONFIG.edgesep,
    marginx: LAYOUT_CONFIG.marginx,
    marginy: LAYOUT_CONFIG.marginy
  });

  // Add nodes with adjusted dimensions
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: LAYOUT_CONFIG.nodeWidth,
      height: LAYOUT_CONFIG.nodeHeight,
      paddingLeft: LAYOUT_CONFIG.paddingLeft,
      paddingRight: LAYOUT_CONFIG.paddingRight
    });
  });

  // Add edges to the graph with weights to prioritize the technique backbone
  edges.forEach((edge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    // Give action-to-action edges higher weight to form the main backbone
    const weight = (sourceNode?.type === 'attack-action' && targetNode?.type === 'attack-action') ? 10 : 1;

    dagreGraph.setEdge(edge.source, edge.target, { weight });
  });

  // Calculate the layout
  dagre.layout(dagreGraph);

  // Get the positioned nodes with minimal adjustments
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - LAYOUT_CONFIG.nodeWidth / 2,
        y: nodeWithPosition.y - LAYOUT_CONFIG.nodeHeight / 2,
      },
    };
  });

  // Update edges with smart handle IDs based on final node positions
  const layoutedEdges = edges.map((edge) => {
    const sourceNode = layoutedNodes.find(n => n.id === edge.source);
    const targetNode = layoutedNodes.find(n => n.id === edge.target);

    if (sourceNode && targetNode) {
      const { sourceHandle, targetHandle } = getSmartHandleIds(sourceNode, targetNode);

      return {
        ...edge,
        sourceHandle,
        targetHandle
      };
    }

    return edge;
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
};