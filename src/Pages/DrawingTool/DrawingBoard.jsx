import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaSave, FaTrash, FaPencilAlt, FaSquare, FaCircle } from 'react-icons/fa';

const DrawingBoard = () => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokes, setStrokes] = useState([]);
    const [currentStroke, setCurrentStroke] = useState([]);
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [isSaving, setIsSaving] = useState(false);
    const [drawingMode, setDrawingMode] = useState('pencil');
    const [dragStart, setDragStart] = useState(null);

    const colors = [
        '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
        '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB',
        '#A52A2A', '#808080', '#FFFFFF'
    ];

    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        strokes.forEach(stroke => {
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.strokeWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            if (stroke.type === 'pencil' && stroke.points.length > 1) {
                ctx.beginPath();
                ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
                stroke.points.forEach(point => {
                    ctx.lineTo(point.x, point.y);
                });
                ctx.stroke();
            } else if (stroke.type === 'rectangle') {
                ctx.strokeRect(stroke.x, stroke.y, stroke.rectWidth, stroke.rectHeight);
            } else if (stroke.type === 'circle') {
                ctx.beginPath();
                ctx.arc(stroke.x, stroke.y, stroke.radius, 0, 2 * Math.PI);
                ctx.stroke();
            }
        });
    }, [strokes]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            redrawCanvas();
        }
    }, [redrawCanvas]);

    const getMousePos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const handleStart = (e) => {
        e.preventDefault();
        const pos = getMousePos(e);
        setIsDrawing(true);
        
        if (drawingMode === 'pencil') {
            setCurrentStroke([pos]);
        } else {
            setDragStart(pos);
        }
    };

    const handleMove = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        
        const pos = getMousePos(e);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (drawingMode === 'pencil') {
            const newStroke = [...currentStroke, pos];
            setCurrentStroke(newStroke);
            
            redrawCanvas();
            
            if (newStroke.length > 1) {
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = strokeWidth;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                
                ctx.beginPath();
                ctx.moveTo(newStroke[0].x, newStroke[0].y);
                newStroke.forEach(point => {
                    ctx.lineTo(point.x, point.y);
                });
                ctx.stroke();
            }
        } else if (dragStart) {
            redrawCanvas();
            
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            
            if (drawingMode === 'rectangle') {
                const rectWidth = pos.x - dragStart.x;
                const rectHeight = pos.y - dragStart.y;
                ctx.strokeRect(
                    Math.min(dragStart.x, pos.x),
                    Math.min(dragStart.y, pos.y),
                    Math.abs(rectWidth),
                    Math.abs(rectHeight)
                );
            } else if (drawingMode === 'circle') {
                const radius = Math.sqrt(
                    Math.pow(pos.x - dragStart.x, 2) + Math.pow(pos.y - dragStart.y, 2)
                );
                ctx.beginPath();
                ctx.arc(dragStart.x, dragStart.y, radius, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }
    };

    const handleEnd = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        
        const pos = getMousePos(e);
        
        if (drawingMode === 'pencil' && currentStroke.length > 0) {
            const newStroke = {
                type: 'pencil',
                points: currentStroke,
                color: strokeColor,
                strokeWidth: strokeWidth,
                timestamp: Date.now()
            };
            setStrokes(prev => [...prev, newStroke]);
            setCurrentStroke([]);
        } else if (dragStart) {
            let newStroke;
            
            if (drawingMode === 'rectangle') {
                newStroke = {
                    type: 'rectangle',
                    x: Math.min(dragStart.x, pos.x),
                    y: Math.min(dragStart.y, pos.y),
                    rectWidth: Math.abs(pos.x - dragStart.x),
                    rectHeight: Math.abs(pos.y - dragStart.y),
                    color: strokeColor,
                    strokeWidth: strokeWidth,
                    timestamp: Date.now()
                };
            } else if (drawingMode === 'circle') {
                const radius = Math.sqrt(
                    Math.pow(pos.x - dragStart.x, 2) + Math.pow(pos.y - dragStart.y, 2)
                );
                newStroke = {
                    type: 'circle',
                    x: dragStart.x,
                    y: dragStart.y,
                    radius: radius,
                    color: strokeColor,
                    strokeWidth: strokeWidth,
                    timestamp: Date.now()
                };
            }
            
            if (newStroke) {
                setStrokes(prev => [...prev, newStroke]);
            }
            setDragStart(null);
        }
        
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        setStrokes([]);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const saveDrawing = async () => {
        if (strokes.length === 0) {
            alert('No drawing to save!');
            return;
        }

        setIsSaving(true);
        
        const drawingData = {
            strokes: strokes,
            canvasWidth: canvasRef.current.width,
            canvasHeight: canvasRef.current.height,
            createdAt: new Date().toISOString()
        };

        console.log("saving drawing", drawingData);
        
        try {
            const response = await fetch('/api/save-drawing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(drawingData)
            });

            if (response.ok) {
                alert('Drawing saved successfully!');
            } else {
                throw new Error('Failed to save drawing');
            }
        } catch (error) {
            console.error('Error saving drawing:', error);
            alert('Failed to save drawing. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white shadow-sm p-4 border-gray-200 border-b">
                <h1 className="font-bold text-gray-800 text-2xl">Drawing Canvas</h1>
                <p className="text-gray-600 text-sm">Draw freely on the canvas below</p>
            </div>

            {/* Controls - Scrollable */}
            <div className="bg-white p-4 border-gray-200 border-b max-h-48 overflow-y-auto">
                <div className="space-y-4 mx-auto max-w-6xl">
                    {/* Drawing Mode Selector */}
                    <div>
                        <h3 className="mb-2 font-semibold text-gray-700 text-sm">Drawing Mode</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDrawingMode('pencil')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                                    drawingMode === 'pencil'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                                }`}
                            >
                                <FaPencilAlt className="w-4 h-4" />
                                Pencil
                            </button>
                            <button
                                onClick={() => setDrawingMode('rectangle')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                                    drawingMode === 'rectangle'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                                }`}
                            >
                                <FaSquare className="w-4 h-4" />
                                Rectangle
                            </button>
                            <button
                                onClick={() => setDrawingMode('circle')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                                    drawingMode === 'circle'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                                }`}
                            >
                                <FaCircle className="w-4 h-4" />
                                Circle
                            </button>
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <h3 className="mb-2 font-semibold text-gray-700 text-sm">Colors</h3>
                        <div className="flex flex-wrap gap-2">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setStrokeColor(color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                                        strokeColor === color
                                            ? 'border-gray-800 scale-110 shadow-lg'
                                            : 'border-gray-300'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Brush Size */}
                    <div>
                        <h3 className="mb-2 font-semibold text-gray-700 text-sm">
                            Brush Size: {strokeWidth}px
                        </h3>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={strokeWidth}
                            onChange={(e) => setStrokeWidth(Number(e.target.value))}
                            className="bg-gray-200 rounded-lg w-full max-w-xs h-2 appearance-none cursor-pointer slider"
                        />
                    </div>

                    {/* Current Color Preview */}
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-700 text-sm">Current:</span>
                        <div 
                            className="border-2 border-gray-300 rounded-full w-6 h-6"
                            style={{ backgroundColor: strokeColor }}
                        />
                        <span className="text-gray-600 text-sm">{strokeWidth}px {drawingMode}</span>
                    </div>
                </div>
            </div>

            {/* Canvas Container */}
            <div className="flex-1 p-4">
                <div className="mx-auto max-w-6xl h-full">
                    <div className="relative bg-white shadow-lg border border-gray-200 rounded-lg h-full min-h-[500px] overflow-hidden">
                        <canvas
                            ref={canvasRef}
                            className="w-full h-full cursor-crosshair"
                            onMouseDown={handleStart}
                            onMouseMove={handleMove}
                            onMouseUp={handleEnd}
                            onMouseLeave={handleEnd}
                            onTouchStart={handleStart}
                            onTouchMove={handleMove}
                            onTouchEnd={handleEnd}
                        />
                        
                        {/* Canvas Instructions */}
                        {strokes.length === 0 && (
                            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                                <div className="text-gray-400 text-center">
                                    <div className="mb-2 text-4xl">🎨</div>
                                    <p className="font-medium text-lg">Start drawing!</p>
                                    <p className="text-sm">Select a mode and click to draw</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white p-4 border-gray-200 border-t">
                <div className="flex justify-center gap-4 mx-auto max-w-6xl">
                    <button
                        onClick={clearCanvas}
                        disabled={strokes.length === 0}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 shadow-md hover:shadow-lg px-6 py-3 rounded-lg font-medium text-white transition-colors duration-200 disabled:cursor-not-allowed"
                    >
                        <FaTrash className="w-4 h-4" />
                        Clear Canvas
                    </button>
                    
                    <button
                        onClick={saveDrawing}
                        disabled={strokes.length === 0 || isSaving}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 shadow-md hover:shadow-lg px-6 py-3 rounded-lg font-medium text-white transition-colors duration-200 disabled:cursor-not-allowed"
                    >
                        <FaSave className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save Drawing'}
                    </button>
                </div>
                
                {/* Drawing Stats */}
                <div className="mx-auto mt-3 max-w-6xl text-gray-500 text-sm text-center">
                    {strokes.length > 0 && (
                        <p>{strokes.length} stroke{strokes.length !== 1 ? 's' : ''} drawn</p>
                    )}
                </div>
            </div>

            {/* Custom Slider Styles */}
            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
                    transition: all 0.2s ease;
                }
                .slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
                }
                .slider::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
                }
            `}</style>
        </div>
    );
};

export default DrawingBoard;