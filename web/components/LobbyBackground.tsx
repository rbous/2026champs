'use client';

import { useEffect, useRef, useState } from 'react';

type Shape = {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    type: 'circle' | 'square' | 'triangle';
    size: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
};

const COLORS = [
    'var(--color-pink)',
    'var(--color-yellow)',
    'var(--color-blue)',
    'var(--color-green)',
    'var(--color-purple)'
];

export default function LobbyBackground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [shapes, setShapes] = useState<Shape[]>([]);
    const requestRef = useRef<number | null>(null);

    // Initialize shapes
    useEffect(() => {
        const newShapes = Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            vx: (Math.random() - 0.5) * 0.05, // Slower than main page
            vy: (Math.random() - 0.5) * 0.05,
            type: (Math.random() > 0.6 ? 'circle' : Math.random() > 0.5 ? 'square' : 'triangle') as 'circle' | 'square' | 'triangle',
            size: 40 + Math.random() * 60,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 0.5, // Slow rotation
        }));
        setShapes(newShapes);
    }, []);

    // Animation Loop
    useEffect(() => {
        const animate = () => {
            setShapes((prevShapes) =>
                prevShapes.map((shape) => {
                    let { x, y, vx, vy, rotation, rotationSpeed } = shape;

                    // Update position
                    x += vx;
                    y += vy;
                    rotation += rotationSpeed;

                    // Soft bounce off walls
                    if (x <= -10 || x >= 110) vx *= -1;
                    if (y <= -10 || y >= 110) vy *= -1;

                    return { ...shape, x, y, vx, vy, rotation };
                })
            );
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
        }
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-40"
        >
            {shapes.map((shape) => (
                <div
                    key={shape.id}
                    className="absolute transition-transform will-change-transform mix-blend-multiply"
                    style={{
                        left: `${shape.x}%`,
                        top: `${shape.y}%`,
                        width: `${shape.size}px`,
                        height: `${shape.size}px`,
                        backgroundColor: shape.type === 'triangle' ? 'transparent' : shape.color,
                        borderRadius: shape.type === 'circle' ? '50%' : shape.type === 'square' ? '12px' : '0',
                        transform: `translate(-50%, -50%) rotate(${shape.rotation}deg)`,
                        borderBottom: shape.type === 'triangle' ? `${shape.size}px solid ${shape.color}` : 'none',
                        borderLeft: shape.type === 'triangle' ? `${shape.size / 2}px solid transparent` : 'none',
                        borderRight: shape.type === 'triangle' ? `${shape.size / 2}px solid transparent` : 'none',
                    }}
                />
            ))}
        </div>
    );
}
