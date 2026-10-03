import Link from "next/link";
import { experiments, type Experiment } from "@/src/labs/experiments";

function ExperimentIcon({ icon }: { icon: Experiment["icon"] }) {
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {icon === "writing" && <><path d="m7 25 3-8L23 4l5 5-13 13-8 3Z" /><path d="m20 7 5 5M10 17l5 5M5 28h22" /></>}
    {icon === "dna" && <><path d="M8 3c0 13 16 13 16 26M24 3c0 13-16 13-16 26" /><path d="M9 7h14M12 12h8M12 20h8M9 25h14" /></>}
    {icon === "notes" && <><path d="M8 4h18v23H8a3 3 0 0 1 0-6h18M5 24V7a3 3 0 0 1 3-3" /><path d="M12 10h10M12 15h7" /></>}
  </svg>;
}

function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const content = <>
    <div className="lab-card-top"><span className="lab-card-icon"><ExperimentIcon icon={experiment.icon} /></span><span className="lab-card-category">{experiment.category}</span></div>
    <h3>{experiment.title}</h3>
    <p className="lab-card-description">{experiment.description}</p>
    <span className="lab-card-action">{experiment.action}<span aria-hidden="true">{experiment.external ? "↗" : "→"}</span></span>
  </>;
  return <li className="lab-card">
    {experiment.external
      ? <a className="lab-card-link" href={experiment.href} target="_blank" rel="noopener noreferrer" aria-label={`${experiment.title} — ${experiment.action}（新しいタブで開きます）`}>{content}</a>
      : <Link className="lab-card-link" href={experiment.href}>{content}</Link>}
  </li>;
}

export default function Lab() {
  return <>
    <header className="lab-intro">
      <p className="lab-eyebrow">SMALL EXPERIMENTS / くろねこ。の実験室</p>
      <h1>Lab</h1>
      <p className="lab-lead">つくって、試して、記録する。</p>
      <p className="lab-description">AIとの文章づくりも、小さなツールも、日々のノートも。<br className="lab-desktop-break" />気になったことを、少しずつ形にしています。</p>
    </header>
    <section aria-labelledby="lab-experiments-heading">
      <div className="lab-section-heading"><h2 id="lab-experiments-heading">実験の入口</h2><span>{experiments.length}つの実験</span></div>
      <ul className="lab-grid">{experiments.map(experiment => <ExperimentCard key={experiment.id} experiment={experiment} />)}</ul>
    </section>
  </>;
}
