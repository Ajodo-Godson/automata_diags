import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './CollapsibleSection.css';

export function CollapsibleSection({ title, children, defaultOpen = true }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="collapsible-section">
            <button 
                className="collapsible-header"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="collapsible-title">{title}</h3>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {isOpen && (
                <div className="collapsible-content">
                    {children}
                </div>
            )}
        </div>
    );
}

