import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const Accordion = ({ items, defaultOpenIndex = null }) => {
  const [openIndex, setOpenIndex] = useState(defaultOpenIndex);

  return (
    <div className="divide-y divide-stone-200 border-t border-b border-stone-200">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.title}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between py-5 text-left group outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
              aria-expanded={isOpen}
            >
              <span className="text-[11px] font-black uppercase tracking-widest text-stone-900 group-hover:text-stone-500 transition-colors">
                {item.title}
              </span>
              <ChevronDown
                size={14}
                strokeWidth={2}
                className={`shrink-0 text-stone-400 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              style={{
                display: "grid",
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition:
                  "grid-template-rows 0.32s cubic-bezier(0.25,0.1,0.25,1)",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <div className="pb-5 text-[11px] text-stone-500 font-medium leading-relaxed">
                  {item.body}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};