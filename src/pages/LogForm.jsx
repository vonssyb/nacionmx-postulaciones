import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Upload } from 'lucide-react';

const LogForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: 'warn',
        target: '',
        robloxId: '',
        reason: '',
        evidence: '',
        notes: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // TODO: Validate and send to Supabase
        console.log("Submitting:", formData);
        navigate('/dashboard');
    };

    return (
        <div className="form-container">
            <div className="page-header">
                <h1 className="page-title">Nuevo Registro</h1>
                <p className="page-subtitle">Reportar una nueva actividad o sanción.</p>
            </div>

            <form onSubmit={handleSubmit} className="log-form card">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Tipo de Acción</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="input">
                            <option value="warn">Advertencia (Warn)</option>
                            <option value="kick">Expulsión (Kick)</option>
                            <option value="ban">Bloqueo (Ban)</option>
                            <option value="ticket">Atención de Ticket</option>
                            <option value="patrol">Patrullaje / Rol</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Usuario (Roblox)</label>
                        <input
                            type="text"
                            name="target"
                            value={formData.target}
                            onChange={handleChange}
                            placeholder="Nombre de usuario"
                            className="input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>ID de Roblox (Opcional)</label>
                        <input
                            type="text"
                            name="robloxId"
                            value={formData.robloxId}
                            onChange={handleChange}
                            placeholder="123456789"
                            className="input"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Razón / Motivo</label>
                        <input
                            type="text"
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            placeholder="Ej: Insultos en zona segura"
                            className="input"
                            required
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Evidencia (URL)</label>
                        <div className="input-with-icon">
                            <Upload size={18} />
                            <input
                                type="url"
                                name="evidence"
                                value={formData.evidence}
                                onChange={handleChange}
                                placeholder="https://imgur.com/..."
                                className="input"
                            />
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Notas Adicionales</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="4"
                            className="input"
                        ></textarea>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">
                        <X size={18} /> Cancelar
                    </button>
                    <button type="submit" className="btn-primary">
                        <Save size={18} /> Guardar Registro
                    </button>
                </div>
            </form>

            <style>{`
                .log-form {
                    padding: 2rem;
                    max-width: 800px;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                .full-width {
                    grid-column: 1 / -1;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }
                .input {
                    width: 100%;
                    background: var(--bg-dark);
                    border: 1px solid var(--border);
                    padding: 0.75rem;
                    border-radius: var(--radius);
                    color: var(--text-main);
                    font-size: 1rem;
                }
                .input:focus {
                    border-color: var(--primary);
                    outline: none;
                }
                .input-with-icon {
                    position: relative;
                }
                .input-with-icon svg {
                    position: absolute;
                    left: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }
                .input-with-icon input {
                    padding-left: 2.5rem;
                }
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    border-top: 1px solid var(--border);
                    padding-top: 1.5rem;
                }
            `}</style>
        </div>
    );
};

export default LogForm;
