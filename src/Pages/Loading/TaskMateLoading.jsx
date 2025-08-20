import React, { useRef, useState } from "react";
import { Stage, Layer, Rect, Circle, Line } from "react-konva";

function AdvancedDrawingBoard({ onSave }) {
    const stageRef = useRef();
    const [shapes, setShapes] = useState([]);
    const [connections, setConnections] = useState([]);
    const [selectedShape, setSelectedShape] = useState(null);

    // Add shape
    const addShape = (type) => {
        const id = shapes.length + 1;
        setShapes([
            ...shapes,
            {
                id,
                type,
                x: 50,
                y: 50,
                width: 100,
                height: 100,
                radius: 50,
                fill: "lightblue",
            },
        ]);
    };

    // Drag shape
    const handleDrag = (e, id) => {
        const newShapes = shapes.map((shape) =>
            shape.id === id
                ? { ...shape, x: e.target.x(), y: e.target.y() }
                : shape
        );
        setShapes(newShapes);
    };

    // Connect shapes
    const addConnection = (fromId, toId) => {
        setConnections([...connections, { from: fromId, to: toId }]);
    };

    // Save drawing
    const saveDrawing = () => {
        const json = stageRef.current.toJSON();
        onSave(json); // send to backend
    };

    return (
        <div className="top-[70px]">
            <div >
                <button onClick={() => addShape("rect")}>Add Rectangle</button>
                <button onClick={() => addShape("circle")}>Add Circle</button>
                <button onClick={saveDrawing}>Save</button>
            </div>

            <Stage
                width={window.innerWidth}
                height={600}
                ref={stageRef}
                style={{ border: "1px solid #ccc" }}
            >
                <Layer>
                    {/* Draw shapes */}
                    {shapes.map((shape) =>
                        shape.type === "rect" ? (
                            <Rect
                                key={shape.id}
                                {...shape}
                                draggable
                                onDragMove={(e) => handleDrag(e, shape.id)}
                                onClick={() => setSelectedShape(shape.id)}
                            />
                        ) : (
                            <Circle
                                key={shape.id}
                                {...shape}
                                draggable
                                onDragMove={(e) => handleDrag(e, shape.id)}
                                onClick={() => setSelectedShape(shape.id)}
                            />
                        )
                    )}

                    {/* Draw connections */}
                    {connections.map((conn, i) => {
                        const fromShape = shapes.find((s) => s.id === conn.from);
                        const toShape = shapes.find((s) => s.id === conn.to);
                        if (!fromShape || !toShape) return null;

                        return (
                            <Line
                                key={i}
                                points={[
                                    fromShape.x + (fromShape.width || 0) / 2,
                                    fromShape.y + (fromShape.height || fromShape.radius || 0) / 2,
                                    toShape.x + (toShape.width || 0) / 2,
                                    toShape.y + (toShape.height || toShape.radius || 0) / 2,
                                ]}
                                stroke="black"
                            />
                        );
                    })}
                </Layer>
            </Stage>
        </div>
    );
}

export default AdvancedDrawingBoard;
