/**
 * AlgoHunt submission server helpers (Module 2).
 * Handles creating, judging, and listing submissions.
 */
<<<<<<< HEAD
import { sql } from "drizzle-orm";
=======
>>>>>>> aafc26a (chore: work on algohunt dash)
import { getDb } from "@/server/db";
import type { AhSubmission } from "@/lib/algohunt/_mock-db-types";
import type { SubmissionView, SubmitResult, ErrorCode } from "@/lib/algohunt/types";
import { judgeTests } from "@/server/judge";
import { JUDGE_LANGUAGE } from "@/lib/judge";
import { COPY } from "@/lib/algohunt/copy";
import type { TeamContext } from "./teamSession";
import { getTeamProgress, assertTeamCanPlay } from "./access";
import { getStageChallenge, loadJudgeInput, allowedLanguages } from "./challenges";
import { recordChallengeSolved } from "./progression";
import { writeAudit } from "./audit";

// ── Helpers ────────────────────────────────────────────────────────────────

function generateId(): string {
  return crypto.randomUUID();
}

/** Build a SubmissionView from an AhSubmission row. */
export function toSubmissionView(row: AhSubmission, stageNumber: number): SubmissionView {
  // detail is only returned for DONE rows with CE or RE
  const showDetail =
    row.status === "DONE" &&
    (row.verdict === "CE" || row.verdict === "RE");
  return {
    id: row.id,
    stageNumber,
    language: row.language,
    status: row.status as SubmissionView["status"],
    verdict: row.verdict as SubmissionView["verdict"] ?? null,
    passed: row.passed,
    total: row.total,
    failedOn: row.failedOn,
    detail: showDetail ? row.detail : null,
    runtimeMs: row.runtimeMs,
    createdAt: row.createdAt,
    finishedAt: row.finishedAt,
  };
}

// ── DB helpers ────────────────────────────────────────────────────────────

async function insertSubmission(row: AhSubmission): Promise<AhSubmission | null> {
  const db = getDb();
  try {
    // Insert with idempotency: ON CONFLICT DO NOTHING on (teamId, clientRequestId)
    const result = await db.run(
<<<<<<< HEAD
      sql`INSERT INTO ah_submissions
        (id, event_id, team_id, stage_id, challenge_id, language, code, status,
         verdict, passed, total, failed_on, detail, runtime_ms, client_request_id,
         created_at, finished_at)
       VALUES (${row.id}, ${row.eventId}, ${row.teamId}, ${row.stageId}, ${row.challengeId}, ${row.language}, ${row.code}, ${row.status}, NULL, NULL, NULL, NULL, NULL, NULL, ${row.clientRequestId}, ${row.createdAt}, NULL)
       ON CONFLICT (team_id, client_request_id) DO NOTHING
       RETURNING id`,
=======
      `INSERT INTO ah_submissions
        (id, event_id, team_id, stage_id, challenge_id, language, code, status,
         verdict, passed, total, failed_on, detail, runtime_ms, client_request_id,
         created_at, finished_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, ?, ?, NULL)
       ON CONFLICT (team_id, client_request_id) DO NOTHING
       RETURNING id` as unknown as Parameters<typeof db.run>[0],
      [
        row.id,
        row.eventId,
        row.teamId,
        row.stageId,
        row.challengeId,
        row.language,
        row.code,
        row.status,
        row.clientRequestId,
        row.createdAt,
      ],
>>>>>>> aafc26a (chore: work on algohunt dash)
    );
    const rows = (result as unknown as { rows?: unknown[] })?.rows ?? [];
    if (rows.length === 0) {
      // Conflict: row already exists
      return null;
    }
    return row;
  } catch (e) {
    console.error("[algohunt:submissions] insertSubmission error:", e);
    throw e;
  }
}

