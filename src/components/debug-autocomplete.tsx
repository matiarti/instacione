'use client';

import { useState } from 'react';
import { Autocomplete } from './ui/autocomplete';

export default function DebugAutocomplete() {
  const [selectedValue, setSelectedValue] = useState('');

  const options = [
    { value: 'volkswagen', label: 'Volkswagen' },
    { value: 'ford', label: 'Ford' },
    { value: 'chevrolet', label: 'Chevrolet' },
    { value: 'honda', label: 'Honda' },
    { value: 'toyota', label: 'Toyota' },
  ];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Debug Autocomplete</h2>
      <div className="space-y-2">
        <label className="text-sm font-medium">Selected Value: {selectedValue}</label>
        <Autocomplete
          options={options}
          value={selectedValue}
          onValueChange={(value) => {
            console.log('Value changed:', value);
            setSelectedValue(value);
          }}
          placeholder="Select a brand..."
          emptyMessage="No brands found."
        />
      </div>
    </div>
  );
}
