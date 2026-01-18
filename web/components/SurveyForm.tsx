'use client';

import { useState, useEffect } from 'react';
import { type Question } from '@/lib/api';

export type QuestionInput = {
    type: 'ESSAY' | 'DEGREE' | 'MCQ';
    prompt: string;
    rubric: string;
    pointsMax: number;
    threshold: number;
    scaleMin: number;
    scaleMax: number;
    options: string[];
};

export const defaultQuestion: QuestionInput = {
    type: 'ESSAY',
    prompt: '',
    rubric: '',
    pointsMax: 100,
    threshold: 0.5,
    scaleMin: 1,
    scaleMax: 5,
    options: [],
};

// Helper to convert API Question to QuestionInput
export const toQuestionInput = (q: Question): QuestionInput => ({
    type: q.type,
    // Provide defaults for optional fields or fields that might be missing
    prompt: q.prompt || '',
    rubric: q.rubric || '',
    pointsMax: q.pointsMax || 100,
    threshold: q.threshold || 0.5,
    scaleMin: q.scaleMin || 1,
    scaleMax: q.scaleMax || 5,
    options: q.options || [],
});

interface SurveyFormProps {
    initialTitle?: string;
    initialIntent?: string;
    initialMaxFollowUps?: number;
    initialAllowSkipAfter?: number;
    initialQuestions?: QuestionInput[];
    onSubmit: (data: {
        title: string;
        intent: string;
        settings: {
            maxFollowUps: number;
            allowSkipAfter: number;
        };
        questions: QuestionInput[];
    }) => Promise<void>;
    submitLabel: string;
    isLoading?: boolean;
    error?: string;
}

