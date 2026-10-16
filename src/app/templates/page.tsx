"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { templates } from "@/lib/templates";
import { createProject } from "@/lib/projects";

export default function TemplatesPage() {
  const router = useRouter();

  const useTemplate = (template: (typeof templates)[number]) => {
    const project = createProject(template.type as Parameters<typeof createProject>[0], template.title);
    router.push(`/editor?type=${template.type}&template=${template.id}&new=1&design=${project.id}`);
  };

  return (
    <main className="min-h-screen bg-[#080b14] text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/brand/freecraft-logo.png" alt="FreeCraft" width={42} height={42} className="rounded-xl" />
          <span className="font-bold tracking-tight">FreeCraft</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft size={16} /> Back home
        </Link>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-12 lg:px-10">
        <div className="max-w-3xl">
          <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
            <Sparkles size={14} /> Free templates
          </div>
          <h1 className="text-5xl font-black tracking-[-0.04em] md:text-6xl">Start with a good idea.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
            Pick a starting point, open it in the editor, and change every element. Nothing is locked behind a paywall.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <article key={template.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] transition hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.055]">
              <div className="relative h-60 overflow-hidden" style={{ background: template.background }}>
                <div className="absolute inset-5 rounded-2xl border border-white/10 p-5" style={{ background: `${template.accent}10` }}>
                  <div className="text-[10px] font-bold tracking-[0.2em]" style={{ color: template.accent }}>{template.category.toUpperCase()}</div>
                  <div className="mt-5 max-w-[80%] text-2xl font-black leading-tight text-white">{template.title}</div>
                  <div className="absolute bottom-5 left-5 right-5 flex gap-2">
                    {template.tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-[10px] text-white/70">{tag}</span>)}
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="text-lg font-bold">{template.title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{template.description}</p>
                <button onClick={() => useTemplate(template)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500">
                  Use template <ArrowRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
