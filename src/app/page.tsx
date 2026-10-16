import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Image as ImageIcon,
  LayoutTemplate,
  Palette,
  Presentation,
  QrCode,
  Sparkles,
  Type,
  WandSparkles,
} from "lucide-react";

const createItems = [
  ["Presentation", Presentation, "Slides for class, work, or ideas.", "/editor?type=presentation"],
  ["Poster", LayoutTemplate, "Posters, flyers, and announcements.", "/editor?type=poster"],
  ["Resume", FileText, "Build a clean, professional CV.", "/editor?type=resume"],
  ["Social Post", ImageIcon, "Posts sized for social platforms.", "/editor?type=social"],
  ["Thumbnail", ImageIcon, "Eye-catching video thumbnails.", "/editor?type=thumbnail"],
  ["UI Design", Palette, "Start exploring product interfaces.", "/editor?type=ui"],
] as const;

const tools = [
  ["Background remover", WandSparkles],
  ["Image compressor", ImageIcon],
  ["Image converter", ArrowRight],
  ["QR generator", QrCode],
  ["Color palette", Palette],
  ["Font pairing", Type],
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b1020]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/brand/freecraft-logo.png" alt="FreeCraft" width={44} height={44} className="rounded-xl object-cover" />
          <span className="text-lg font-bold tracking-tight">FreeCraft</span>
        </Link>
        <div className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          <a href="#create" className="hover:text-white">Create</a>
          <a href="#tools" className="hover:text-white">Toolbox</a>
          <Link href="/templates" className="hover:text-white">Templates</Link>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:block">
            Workspace
          </Link>
          <Link href="/editor?type=poster" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500">
            Start creating
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-10 lg:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-7 flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-medium text-blue-200">
            <Sparkles size={14} />
            Free & open source
          </div>
          <h1 className="text-5xl font-black tracking-[-0.04em] text-white md:text-7xl">
            Design. Create. <span className="text-blue-400">Share. Free.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            One creative workspace for students and creators — without the paywalls.
          </p>

          <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl">
            <div className="rounded-2xl border border-white/10 bg-[#111827] p-5 text-left">
              <div className="flex items-start gap-3">
                <WandSparkles className="mt-1 shrink-0 text-blue-400" size={20} />
                <div>
                  <p className="text-sm font-medium text-slate-300">What do you want to create?</p>
                  <p className="mt-2 text-slate-500">Create a 10-slide presentation about AI for my university project...</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500">Create with AI</button>
                <Link href="/editor?type=poster" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold hover:bg-white/10">Start blank</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="create" className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-400">CREATE</p>
          <h2 className="mt-2 text-3xl font-bold">Make something real.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {createItems.map(([name, Icon, desc, href]) => (
            <Link key={name} href={href} className="group rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-0.5 hover:border-blue-400/30 hover:bg-white/[0.06]">
              <Icon size={23} className="text-blue-400" />
              <h3 className="mt-5 text-lg font-semibold">{name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
              <ArrowRight size={17} className="mt-6 text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400" />
            </Link>
          ))}
        </div>
      </section>

      <section id="tools" className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="mb-8">
          <p className="text-sm font-semibold text-cyan-400">CREATIVE TOOLBOX</p>
          <h2 className="mt-2 text-3xl font-bold">Useful tools. No hunting around.</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {tools.map(([name, Icon]) => (
            <div key={name} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm text-slate-300">
              <Icon size={18} className="text-cyan-400" />
              {name}
            </div>
          ))}
        </div>
      </section>

      <section id="templates" className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-white/[0.03] to-cyan-400/10 p-8 md:p-12">
          <div className="flex max-w-2xl items-start gap-4">
            <div className="rounded-2xl bg-blue-500/15 p-3"><LayoutTemplate className="text-blue-400" /></div>
            <div>
              <p className="text-sm font-semibold text-blue-300">THE FREECRAFT EDITOR</p>
              <h2 className="mt-2 text-3xl font-bold">Simple on the surface. Powerful underneath.</h2>
              <p className="mt-4 leading-7 text-slate-400">The first real building block is here: a structured design canvas with layers, selection, text, shapes, undo/redo, and export.</p>
              <Link href="/templates" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-100">
                Browse templates <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10 text-center text-sm text-slate-500">
        FreeCraft — Design. Create. Share. Free.
      </footer>
    </main>
  );
}