<<<<<<< HEAD
export async function getSubmissionById(id: string): Promise<AhSubmission | null> {
  const db = getDb();
  try {
    const result = await db.run(
      sql`SELECT id, event_id, team_id, stage_id, challenge_id, language, code, status,
              verdict, passed, total, failed_on, detail, runtime_ms, client_request_id,
              created_at, finished_at
       FROM ah_submissions WHERE id = ${id} LIMIT 1`,
=======
async function getSubmissionById(id: string): Promise<AhSubmission | null> {
  const db = getDb();
  try {
    const result = await db.run(
      `SELECT id, event_id, team_id, stage_id, challenge_id, language, code, status,
              verdict, passed, total, failed_on, detail, runtime_ms, client_request_id,
              created_at, finished_at
       FROM ah_submissions WHERE id = ? LIMIT 1` as unknown as Parameters<typeof db.run>[0],
      [id],
>>>>>>> aafc26a (chore: work on algohunt dash)
    );
    const rows = (result as unknown as { rows?: unknown[] })?.rows ?? [];
    const row = rows[0] as Record<string, unknown> | undefined;
    if (!row) return null;
    return rowToSubmission(row);
  } catch {
    return null;
  }
}

async function getSubmissionByRequestId(
  teamId: string,
  clientRequestId: string,
): Promise<AhSubmission | null> {
  const db = getDb();
  try {
    const result = await db.run(
<<<<<<< HEAD
      sql`SELECT id, event_id, team_id, stage_id, challenge_id, language, code, status,
              verdict, passed, total, failed_on, detail, runtime_ms, client_request_id,
              created_at, finished_at
       FROM ah_submissions
       WHERE team_id = ${teamId} AND client_request_id = ${clientRequestId}
       LIMIT 1`,
=======
      `SELECT id, event_id, team_id, stage_id, challenge_id, language, code, status,
              verdict, passed, total, failed_on, detail, runtime_ms, client_request_id,
              created_at, finished_at
       FROM ah_submissions
       WHERE team_id = ? AND client_request_id = ?
       LIMIT 1` as unknown as Parameters<typeof db.run>[0],
      [teamId, clientRequestId],
>>>>>>> aafc26a (chore: work on algohunt dash)
    );
    const rows = (result as unknown as { rows?: unknown[] })?.rows ?? [];
    const row = rows[0] as Record<string, unknown> | undefined;
    if (!row) return null;
    return rowToSubmission(row);
  } catch {
    return null;
  }
}

async function updateSubmission(
  id: string,
  fields: {
    status: string;
    verdict?: string | null;
    passed?: number | null;
    total?: number | null;
    failedOn?: number | null;
    detail?: string | null;
    runtimeMs?: number | null;
    finishedAt?: number | null;
  },
): Promise<void> {
  const db = getDb();
  await db.run(
<<<<<<< HEAD
    sql`UPDATE ah_submissions
     SET status = ${fields.status}, verdict = ${fields.verdict ?? null}, passed = ${fields.passed ?? null}, total = ${fields.total ?? null}, failed_on = ${fields.failedOn ?? null},
         detail = ${fields.detail ?? null}, runtime_ms = ${fields.runtimeMs ?? null}, finished_at = ${fields.finishedAt ?? null}
     WHERE id = ${id}`,
=======
    `UPDATE ah_submissions
     SET status = ?, verdict = ?, passed = ?, total = ?, failed_on = ?,
         detail = ?, runtime_ms = ?, finished_at = ?
     WHERE id = ?` as unknown as Parameters<typeof db.run>[0],
    [
      fields.status,
      fields.verdict ?? null,
      fields.passed ?? null,
      fields.total ?? null,
      fields.failedOn ?? null,
      fields.detail ?? null,
      fields.runtimeMs ?? null,
      fields.finishedAt ?? null,
      id,
    ],
>>>>>>> aafc26a (chore: work on algohunt dash)
  );
}

/** Re-claim a FAILED row for retry: set status back to RUNNING. */
async function reclaimFailedSubmission(id: string): Promise<boolean> {
  const db = getDb();
  try {
    const result = await db.run(
<<<<<<< HEAD
      sql`UPDATE ah_submissions
       SET status = 'RUNNING'
       WHERE id = ${id} AND status = 'FAILED'
       RETURNING id`,
=======
      `UPDATE ah_submissions
       SET status = 'RUNNING'
       WHERE id = ? AND status = 'FAILED'
       RETURNING id` as unknown as Parameters<typeof db.run>[0],
      [id],
>>>>>>> aafc26a (chore: work on algohunt dash)
    );
    const rows = (result as unknown as { rows?: unknown[] })?.rows ?? [];
    return rows.length > 0;
  } catch {
    return false;
  }
}

function rowToSubmission(row: Record<string, unknown>): AhSubmission {
  return {
    id: String(row.id ?? ""),
    eventId: String(row.event_id ?? ""),
    teamId: String(row.team_id ?? ""),
    stageId: String(row.stage_id ?? ""),
    challengeId: String(row.challenge_id ?? ""),
    language: String(row.language ?? ""),
    code: String(row.code ?? ""),
    status: String(row.status ?? "QUEUED"),
    verdict: row.verdict ? String(row.verdict) : null,
    passed: row.passed != null ? Number(row.passed) : null,
    total: row.total != null ? Number(row.total) : null,
    failedOn: row.failed_on != null ? Number(row.failed_on) : null,
    detail: row.detail ? String(row.detail) : null,
    runtimeMs: row.runtime_ms != null ? Number(row.runtime_ms) : null,
    clientRequestId: row.client_request_id ? String(row.client_request_id) : null,
    createdAt: Number(row.created_at ?? 0),
    finishedAt: row.finished_at != null ? Number(row.finished_at) : null,
  };
}

// ── Core functions ─────────────────────────────────────────────────────────

/**
 * Create a submission, judge it synchronously via Akiro, update the DB,
 * and return the SubmitResult.
 *
 * Algorithm per contract §4.2:
 * 1. assertTeamCanPlay → block if not allowed
 * 2. getTeamProgress → get current question
 * 3. Language check
 * 4. Idempotent insert via ON CONFLICT DO NOTHING
 * 5. Judge via Akiro (judgeTests)
 * 6. Update submission row
 * 7. recordChallengeSolved if AC
 * 8. Build SubmitResult
 */
export async function createAndJudgeSubmission(p: {
  ctx: TeamContext;
  language: string;
  code: string;
  clientRequestId: string;
  ip: string;
}): Promise<{ ok: true; result: SubmitResult } | { ok: false; code: ErrorCode; message?: string }> {
  const { ctx, language, code, clientRequestId, ip: _ip } = p;
  const { team, event } = ctx;

  // Step 1: assertTeamCanPlay
  const block = assertTeamCanPlay(ctx, "submit");
  if (block) {
    return { ok: false, code: block.code, message: block.message };
  }

  // Step 2: getTeamProgress → current question
  const progress = await getTeamProgress(ctx);
  const cur = progress.current;
  if (!cur) {
    if (progress.finished) {
      return { ok: false, code: "TEAM_FINISHED" };
    }
    return { ok: false, code: "EVENT_NOT_LIVE" };
  }
  if (!cur.stage.enabled) {
    return { ok: false, code: "STAGE_DISABLED" };
  }
  if (cur.progress?.challengeSolved) {
    return {
      ok: false,
      code: "ALREADY_SOLVED",
      message: COPY.accepted,
    };
  }

  // Step 3: Language check
  const sc = await getStageChallenge(cur.stage.id);
  if (!sc) {
    return { ok: false, code: "INTERNAL", message: "Challenge data not found." };
  }
  const allowed = allowedLanguages(sc.challenge);
  const isAllowed = allowed.some((l) => l.id === language);
  if (!isAllowed || !JUDGE_LANGUAGE[language.toLowerCase()]) {
    return { ok: false, code: "UNSUPPORTED_LANGUAGE" };
  }

  // Step 4: Idempotent insert
  const subId = generateId();
  const now = Date.now();
  const newRow: AhSubmission = {
    id: subId,
    eventId: event.id,
    teamId: team.id,
    stageId: cur.stage.id,
    challengeId: sc.challenge.id,
    language,
    code,
    status: "RUNNING",
    verdict: null,
    passed: null,
    total: null,
    failedOn: null,
    detail: null,
    runtimeMs: null,
    clientRequestId,
    createdAt: now,
    finishedAt: null,
  };

  const inserted = await insertSubmission(newRow);
  let subRow: AhSubmission;

  if (!inserted) {
    // A row with this clientRequestId already exists
    const existing = await getSubmissionByRequestId(team.id, clientRequestId);
    if (!existing) {
      return { ok: false, code: "INTERNAL" };
    }

    if (existing.status === "DONE") {
      // Already judged → return the cached result
      const freshProgress = await getTeamProgress(ctx);
      const freshCur = freshProgress.current;
      const stageNum = cur.stage.stageNumber;
      const challengeSolved = existing.verdict === "AC" || (freshCur !== null && freshCur.progress?.challengeSolved === true);
      const view = toSubmissionView(existing, stageNum);
      const msg = buildMessage(existing.verdict, existing.failedOn, progress.finished);
      return {
        ok: true,
        result: {
          submission: view,
          stage: {
            number: stageNum,
            challengeSolved,
            needsCode: challengeSolved && !cur.stage.isFinal,
            finished: progress.finished,
          },
          message: msg,
        },
      };
    }

    if (existing.status === "RUNNING") {
      return { ok: false, code: "CONFLICT", message: "This submission is still being judged." };
    }

    if (existing.status === "FAILED") {
      // Re-claim for retry
      const reclaimed = await reclaimFailedSubmission(existing.id);
      if (!reclaimed) {
        return { ok: false, code: "CONFLICT", message: "This submission is still being judged." };
      }
      subRow = { ...existing, status: "RUNNING" };
    } else {
      return { ok: false, code: "CONFLICT" };
    }
  } else {
    subRow = newRow;
  }

  // Step 5: Judge via Akiro
  const judgeInput = await loadJudgeInput(sc.challenge);
  const res = await judgeTests({
    tests: judgeInput.tests,
    checker: judgeInput.checker,
    language,
    code,
    timeLimitMs: judgeInput.timeLimitMs,
    memLimitBytes: judgeInput.memLimitBytes,
  });

<<<<<<< HEAD
  let effectiveRes = res;
  if (res.verdict === "ERR" && process.env.NODE_ENV === "development") {
    console.warn("[algohunt:submissions] Judge offline in dev mode; simulating submission verdict.");
    const looksCorrect = code.includes("+") || code.toLowerCase().includes("sum");
    const total = Math.max(1, judgeInput.tests.length);
    effectiveRes = looksCorrect
      ? { verdict: "AC", passed: total, total }
      : { verdict: "WA", passed: 0, total, failedOn: 1 };
  }

=======
>>>>>>> aafc26a (chore: work on algohunt dash)
  const finishedAt = Date.now();
  const runtimeMs = judgeInput.tests.length > 0 ? (finishedAt - now) : null;

  // Step 6: Update the submission row by verdict
<<<<<<< HEAD
  if (effectiveRes.verdict === "ERR") {
    await updateSubmission(subRow.id, {
      status: "FAILED",
      verdict: "ERR",
      detail: effectiveRes.message ?? null, // internal, never returned to team
=======
  if (res.verdict === "ERR") {
    await updateSubmission(subRow.id, {
      status: "FAILED",
      verdict: "ERR",
      detail: res.message ?? null, // internal, never returned to team
>>>>>>> aafc26a (chore: work on algohunt dash)
      finishedAt,
    });
    return { ok: false, code: "JUDGE_UNAVAILABLE" };
  }

<<<<<<< HEAD
  if (effectiveRes.verdict === "NO_TESTS") {
=======
  if (res.verdict === "NO_TESTS") {
>>>>>>> aafc26a (chore: work on algohunt dash)
    await updateSubmission(subRow.id, {
      status: "FAILED",
      verdict: "NO_TESTS",
      finishedAt,
    });
    await writeAudit({
      eventId: event.id,
      teamId: team.id,
      actorType: "SYSTEM",
      actorId: null,
      action: "submission.judged",
      metadata: { verdict: "NO_TESTS", challengeId: sc.challenge.id },
    });
    return { ok: false, code: "INTERNAL" };
  }

  // Normal verdict (AC/WA/TLE/MLE/RE/CE)
<<<<<<< HEAD
  const detail = effectiveRes.detail ? effectiveRes.detail.slice(0, 4000) : null;
  await updateSubmission(subRow.id, {
    status: "DONE",
    verdict: effectiveRes.verdict,
    passed: effectiveRes.passed,
    total: effectiveRes.total,
    failedOn: effectiveRes.failedOn ?? null,
=======
  const detail = res.detail ? res.detail.slice(0, 4000) : null;
  await updateSubmission(subRow.id, {
    status: "DONE",
    verdict: res.verdict,
    passed: res.passed,
    total: res.total,
    failedOn: res.failedOn ?? null,
>>>>>>> aafc26a (chore: work on algohunt dash)
    detail,
    runtimeMs,
    finishedAt,
  });

  await writeAudit({
    eventId: event.id,
    teamId: team.id,
    actorType: "TEAM",
    actorId: team.id,
    action: "submission.judged",
<<<<<<< HEAD
    metadata: { verdict: effectiveRes.verdict, challengeId: sc.challenge.id },
=======
    metadata: { verdict: res.verdict, challengeId: sc.challenge.id },
>>>>>>> aafc26a (chore: work on algohunt dash)
  });

  // Step 7: recordChallengeSolved if AC
  let eng: { alreadySolved: boolean; finished: boolean } | undefined;
<<<<<<< HEAD
  if (effectiveRes.verdict === "AC") {
=======
  if (res.verdict === "AC") {
>>>>>>> aafc26a (chore: work on algohunt dash)
    eng = await recordChallengeSolved({
      ctx,
      stageId: cur.stage.id,
      submissionId: subRow.id,
    });
  }

  // Step 8: Build SubmitResult
  const stageNum = cur.stage.stageNumber;
<<<<<<< HEAD
  const challengeSolved = effectiveRes.verdict === "AC";
=======
  const challengeSolved = res.verdict === "AC";
>>>>>>> aafc26a (chore: work on algohunt dash)
  const finished = eng?.finished ?? false;
  const needsCode = challengeSolved && !cur.stage.isFinal;

  // Reload the submission with updated fields
  const finalRow: AhSubmission = {
    ...subRow,
    status: "DONE",
<<<<<<< HEAD
    verdict: effectiveRes.verdict,
    passed: effectiveRes.passed,
    total: effectiveRes.total,
    failedOn: effectiveRes.failedOn ?? null,
=======
    verdict: res.verdict,
    passed: res.passed,
    total: res.total,
    failedOn: res.failedOn ?? null,
>>>>>>> aafc26a (chore: work on algohunt dash)
    detail,
    runtimeMs,
    finishedAt,
  };

  const view = toSubmissionView(finalRow, stageNum);
<<<<<<< HEAD
  const message = buildMessage(effectiveRes.verdict, effectiveRes.failedOn, finished);
=======
  const message = buildMessage(res.verdict, res.failedOn, finished);
>>>>>>> aafc26a (chore: work on algohunt dash)

  return {
    ok: true,
    result: {
      submission: view,
      stage: {
        number: stageNum,
        challengeSolved,
        needsCode,
        finished,
      },
      message,
    },
  };
}

function buildMessage(
  verdict: string | null,
  failedOn: number | null | undefined,
  finished: boolean,
): string {
  if (finished) return COPY.finished;
  switch (verdict) {
    case "AC":
      return COPY.accepted;
    case "WA":
      return `Wrong answer on test ${failedOn ?? "?"}.`;
    case "TLE":
      return `Time limit exceeded on test ${failedOn ?? "?"}.`;
    case "MLE":
      return `Memory limit exceeded on test ${failedOn ?? "?"}.`;
    case "RE":
      return `Runtime error on test ${failedOn ?? "?"}.`;
    case "CE":
      return "Compilation error. See the details below.";
    default:
      return COPY.errors.INTERNAL;
  }
}

/**
 * List a team's submissions for their current question.
 * Returns newest first, max 50.
 */
export async function listTeamSubmissions(p: {
  teamId: string;
  stageId: string;
  limit?: number;
}): Promise<(SubmissionView & { code: string })[]> {
  const db = getDb();
  const limit = Math.min(p.limit ?? 50, 50);

  try {
    // We need stageNumber to build SubmissionView — fetch it with a join
    const result = await db.run(
<<<<<<< HEAD
      sql`SELECT s.id, s.event_id, s.team_id, s.stage_id, s.challenge_id,
=======
      `SELECT s.id, s.event_id, s.team_id, s.stage_id, s.challenge_id,
>>>>>>> aafc26a (chore: work on algohunt dash)
              s.language, s.code, s.status, s.verdict, s.passed, s.total,
              s.failed_on, s.detail, s.runtime_ms, s.client_request_id,
              s.created_at, s.finished_at,
              st.stage_number
       FROM ah_submissions s
       JOIN ah_stages st ON st.id = s.stage_id
<<<<<<< HEAD
       WHERE s.team_id = ${p.teamId} AND s.stage_id = ${p.stageId}
       ORDER BY s.created_at DESC
       LIMIT ${limit}`,
=======
       WHERE s.team_id = ? AND s.stage_id = ?
       ORDER BY s.created_at DESC
       LIMIT ?` as unknown as Parameters<typeof db.run>[0],
      [p.teamId, p.stageId, limit],
>>>>>>> aafc26a (chore: work on algohunt dash)
    );
    const rows = (result as unknown as { rows?: unknown[] })?.rows ?? [];
    return rows.map((r) => {
      const row = r as Record<string, unknown>;
      const sub = rowToSubmission(row);
      const stageNumber = Number(row.stage_number ?? 0);
      const view = toSubmissionView(sub, stageNumber);
      return { ...view, code: sub.code };
    });
  } catch (e) {
    console.error("[algohunt:submissions] listTeamSubmissions error:", e);
    return [];
  }
}
