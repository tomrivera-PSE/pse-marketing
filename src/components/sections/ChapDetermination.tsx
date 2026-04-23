'use client';

// PHASE-9 STUB — replaced with the full structured renderer in Phase 10.
// See the build spec. Kept intentionally minimal so Phase 9's typecheck
// passes without pulling Phase 10 work forward.

import type { ValidatedResponse } from '@/lib/chapValidation';

export function ChapDetermination(props: {
  response: ValidatedResponse | null;
}) {
  return (
    <div className="chap-interface__msg-bubble">
      {props.response === null
        ? 'We couldn’t produce a structured determination for that question.'
        : props.response.kind === 'out_of_scope'
          ? 'That question is out of the current scope (IRC §6656).'
          : `Determination: ${props.response.determination} — ${props.response.rationale}`}
    </div>
  );
}
