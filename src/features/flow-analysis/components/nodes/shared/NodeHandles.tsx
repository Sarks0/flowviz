import { Handle, Position } from 'reactflow';

interface NodeHandlesProps {
  type?: 'default' | 'operator';
}

export function NodeHandles({ type = 'default' }: NodeHandlesProps) {
  const handleColor = type === 'operator' ? 'rgb(245, 158, 11)' : '#fff';
  const handleStyle = {
    background: handleColor,
    width: 6,
    height: 6,
    border: '2px solid rgba(0, 0, 0, 0.3)',
  };

  return (
    <>
      {/* Top handles */}
      <Handle
        id="top-target"
        type="target"
        position={Position.Top}
        style={{
          ...handleStyle,
          top: -3,
        }}
      />
      <Handle
        id="top-source"
        type="source"
        position={Position.Top}
        style={{
          ...handleStyle,
          top: -3,
        }}
      />

      {/* Bottom handles */}
      <Handle
        id="bottom-target"
        type="target"
        position={Position.Bottom}
        style={{
          ...handleStyle,
          bottom: -3,
        }}
      />
      <Handle
        id="bottom-source"
        type="source"
        position={Position.Bottom}
        style={{
          ...handleStyle,
          bottom: -3,
        }}
      />

      {/* Left handles */}
      <Handle
        id="left-target"
        type="target"
        position={Position.Left}
        style={{
          ...handleStyle,
          left: -3,
        }}
      />
      <Handle
        id="left-source"
        type="source"
        position={Position.Left}
        style={{
          ...handleStyle,
          left: -3,
        }}
      />

      {/* Right handles */}
      <Handle
        id="right-target"
        type="target"
        position={Position.Right}
        style={{
          ...handleStyle,
          right: -3,
        }}
      />
      <Handle
        id="right-source"
        type="source"
        position={Position.Right}
        style={{
          ...handleStyle,
          right: -3,
        }}
      />
    </>
  );
}