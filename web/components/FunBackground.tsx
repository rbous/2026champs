'use client';

import { useEffect, useRef, useState } from 'react';

type FloatingObject = {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    emoji: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
};

const EMOJIS = ['🎉', '🎈', '✨', '🎸', '🎹', '⭐', '🍭', '🍕', '🚀', '💿'];

export default function FunBackground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [objects, setObjects] = useState<FloatingObject[]>([]);
    const requestRef = useRef<number | null>(null);

    // Initialize objects
    useEffect(() => {
        const newObjects = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            vx: (Math.random() - 0.5) * 0.1,
            vy: (Math.random() - 0.5) * 0.1,
            emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
            size: 20 + Math.random() * 40,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 2,
        }));
        setObjects(newObjects);
    }, []);

    // Animation Loop
    useEffect(() => {
        const animate = () => {
            setObjects((prevObjs) =>
                prevObjs.map((obj) => {
                    let { x, y, vx, vy, rotation, rotationSpeed } = obj;

                    // Update position
                    x += vx;
                    y += vy;
                    rotation += rotationSpeed;

                    // Bounce off walls
                    if (x <= 0 || x >= 100) vx *= -1;
                    if (y <= 0 || y >= 100) vy *= -1;

                    // Keep within bounds
                    x = Math.max(0, Math.min(100, x));
                    y = Math.max(0, Math.min(100, y));

                    return { ...obj, x, y, vx, vy, rotation };
                })
            );
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current !== null) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);

    // Mouse Interaction
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
        const mouseY = ((e.clientY - rect.top) / rect.height) * 100;

        setObjects((prevObjs) =>
            prevObjs.map((obj) => {
                const dx = obj.x - mouseX;
                const dy = obj.y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Repel force
                if (dist < 15) {
                    return {
                        ...obj,
                        vx: obj.vx + (dx / dist) * 0.5,
                        vy: obj.vy + (dy / dist) * 0.5,
                        rotationSpeed: obj.rotationSpeed * 1.1, // Spin faster!
                    };
                }

                // Natural friction/return to normal speed
                return {
                    ...obj,
                    vx: obj.vx * 0.99,
                    vy: obj.vy * 0.99,
                    rotationSpeed: obj.rotationSpeed * 0.99 + (obj.rotationSpeed > 0 ? 0.01 : -0.01) // degrade spin
                };
            })
        );
    };

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 overflow-hidden pointer-events-none z-0"
            onMouseMove={handleMouseMove}
            style={{ pointerEvents: 'auto' }} // Enable mouse events for interaction
        >
            {objects.map((obj) => (
                <div
                    key={obj.id}
                    className="absolute select-none cursor-default transition-transform will-change-transform"
                    style={{
                        left: `${obj.x}%`,
                        top: `${obj.y}%`,
                        fontSize: `${obj.size}px`,
                        transform: `translate(-50%, -50%) rotate(${obj.rotation}deg)`,
                    }}
                >
                    {obj.emoji}
                </div>
            ))}
        </div>
    );
}
