import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    FaPencilAlt,
    FaFont,
    FaSquare,
    FaCircle,
    FaArrowsAlt,
    FaMinus,
    FaTrash,
    FaDownload,
    FaUndo,
    FaPalette,
    FaBars,
    FaTimes,
    FaLink,
    FaExpandArrowsAlt
} from 'react-icons/fa';
import { ChevronDown,ChevronUp } from 'lucide-react';

const DrawingBoard = () => {
    const canvasRef = useRef(null);
    const textInputRef = useRef(null);
    const [tool, setTool] = useState('pen');
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [fillColor, setFillColor] = useState('transparent');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [shapes, setShapes] = useState([]);
    const [selectedShape, setSelectedShape] = useState(null);
    const [dragStart, setDragStart] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
    const [connections, setConnections] = useState([]);
    const [connectingFrom, setConnectingFrom] = useState(null);
    const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    // Fixed undo/redo functionality
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const tools = [
        { id: 'pen', icon: FaPencilAlt, name: 'Pen', color: 'from-purple-500 to-pink-500' },
        { id: 'text', icon: FaFont, name: 'Text', color: 'from-blue-500 to-cyan-500' },
        { id: 'rectangle', icon: FaSquare, name: 'Rectangle', color: 'from-green-500 to-emerald-500' },
        { id: 'circle', icon: FaCircle, name: 'Circle', color: 'from-orange-500 to-red-500' },
        { id: 'select', icon: FaArrowsAlt, name: 'Select', color: 'from-indigo-500 to-purple-500' },
        { id: 'line', icon: FaMinus, name: 'Line', color: 'from-gray-500 to-slate-600' },
    ];

    const colors = [
        '#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFFFFF',
        '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
        '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
    ];

    const fillColors = [
        'transparent', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFFFFF',
        '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
        '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
    ];

    // Update canvas size on window resize
    useEffect(() => {
        const updateCanvasSize = () => {
            const navbar = document.querySelector('.toolbar');
            const navbarHeight = navbar ? navbar.offsetHeight : 80;
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight - navbarHeight;
            setCanvasSize({ width: newWidth, height: newHeight });
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        return () => window.removeEventListener('resize', updateCanvasSize);
    }, [isToolbarCollapsed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    }, []);

    // Fixed saveToHistory function
    const saveToHistory = useCallback(() => {
        const currentState = {
            shapes: JSON.parse(JSON.stringify(shapes)),
            connections: JSON.parse(JSON.stringify(connections)),
            selectedShape
        };

        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            return [...newHistory, currentState];
        });
        setHistoryIndex(prev => prev + 1);
    }, [shapes, connections, selectedShape, historyIndex]);

    const redraw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all shapes
        shapes.forEach((shape, index) => {
            ctx.strokeStyle = shape.strokeColor || shape.color || '#000000';
            ctx.fillStyle = shape.fillColor || 'transparent';
            ctx.lineWidth = shape.strokeWidth;

            if (shape.type === 'path') {
                ctx.beginPath();
                shape.points.forEach((point, i) => {
                    if (i === 0) ctx.moveTo(point.x, point.y);
                    else ctx.lineTo(point.x, point.y);
                });
                ctx.stroke();
            } else if (shape.type === 'rectangle') {
                if (shape.fillColor && shape.fillColor !== 'transparent') {
                    ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
                }
                ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                if (selectedShape === index) {
                    ctx.strokeStyle = '#3B82F6';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([8, 4]);
                    ctx.strokeRect(shape.x - 4, shape.y - 4, shape.width + 8, shape.height + 8);
                    ctx.setLineDash([]);
                }
            } else if (shape.type === 'circle') {
                ctx.beginPath();
                ctx.arc(shape.x + shape.radius, shape.y + shape.radius, shape.radius, 0, 2 * Math.PI);
                if (shape.fillColor && shape.fillColor !== 'transparent') {
                    ctx.fill();
                }
                ctx.stroke();
                if (selectedShape === index) {
                    ctx.strokeStyle = '#3B82F6';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([8, 4]);
                    ctx.strokeRect(shape.x - 4, shape.y - 4, shape.radius * 2 + 8, shape.radius * 2 + 8);
                    ctx.setLineDash([]);
                }
            } else if (shape.type === 'text') {
                ctx.font = `${Math.max(16, shape.strokeWidth * 8)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
                ctx.fillStyle = shape.strokeColor || shape.color || '#000000';
                ctx.fillText(shape.text, shape.x, shape.y);
                if (selectedShape === index) {
                    const metrics = ctx.measureText(shape.text);
                    ctx.strokeStyle = '#3B82F6';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([8, 4]);
                    ctx.strokeRect(shape.x - 4, shape.y - 24, metrics.width + 8, 32);
                    ctx.setLineDash([]);
                }
            } else if (shape.type === 'line') {
                ctx.beginPath();
                ctx.moveTo(shape.x1, shape.y1);
                ctx.lineTo(shape.x2, shape.y2);
                ctx.stroke();
            }
        });

        // Draw connections with enhanced style
        connections.forEach(connection => {
            const fromShape = shapes[connection.from];
            const toShape = shapes[connection.to];

            if (fromShape && toShape) {
                ctx.strokeStyle = '#6366F1';
                ctx.lineWidth = 3;
                ctx.setLineDash([10, 5]);

                const fromCenter = getShapeCenter(fromShape);
                const toCenter = getShapeCenter(toShape);

                ctx.beginPath();
                ctx.moveTo(fromCenter.x, fromCenter.y);
                ctx.lineTo(toCenter.x, toCenter.y);
                ctx.stroke();
                ctx.setLineDash([]);

                // Enhanced arrow
                const angle = Math.atan2(toCenter.y - fromCenter.y, toCenter.x - fromCenter.x);
                const arrowLength = 15;
                ctx.beginPath();
                ctx.moveTo(toCenter.x, toCenter.y);
                ctx.lineTo(
                    toCenter.x - arrowLength * Math.cos(angle - Math.PI / 6),
                    toCenter.y - arrowLength * Math.sin(angle - Math.PI / 6)
                );
                ctx.moveTo(toCenter.x, toCenter.y);
                ctx.lineTo(
                    toCenter.x - arrowLength * Math.cos(angle + Math.PI / 6),
                    toCenter.y - arrowLength * Math.sin(angle + Math.PI / 6)
                );
                ctx.stroke();
            }
        });

        // Draw inline text input if typing
        if (isTyping && textPosition) {
            // Draw the text being typed
            ctx.font = `${Math.max(16, strokeWidth * 8)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
            ctx.fillStyle = strokeColor;
            ctx.fillText(textInput, textPosition.x, textPosition.y);

            // Draw selection box
            ctx.strokeStyle = '#3B82F6';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            const textWidth = Math.max(100, ctx.measureText(textInput).width + 20);
            ctx.strokeRect(textPosition.x - 5, textPosition.y - 25, textWidth, 30);
            ctx.setLineDash([]);

            // Draw blinking cursor
            const cursorX = textPosition.x + ctx.measureText(textInput).width;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cursorX, textPosition.y - 20);
            ctx.lineTo(cursorX, textPosition.y + 5);
            ctx.stroke();
        }
    }, [shapes, selectedShape, connections, isTyping, textPosition, textInput, strokeColor]);

    const getShapeCenter = (shape) => {
        if (shape.type === 'rectangle') {
            return { x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 };
        } else if (shape.type === 'circle') {
            return { x: shape.x + shape.radius, y: shape.y + shape.radius };
        } else if (shape.type === 'text') {
            return { x: shape.x, y: shape.y };
        }
        return { x: shape.x || 0, y: shape.y || 0 };
    };

    useEffect(() => {
        redraw();
    }, [redraw]);

    const getMousePos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        // Handle both mouse and touch events
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const findShapeAtPoint = (x, y) => {
        for (let i = shapes.length - 1; i >= 0; i--) {
            const shape = shapes[i];
            if (shape.type === 'rectangle') {
                if (x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height) {
                    return i;
                }
            } else if (shape.type === 'circle') {
                const dx = x - (shape.x + shape.radius);
                const dy = y - (shape.y + shape.radius);
                if (Math.sqrt(dx * dx + dy * dy) <= shape.radius) {
                    return i;
                }
            } else if (shape.type === 'text') {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.font = `${Math.max(16, shape.strokeWidth * 8)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
                const metrics = ctx.measureText(shape.text);
                if (x >= shape.x && x <= shape.x + metrics.width && y >= shape.y - 20 && y <= shape.y + 12) {
                    return i;
                }
            }
        }
        return null;
    };

    const handleStart = (e) => {
        e.preventDefault();

        // If typing, finish the current text
        if (isTyping) {
            finishTextInput();
            return;
        }

        const pos = getMousePos(e);

        if (tool === 'select') {
            const shapeIndex = findShapeAtPoint(pos.x, pos.y);
            if (shapeIndex !== null) {
                if (connectingFrom !== null) {
                    if (connectingFrom !== shapeIndex) {
                        saveToHistory();
                        setConnections(prev => [...prev, { from: connectingFrom, to: shapeIndex }]);
                    }
                    setConnectingFrom(null);
                } else {
                    setSelectedShape(shapeIndex);
                    setDragStart(pos);
                }
            } else {
                setSelectedShape(null);
                setConnectingFrom(null);
            }
        } else if (tool === 'pen') {
            saveToHistory();
            setIsDrawing(true);
            const newShape = {
                type: 'path',
                points: [pos],
                strokeColor,
                fillColor: 'transparent',
                strokeWidth
            };
            setShapes(prev => [...prev, newShape]);
        } else if (tool === 'text') {
            setIsTyping(true);
            setTextPosition(pos);
            setTextInput('');
            // Focus on canvas for keyboard input
            if (canvasRef.current) {
                canvasRef.current.focus();
            }
        } else if (['rectangle', 'circle', 'line'].includes(tool)) {
            saveToHistory();
            setIsDrawing(true);
            setDragStart(pos);
        }
    };

    const handleMove = (e) => {
        e.preventDefault();
        const pos = getMousePos(e);

        if (tool === 'select' && selectedShape !== null && dragStart) {
            const dx = pos.x - dragStart.x;
            const dy = pos.y - dragStart.y;

            setShapes(prev => prev.map((shape, index) => {
                if (index === selectedShape) {
                    if (shape.type === 'rectangle' || shape.type === 'circle' || shape.type === 'text') {
                        return { ...shape, x: shape.x + dx, y: shape.y + dy };
                    }
                }
                return shape;
            }));
            setDragStart(pos);
        } else if (isDrawing && tool === 'pen') {
            setShapes(prev => {
                const newShapes = [...prev];
                const currentShape = newShapes[newShapes.length - 1];
                if (currentShape) {
                    currentShape.points.push(pos);
                }
                return newShapes;
            });
        } else if (isDrawing && dragStart) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            redraw();

            ctx.strokeStyle = strokeColor;
            ctx.fillStyle = fillColor;
            ctx.lineWidth = strokeWidth;

            if (tool === 'rectangle') {
                const width = pos.x - dragStart.x;
                const height = pos.y - dragStart.y;
                if (fillColor && fillColor !== 'transparent') {
                    ctx.fillRect(dragStart.x, dragStart.y, width, height);
                }
                ctx.strokeRect(dragStart.x, dragStart.y, width, height);
            } else if (tool === 'circle') {
                const radius = Math.sqrt(Math.pow(pos.x - dragStart.x, 2) + Math.pow(pos.y - dragStart.y, 2));
                ctx.beginPath();
                ctx.arc(dragStart.x, dragStart.y, radius, 0, 2 * Math.PI);
                if (fillColor && fillColor !== 'transparent') {
                    ctx.fill();
                }
                ctx.stroke();
            } else if (tool === 'line') {
                ctx.beginPath();
                ctx.moveTo(dragStart.x, dragStart.y);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
            }
        }
    };

    const handleEnd = (e) => {
        e.preventDefault();
        if (isDrawing && dragStart && ['rectangle', 'circle', 'line'].includes(tool)) {
            const pos = getMousePos(e);

            let newShape;
            if (tool === 'rectangle') {
                newShape = {
                    type: 'rectangle',
                    x: Math.min(dragStart.x, pos.x),
                    y: Math.min(dragStart.y, pos.y),
                    width: Math.abs(pos.x - dragStart.x),
                    height: Math.abs(pos.y - dragStart.y),
                    strokeColor,
                    fillColor,
                    strokeWidth
                };
            } else if (tool === 'circle') {
                const radius = Math.sqrt(Math.pow(pos.x - dragStart.x, 2) + Math.pow(pos.y - dragStart.y, 2));
                newShape = {
                    type: 'circle',
                    x: dragStart.x - radius,
                    y: dragStart.y - radius,
                    radius,
                    strokeColor,
                    fillColor,
                    strokeWidth
                };
            } else if (tool === 'line') {
                newShape = {
                    type: 'line',
                    x1: dragStart.x,
                    y1: dragStart.y,
                    x2: pos.x,
                    y2: pos.y,
                    strokeColor,
                    fillColor: 'transparent',
                    strokeWidth
                };
            }

            if (newShape) {
                setShapes(prev => [...prev, newShape]);
            }
        }

        setIsDrawing(false);
        setDragStart(null);
    };

    // Handle keyboard input for text
    const handleKeyDown = (e) => {
        if (isTyping) {
            if (e.key === 'Enter') {
                finishTextInput();
            } else if (e.key === 'Escape') {
                setIsTyping(false);
                setTextInput('');
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                setTextInput(prev => prev.slice(0, -1));
            } else if (e.key.length === 1) {
                e.preventDefault();
                setTextInput(prev => prev + e.key);
            }
        } else if (e.key === 'Delete' && selectedShape !== null) {
            deleteSelected();
        } else if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z') {
                e.preventDefault();
                undo();
            }
        }
    };

    const finishTextInput = () => {
        if (textInput.trim()) {
            saveToHistory();
            const newShape = {
                type: 'text',
                text: textInput,
                x: textPosition.x,
                y: textPosition.y,
                strokeColor,
                fillColor: 'transparent',
                strokeWidth
            };
            setShapes(prev => [...prev, newShape]);
        }
        setIsTyping(false);
        setTextInput('');
    };

    const clearCanvas = () => {
        saveToHistory();
        setShapes([]);
        setConnections([]);
        setSelectedShape(null);
        setConnectingFrom(null);
    };

    const deleteSelected = () => {
        if (selectedShape !== null) {
            saveToHistory();
            setShapes(prev => prev.filter((_, index) => index !== selectedShape));
            setConnections(prev => prev.filter(conn => conn.from !== selectedShape && conn.to !== selectedShape));
            setSelectedShape(null);
        }
    };

    // Fixed undo function
    const undo = () => {
        if (historyIndex >= 0) {
            const previousState = history[historyIndex];
            setShapes(previousState.shapes);
            setConnections(previousState.connections);
            setSelectedShape(previousState.selectedShape);
            setHistoryIndex(prev => prev - 1);
        }
    };

    const downloadCanvas = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    const connectShapes = () => {
        if (selectedShape !== null) {
            setConnectingFrom(selectedShape);
        }
    };

    // Add keyboard event listener
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isTyping, textInput, selectedShape]);

    return (
        <div className="flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 w-full h-screen overflow-hidden">
            {/* Modern Toolbar */}
            <div className={`toolbar fixed  left-0 right-0 z-50 transition-all duration-300 ease-in-out 
    ${isToolbarCollapsed ? 'h-16' : 'h-auto'} 
    bg-gradient-to-r from-teal-500 to-teal-400 backdrop-blur-xl 
    shadow-lg border-b border-white/10`}>
    
    {/* Header with Toggle */}
    <div className="flex justify-between items-center px-6 py-3 border border-white/50">
        {/* Logo/Title */}
        <div className="flex items-center space-x-4">
            <div className="flex justify-center items-center bg-white/10 backdrop-blur-sm border border-white/90 rounded-xl w-10 h-10">
                <FaPalette className="text-white text-xl" />
            </div>
            <h1 className="font-bold text-white text-2xl">
                DrawBoard
            </h1>
        </div>

        {/* Toggle Button */}
        <button
            onClick={() => setIsToolbarCollapsed(!isToolbarCollapsed)}
            className="group relative bg-white/10 hover:bg-white/20 p-2.5 border border-white/20 hover:border-white/30 rounded-xl hover:scale-105 transition-all duration-300"
        >
            {isToolbarCollapsed ? (
                <ChevronDown className="w-6 h-6 text-white" />
            ) : (
                <ChevronUp className="w-6 h-6 text-white" />
            )}
            <span className="-bottom-12 left-1/2 absolute bg-black/75 opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-lg text-white text-xs whitespace-nowrap transition-all -translate-x-1/2 duration-200 transform">
                {isToolbarCollapsed ? 'Expand Toolbar' : 'Collapse Toolbar'}
            </span>
        </button>
    </div>

    {/* Tools Container */}
    <div className={`${isToolbarCollapsed ? 'max-h-0' : 'max-h-[500px]'} 
        overflow-hidden transition-all duration-300 ease-in-out`}>
        <div className="flex flex-wrap items-center gap-4 bg-white/5 p-6">
            {/* Tools Section */}
            <div className="flex flex-wrap gap-2">
                {tools.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTool(t.id)}
                        className={`group relative p-3 rounded-xl transition-all duration-200 
                            ${tool === t.id
                                ? 'bg-white text-steal-600 shadow-lg shadow-blue-500/20'
                                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                            } hover:scale-105`}
                        title={t.name}
                    >
                        <t.icon size={20} />
                        <div className="-top-12 left-1/2 absolute bg-black/75 opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-lg text-white text-xs whitespace-nowrap transition-all -translate-x-1/2 duration-200 transform">
                            {t.name}
                        </div>
                    </button>
                ))}
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block bg-white/20 w-px h-10"></div>

            {/* Color Palettes */}
            <div className="flex sm:flex-row flex-col gap-4">
                {/* Stroke Colors */}
                <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-600 text-sm whitespace-nowrap">Stroke</span>
                    <div className="flex gap-2">
                        {colors.map((c) => (
                            <button
                                key={c}
                                onClick={() => setStrokeColor(c)}
                                className={`w-8 h-8 rounded-full border-3 transition-all duration-200 transform hover:scale-110 ${strokeColor === c
                                    ? 'border-gray-900 shadow-lg scale-110'
                                    : 'border-white shadow-md hover:shadow-lg'
                                    }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>

                {/* Fill Colors */}
                <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-600 text-sm whitespace-nowrap">Fill</span>
                    <div className="flex gap-2">
                        {fillColors.map((c) => (
                            <button
                                key={c}
                                onClick={() => setFillColor(c)}
                                className={`w-8 h-8 rounded-full border-3 transition-all duration-200 transform hover:scale-110 relative ${fillColor === c
                                    ? 'border-gray-900 shadow-lg scale-110'
                                    : 'border-white shadow-md hover:shadow-lg'
                                    }`}
                                style={{ backgroundColor: c === 'transparent' ? '#ffffff' : c }}
                            >
                                {c === 'transparent' && (
                                    <div className="absolute inset-0 flex justify-center items-center">
                                        <div className="bg-red-500 rounded-full w-6 h-0.5 rotate-45 transform"></div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stroke Width */}
            <div className="flex items-center gap-3">
                <span className="font-medium text-gray-600 text-sm whitespace-nowrap">Size</span>
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="bg-gray-200 rounded-lg w-24 h-2 appearance-none cursor-pointer slider"
                />
                <span className="w-8 font-medium text-gray-600 text-sm">{strokeWidth}px</span>
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block bg-white/20 w-px h-10"></div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                {selectedShape !== null && (
                    <>
                        <button
                            onClick={connectShapes}
                            className={`p-3 rounded-xl transition-all duration-200 ${connectingFrom !== null
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                                : 'bg-white/10 hover:bg-orange-50 text-orange-600 border border-orange-200 hover:shadow-lg'
                                }`}
                            title="Connect shapes"
                        >
                            <FaLink size={16} />
                        </button>
                        <button
                            onClick={deleteSelected}
                            className="bg-gradient-to-r from-red-500 hover:from-red-600 to-pink-500 hover:to-pink-600 shadow-lg hover:shadow-xl p-3 rounded-xl text-white hover:scale-105 transition-all duration-200 transform"
                            title="Delete selected"
                        >
                            <FaTrash size={16} />
                        </button>
                    </>
                )}

                <button
                    onClick={undo}
                    className="bg-gradient-to-r from-blue-500 hover:from-blue-600 to-indigo-500 hover:to-indigo-600 shadow-lg hover:shadow-xl p-3 rounded-xl text-white hover:scale-105 transition-all duration-200 transform"
                    title="Undo (Ctrl+Z)"
                    disabled={historyIndex < 0}
                >
                    <FaUndo size={16} />
                </button>

                <button
                    onClick={clearCanvas}
                    className="bg-gradient-to-r from-gray-500 hover:from-gray-600 to-slate-600 hover:to-slate-700 shadow-lg hover:shadow-xl p-3 rounded-xl text-white hover:scale-105 transition-all duration-200 transform"
                    title="Clear canvas"
                >
                    <FaTrash size={16} />
                </button>

                <button
                    onClick={downloadCanvas}
                    className="bg-gradient-to-r from-green-500 hover:from-green-600 to-emerald-500 hover:to-emerald-600 shadow-lg hover:shadow-xl p-3 rounded-xl text-white hover:scale-105 transition-all duration-200 transform"
                    title="Download image"
                >
                    <FaDownload size={16} />
                </button>
            </div>

            {/* Status indicators */}
            <div className="flex items-center gap-4">
                {connectingFrom !== null && (
                    <div className="flex items-center space-x-2 bg-orange-50 px-4 py-2 border border-orange-200 rounded-full">
                        <FaExpandArrowsAlt className="text-orange-500" />
                        <span className="font-medium text-orange-600 text-sm">
                            Click another shape to connect
                        </span>
                    </div>
                )}

                {isTyping && (
                    <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 border border-blue-200 rounded-full">
                        <FaFont className="text-blue-500" />
                        <span className="font-medium text-blue-600 text-sm">
                            Type text, press Enter to finish
                        </span>
                    </div>
                )}
            </div>
        </div>
    </div>
</div>

            {/* Canvas Container */}
            <div className="relative flex-1 overflow-hidden" 
    style={{ paddingTop: isToolbarCollapsed ? '64px' : '120px' }}>
                <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    className="bg-white focus:outline-none touch-none cursor-crosshair"
                    style={{
                        cursor: tool === 'pen' ? 'url("data:image/svg+xml,%3csvg width=\'16\' height=\'16\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'M2 14L14 2M14 2v8M14 2h-8\' stroke=\'%23000\' stroke-width=\'2\' fill=\'none\'/%3e%3c/svg%3e") 2 14, crosshair' :
                            tool === 'text' ? 'text' :
                                tool === 'select' ? 'pointer' :
                                    'crosshair'
                    }}
                    tabIndex={0}
                    onMouseDown={handleStart}
                    onMouseMove={handleMove}
                    onMouseUp={handleEnd}
                    onTouchStart={handleStart}
                    onTouchMove={handleMove}
                    onTouchEnd={handleEnd}
                />
            </div>

            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: linear-gradient(45deg, #3b82f6, #8b5cf6);
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                    transition: all 0.2s ease;
                }
                .slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6);
                }
                .slider::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: linear-gradient(45deg, #3b82f6, #8b5cf6);
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                    transition: all 0.2s ease;
                }
                .slider::-moz-range-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6);
                }
                .slider::-moz-range-track {
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 4px;
                }`}
            </style>
        </div>
    );
};

export default DrawingBoard;