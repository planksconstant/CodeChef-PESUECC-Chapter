<<<<<<< HEAD
import Image from "next/image";
=======
>>>>>>> aafc26a (chore: work on algohunt dash)
import { redirect } from "next/navigation";
import { getCurrentTeam } from "@/server/algohunt/teamSession";
import { getTeamProgress } from "@/server/algohunt/access";
import { getStageChallenge, toChallengeView, toChallengeContent } from "@/server/algohunt/challenges";
import { COPY } from "@/lib/algohunt/copy";
import ProblemStatement from "@/components/cp-arena/ProblemStatement";
import MechaPanel from "@/components/cp-arena/MechaPanel";
import Link from "@/components/AppLink";
import ChallengeWorkspace from "@/components/algohunt/challenge/ChallengeWorkspace";

export const dynamic = "force-dynamic";

export default async function ChallengePage() {
  const ctx = await getCurrentTeam();
  if (!ctx) redirect("/algohunt/login");

  const { event, team } = ctx;

  // ── Event status gates (§14 rules 3–4) ──
  if (event.status === "ENDED" || event.status === "ARCHIVED") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <MechaPanel label="ALGOHUNT 2.0" className="w-full max-w-lg">
          <div className="space-y-4 px-6 py-8 text-center">
            <p className="text-lg font-semibold text-chocolate dark:text-cream">{COPY.ended}</p>
            <Link
              href="/algohunt/leaderboard"
              className="mecha-btn mecha-btn--primary inline-block"
            >
              View Leaderboard
            </Link>
          </div>
        </MechaPanel>
      </div>
    );
  }

  if (event.status === "DRAFT" || event.status === "CHECK_IN" || event.status === "READY") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <MechaPanel label="ALGOHUNT 2.0" className="w-full max-w-lg">
          <div className="px-6 py-8 text-center">
            <p className="text-lg font-semibold text-chocolate dark:text-cream">{COPY.notStarted}</p>
          </div>
        </MechaPanel>
      </div>
    );
  }

  if (team.status === "DISQUALIFIED") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <MechaPanel label="ALGOHUNT 2.0" className="w-full max-w-lg">
          <div className="px-6 py-8 text-center">
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">{COPY.disqualified}</p>
          </div>
        </MechaPanel>
      </div>
    );
  }

  if (team.status === "REGISTERED") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <MechaPanel label="ALGOHUNT 2.0" className="w-full max-w-lg">
          <div className="space-y-4 px-6 py-8 text-center">
            <p className="text-lg font-semibold text-chocolate dark:text-cream">{COPY.notCheckedIn}</p>
            <Link href="/algohunt" className="mecha-btn mecha-btn--primary inline-block">
              Back to Dashboard
            </Link>
          </div>
        </MechaPanel>
      </div>
    );
  }

  // ── Get team's current question ──
  const progress = await getTeamProgress(ctx);

  if (progress.finished || !progress.current) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <MechaPanel label="ALGOHUNT 2.0" className="w-full max-w-lg">
          <div className="space-y-4 px-6 py-8 text-center">
            <div className="text-4xl">🎉</div>
            <p className="text-lg font-bold text-chocolate dark:text-cream">{COPY.finished}</p>
            <Link
              href="/algohunt/leaderboard"
              className="mecha-btn mecha-btn--primary inline-block"
            >
              View Leaderboard
            </Link>
          </div>
        </MechaPanel>
      </div>
    );
  }

  const cur = progress.current;
  const sc = await getStageChallenge(cur.stage.id);
  if (!sc) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <MechaPanel label="ERROR" className="w-full max-w-lg">
          <div className="px-6 py-8 text-center">
            <p className="text-chocolate dark:text-cream">{COPY.errors.INTERNAL}</p>
          </div>
        </MechaPanel>
      </div>
    );
  }

  const challengeSolved = cur.progress?.challengeSolved ?? false;
<<<<<<< HEAD
=======

  // ── CODE_PENDING: solved but waiting for a QR code ──
  if (challengeSolved && !cur.stage.isFinal) {
    const view = toChallengeView(sc, { solved: true });
    const statement = <ProblemStatement challenge={toChallengeContent(sc.challenge)} />;
    return (
      <div className="flex flex-col">
        {/* Solved banner */}
        <div className="border-b border-green-500/30 bg-green-500/10 px-4 py-3 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <span className="font-semibold text-green-700 dark:text-green-400">
                  Question {cur.stage.stageNumber} solved!
                </span>
              </div>
              <Link
                href="/algohunt/code"
                className="mecha-btn mecha-btn--primary text-center"
              >
                Enter a QR code →
              </Link>
            </div>
            <p className="mt-1 text-sm text-green-600 dark:text-green-300/80">{COPY.accepted}</p>
          </div>
        </div>

        {/* Workspace with submit disabled */}
        <ChallengeWorkspace
          view={view}
          teamCode={team.teamCode}
          statement={statement}
          totalStages={progress.totalStages}
          solvedCount={progress.solvedCount}
        />
      </div>
    );
  }

