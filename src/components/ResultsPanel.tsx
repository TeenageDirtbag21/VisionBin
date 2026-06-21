import { useState, useEffect } from "react";
import { ClassifyResponse, MultiClassifyResponse } from "../types";
import { CATEGORIES } from "../data";
import { Copy, Share2, RefreshCw, Check, Compass, Lightbulb, Hammer, ShieldAlert, Leaf, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface ResultsPanelProps {
  result: ClassifyResponse | MultiClassifyResponse;
  onReset: () => void;
}

export default function ResultsPanel({ result, onReset }: ResultsPanelProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [activeFact, setActiveFact] = useState<string>("");

  // Check if result is multiple batch
  const isBatch = "results" in result;

  // For Single Image Fact pick (Run once on mount or when result changes)
  useEffect(() => {
    if (!isBatch) {
      const singleRes = result as ClassifyResponse;
      const categoryKey = CATEGORIES[singleRes.category] ? singleRes.category : "Non-Recyclable";
      const facts = CATEGORIES[categoryKey]?.facts || ["Always segregate waste at the household level."];
      const randomIdx = Math.floor(Math.random() * facts.length);
      setActiveFact(facts[randomIdx]);
    }
  }, [result, isBatch]);

  const handleCopy = () => {
    let textToCopy = "";

    if (isBatch) {
      const batchRes = result as MultiClassifyResponse;
      textToCopy = `[VisionBin — Batch Waste Report]\n`;
      textToCopy += `Total Items Classified: ${batchRes.totalItems}\n`;
      textToCopy += `Category Counts: ${JSON.stringify(batchRes.summary)}\n\n`;
      batchRes.results.forEach((item, i) => {
        textToCopy += `--- Item #${i + 1} ---\n`;
        textToCopy += `Category: ${item.category}\n`;
        textToCopy += `Materials Identified: ${item.detected_items.join(", ")}\n`;
        textToCopy += `Sustainability Score: ${item.sustainability_score}/100\n`;
        textToCopy += `Local Tip: ${item.local_disposal_note}\n\n`;
      });
    } else {
      const singleRes = result as ClassifyResponse;
      const categoryKey = CATEGORIES[singleRes.category] ? singleRes.category : "Non-Recyclable";
      const cat = CATEGORIES[categoryKey];
      textToCopy = `[VisionBin — Waste Segregated]\n`;
      textToCopy += `Category: ${singleRes.category} (${cat.emoji})\n`;
      textToCopy += `Confidence: ${Math.round(singleRes.confidence * 100)}%\n`;
      textToCopy += `Detected Items: ${singleRes.detected_items.join(", ")}\n`;
      textToCopy += `Recyclability potential: ${singleRes.recyclability}\n`;
      textToCopy += `Decomposition rate: ${singleRes.decomposition_time}\n`;
      textToCopy += `Sustainability Core-Score: ${singleRes.sustainability_score}/100\n`;
      textToCopy += `Disposal Protocol: ${cat.disposal}\n`;
      textToCopy += `Educational Detail: ${singleRes.reasoning}\n`;
      textToCopy += `India Local Disposal: ${singleRes.local_disposal_note}`;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = async () => {
    const textDesc = isBatch
      ? `I ran a batch scan of ${(result as MultiClassifyResponse).totalItems} waste items with VisionBin!`
      : `I categorized ${(result as ClassifyResponse).category} waste with VisionBin!`;

    const shareData = {
      title: "VisionBin AI Waste Diagnostic",
      text: `${textDesc} Aligning waste segregation with SDG goals 11 & 12.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    } catch {
      // User cancelled
    }
  };

  // RENDER BATCH REPORT
  if (isBatch) {
    const batchRes = result as MultiClassifyResponse;

    return (
      <motion.section
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mt-8 space-y-6 animate-fade-in"
      >
        <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="syne-font text-white text-xl lg:text-2xl font-extrabold tracking-tight">
                Batch Diagnostic Report
              </h3>
              <p className="text-caption mt-1">
                Processed total of {batchRes.totalItems} image{batchRes.totalItems > 1 ? "s" : ""} sequentially
              </p>
            </div>
            <span className="text-2xl bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
              📊
            </span>
          </div>

          <div className="p-6 lg:p-8 space-y-6">
            {/* Category summary counters */}
            <div>
              <h4 className="text-label mb-3.5">
                Constituent Categories Breakdown
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.keys(CATEGORIES).map((catName) => {
                  const count = batchRes.summary[catName] || 0;
                  const cat = CATEGORIES[catName];
                  return (
                    <div
                      key={catName}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                        count > 0 ? "bg-slate-900 border-slate-700/80" : "border-slate-850/45 opacity-40 bg-slate-900/30"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xl select-none">{cat.emoji}</span>
                        <span className="text-caption font-bold text-slate-400">{cat.name}</span>
                      </div>
                      <div className="mt-2 flex justify-between items-end">
                        <span className="text-lg font-black font-mono text-white">
                          {count}
                        </span>
                        {count > 0 && (
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List of individual classified items */}
            <div className="space-y-4">
              <h4 className="text-label mb-2">
                Detailed Classification Breakdown
              </h4>
              <div className="space-y-3">
                {batchRes.results.map((item, idx) => {
                  const catKey = CATEGORIES[item.category] ? item.category : "Non-Recyclable";
                  const cat = CATEGORIES[catKey];
                  const conf = Math.round(item.confidence * 100);

                  return (
                    <div key={idx} className="bg-slate-900/30 border border-slate-850 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Left info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black font-mono bg-slate-950 px-2 py-1 border border-slate-850 rounded text-slate-500 h-max">
                            #{idx + 1}
                          </span>
                          <span
                            className="text-xs font-extrabold px-3 py-1 rounded-full border flex items-center gap-1 shrink-0"
                            style={{ backgroundColor: `${cat.color}10`, borderColor: `${cat.color}30`, color: cat.color }}
                          >
                            <span>{cat.emoji}</span>
                            <span>{item.category}</span>
                          </span>
                          <span className="text-caption font-mono">
                            ({conf}% Confidence)
                          </span>
                        </div>

                        {/* Items listed */}
                        <div className="flex flex-wrap gap-1.5">
                          {item.detected_items.map((sub, sidx) => (
                            <span key={sidx} className="bg-slate-900 border border-slate-800 text-xs px-2.5 py-1 rounded text-slate-300">
                              {sub}
                            </span>
                          ))}
                        </div>

                        <p className="text-sm text-slate-400 italic">
                          &ldquo;{item.reasoning}&rdquo;
                        </p>

                        <div className="text-sm text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-850/80">
                          <strong className="text-label text-emerald-400 block mb-1">Disposal protocol:</strong>
                          {cat.disposal}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-850">
              <button
                onClick={onReset}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-100 hover:border-slate-500 border border-slate-700 font-semibold py-3.5 px-4 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer text-sm"
              >
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                Classify Another Batch
              </button>

              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold py-3.5 px-4 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer text-sm"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-emerald-500" />}
                <span>{copied ? "Copied Report!" : "Copy Report"}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold py-3.5 px-4 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer text-sm relative"
              >
                <Share2 className="w-4 h-4 text-emerald-500" />
                <span>Share Summary</span>
                {shared && (
                  <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-950 border border-slate-800 text-xs text-slate-200 px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                    App link copied to clipboard!
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  // RENDER SINGLE IMAGE RESULT
  const single = result as ClassifyResponse;
  const categoryKey = CATEGORIES[single.category] ? single.category : "Non-Recyclable";
  const cat = CATEGORIES[categoryKey];
  const confPerc = Math.round(single.confidence * 100);

  // Determine recyclability color
  const recColors = {
    High: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    Medium: "text-blue-400 bg-blue-500/10 border-blue-500/25",
    Low: "text-amber-400 bg-amber-500/10 border-amber-500/25",
    "Not Recyclable": "text-red-400 bg-red-500/10 border-red-500/25",
  };
  const recClass = recColors[single.recyclability] || recColors["Not Recyclable"];

  // Determine environmental risk color
  const riskColors = {
    Low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    Medium: "text-blue-400 bg-blue-500/10 border-blue-500/25",
    High: "text-amber-400 bg-amber-500/10 border-amber-500/25",
    Critical: "text-red-400 bg-red-500/10 border-red-500/25",
  };
  const riskClass = riskColors[single.environmental_risk] || riskColors["Critical"];

  // Sustainability score gauge color
  let scoreColor = "#ef4444"; // Red
  if (single.sustainability_score >= 70) scoreColor = "#10b981"; // Emerald
  else if (single.sustainability_score >= 40) scoreColor = "#f59e0b"; // Amber

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 25 }}
      className="w-full mt-8 animate-fade-in"
    >
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Banner styled with category color */}
        <div
          className="p-8 flex items-center gap-5 text-white transition-colors duration-500"
          style={{ backgroundColor: cat.color }}
        >
          <span className="text-5xl select-none" role="img" aria-label={single.category}>
            {cat.emoji}
          </span>
          <div>
            <h3 className="syne-font text-2xl lg:text-3xl font-extrabold tracking-tight">
              {single.category}
            </h3>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded bg-black/25 text-white/90 border border-white/15">
              AI Classification Result
            </span>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-6">
          {/* Confidence and sustainability gauge layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Confidence scale card */}
            <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl relative flex flex-col justify-between">
              <div>
                <span className="text-label mb-1 block">
                  AI Confidence rating
                </span>
                <p className="text-caption mt-1">
                  Confidence that classification matches the waste material parameters
                </p>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="text-3xl font-black font-mono" style={{ color: cat.color }}>
                  {confPerc}%
                </div>
                <div className="flex-1">
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: cat.color,
                        width: `${confPerc}%`,
                        transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sustainability circular score gauge */}
            <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex-1 pr-3">
                <span className="text-label mb-1 block">
                  Sustainability Score
                </span>
                <p className="text-caption mt-1">
                  Score evaluates overall recyclability and environmental friendliness of the materials.
                </p>
              </div>
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="26" className="stroke-slate-800" strokeWidth="5" fill="transparent" />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    className="transition-all duration-800 ease-out"
                    strokeWidth="5"
                    fill="transparent"
                    stroke={scoreColor}
                    strokeDasharray={163.4}
                    strokeDashoffset={163.4 - (163.4 * (single.sustainability_score || 0)) / 100}
                  />
                </svg>
                <span className="absolute text-sm font-extrabold font-mono text-slate-200">
                  {single.sustainability_score}
                </span>
              </div>
            </div>
          </div>

          {/* Identified Materials */}
          {single.detected_items?.length > 0 && (
            <div>
              <h4 className="text-label mb-2.5">
                Detected Materials & Items
              </h4>
              <div className="flex flex-wrap gap-2">
                {single.detected_items.map((item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                    style={{
                      backgroundColor: `${cat.color}10`,
                      borderColor: `${cat.color}30`,
                      color: cat.color,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Reasoning diagnostic sentence */}
          <div className="p-4 bg-slate-900/20 border-l-2 border-slate-750/70 rounded-r-xl">
            <p className="text-slate-300 italic text-[13px] leading-relaxed">
              &ldquo;{single.reasoning}&rdquo;
            </p>
          </div>

          {/* Segmented Material Composition Proportional Bar */}
          {single.composition?.length > 0 && (
            <div className="bg-slate-900/25 p-4 rounded-xl border border-slate-850 space-y-3.5">
              <h4 className="text-label mb-2">
                Estimated Material Composition
              </h4>
              
              {/* Segmented Bar */}
              <div className="w-full bg-slate-950 h-5 rounded-lg overflow-hidden flex items-stretch border border-slate-850">
                {single.composition.map((comp, idx) => {
                  const colors = [cat.color, "#6366f1", "#f59e0b", "#3b82f6", "#ef4444", "#94a3b8"];
                  const selectedColor = colors[idx % colors.length];
                  return (
                    <div
                      key={idx}
                      title={`${comp.name}: ${comp.percentage}%`}
                      className="h-full first:rounded-l-lg last:rounded-r-lg"
                      style={{
                        backgroundColor: selectedColor,
                        width: `${comp.percentage}%`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Composition legend */}
              <div className="flex flex-wrap gap-3 pt-1">
                {single.composition.map((comp, idx) => {
                  const colors = [cat.color, "#6366f1", "#f59e0b", "#3b82f6", "#ef4444", "#94a3b8"];
                  const selectedColor = colors[idx % colors.length];
                  return (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-355 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedColor }} />
                      <span>{comp.name}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">({comp.percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3-Card Impact Metric with card-hover class */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Recyclability badge */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between card-hover ${recClass}`}>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-85">
                <Leaf className="w-3.5 h-3.5" />
                Recyclability
              </div>
              <span className="text-base font-extrabold mt-2.5">{single.recyclability}</span>
            </div>

            {/* Decomposition Rate */}
            <div className="p-4 rounded-xl border border-slate-850 bg-slate-900/30 flex flex-col justify-between text-slate-300 card-hover">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-405">
                <Compass className="w-3.5 h-3.5" />
                Decomposition Time
              </div>
              <span className="text-base font-extrabold tracking-tight mt-2.5 text-slate-100 font-mono">
                {single.decomposition_time}
              </span>
            </div>

            {/* Environmental safety risk */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between card-hover ${riskClass}`}>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-85">
                <ShieldAlert className="w-3.5 h-3.5" />
                Environmental Risk
              </div>
              <span className="text-base font-extrabold mt-2.5">{single.environmental_risk}</span>
            </div>
          </div>

          {/* Disposal action plan & India Local Note */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Disposal checklist instructions mapped literally */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/20">
              <h4 className="syne-font font-bold text-white text-[15px] flex items-center gap-1.5 mb-3">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                Disposal Action Plan
              </h4>
              <ol className="space-y-2.5">
                {cat.disposalSteps.map((step, sIdx) => (
                  <li key={sIdx} className="text-sm text-slate-300 flex items-start gap-2 leading-relaxed">
                    <span className="font-bold text-emerald-400 font-mono shrink-0 select-none bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10.5px]">
                      {sIdx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* India-Specific Tip */}
            {single.local_disposal_note && (
              <div className="p-5 rounded-xl border-l-4 border-amber-500 bg-amber-500/5 flex flex-col justify-between">
                <div>
                  <h4 className="syne-font font-bold text-amber-300 text-[15px] flex items-center gap-1.5 mb-2.5">
                    <Compass className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                    🇮🇳 Local Indian Municipal Tip
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    {single.local_disposal_note}
                  </p>
                </div>
                <div className="mt-4 pt-3.5 border-t border-amber-500/10 text-[10px] text-slate-500 font-medium">
                  Matches Swachh Bharat urban segregation standards.
                </div>
              </div>
            )}
          </div>

          {/* Circular Reuse Ideas with card-hover class */}
          {single.reuse_ideas?.length > 0 && (
            <div className="p-5 bg-slate-900/15 border border-slate-850 rounded-xl space-y-3.5">
              <h4 className="syne-font text-white font-extrabold text-[14px] flex items-center gap-1.5">
                <Hammer className="w-4.5 h-4.5 text-emerald-400" />
                Before Throwing Away — Circular Reuse Ideas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {single.reuse_ideas.slice(0, 3).map((idea, idIndex) => (
                  <div key={idIndex} className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-lg flex items-start gap-2 transition-colors hover:border-slate-700 card-hover">
                    <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 p-1.5 rounded-md block shrink-0">
                      💡
                    </span>
                    <span className="text-sm text-slate-300 leading-normal">{idea}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trivia card with dynamic facts */}
          {activeFact && (
            <div className="p-5 bg-[#111827] border border-dashed border-emerald-500/25 rounded-xl">
              <h4 className="syne-font font-bold text-white text-[15px] flex items-center gap-2 mb-2">
                <Lightbulb className="w-4.5 h-4.5 text-emerald-400" />
                Did You Know?
              </h4>
              <p className="text-body">
                {activeFact}
              </p>
            </div>
          )}

          {/* Action buttons with quick reset options */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={onReset}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-100 hover:border-slate-500 border border-slate-700 font-semibold py-3.5 px-4 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer text-sm"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin-hover" />
              Classify Another
            </button>

            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold py-3.5 px-4 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer text-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-emerald-500" />
                  <span>Copy Result</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold py-3.5 px-4 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer text-sm relative"
            >
              <Share2 className="w-4 h-4 text-emerald-500" />
              <span>Share Diagnostic</span>
              {shared && (
                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl z-20">
                  Shared URL is copied to clipboard!
                  </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
