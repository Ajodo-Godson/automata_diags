import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './CollapsibleSection.css';

export function CollapsibleSection({ title, children, defaultOpen = true, action }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const contentId = useId();

    return (
        <section className="collapsible-section">
            <button
                type="button"
                className="collapsible-header"
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => setIsOpen((open) => !open)}
            >
                <span className="collapsible-title">{title}</span>
                {/* One chevron that rotates, rather than swapping two icons. */}
                <ChevronDown size={16} className="collapsible-chevron" aria-hidden="true" />
            </button>
            {isOpen && (
                <div className="collapsible-content" id={contentId}>
                    {action}
                    {children}
                </div>
            )}
        </section>
    );
}
