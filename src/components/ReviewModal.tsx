import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ isOpen, onClose, onSuccess }: ReviewModalProps) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setText('');
      setRating(5);
      setMessage('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!name.trim() || !text.trim()) {
      setIsError(true);
      setMessage('Please fill in your name and review.');
      return;
    }

    const existing = JSON.parse(localStorage.getItem('toolscout_global_reviews') || '[]');
    const newReview = {
      id: Date.now(),
      name: name.trim(),
      text: text.trim(),
      rating,
      role: 'ToolScout User',
      date: new Date().toISOString(),
    };
    localStorage.setItem('toolscout_global_reviews', JSON.stringify([...existing, newReview]));

    setIsError(false);
    setMessage('Review submitted successfully!');
    onSuccess();
    setTimeout(onClose, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-inner relative">
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="mb-6">
          <div className="sec-label mb-3">Share Your Experience</div>
          <div className="font-syne text-[clamp(22px,3vw,32px)] font-extrabold leading-none tracking-tight uppercase">
            Leave a <span className="text-accent">Review</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <input
            type="text"
            placeholder="Your name…"
            className="bg-black3 border-[1.5px] border-border2 outline-none text-white font-body text-base italic p-4 w-full transition-colors focus:border-accent"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            placeholder="Describe your experience…"
            rows={4}
            className="bg-black3 border-[1.5px] border-border2 outline-none text-white font-body text-base italic p-4 w-full resize-y transition-colors focus:border-accent"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white3">Rating</span>
            <div className="flex gap-1.5 cursor-pointer text-xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-opacity"
                  style={{ color: star <= rating ? 'var(--accent)' : 'var(--white3)' }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        {message && (
          <div
            className="font-mono text-[11px] uppercase tracking-widest min-h-[20px] mb-3"
            style={{ color: isError ? 'var(--accent2)' : 'var(--accent)' }}
          >
            {message}
          </div>
        )}

        <button
          className="modal-go py-3.5 px-8 text-[13px]"
          onClick={handleSubmit}
        >
          Submit Review
        </button>
      </div>
    </div>
  );
}
