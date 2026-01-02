import './StatusBadge.css'

const STATUS_CONFIG = {
    pending: {
        label: 'Pendiente',
        className: 'status-pending',
        icon: '⏳',
    },
    under_review: {
        label: 'En Revisión',
        className: 'status-review',
        icon: '👀',
    },
    approved: {
        label: 'Aprobado',
        className: 'status-approved',
        icon: '✅',
    },
    rejected: {
        label: 'Rechazado',
        className: 'status-rejected',
        icon: '❌',
    },
    withdrawn: {
        label: 'Retirado',
        className: 'status-withdrawn',
        icon: '🚫',
    },
}

export default function StatusBadge({ status }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending

    return (
        <span className={`status-badge ${config.className}`}>
            <span className="status-icon">{config.icon}</span>
            <span className="status-label">{config.label}</span>
        </span>
    )
}
