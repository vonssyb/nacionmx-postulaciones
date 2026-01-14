import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const QuestionReview = ({ questions }) => {
    const [scores, setScores] = useState({});
    const [notes, setNotes] = useState({});

    const handleScore = (index, scoreType) => {
        setScores(prev => ({
            ...prev,
            [index]: prev[index] === scoreType ? null : scoreType
        }));
    };

    const handleNote = (index, noteText) => {
        setNotes(prev => ({
            ...prev,
            [index]: noteText
        }));
    };

    const calculateScore = () => {
        const scoredQuestions = Object.keys(scores).length;
        if (scoredQuestions === 0) return { total: 0, max: 0, percentage: 0 };

        const total = Object.values(scores).reduce((sum, score) => {
            if (score === 'correct') return sum + 1;
            if (score === 'partial') return sum + 0.5;
            return sum;
        }, 0);

        const max = scoredQuestions;
        const percentage = max > 0 ? Math.round((total / max) * 100) : 0;
        return { total, max, percentage };
    };

    const scoreData = calculateScore();

    // Debug logging
    console.log('[QuestionReview] Rendering with questions:', questions);
    console.log('[QuestionReview] Questions array length:', questions?.length);

    if (!questions || questions.length === 0) {
        return <div style={{ padding: '1rem', color: '#e74c3c' }}>No hay preguntas disponibles para calificar</div>;
    }

    return (
        <div style={styles.container}>
            {/* Score Counter */}
            <div style={styles.scoreCounter}>
                <div style={styles.scoreLabel}>Puntuación</div>
                <div style={styles.scoreValue}>
                    {scoreData.total.toFixed(1)} / {scoreData.max}
                </div>
                <div style={styles.scorePercentage}>
                    {scoreData.percentage}%
                </div>
            </div>

            {/* Questions List */}
            <div style={styles.questionsList}>
                {questions.map((q, index) => {
                    const currentScore = scores[index];
                    const question = q.question || q.pregunta;
                    const answer = q.answer || q.respuesta;

                    return (
                        <div key={index} style={styles.questionCard}>
                            <div style={styles.questionHeader}>
                                <strong>P{index + 1}</strong>
                            </div>

                            <div style={styles.questionText}>
                                <strong>{question}</strong>
                            </div>

                            <div style={styles.answerText}>
                                {answer}
                            </div>

                            {/* Score Buttons */}
                            <div style={styles.scoreButtons}>
                                <button
                                    onClick={() => handleScore(index, 'correct')}
                                    style={{
                                        ...styles.scoreBtn,
                                        ...(currentScore === 'correct' ? styles.scoreBtnCorrectActive : styles.scoreBtnCorrect)
                                    }}
                                    title="Correcta (1 punto)"
                                >
                                    <CheckCircle size={16} /> Correcta
                                </button>

                                <button
                                    onClick={() => handleScore(index, 'partial')}
                                    style={{
                                        ...styles.scoreBtn,
                                        ...(currentScore === 'partial' ? styles.scoreBtnPartialActive : styles.scoreBtnPartial)
                                    }}
                                    title="Parcial (0.5 puntos)"
                                >
                                    <AlertTriangle size={16} /> Parcial
                                </button>

                                <button
                                    onClick={() => handleScore(index, 'incorrect')}
                                    style={{
                                        ...styles.scoreBtn,
                                        ...(currentScore === 'incorrect' ? styles.scoreBtnIncorrectActive : styles.scoreBtnIncorrect)
                                    }}
                                    title="Incorrecta (0 puntos)"
                                >
                                    <XCircle size={16} /> Incorrecta
                                </button>
                            </div>

                            {/* Note Input */}
                            <div style={styles.noteContainer}>
                                <input
                                    type="text"
                                    placeholder="Nota para esta pregunta (opcional)..."
                                    value={notes[index] || ''}
                                    onChange={(e) => handleNote(index, e.target.value)}
                                    style={styles.noteInput}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    },
    scoreCounter: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '1.5rem',
        textAlign: 'center',
        color: 'white',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
    },
    scoreLabel: {
        fontSize: '0.9rem',
        opacity: 0.9,
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    scoreValue: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '0.25rem'
    },
    scorePercentage: {
        fontSize: '1.25rem',
        opacity: 0.95
    },
    questionsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    questionCard: {
        border: '1px solid #444',
        borderRadius: '10px',
        padding: '1rem',
        background: '#1a1a1a',
        transition: 'box-shadow 0.2s'
    },
    questionHeader: {
        fontSize: '0.85rem',
        color: '#667eea',
        marginBottom: '0.5rem',
        fontWeight: '600'
    },
    questionText: {
        marginBottom: '0.75rem',
        fontSize: '0.95rem',
        color: '#e0e0e0'
    },
    answerText: {
        padding: '0.75rem',
        background: '#2a2a2a',
        borderRadius: '6px',
        marginBottom: '1rem',
        fontSize: '0.9rem',
        color: '#b0b0b0',
        lineHeight: '1.6'
    },
    scoreButtons: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '0.75rem',
        flexWrap: 'wrap'
    },
    scoreBtn: {
        flex: '1',
        minWidth: '100px',
        padding: '0.6rem 1rem',
        borderRadius: '8px',
        border: '2px solid transparent',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s',
        opacity: 0.7
    },
    scoreBtnCorrect: {
        background: '#1a1a1a',
        border: '2px solid #2ecc71',
        color: '#2ecc71'
    },
    scoreBtnCorrectActive: {
        background: '#2ecc71',
        color: '#1a1a1a',
        opacity: 1,
        transform: 'scale(1.05)'
    },
    scoreBtnPartial: {
        background: '#1a1a1a',
        border: '2px solid #f39c12',
        color: '#f39c12'
    },
    scoreBtnPartialActive: {
        background: '#f39c12',
        color: '#1a1a1a',
        opacity: 1,
        transform: 'scale(1.05)'
    },
    scoreBtnIncorrect: {
        background: '#1a1a1a',
        border: '2px solid #e74c3c',
        color: '#e74c3c'
    },
    scoreBtnIncorrectActive: {
        background: '#e74c3c',
        color: '#1a1a1a',
        opacity: 1,
        transform: 'scale(1.05)'
    },
    noteContainer: {
        marginTop: '0.5rem'
    },
    noteInput: {
        width: '100%',
        padding: '0.6rem',
        border: '1px solid #444',
        borderRadius: '6px',
        fontSize: '0.85rem',
        outline: 'none',
        transition: 'border-color 0.2s',
        background: '#2a2a2a',
        color: '#e0e0e0'
    }
};

export default QuestionReview;
