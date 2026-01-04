import React from 'react';
import rulesData from '../data/json/rules.json';
import { BookOpen, AlertTriangle } from 'lucide-react';

const Rules = () => {
    return (
        <div className="rules-container">
            <div className="page-header">
                <h1 className="page-title">Reglamento Oficial</h1>
                <p className="page-subtitle">Normativas vigentes de Nación MX RP. El desconocimiento no exime de sanción.</p>
            </div>

            <div className="rules-grid">
                {rulesData.map((category, index) => (
                    <div key={index} className="rules-category card">
                        <div className="category-header">
                            <h2 className="category-title">{category.category}</h2>
                            <p className="category-desc">{category.description}</p>
                        </div>
                        <div className="rules-list">
                            {category.rules.map((rule, rIndex) => (
                                <div key={rIndex} className="rule-item">
                                    <h3 className="rule-title">
                                        {rule.title.includes('(') ? (
                                            <>
                                                <span className="code-badge">{rule.title.split('(')[0].trim()}</span>
                                                {rule.title.includes(')') ? ` ${rule.title.split('(')[1].replace(')', '')}` : ''}
                                            </>
                                        ) : (
                                            rule.title
                                        )}
                                    </h3>
                                    <p className="rule-desc">{rule.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .rules-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
                    gap: 2rem;
                }
                .card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    overflow: hidden;
                }
                .category-header {
                    background: var(--bg-card-hover);
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border);
                }
                .category-title {
                    color: var(--primary);
                    font-size: 1.1rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .category-desc {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin-top: 0.5rem;
                }
                .rules-list {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .rule-item {
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 1rem;
                }
                .rule-item:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }
                .rule-title {
                    font-size: 1rem;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .code-badge {
                    background: rgba(212, 175, 55, 0.15);
                    color: var(--primary);
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.85rem;
                    font-family: monospace;
                    font-weight: 700;
                }
                .rule-desc {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                    white-space: pre-line;
                }
                @media (max-width: 768px) {
                    .rules-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Rules;
