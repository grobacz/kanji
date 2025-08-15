import { useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Line } from 'react-konva';
// import { KonvaEventObject } from 'konva/lib/Node'; // Not used currently

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  onStrokeComplete?: (stroke: number[][]) => void;
  onClear?: () => void;
  disabled?: boolean;
}

interface DrawingCanvasRef {
  clear: () => void;
}

interface Stroke {
  points: number[];
  startTime: number;
  endTime?: number;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({
  width = 400,
  height = 400,
  onStrokeComplete,
  onClear,
  disabled = false,
}, ref) => {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const stageRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  // Grid configuration
  const gridSize = 20;
  const gridLines = [];
  
  // Create grid lines
  for (let i = 0; i <= width; i += gridSize) {
    gridLines.push(
      <Line
        key={`v${i}`}
        points={[i, 0, i, height]}
        stroke="#e5e5e5"
        strokeWidth={i % (gridSize * 2) === 0 ? 1 : 0.5}
        listening={false}
      />
    );
  }
  
  for (let i = 0; i <= height; i += gridSize) {
    gridLines.push(
      <Line
        key={`h${i}`}
        points={[0, i, width, i]}
        stroke="#e5e5e5"
        strokeWidth={i % (gridSize * 2) === 0 ? 1 : 0.5}
        listening={false}
      />
    );
  }

  // Add center guides (more prominent)
  gridLines.push(
    <Line
      key="centerV"
      points={[width / 2, 0, width / 2, height]}
      stroke="#d1d5db"
      strokeWidth={2}
      dash={[5, 5]}
      listening={false}
    />,
    <Line
      key="centerH"
      points={[0, height / 2, width, height / 2]}
      stroke="#d1d5db"
      strokeWidth={2}
      dash={[5, 5]}
      listening={false}
    />
  );

  const getPointerPosition = () => {
    if (!stageRef.current) return null;
    return stageRef.current.getPointerPosition();
  };

  const handleMouseDown = () => {
    if (disabled) return;
    
    setIsDrawing(true);
    const pos = getPointerPosition();
    if (!pos) return;

    const newStroke: Stroke = {
      points: [pos.x, pos.y],
      startTime: Date.now(),
    };
    
    setCurrentStroke(newStroke);
  };

  const handleMouseMove = () => {
    if (!isDrawing || disabled || !currentStroke) return;
    
    const pos = getPointerPosition();
    if (!pos) return;

    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, pos.x, pos.y],
    };
    
    setCurrentStroke(updatedStroke);
  };

  const handleMouseUp = () => {
    if (!isDrawing || disabled || !currentStroke) return;
    
    setIsDrawing(false);
    
    const completedStroke = {
      ...currentStroke,
      endTime: Date.now(),
    };
    
    setStrokes([...strokes, completedStroke]);
    setCurrentStroke(null);
    
    // Convert points array to coordinate pairs for callback
    const strokePoints: number[][] = [];
    for (let i = 0; i < completedStroke.points.length; i += 2) {
      strokePoints.push([completedStroke.points[i], completedStroke.points[i + 1]]);
    }
    
    onStrokeComplete?.(strokePoints);
  };

  const clearCanvas = useCallback(() => {
    setStrokes([]);
    setCurrentStroke(null);
    setIsDrawing(false);
    onClear?.();
  }, [onClear]);

  // Expose clear function to parent via ref
  useImperativeHandle(ref, () => ({
    clear: clearCanvas
  }), [clearCanvas]);

  return (
    <div className="relative inline-block">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        className="border-2 border-gray-300 rounded-lg bg-white cursor-crosshair"
        style={{ 
          touchAction: 'none',
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto'
        }}
      >
        <Layer>
          {/* Grid */}
          {gridLines}
          
          {/* Completed strokes */}
          {strokes.map((stroke, index) => (
            <Line
              key={index}
              points={stroke.points}
              stroke="#000000"
              strokeWidth={6}
              tension={0.1}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation="source-over"
              shadowColor="#00000020"
              shadowBlur={2}
              shadowOffset={{ x: 1, y: 1 }}
            />
          ))}
          
          {/* Current stroke being drawn */}
          {currentStroke && (
            <Line
              points={currentStroke.points}
              stroke="#dc2626"
              strokeWidth={6}
              tension={0.1}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation="source-over"
              shadowColor="#dc262620"
              shadowBlur={2}
              shadowOffset={{ x: 1, y: 1 }}
            />
          )}
        </Layer>
      </Stage>
      
      {/* Stroke count indicator */}
      <div className="absolute top-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded text-sm font-medium text-gray-600">
        Strokes: {strokes.length + (currentStroke ? 1 : 0)}
      </div>
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;