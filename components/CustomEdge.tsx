import { BaseEdge, EdgeProps, getSmoothStepPath } from "reactflow";

export default function CustomEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge
      path={edgePath}
      style={{
        ...style,
        stroke: "#9B7AFA",
        strokeWidth: 2,
      }}
    />
  );
}
