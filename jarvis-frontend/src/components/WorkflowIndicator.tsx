import type { OrbState } from './ParticleBlob';
import './WorkflowIndicator.css';

interface WorkflowIndicatorProps {
  state: OrbState;
}

const WORKFLOW_STAGES = [
  { key: 'listening', label: 'Listening', state: 'listening' as OrbState },
  { key: 'thinking', label: 'Understanding', state: 'thinking' as OrbState },
  { key: 'planning', label: 'Planning', state: 'thinking' as OrbState },
  { key: 'searching', label: 'Executing', state: 'searching' as OrbState },
  { key: 'completed', label: 'Completed', state: 'completed' as OrbState },
];

function getActiveIndex(state: OrbState): number {
  switch (state) {
    case 'listening': return 0;
    case 'thinking': return 2;
    case 'searching': return 3;
    case 'speaking': return 3;
    case 'completed': return 4;
    default: return -1;
  }
}

export default function WorkflowIndicator({ state }: WorkflowIndicatorProps) {
  const activeIndex = getActiveIndex(state);
  const isActive = activeIndex >= 0;

  if (!isActive) return null;

  return (
    <div className="workflow-indicator">
      {WORKFLOW_STAGES.map((stage, idx) => {
        const isCompleted = idx < activeIndex;
        const isCurrent = idx === activeIndex;

        return (
          <div
            key={stage.key}
            className={`workflow-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
          >
            <div className="step-node">
              <div className="step-dot" />
              {isCurrent && <div className="step-pulse" />}
            </div>
            <span className="step-label">{stage.label}</span>
            {idx < WORKFLOW_STAGES.length - 1 && (
              <div className={`step-connector ${isCompleted ? 'filled' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
