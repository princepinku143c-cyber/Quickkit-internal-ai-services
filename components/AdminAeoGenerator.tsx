import React, { useState } from "react";
import { CheckCircle2, Copy, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { apiCall } from "../lib/api";

type AeoItem = { question: string; answer: string };
type Generation = { id: string; keyword: string; model: string; items: AeoItem[]; status: string; createdAt: string };

export const AdminAeoGenerator: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [context, setContext] = useState("QuickKitAI / Raja AI Systems provides AI automation and managed workflows for businesses in India. Do not invent customer results, rankings, guarantees or prices.");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setGeneration(null);
    setLoading(true);
    try {
      const result = await apiCall("/api/aeo-generate", { keyword, context, count });
      setGeneration(result as Generation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AEO generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const copyDraft = async () => {
    if (!generation) return;
    const text = generation.items.map((item, index) => "Q" + (index + 1) + ": " + item.question + "\nA: " + item.answer).join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[.22em] text-amber-400">Answer Engine Optimization</p>
        <h1 className="mt-2 text-3xl font-black text-white">AEO Content Studio</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">Generate answer-ready Q&A drafts through the server-side OpenCode connection. Drafts are saved for editorial review and are never auto-published.</p>
      </div>
      <form onSubmit={generate} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <label className="block text-sm font-bold text-slate-200">
          Target topic or buyer-intent keyword
          <input value={keyword} onChange={event => setKeyword(event.target.value)} maxLength={180} required placeholder="e.g. AI lead qualification for Indian real estate builders" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-amber-400" />
        </label>
        <label className="block text-sm font-bold text-slate-200">
          Verified business context
          <textarea value={context} onChange={event => setContext(event.target.value)} maxLength={1200} rows={4} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-amber-400" />
        </label>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="text-sm font-bold text-slate-200">
            Number of Q&A pairs
            <select value={count} onChange={event => setCount(Number(event.target.value))} className="mt-2 block rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white">
              {[3, 5, 8, 10].map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <button type="submit" disabled={loading || !keyword.trim()} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating…" : "Generate AEO drafts"}
          </button>
        </div>
        {error && <p role="alert" className="flex items-center gap-2 text-sm text-rose-300"><AlertCircle className="h-4 w-4" />{error}</p>}
      </form>
      {generation && (
        <section className="space-y-4 rounded-3xl border border-emerald-800/60 bg-slate-900/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Draft generated and saved</p>
              <p className="mt-1 text-xs text-slate-500">Model: {generation.model} · {generation.items.length} pairs · Review status: {generation.status}</p>
            </div>
            <button type="button" onClick={copyDraft} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-bold text-white"><Copy className="h-4 w-4" />{copied ? "Copied" : "Copy all"}</button>
          </div>
          {generation.items.map((item, index) => (
            <article key={index} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-amber-300">Question {index + 1}</p>
              <h2 className="mt-2 font-bold text-white">{item.question}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">{item.answer}</p>
            </article>
          ))}
          <p className="text-xs leading-5 text-slate-500">Editorial gate: verify factual claims, add genuine sources and approve the draft before publishing it on a public page.</p>
        </section>
      )}
    </div>
  );
};
