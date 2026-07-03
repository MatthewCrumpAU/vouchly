@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* premium-minimal: soft off-white canvas, purple-tinted ink */
  --background: 247 247 251;
  --foreground: 27 23 38;
  --brand-grad: linear-gradient(135deg, #7c3aed, #4f46e5);
}
.dark {
  --background: 12 10 20;
  --foreground: 226 226 235;
}

html { scroll-behavior: smooth; }
body {
  background: rgb(var(--background));
  color: rgb(var(--foreground));
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

@layer components {
  .card {
    @apply rounded-2xl border bg-white p-5;
    border-color: #ecebf2;
    box-shadow: 0 1px 2px rgba(16,24,40,.04), 0 12px 32px -16px rgba(91,60,190,.16);
  }
  .dark .card { @apply border-slate-800 bg-slate-900; box-shadow: none; }

  .input {
    @apply w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900
           placeholder:text-slate-400 outline-none transition
           dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100;
    border-color: #e5e3ef;
  }
  .input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.15); }

  .label { @apply mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300; }

  /* small uppercase section label used above numbers/headings */
  .eyebrow {
    @apply text-[11px] font-semibold uppercase text-slate-500;
    letter-spacing: .12em;
  }

  /* gradient brand accents */
  .brand-grad { background: var(--brand-grad); }
  .brand-grad-text {
    background: var(--brand-grad);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
}
