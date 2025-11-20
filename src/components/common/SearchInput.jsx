/**
 * Search Input Component with Debouncing
 */

import { useState, useEffect } from 'react';
import { debounce } from '../../utils/helpers';
import './SearchInput.css';

const SearchInput = ({ 
  placeholder = 'Search...', 
  onSearch, 
  delay = 300,
  className = '' 
}) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    const debouncedSearch = debounce((searchValue) => {
      onSearch(searchValue);
    }, delay);

    debouncedSearch(value);
  }, [value, onSearch, delay]);

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className={`search-input ${className}`}>
      <span className="search-icon" aria-hidden="true">🔍</span>
      <input
        type="text"
        className="input search-field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Search"
      />
      {value && (
        <button
          className="search-clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchInput;
