'use client';

import React from 'react';

interface SearchSuggestionsProps {
  suggestions: string[];
  query: string;
  onSelect: (term: string) => void;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ suggestions, query, onSelect }) => {
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    // Highlight based on current query tokens
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} className="font-semibold text-[#242424]">{part}</span>
      ) : (
        <span key={i} className="font-normal text-[#242424]">{part}</span>
      )
    );
  };

  return (
    <div 
      className="absolute left-[24px] right-[24px] top-[74.5px] z-[999] flex flex-col rounded-[12px] border border-[#eaebf0] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.15)] overflow-hidden"
      style={{ maxWidth: 'calc(100% - 48px)' }}
    >
      {suggestions.map((suggestion, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(suggestion)}
          type="button"
          className="flex w-full cursor-pointer items-center px-[24px] py-[12px] border-t first:border-t-0 border-[#eaebf0] text-left hover:bg-[#fafafa] transition-colors group outline-none"
        >
          <div className="font-titillium text-[14px] leading-[16px] tracking-[-0.2px] text-[#242424] truncate">
             {renderHighlightedText(suggestion, query)}
          </div>
          {/* Autocorrect Label */}
          {idx === 0 && suggestion.toLowerCase() !== query.toLowerCase() && (
            <span className="ml-auto text-[9px] font-bold text-[#3f9633] uppercase tracking-wider bg-[#f0f9f0] px-2 py-0.5 rounded">
              Suggested
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default SearchSuggestions;
