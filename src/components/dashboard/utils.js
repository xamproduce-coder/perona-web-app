// src/components/dashboard/utils.js
// Single source of truth for all dashboard sub-components.

export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  return `${m}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
};

export const STATUS_MAP = {
  queued:             { label: 'Queued',      color: 'text-white/40',    dot: 'bg-white/20'    },
  in_progress:        { label: 'In Progress', color: 'text-blue-400',    dot: 'bg-blue-400'    },
  review:             { label: 'Review',      color: 'text-amber-400',   dot: 'bg-amber-400'   },
  revision_requested: { label: 'Revision',    color: 'text-orange-400',  dot: 'bg-orange-400'  },
  finalized:          { label: 'Final',       color: 'text-emerald-400', dot: 'bg-emerald-400' },
  pending:            { label: 'Pending',     color: 'text-white/30',    dot: 'bg-white/20'    },
};


