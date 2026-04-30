import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { TOOLS } from '../constants';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof TOOLS>([]);

  useEffect(() => {
    if (query.trim()) {
      const q = query.toLowerCase();
      const matches = TOOLS.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.match.toLowerCase().includes(q)
      ).slice(0, 5);
      setResults(matches);
    } else {
      setResults([]);
    }
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-inner">
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        <div className="modal-search-box">
          <input
            type="text"
            placeholder="Describe your problem…"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                navigate(`/browse?q=${encodeURIComponent(query)}`);
                onClose();
              }
              if (e.key === 'Escape') onClose();
            }}
          />
          <button
            className="modal-go"
            onClick={() => {
              if (query.trim()) {
                navigate(`/browse?q=${encodeURIComponent(query)}`);
                onClose();
              }
            }}
          >
            Search
          </button>
        </div>
        <div className="modal-hint">↑↓ Navigate · Enter Select · Esc Close</div>
        <div className="modal-results">
          {results.map(t => (
            <div
              key={t.id}
              className="modal-result"
              onClick={() => {
                navigate(`/tool/${t.id}`);
                onClose();
              }}
            >
              <div className="modal-result-icon">{t.icon}</div>
              <div>
                <div className="modal-result-name">{t.name}</div>
                <div className="modal-result-cat">{t.catLabel}</div>
              </div>
              <div className="modal-result-tag">{t.price}</div>
            </div>
          ))}
          {query && results.length === 0 && (
            <div className="p-5 text-white3 italic text-[13px]">No results found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
