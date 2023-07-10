import React from 'react';
import './hightlight.css';

const HighlightedText = ({ text, searchQuery }) => {
    const getHighlightedText = (text, searchQuery) => {
      const regex = new RegExp(`(${searchQuery})`, 'gi');
      return text.replace(regex, '<span class="highlight">$1</span>');
    };
  
  // Logic to highlight the search query in the text
  const highlightedText = getHighlightedText(text, searchQuery);

  return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
};

export default HighlightedText;
