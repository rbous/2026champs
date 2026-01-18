'use client';

export default function GameBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Subtle Grid Pattern handled by globals.css body, but we add some corner decorations */}

            {/* Top Left */}
            <div className="absolute top-0 left-0 w-32 h-32 opacity-20">
                <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-[var(--color-pink)] animate-bounce-slow" />
                <div className="absolute top-12 left-12 w-8 h-8 rounded-lg bg-[var(--color-yellow)] animate-spin-slow" />
            </div>

            {/* Bottom Right */}
            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20">
                <div className="absolute bottom-4 right-4 w-16 h-16 rounded-full bg-[var(--color-blue)] animate-bounce-slow" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-16 right-16 w-6 h-6 transform rotate-45 bg-[var(--color-green)]" />
            </div>

            {/* Floating particles - very static to not distract */}
            <div className="absolute top-1/4 right-1/4 text-4xl opacity-10 rotate-12">✨</div>
            <div className="absolute bottom-1/4 left-1/4 text-4xl opacity-10 -rotate-12">🌀</div>
        </div>
    );
}
