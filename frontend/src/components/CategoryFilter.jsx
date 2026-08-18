import React, { useState } from 'react';
import { 
  Sparkles, 
  Building2, 
  Palmtree, 
  Flame, 
  Trees, 
  Castle, 
  Sun, 
  Mountain 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'apartments', label: 'Apartments', icon: Building2 },
  { id: 'beachfront', label: 'Beachfront', icon: Palmtree },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'cabins', label: 'Cabins', icon: Trees },
  { id: 'mansions', label: 'Mansions', icon: Castle },
  { id: 'tropical', label: 'Tropical', icon: Sun },
  { id: 'views', label: 'Views', icon: Mountain },
];

function CategoryFilter({ activeCategory, onSelectCategory }) {
  const [selected, setSelected] = useState(activeCategory || 'All');

  const handleSelect = (label) => {
    setSelected(label);
    if (onSelectCategory) {
      onSelectCategory(label);
    }
  };

  const currentSelection = activeCategory !== undefined ? activeCategory : selected;

  return (
    <div className="flex items-center space-x-8 overflow-x-auto pb-4 pt-2 border-b border-gray-100 mb-8 scrollbar-none">
      {CATEGORIES.map(({ id, label, icon: Icon }) => {
        const isActive = currentSelection.toLowerCase() === label.toLowerCase();

        return (
          <button
            key={id}
            type="button"
            onClick={() => handleSelect(label)}
            className={`flex flex-col items-center space-y-2 pb-2 transition border-b-2 whitespace-nowrap cursor-pointer ${
              isActive
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'text-black' : 'text-gray-500'}`} />
            <span className="text-xs">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default CategoryFilter;