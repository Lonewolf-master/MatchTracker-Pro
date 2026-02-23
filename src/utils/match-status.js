import { MATCH_STATUS } from '../validation/zod.js';

export function getMatchStatus(startTime, endTime, now = new Date()) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  const nowTs = now.getTime();
  const startTs = start.getTime();
  const endTs = end.getTime();

  if (nowTs < startTs) return MATCH_STATUS.SCHEDULED;
  if (nowTs >= endTs) return MATCH_STATUS.FINISHED;
  return MATCH_STATUS.LIVE;
}

export async function syncMatchStatus(match, updateStatus, now = new Date()) {
  const nextStatus = getMatchStatus(match.startTime, match.endTime, now);

  if (!nextStatus) return match.status;
  if (match.status === nextStatus) return match.status;

  await updateStatus(nextStatus);

  // if mutation is intended
  match.status = nextStatus;

  return nextStatus;
}