>>>>>>> aafc26a (chore: work on algohunt dash)
  const view = toChallengeView(sc, { solved: challengeSolved });
  const statement = <ProblemStatement challenge={toChallengeContent(sc.challenge)} />;

  return (
<<<<<<< HEAD
    <div className="fixed inset-0 z-[60] flex flex-col bg-cream dark:bg-[#0f0b07]">
      {/* ══════════ Top Navbar (48px) ══════════ */}
      <header className="relative z-30 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-hairline bg-white/90 px-3 backdrop-blur dark:bg-panel/90 sm:px-4">
        {/* Left: Logo · AlgoHunt · Question title & badge */}
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/" title="Home" className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md border border-hairline bg-white shadow-sm">
            <Image src="/logo.svg" alt="CodeChef PESUECC" width={20} height={20} priority unoptimized className="h-5 w-5 object-contain" />
          </Link>
          <Link
            href="/algohunt"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-charcoal/75 transition-colors hover:bg-black/[0.04] hover:text-chocolate dark:text-cream/80 dark:hover:bg-white/5"
          >
            AlgoHunt 2.0
          </Link>
          <span className="text-charcoal/30 dark:text-cream/30">/</span>
          <span className="font-mono text-xs font-semibold text-charcoal/70 dark:text-cream/70">
            Q{cur.stage.stageNumber} of {progress.totalStages}
          </span>
          {cur.stage.isFinal && (
            <span className="mecha-chip bg-bronze/15 text-bronze text-[10px] font-bold uppercase tracking-wider">
              Final Question
            </span>
          )}
          <span className="hidden truncate text-xs font-semibold text-chocolate dark:text-cream md:inline">
            — {sc.challenge.title}
          </span>
          {/* Progress dots */}
          <div className="ml-2 hidden items-center gap-1 sm:flex" aria-label="Question progress">
=======
    <div className="flex flex-col">
      {/* Header strip */}
      <div className="border-b border-hairline bg-white/90 px-4 py-2 backdrop-blur dark:bg-panel/90 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold text-charcoal/60 dark:text-cream/60">
              Question {cur.stage.stageNumber} of {progress.totalStages}
            </span>
            {cur.stage.isFinal && (
              <span className="mecha-chip bg-bronze/15 text-bronze text-xs font-bold uppercase tracking-wider">
                Final Question
              </span>
            )}
            <span className="font-semibold text-chocolate dark:text-cream">{sc.challenge.title}</span>
          </div>
          {/* Progress dots */}
          <div className="flex items-center gap-1" aria-label="Question progress">
>>>>>>> aafc26a (chore: work on algohunt dash)
            {progress.stages.map((s) => {
              const isCurrent = s.stage.stageNumber === cur.stage.stageNumber;
              const isDone = s.state === "COMPLETED";
              return (
                <span
                  key={s.stage.stageNumber}
<<<<<<< HEAD
                  title={`Question ${s.stage.stageNumber}${isDone ? " (done)" : isCurrent ? " (current)" : " (locked)"}`}
=======
                  aria-label={
                    isDone ? `Question ${s.stage.stageNumber} done` :
                    isCurrent ? `Question ${s.stage.stageNumber} current` :
                    `Question ${s.stage.stageNumber} locked`
                  }
>>>>>>> aafc26a (chore: work on algohunt dash)
                  className={`h-2 w-2 rounded-full ${
                    isDone ? "bg-green-500" :
                    isCurrent ? "bg-bronze" :
                    "bg-charcoal/20 dark:bg-cream/20"
                  }`}
                />
              );
            })}
          </div>
        </div>
<<<<<<< HEAD

        {/* Right: Solved QR action / links / team code */}
        <div className="flex shrink-0 items-center gap-2">
          {challengeSolved && !cur.stage.isFinal && (
            <Link
              href="/algohunt/code"
              className="mecha-btn mecha-btn--primary h-7 px-2.5 text-xs font-semibold"
            >
              Enter QR Code →
            </Link>
          )}
          <Link
            href="/algohunt/submissions"
            className="rounded-md px-2 py-1 text-xs font-medium text-charcoal/70 hover:bg-black/[0.04] hover:text-chocolate dark:text-cream/70 dark:hover:bg-white/5"
          >
            Submissions
          </Link>
          <Link
            href="/algohunt/leaderboard"
            className="hidden rounded-md px-2 py-1 text-xs font-medium text-charcoal/70 hover:bg-black/[0.04] hover:text-chocolate dark:text-cream/70 dark:hover:bg-white/5 sm:inline"
          >
            Leaderboard
          </Link>
          <span className="mecha-chip bg-black/[0.04] font-mono text-[11px] text-charcoal/60 dark:bg-white/5 dark:text-cream/60">
            {team.teamCode}
          </span>
        </div>
      </header>

      {/* Solved pending QR code banner (if question solved but waiting for QR) */}
      {challengeSolved && !cur.stage.isFinal && (
        <div className="shrink-0 border-b border-green-500/30 bg-green-500/10 px-4 py-2">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
            <p className="text-xs font-medium text-green-700 dark:text-green-300">
              ✅ Question {cur.stage.stageNumber} solved! Find your physical clue checkpoint and enter the code.
            </p>
            <Link
              href="/algohunt/code"
              className="text-xs font-semibold text-green-800 underline dark:text-green-300"
            >
              Enter code now →
            </Link>
          </div>
        </div>
      )}

      {/* ══════════ Main Resizable Workspace ══════════ */}
=======
        {cur.stage.isFinal && (
          <p className="mt-1 text-center text-xs font-medium text-bronze">
            FINAL QUESTION — Solve it to finish AlgoHunt 2.0. No code needed after this.
          </p>
        )}
      </div>

>>>>>>> aafc26a (chore: work on algohunt dash)
      <ChallengeWorkspace
        view={view}
        teamCode={team.teamCode}
        statement={statement}
        totalStages={progress.totalStages}
        solvedCount={progress.solvedCount}
      />
    </div>
  );
}
