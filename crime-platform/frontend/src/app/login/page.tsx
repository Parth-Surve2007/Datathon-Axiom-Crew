"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Fingerprint, LockKeyhole, Mail, Radio, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

const signalBars = [32, 48, 38, 64, 54, 82, 62, 92, 72, 56, 76, 66, 88, 60, 74];

export default function Login() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (connecting) return;
    setConnecting(true);
    window.setTimeout(() => router.push("/dashboard"), reduceMotion ? 100 : 650);
  };

  return (
    <main className="relative min-h-screen min-h-[100dvh] overflow-hidden bg-[#e9edf0] p-3 sm:p-5 lg:p-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="ambient-orb absolute -left-40 -top-40 size-[32rem] rounded-full bg-white/90 blur-[100px]" />
        <div className="ambient-orb-reverse absolute -bottom-56 -right-36 size-[38rem] rounded-full bg-[#93b2ca]/28 blur-[120px]" />
      </div>

      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1500px] overflow-hidden rounded-[30px] border border-white/70 bg-white/65 shadow-[0_28px_90px_rgba(24,32,51,.13)] sm:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[1.06fr_.94fr]"
      >
        <section className="soft-grid relative hidden overflow-hidden bg-[#182033] p-10 text-white lg:flex lg:flex-col xl:p-14" aria-label="Kangavalu intelligence overview">
          <div className="scan-line opacity-30" />
          <motion.div
            aria-hidden
            animate={reduceMotion ? undefined : { rotate: [0, 4, -3, 0], scale: [1, 1.04, 0.98, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-28 -top-24 size-[32rem] opacity-[0.055]"
          >
            <Image src="/ksp-logo.png" alt="" fill sizes="512px" className="object-contain" />
          </motion.div>

          <div className="relative z-10 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-[#d9482b] shadow-[0_12px_30px_rgba(217,72,43,.3)]">
              <Image src="/ksp-logo.png" alt="" width={34} height={30} className="h-8 w-9 object-contain" priority />
            </span>
            <span>
              <span className="block text-base font-bold leading-none tracking-[-0.03em]">Kangavalu</span>
              <span className="mt-1.5 block text-[9px] font-semibold uppercase tracking-[0.24em] text-white/45">Karnataka State Police</span>
            </span>
          </div>

          <div className="relative z-10 my-auto max-w-[38rem] py-16">
            <motion.div initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18, duration: 0.55 }} className="mb-6 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">
              <span className="live-dot size-2 rounded-full bg-[#6bc1ad]" /> State node operational
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.65, ease: [0.22, 1, 0.36, 1] }} className="max-w-[35rem] text-[clamp(3rem,5vw,5.8rem)] font-semibold leading-[0.92] tracking-[-0.075em]">
              Intelligence that <span className="text-[#9db8cc]">connects the dots.</span>
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36, duration: 0.55 }} className="mt-6 max-w-md text-sm leading-relaxed text-white/50">A unified operational picture for cases, people, places, evidence, and emerging crime patterns across Karnataka.</motion.p>

            <div className="mt-10 flex h-24 items-end gap-2 rounded-[24px] border border-white/[0.07] bg-white/[0.035] px-5 py-4" aria-label="Live intelligence signal">
              {signalBars.map((height, index) => (
                <motion.span key={index} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: reduceMotion ? 0 : 0.5 + index * 0.035, duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className={`h-full min-w-0 flex-1 origin-bottom rounded-full ${index === 8 ? "bg-[#d9482b]" : "bg-white/20"}`} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3">
            {[["1,248", "Active cases"], ["84", "High priority"], ["68%", "Clearance rate"]].map(([value, label], index) => (
              <motion.div key={label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : 0.5 + index * 0.08 }} className="border-l border-white/10 pl-4 first:border-0 first:pl-0">
                <p className="text-xl font-semibold tracking-[-0.04em]">{value}</p><p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/35">{label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="relative flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-20">
          <div className="w-full max-w-[440px]">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[#d9482b] shadow-[0_12px_30px_rgba(217,72,43,.25)]"><Image src="/ksp-logo.png" alt="" width={34} height={30} className="h-8 w-9 object-contain" priority /></span>
              <span><span className="block text-base font-bold leading-none text-[#182033]">Kangavalu</span><span className="mt-1.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8a929b]">Karnataka State Police</span></span>
            </div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.58, ease: [0.22, 1, 0.36, 1] }}>
              <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-[#fbeae5] text-[#d9482b]"><Fingerprint size={22} /></span>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9299a2]">Secure access</p>
              <h1 className="mt-2 text-[clamp(2.1rem,4vw,3.3rem)] font-semibold leading-none tracking-[-0.06em] text-[#182033]">Welcome back.</h1>
              <p className="mt-3 text-sm leading-relaxed text-[#777f89]">Sign in to enter your operational workspace.</p>
            </motion.div>

            <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.58, ease: [0.22, 1, 0.36, 1] }} className="mt-9 space-y-5">
              <div className="block">
                <label htmlFor="official-email" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#747d87]">Official email</label>
                <span className="group relative block">
                  <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#929aa3] transition-colors group-focus-within:text-[#d9482b]" />
                  <input id="official-email" type="email" autoComplete="email" required defaultValue="admin@gmail.com" className="h-14 w-full rounded-2xl border border-[#d9dfe4] bg-white/75 pl-12 pr-4 text-sm text-[#182033] shadow-sm outline-none transition focus:border-[#d9482b]/35 focus:bg-white focus:shadow-[0_12px_32px_rgba(24,32,51,.08)]" />
                </span>
              </div>

              <div className="block">
                <label htmlFor="access-key" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#747d87]">Access key</label>
                <span className="group relative block">
                  <LockKeyhole size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#929aa3] transition-colors group-focus-within:text-[#d9482b]" />
                  <input id="access-key" type={showPassword ? "text" : "password"} autoComplete="current-password" required defaultValue="admin" className="h-14 w-full rounded-2xl border border-[#d9dfe4] bg-white/75 pl-12 pr-13 text-sm text-[#182033] shadow-sm outline-none transition focus:border-[#d9482b]/35 focus:bg-white focus:shadow-[0_12px_32px_rgba(24,32,51,.08)]" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide access key" : "Show access key"} className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-xl text-[#7d8690] hover:bg-[#f1f3f4] hover:text-[#182033]">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 text-[10px] text-[#7a838d]">
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="size-4 accent-[#d9482b]" /> Keep this device trusted</label>
                <span className="font-semibold text-[#59636e]">Demo access enabled</span>
              </div>

              <motion.button whileHover={reduceMotion ? undefined : { y: -2, scale: 1.008 }} whileTap={{ scale: 0.98 }} type="submit" disabled={connecting} className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#182033] px-5 text-xs font-semibold text-white shadow-[0_14px_34px_rgba(24,32,51,.24)] transition-shadow hover:shadow-[0_20px_42px_rgba(24,32,51,.3)] disabled:cursor-wait">
                {connecting && <motion.span layoutId="connecting" className="absolute inset-y-0 left-0 bg-[#d9482b]" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: reduceMotion ? 0.05 : 0.62, ease: [0.22, 1, 0.36, 1] }} />}
                <span className="relative z-10">{connecting ? "Establishing secure session…" : "Enter intelligence workspace"}</span>
                {!connecting && <ArrowRight size={15} className="relative z-10 transition-transform group-hover:translate-x-1" />}
              </motion.button>
            </motion.form>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }} className="mt-8 flex items-center justify-center gap-2 text-[9px] font-medium uppercase tracking-[0.15em] text-[#9299a2]"><ShieldCheck size={13} className="text-[#287a71]" /> Authorized personnel only <span className="mx-1 text-[#c1c7cc]">•</span> <Radio size={11} /> Encrypted node</motion.div>
          </div>
        </section>
      </motion.div>
    </main>
  );
}
