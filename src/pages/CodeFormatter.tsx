import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.getAttribute('content') ?? '';

    document.title = title;
    meta?.setAttribute('content', description);

    return () => {
      document.title = previousTitle;
      meta?.setAttribute('content', previousDescription);
    };
  }, [description, title]);
}

const formatLooseCode = (value: string) => value
  .replace(/>\s+</g, '>\n<')
  .replace(/\s*{\s*/g, ' {\n  ')
  .replace(/;\s*/g, ';\n')
  .replace(/\s*}\s*/g, '\n}\n')
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .join('\n');

export default function CodeFormatter() {
  usePageMeta(
    'Free Code Formatter Tool Online | ToolScout',
    'Format messy code snippets online. Clean HTML, CSS, JavaScript, and JSON for easier reading, debugging, and sharing.'
  );

  const [code, setCode] = useState('{"name":"ToolScout","type":"formatter","fast":true}');
  const [copied, setCopied] = useState(false);

  const formatted = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(code), null, 2);
    } catch {
      return formatLooseCode(code);
    }
  }, [code]);

  const copy = async () => {
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="page active">
      <section className="section pt-[120px]">
        <div className="max-w-[1200px] mx-auto">
          <Link to="/" className="btn-ghost mb-10">Back to ToolScout</Link>
          <div className="sec-label">Free Builder Tool</div>
          <h1 className="hero-headline !text-[clamp(42px,7vw,88px)]">
            Code<br /><span className="line-accent">Formatter</span>
          </h1>
          <p className="hero-sub !max-w-[720px]">
            Paste JSON, HTML, CSS, JavaScript, or TypeScript snippets and clean them into a more readable shape.
            Formatting helps students debug faster and helps creators share cleaner tutorial code.
          </p>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="bg-black2 border border-border2 p-5">
              <div className="sec-label">Input</div>
              <textarea
                className="w-full min-h-[420px] bg-black3 border border-border2 text-white outline-none p-5 font-mono text-sm leading-7 resize-y focus:border-accent"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                aria-label="Code to format"
                spellCheck={false}
              />
            </div>
            <div className="bg-black2 border border-border2 p-5">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="sec-label !mb-0">Formatted</div>
                <button className="btn-primary !py-2 !px-5" type="button" onClick={copy}>
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="min-h-[420px] whitespace-pre-wrap overflow-auto bg-black3 border border-border2 text-accent p-5 font-mono text-sm leading-7">{formatted}</pre>
            </div>
          </div>

          <nav className="flex flex-wrap gap-4 mt-10" aria-label="Related tools">
            <Link className="btn-ghost" to="/word-counter">Word Counter</Link>
            <Link className="btn-ghost" to="/image-compressor">Image Compressor</Link>
          </nav>
        </div>
      </section>
    </div>
  );
}
