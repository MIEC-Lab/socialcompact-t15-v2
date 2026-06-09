/*
 * Authorship: Chenle Chen (D) owns round-detail visualization.
 * Scope: Explains what happened inside each round of the match.
 */

export type RoundChat = {
  speaker: string;
  message: string;
};

export type RoundPrediction = {
  player: string;
  prediction: string;
};

export type RoundAction = {
  player: string;
  action: string;
};

export type RoundObservation = {
  label: string;
  value: string;
};

export type RoundEventType = "event" | "vote" | "elimination" | "status";

export type RoundEvent = {
  text: string;
  type: RoundEventType;
};

export type RoundDetailData = {
  id: number;
  events?: RoundEvent[];
  remainingPlayers?: string[];
  chats: RoundChat[];
  predictions: RoundPrediction[];
  actions: RoundAction[];
  observations: RoundObservation[];
};

type RoundDetailProps = {
  round: RoundDetailData;
};

function EmptyState({ label }: { label: string }) {
  return (
    <p className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-400">
      No {label} recorded for this round.
    </p>
  );
}

export function RoundDetail({ round }: RoundDetailProps) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Round Detail
          </p>
          <h2 className="mt-2 text-2xl font-bold">Round {round.id}</h2>
        </div>
        <p className="text-sm text-slate-400">
          chats, predictions, actions, observations
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
          <h3 className="text-lg font-semibold text-white">Chats</h3>
          <div className="mt-4 space-y-3">
            {round.chats.length === 0 ? (
              <EmptyState label="chats" />
            ) : (
              round.chats.map((chat, index) => (
                <div
                  key={`${chat.speaker}-${index}`}
                  className="rounded-2xl bg-white/5 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-cyan-200">
                    {chat.speaker}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {chat.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
          <h3 className="text-lg font-semibold text-white">Predictions</h3>
          <div className="mt-4 space-y-3">
            {round.predictions.length === 0 ? (
              <EmptyState label="predictions" />
            ) : (
              round.predictions.map((item, index) => (
                <div
                  key={`${item.player}-${index}`}
                  className="rounded-2xl bg-white/5 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-violet-200">
                    {item.player}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {item.prediction}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
          <h3 className="text-lg font-semibold text-white">Actions</h3>
          <div className="mt-4 space-y-3">
            {round.actions.length === 0 ? (
              <EmptyState label="actions" />
            ) : (
              round.actions.map((item, index) => (
                <div
                  key={`${item.player}-${index}`}
                  className="rounded-2xl bg-white/5 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-emerald-200">
                    {item.player}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {item.action}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
          <h3 className="text-lg font-semibold text-white">Observations</h3>
          <div className="mt-4 space-y-3">
            {round.observations.length === 0 ? (
              <EmptyState label="observations" />
            ) : (
              round.observations.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="rounded-2xl bg-white/5 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-amber-200">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {item.value}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default RoundDetail;
