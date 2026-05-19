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

export default function WordCounter() {
  usePageMeta(
    'Free Word Counter Tool Online | ToolScout',
    'Count words instantly with our free word counter tool. Fast, accurate, and perfect for students and creators.'
  );

  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.match(/\b[\w'-]+\b/g)?.length ?? 0 : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const sentences = trimmed ? text.split(/[.!?]+/).filter((item) => item.trim()).length : 0;
    const paragraphs = trimmed ? text.split(/\n\s*\n/).filter((item) => item.trim()).length : 0;
    const readingTime = words ? Math.max(1, Math.ceil(words / 200)) : 0;

    return { words, characters, charactersNoSpaces, sentences, paragraphs, readingTime };
  }, [text]);

  return (
    <div className="page active">
      <section className="section pt-[120px]">
        <div className="max-w-[1120px] mx-auto">
          <Link to="/" className="btn-ghost mb-10">Back to ToolScout</Link>
          <div className="sec-label">Free Writing Tool</div>
          <h1 className="hero-headline !text-[clamp(42px,7vw,88px)]">
            Word<br /><span className="line-accent">Counter</span>
          </h1>
          <p className="hero-sub !max-w-[720px]">
            Paste an essay, caption, script, product description, or class assignment and get instant word, character,
            sentence, paragraph, and reading-time counts. Everything runs in your browser, so your writing stays private.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {[
              ['Words', stats.words],
              ['Characters', stats.characters],
              ['No Spaces', stats.charactersNoSpaces],
              ['Sentences', stats.sentences],
              ['Paragraphs', stats.paragraphs],
              ['Read Time', stats.readingTime ? `${stats.readingTime} min` : '0 min'],
            ].map(([label, value]) => (
              <div key={String(label)} className="bg-black2 border border-border p-5">
                <div className="font-syne text-3xl font-extrabold text-accent leading-none">{value}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white3 mt-3">{label}</div>
              </div>
            ))}
          </div>

          <div className="bg-black2 border border-border2 p-4 md:p-6">
            <textarea
              className="w-full min-h-[320px] bg-black3 border border-border2 text-white outline-none p-5 text-base leading-8 resize-y focus:border-accent"
              placeholder="Paste or type your text here..."
              value={text}
              onChange={(event) => setText(event.target.value)}
              aria-label="Text to count"
            />
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
              <p className="text-white3 text-sm italic m-0">
                {stats.words > 0 ? `${stats.words} words counted` : 'Start typing to see live counts.'}
              </p>
              <button className="btn-primary !py-3 !px-6" type="button" onClick={() => setText('')}>
                Clear
              </button>
            </div>
          </div>

          <nav className="flex flex-wrap gap-4 mt-10" aria-label="Related tools">
            <Link className="btn-ghost" to="/image-compressor">Image Compressor</Link>
            <Link className="btn-ghost" to="/code-formatter">Code Formatter</Link>
          </nav>
        </div>
      </section>
    </div>
  );
}
