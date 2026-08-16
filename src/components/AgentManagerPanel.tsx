import { Activity, Bot, CheckCircle2, Cloud, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { buildAgentManagerInput } from '../agents/context'
import { agentObjectives, type AgentManagerReport, type AgentObjective } from '../agents/types'
import { runAgentManager } from '../services/agentManager'
import type { DraftPick, RunResult } from '../types'

const progressStages = ['Building grounded context', 'Running scout and tactician', 'Critiquing the plan', 'Validating final output']

export function AgentManagerPanel({
  result,
  picks,
  formationId,
  cloudEnabled,
  onSignIn,
}: {
  result: RunResult
  picks: DraftPick[]
  formationId: string
  cloudEnabled: boolean
  onSignIn: () => void
}) {
  const [objective, setObjective] = useState<AgentObjective>('balanced')
  const [report, setReport] = useState<AgentManagerReport | null>(null)
  const [busy, setBusy] = useState(false)
  const [progressIndex, setProgressIndex] = useState(0)
  const [error, setError] = useState('')
  const input = useMemo(
    () => buildAgentManagerInput(result, picks, formationId, objective),
    [formationId, objective, picks, result],
  )

  useEffect(() => {
    if (!busy) return
    const interval = window.setInterval(() => {
      setProgressIndex((current) => Math.min(progressStages.length - 1, current + 1))
    }, 850)
    return () => window.clearInterval(interval)
  }, [busy])

  const startAgentRun = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    setProgressIndex(0)
    try {
      setReport(await runAgentManager(input, { preferCloud: cloudEnabled }))
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : 'The agent team could not analyze this run.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="agent-manager panel" aria-labelledby="agent-manager-title">
      <div className="agent-manager-header">
        <div>
          <span className="agent-kicker"><Bot size={15} /> Agent Lab</span>
          <h2 id="agent-manager-title">Let an agent team audit your XI</h2>
          <p>A scout, tactician, and critic inspect the same structured run data, then a manager agent turns their disagreement into one testable plan.</p>
        </div>
        <span className={cloudEnabled ? 'agent-runtime cloud' : 'agent-runtime local'}>
          {cloudEnabled ? <Cloud size={15} /> : <Activity size={15} />}
          {cloudEnabled ? 'Cloud AI ready' : 'Local runtime'}
        </span>
      </div>

      <div className="agent-objectives" role="group" aria-label="Agent objective">
        {agentObjectives.map((item) => (
          <button
            className={objective === item.id ? 'agent-objective active' : 'agent-objective'}
            type="button"
            key={item.id}
            onClick={() => {
              setObjective(item.id)
              setReport(null)
              setError('')
            }}
            aria-pressed={objective === item.id}
          >
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </button>
        ))}
      </div>

      <div className="agent-manager-actions">
        <button className="button primary" type="button" onClick={startAgentRun} disabled={busy}>
          {busy ? <Activity className="agent-spin" size={18} /> : report ? <RotateCcw size={18} /> : <Sparkles size={18} />}
          {busy ? progressStages[progressIndex] : report ? 'Run again' : 'Run agent team'}
        </button>
        {!cloudEnabled && (
          <button className="button ghost" type="button" onClick={onSignIn}>
            Sign in for model-backed agents
          </button>
        )}
      </div>

      {error && <p className="agent-notice danger" role="alert">{error}</p>}
      {busy && (
        <div className="agent-progress" role="status" aria-live="polite">
          {progressStages.map((stage, index) => (
            <span className={index <= progressIndex ? 'active' : ''} key={stage}>{stage}</span>
          ))}
        </div>
      )}

      {report && !busy && (
        <div className="agent-report" aria-live="polite">
          <div className="agent-report-hero">
            <span>{report.source === 'openai' ? `Model-backed · ${report.model ?? 'OpenAI'}` : 'Deterministic local evaluator'}</span>
            <h3>{report.headline}</h3>
            <p>{report.summary}</p>
            <div className="agent-confidence">
              <span style={{ width: `${report.confidence}%` }} />
              <strong>{report.confidence}% grounded confidence</strong>
            </div>
          </div>

          {report.fallbackReason && (
            <p className="agent-notice"><RotateCcw size={15} /> Cloud run recovered locally: {report.fallbackReason}</p>
          )}

          <div className="agent-plan">
            <span>Manager plan</span>
            <p>{report.formationPlan}</p>
          </div>

          <div className="agent-change-grid">
            {report.keyChanges.map((change, index) => (
              <article key={`${change.title}-${index}`}>
                <span>0{index + 1}</span>
                <h4>{change.title}</h4>
                <p>{change.detail}</p>
                <ul>{change.evidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ul>
              </article>
            ))}
          </div>

          <div className="agent-review-grid">
            <div>
              <h4><CheckCircle2 size={16} /> What survives review</h4>
              <ul>{report.strengths.map((strength) => <li key={strength}>{strength}</li>)}</ul>
            </div>
            <div>
              <h4><ShieldCheck size={16} /> Critic flags</h4>
              <ul>{report.risks.map((risk) => <li key={risk}>{risk}</li>)}</ul>
            </div>
          </div>

          <details className="agent-trace">
            <summary>Inspect agent trace and guardrails</summary>
            <div className="agent-trace-list">
              {report.traces.map((trace) => (
                <article key={trace.id}>
                  <span className={trace.status}>{trace.status}</span>
                  <strong>{trace.label}</strong>
                  <small>{trace.durationMs} ms</small>
                  <p>{trace.note}</p>
                </article>
              ))}
            </div>
            <div className="agent-guardrails">
              {report.guardrails.map((guardrail) => <span key={guardrail}><ShieldCheck size={13} /> {guardrail}</span>)}
            </div>
          </details>
        </div>
      )}
    </section>
  )
}
