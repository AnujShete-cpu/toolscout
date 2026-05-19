import { ChangeEvent, useEffect, useRef, useState } from 'react';
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

const formatBytes = (bytes: number | null) => {
  if (bytes === null) return '-';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

export default function ImageCompressor() {
  usePageMeta(
    'Free Image Compressor Tool Online | ToolScout',
    'Compress images online for faster websites and smaller uploads. Reduce file size while keeping images clear for creators and students.'
  );

  const [quality, setQuality] = useState(75);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const compressFile = (file: File, nextQuality = quality) => {
    if (!file.type.startsWith('image/')) return;
    setFileName(file.name);
    setOriginalSize(file.size);

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxWidth = 1600;
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext('2d');
        if (!context) return;
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (!blob) return;
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setCompressedSize(blob.size);
          setPreviewUrl(URL.createObjectURL(blob));
        }, 'image/jpeg', nextQuality / 100);
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) compressFile(file);
  };

  const savings = originalSize && compressedSize
    ? Math.max(0, Math.round((1 - compressedSize / originalSize) * 100))
    : null;

  return (
    <div className="page active">
      <section className="section pt-[120px]">
        <div className="max-w-[1120px] mx-auto">
          <Link to="/" className="btn-ghost mb-10">Back to ToolScout</Link>
          <div className="sec-label">Free Creator Tool</div>
          <h1 className="hero-headline !text-[clamp(42px,7vw,88px)]">
            Image<br /><span className="line-accent">Compressor</span>
          </h1>
          <p className="hero-sub !max-w-[720px]">
            Compress images in your browser before uploading them to websites, portfolios, assignments, newsletters,
            and social posts. Smaller files load faster and are easier to share.
          </p>

          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <div className="bg-black2 border border-border2 p-6">
              <button
                type="button"
                className="w-full min-h-[240px] border border-dashed border-border2 bg-black3 text-white font-syne uppercase tracking-[0.08em] hover:border-accent transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {fileName || 'Choose an image'}
              </button>
              <input ref={fileInputRef} className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />

              <label className="block mt-6">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white3">JPEG quality: {quality}%</span>
                <input
                  className="w-full mt-3 accent-[#c8ff00]"
                  type="range"
                  min="35"
                  max="95"
                  value={quality}
                  onChange={(event) => setQuality(Number(event.target.value))}
                  onMouseUp={() => fileInputRef.current?.files?.[0] && compressFile(fileInputRef.current.files[0], quality)}
                />
              </label>

              {previewUrl && (
                <a className="btn-primary mt-6" href={previewUrl} download="toolscout-compressed.jpg">
                  Download compressed image
                </a>
              )}
            </div>

            <aside className="bg-black2 border border-border p-6">
              <div className="sec-label">Compression Result</div>
              <div className="grid gap-3 mt-6">
                <div className="bg-black3 border border-border p-4"><strong className="text-accent text-2xl">{formatBytes(originalSize)}</strong><div className="text-white3 text-xs uppercase">Original</div></div>
                <div className="bg-black3 border border-border p-4"><strong className="text-accent text-2xl">{formatBytes(compressedSize)}</strong><div className="text-white3 text-xs uppercase">Compressed</div></div>
                <div className="bg-black3 border border-border p-4"><strong className="text-accent text-2xl">{savings === null ? '-' : `${savings}%`}</strong><div className="text-white3 text-xs uppercase">Saved</div></div>
              </div>
            </aside>
          </div>

          <nav className="flex flex-wrap gap-4 mt-10" aria-label="Related tools">
            <Link className="btn-ghost" to="/word-counter">Word Counter</Link>
            <Link className="btn-ghost" to="/code-formatter">Code Formatter</Link>
          </nav>
        </div>
      </section>
    </div>
  );
}