export default function SurveyForm({
    initialTitle = '',
    initialIntent = '',
    initialMaxFollowUps = 2,
    initialAllowSkipAfter = 1,
    initialQuestions,
    onSubmit,
    submitLabel,
    isLoading = false,
    error: externalError,
}: SurveyFormProps) {
    const [title, setTitle] = useState(initialTitle);
    const [intent, setIntent] = useState(initialIntent);
    const [maxFollowUps, setMaxFollowUps] = useState(initialMaxFollowUps);
    const [allowSkipAfter, setAllowSkipAfter] = useState(initialAllowSkipAfter);
    const [questions, setQuestions] = useState<QuestionInput[]>(initialQuestions || [{ ...defaultQuestion }]);
    const [formError, setFormError] = useState('');

    // Update state if initial props change (e.g. data loaded async)
    useEffect(() => {
        if (initialTitle) setTitle(initialTitle);
        if (initialIntent) setIntent(initialIntent);
        if (initialMaxFollowUps) setMaxFollowUps(initialMaxFollowUps);
        if (initialAllowSkipAfter) setAllowSkipAfter(initialAllowSkipAfter);
        if (initialQuestions && initialQuestions.length > 0) setQuestions(initialQuestions);
    }, [initialTitle, initialIntent, initialMaxFollowUps, initialAllowSkipAfter, initialQuestions]);

    const addQuestion = () => {
        setQuestions([...questions, { ...defaultQuestion }]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const updateQuestion = (index: number, field: keyof QuestionInput, value: unknown) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !intent.trim()) {
            setFormError('Please fill in title and intent');
            return;
        }

        if (questions.some(q => !q.prompt.trim())) {
            setFormError('All questions must have a prompt');
            return;
        }

        if (questions.some(q => q.type === 'MCQ' && q.options.filter(opt => opt.trim()).length < 2)) {
            setFormError('MCQ questions must have at least 2 options');
            return;
        }

        setFormError('');

        await onSubmit({
            title,
            intent,
            settings: { maxFollowUps, allowSkipAfter },
            questions,
        });
    };

    const displayError = externalError || formError;

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in relative z-10">
            {/* Basic Info */}
            <div className="card-party group">
                <h2 className="text-3xl font-black mb-6 text-[var(--color-purple)] group-hover:animate-wiggle inline-block">
                    📋 Survey Deets
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="input-label">Title</label>
                        <input
                            type="text"
                            className="input-party"
                            placeholder="e.g., The Ultimate Snack Ranking"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="input-label">Intent / Goal</label>
                        <textarea
                            className="input-party"
                            placeholder="What's the vibe? What do we need to know?"
                            value={intent}
                            onChange={(e) => setIntent(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Max Follow-ups</label>
                            <input
                                type="number"
                                className="input-party font-mono"
                                min={0}
                                max={5}
                                value={maxFollowUps}
                                onChange={(e) => setMaxFollowUps(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div>
                            <label className="input-label">Allow Skip After</label>
                            <input
                                type="number"
                                className="input-party font-mono"
                                min={0}
                                max={5}
                                value={allowSkipAfter}
                                onChange={(e) => setAllowSkipAfter(parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-[var(--text-dark)]">❓ Questions</h2>
                    <button type="button" onClick={addQuestion} className="btn btn-secondary hover:rotate-2">
                        + Add New Question
                    </button>
                </div>

                {questions.map((q, index) => (
                    <div key={index} className="card-party animate-pop-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-center justify-between mb-6">
                            <span className="badge-party rotate-3" style={{ borderColor: 'var(--color-yellow)' }}>
                                Question #{index + 1}
                            </span>
                            {questions.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(index)}
                                    className="btn btn-ghost text-[var(--color-pink)] font-black text-xl hover:scale-110 hover:rotate-90 transition-transform"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Question Type */}
                            <div>
                                <label className="input-label mb-3">Type of Fun</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'ESSAY', label: 'Essay', icon: '✍️', desc: 'Open text vibes', color: 'var(--color-blue)' },
                                        { id: 'DEGREE', label: 'Rating', icon: '⭐', desc: '1 to 10 scale', color: 'var(--color-yellow)' },
                                        { id: 'MCQ', label: 'Choice', icon: '🤔', desc: 'Pick the best', color: 'var(--color-green)' }
                                    ].map((type) => (
                                        <div
                                            key={type.id}
                                            onClick={() => updateQuestion(index, 'type', type.id)}
                                            className={`choice-card-party flex flex-col gap-2 ${q.type === type.id ? 'selected' : ''}`}
                                            style={{ borderColor: q.type === type.id ? type.color : undefined }}
                                        >
                                            <div className="text-3xl mb-1 filter drop-shadow-sm">{type.icon}</div>
                                            <div className="font-bold text-lg">{type.label}</div>
                                            <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">{type.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Prompt */}
                            <div>
                                <label className="input-label">The Question</label>
                                <textarea
                                    className="input-party text-lg"
                                    placeholder="What's burning in your mind?"
                                    value={q.prompt}
                                    onChange={(e) => updateQuestion(index, 'prompt', e.target.value)}
                                    rows={2}
                                />
                            </div>

                            {/* Essay-specific fields */}
                            {q.type === 'ESSAY' && (
                                <div className="animate-fade-in p-4 bg-[var(--bg-cream)] rounded-xl border-2 border-dashed border-[var(--border-color)]">
                                    <div className="mb-4">
                                        <label className="input-label">Rubric (AI Brain)</label>
                                        <textarea
                                            className="input-party"
                                            placeholder="What makes a legendary answer?"
                                            value={q.rubric}
                                            onChange={(e) => updateQuestion(index, 'rubric', e.target.value)}
                                            rows={2}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="input-label">Max Points</label>
                                            <input
                                                type="number"
                                                className="input-party font-mono"
                                                min={1}
                                                max={1000}
                                                value={q.pointsMax}
                                                onChange={(e) => updateQuestion(index, 'pointsMax', parseInt(e.target.value) || 100)}
                                            />
                                        </div>
                                        <div>
                                            <label className="input-label">SAT Threshold</label>
                                            <input
                                                type="number"
                                                className="input-party font-mono"
                                                min={0}
                                                max={1}
                                                step={0.1}
                                                value={q.threshold}
                                                onChange={(e) => updateQuestion(index, 'threshold', parseFloat(e.target.value) || 0.5)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Degree-specific fields */}
                            {q.type === 'DEGREE' && (
                                <div className="grid grid-cols-3 gap-4 animate-fade-in p-4 bg-[var(--bg-cream)] rounded-xl border-2 border-dashed border-[var(--border-color)]">
                                    <div>
                                        <label className="input-label">Min</label>
                                        <input
                                            type="number"
                                            className="input-party font-mono text-center"
                                            min={1}
                                            max={10}
                                            value={q.scaleMin}
                                            onChange={(e) => updateQuestion(index, 'scaleMin', parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">Max</label>
                                        <input
                                            type="number"
                                            className="input-party font-mono text-center"
                                            min={1}
                                            max={10}
                                            value={q.scaleMax}
                                            onChange={(e) => updateQuestion(index, 'scaleMax', parseInt(e.target.value) || 5)}
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">Points</label>
                                        <input
                                            type="number"
                                            className="input-party font-mono text-center"
                                            min={1}
                                            max={100}
                                            value={q.pointsMax}
                                            onChange={(e) => updateQuestion(index, 'pointsMax', parseInt(e.target.value) || 20)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* MCQ-specific fields */}
                            {q.type === 'MCQ' && (
                                <div className="animate-fade-in p-4 bg-[var(--bg-cream)] rounded-xl border-2 border-dashed border-[var(--border-color)]">
                                    <div className="mb-4">
                                        <label className="input-label">Options</label>
                                        <div className="space-y-3">
                                            {q.options.map((option, optIndex) => (
                                                <div key={optIndex} className="flex gap-2">
                                                    <div className="flex-1 relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">👉</span>
                                                        <input
                                                            type="text"
                                                            className="input-party pl-10"
                                                            placeholder={`Option ${optIndex + 1}`}
                                                            value={option}
                                                            onChange={(e) => {
                                                                const newOptions = [...q.options];
                                                                newOptions[optIndex] = e.target.value;
                                                                updateQuestion(index, 'options', newOptions);
                                                            }}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newOptions = q.options.filter((_, i) => i !== optIndex);
                                                            updateQuestion(index, 'options', newOptions);
                                                        }}
                                                        className="btn btn-ghost text-[var(--color-pink)] hover:rotate-90 hover:scale-110 transition-transform"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newOptions = [...q.options, ''];
                                                    updateQuestion(index, 'options', newOptions);
                                                }}
                                                className="btn btn-secondary w-full border-dashed"
                                            >
                                                + Add Another Option
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="input-label">Points</label>
                                        <input
                                            type="number"
                                            className="input-party font-mono"
                                            min={1}
                                            max={100}
                                            value={q.pointsMax}
                                            onChange={(e) => updateQuestion(index, 'pointsMax', parseInt(e.target.value) || 20)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Error */}
            {displayError && (
                <div className="p-4 bg-[var(--color-pink)] text-white font-bold rounded-xl border-2 border-[var(--border-color)] shadow-[4px_4px_0px_#000] text-center animate-fade-in transform rotate-1">
                    🚨 {displayError} 🚨
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-5 text-xl hover:scale-[1.02] active:scale-[0.98]"
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <div className="spinner border-white" style={{ width: 24, height: 24 }} />
                        Saving Magic...
                    </span>
                ) : (
                    submitLabel
                )}
            </button>
        </form>
    );
}
