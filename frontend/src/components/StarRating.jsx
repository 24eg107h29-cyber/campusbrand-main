import { useState } from 'react';

function StarRating({ rating = 0, count = 0, interactive = false, onRate = null, size = 'md' }) {
  const [hoverRating, setHoverRating] = useState(0);

  const starSize = size === 'sm' ? '0.9rem' : size === 'lg' ? '1.5rem' : '1.15rem';

  const handleClick = (star) => {
    if (interactive && onRate) {
      onRate(star);
    }
  };

  const activeValue = hoverRating || Math.round(rating);

  return (
    <div className="star-rating-wrap" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <div className="stars-row" style={{ display: 'inline-flex', gap: '2px', cursor: interactive ? 'pointer' : 'default' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = interactive ? star <= activeValue : star <= Math.round(rating);
          return (
            <span
              key={star}
              style={{
                fontSize: starSize,
                color: filled ? '#f59e0b' : '#d1d5db',
                transition: 'color 0.15s, transform 0.1s',
                display: 'inline-block',
                transform: interactive && hoverRating === star ? 'scale(1.2)' : 'scale(1)'
              }}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              onClick={() => handleClick(star)}
            >
              ★
            </span>
          );
        })}
      </div>
      {!interactive && rating > 0 && (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
          {rating.toFixed(1)}
          {count > 0 && <span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: '4px' }}>({count})</span>}
        </span>
      )}
      {!interactive && rating === 0 && (
        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>No ratings yet</span>
      )}
    </div>
  );
}

export default StarRating;

