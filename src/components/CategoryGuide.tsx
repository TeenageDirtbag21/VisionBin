import { useState } from "react";
import { CATEGORIES } from "../data";
import { ChevronDown, ChevronUp, Compass, Info, AlertTriangle, Leaf, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function CategoryGuide() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (name: string) => {
    if (expandedCategory === name) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(name);
    }
  };

  return (
    <section className="w-full mt-1 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="syne-font text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
          Waste Categories Guide
        </h2>
        <p className="text-body mt-2 max-w-lg mx-auto">
          Explore strict municipal separation parameters, educational examples, structural recycling hurdles, and circular reduction steps below.
        </p>
      </div>

      {/* Flat Accordion Column List instead of shifting Grid */}
      <div className="flex flex-col gap-3 max-w-3xl mx-auto">
        {Object.values(CATEGORIES).map((cat) => {
          const isExpanded = expandedCategory === cat.name;

          return (
            <div
              key={cat.name}
              onClick={() => toggleCategory(cat.name)}
              className={`bg-[#111827] border border-slate-850 rounded-xl p-5 cursor-pointer transition-all ${cat.hoverBorder} ${
                isExpanded ? "ring-1 ring-slate-700 bg-slate-900/60" : "hover:bg-slate-900/20"
              }`}
              style={{
                borderLeftWidth: "4px", 
                borderLeftColor: cat.color,
                background: isExpanded ? `linear-gradient(to right, ${cat.color}08, transparent)` : ""
              }}
            >
              {/* Row Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none" role="img" aria-label={cat.name}>
                    {cat.emoji}
                  </span>
                  <div>
                    <h4 className="syne-font font-bold text-white text-[15px] flex items-center gap-1.5">
                      <span>{cat.name}</span>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    </h4>
                    {!isExpanded && (
                      <p className="text-caption mt-0.5">
                        Click to explore disposal steps, stats, and challenges
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 hover:text-slate-400" />
                  )}
                </div>
              </div>

              {/* Collapsed view definition summary */}
              {!isExpanded && (
                <p className="text-body mt-2 line-clamp-1 border-t border-slate-800/40 pt-2">
                  {cat.definition}
                </p>
              )}

              {/* Slide-open expanded block using height motion */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden mt-4 pt-4 border-t border-slate-800/80 space-y-4"
                    onClick={(e) => e.stopPropagation()} // halt bubbling toggle on clicks inside
                  >
                    {/* Definition */}
                    <div>
                      <h5 className="text-label flex items-center gap-1.5 mb-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                        Definition & Parameters
                      </h5>
                      <p className="text-body font-medium">
                        {cat.definition}
                      </p>
                    </div>

                    {/* Examples */}
                    <div>
                      <h5 className="text-label flex items-center gap-1.5 mb-2">
                        <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                        Common Household Examples
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.examples.map((ex, exIdx) => (
                          <span
                            key={exIdx}
                            className="text-xs font-semibold px-3 py-1.5 rounded bg-slate-950 text-slate-300 border border-slate-850"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Disposal protocol list */}
                    <div>
                      <h5 className="text-label flex items-center gap-1.5 mb-2">
                        <Compass className="w-3.5 h-3.5 text-emerald-400" />
                        Strict Handling Protocol
                      </h5>
                      <ol className="space-y-1.5">
                        {cat.disposalSteps.map((step, sIdx) => (
                          <li key={sIdx} className="text-sm text-slate-300 flex items-start gap-1.5">
                            <span className="font-mono font-bold text-[10px] text-slate-400 bg-slate-950 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border border-slate-850 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span className="pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Environmental impact split cols */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      {/* Left: Global Impact */}
                      <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-lg">
                        <h5 className="text-label flex items-center gap-1.5 mb-1.5">
                          🌍 Environmental Threat
                        </h5>
                        <p className="text-body">
                          {cat.environmentalImpact}
                        </p>
                      </div>

                      {/* Right: Recycling core problems */}
                      <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-lg">
                        <h5 className="text-label flex items-center gap-1.5 mb-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          Segregation Challenge
                        </h5>
                        <p className="text-body">
                          {cat.recyclingChallenges}
                        </p>
                      </div>
                    </div>

                    {/* Reduction tip checklist */}
                    <div className="pt-2">
                      <h5 className="text-label flex items-center gap-1.5 mb-2">
                        🌱 High-Circularity Reduction Tips
                      </h5>
                      <ul className="space-y-1.5">
                        {cat.reductionTips.map((tip, tIdx) => (
                          <li key={tIdx} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-400 select-none font-bold">✓</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
