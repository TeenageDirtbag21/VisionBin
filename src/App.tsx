import { useState, useEffect } from "react";
import Header from "./components/Header";
import UploadZone, { ImageItem } from "./components/UploadZone";
import ResultsPanel from "./components/ResultsPanel";
import CategoryGuide from "./components/CategoryGuide";
import SdgImpact from "./components/SdgImpact";
import { ClassifyResponse, MultiClassifyResponse } from "./types";
import { CATEGORIES } from "./data";
import { BookOpen, RefreshCw, BarChart3, ArrowRight, Award, Trash2, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type Tab = "dashboard" | "analyze" | "guide" | "impact" | "about";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [userApiKey, setUserApiKey] = useState("");

  // selected images list
  const [images, setImages] = useState<ImageItem[]>([]);

  // analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzeProgress, setAnalyzeProgress] = useState<{ current: number; total: number } | null>(null);
  
  // Single or batch result state
  const [classifyResult, setClassifyResult] = useState<ClassifyResponse | MultiClassifyResponse | null>(null);

  // Dynamic ambient background color state
  const [ambientColor, setAmbientColor] = useState<string>("rgba(16, 185, 129, 0.10)");

  // Local persistence statistics state
  const [totalAnalyses, setTotalAnalyses] = useState<number>(0);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  // Fetch localstorage configurations & statistics on mount
  useEffect(() => {
    // API key persistence (hidden UI but read in server calls if provided)
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setUserApiKey(savedKey);
    }

    // Total counts retrieve
    const totalRaw = localStorage.getItem("visionbin_total_analyses");
    if (totalRaw) {
      setTotalAnalyses(parseInt(totalRaw, 10) || 0);
    }

    // Category distribution counts retrieve
    const distRaw = localStorage.getItem("visionbin_category_counts");
    if (distRaw) {
      try {
        setCategoryCounts(JSON.parse(distRaw) || {});
      } catch {
        setCategoryCounts({});
      }
    }
  }, []);

  const handleImagesSelected = (newImages: ImageItem[]) => {
    setImages(newImages);
    setClassifyResult(null);
    setError(null);
  };

  const handleRemoveImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
    setClassifyResult(null);
    setError(null);
  };

  const handleClearAll = () => {
    setImages([]);
    setClassifyResult(null);
    setError(null);
    setAmbientColor("rgba(16, 185, 129, 0.10)");
  };

  const getCategoryColor = (categoryName: string) => {
    const catKey = CATEGORIES[categoryName] ? categoryName : "Non-Recyclable";
    return CATEGORIES[catKey]?.color || "#10b981";
  };

  // Perform classification API call
  const handleClassify = async () => {
    if (images.length === 0) return;

    setIsAnalyzing(true);
    setError(null);
    setClassifyResult(null);
    setAnalyzeProgress({ current: 1, total: images.length });

    try {
      const isBatch = images.length > 1;
      const apiEndpoint = isBatch ? "/api/classify-batch" : "/api/classify";

      const payload = isBatch
        ? {
            images: images.map((img) => ({
              imageBase64: img.base64,
              mimeType: img.mime,
            })),
            userApiKey: userApiKey.trim() || undefined,
          }
        : {
            imageBase64: images[0].base64,
            mimeType: images[0].mime,
            userApiKey: userApiKey.trim() || undefined,
          };

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze image with server.");
      }

      // Re-attach images previews locally for batch reports
      if (isBatch && "results" in data) {
        const batchData = data as MultiClassifyResponse;
        batchData.results = batchData.results.map((item, idx) => ({
          ...item,
          imageUrl: images[idx]?.url || "",
        }));
        setClassifyResult(batchData);

        // Update background color based on the first item in the batch
        const firstCat = batchData.results[0]?.category || "Non-Recyclable";
        const catColor = getCategoryColor(firstCat);
        setAmbientColor(`${catColor}1a`); // 10% opacity hex representation

        // Update stats
        const updatedCounts = { ...categoryCounts };
        Object.entries(batchData.summary).forEach(([catName, cnt]) => {
          updatedCounts[catName] = (updatedCounts[catName] || 0) + cnt;
        });
        setCategoryCounts(updatedCounts);
        localStorage.setItem("visionbin_category_counts", JSON.stringify(updatedCounts));

        const newTotal = totalAnalyses + batchData.totalItems;
        setTotalAnalyses(newTotal);
        localStorage.setItem("visionbin_total_analyses", newTotal.toString());

        // Increment session count
        setSessionCount((prev) => prev + batchData.totalItems);

        // Persistent categories seen list
        const activeCategories = Object.keys(updatedCounts).filter((k) => updatedCounts[k] > 0);
        localStorage.setItem("visionbin_categories_seen", JSON.stringify(activeCategories));

      } else {
        // Single result
        const singleData = data as ClassifyResponse;
        setClassifyResult(singleData);

        // Update background color
        const catColor = getCategoryColor(singleData.category);
        setAmbientColor(`${catColor}1a`);

        // Update stats
        const updatedCounts = { ...categoryCounts };
        const cat = singleData.category || "Non-Recyclable";
        updatedCounts[cat] = (updatedCounts[cat] || 0) + 1;
        setCategoryCounts(updatedCounts);
        localStorage.setItem("visionbin_category_counts", JSON.stringify(updatedCounts));

        const newTotal = totalAnalyses + 1;
        setTotalAnalyses(newTotal);
        localStorage.setItem("visionbin_total_analyses", newTotal.toString());

        // Increment session count
        setSessionCount((prev) => prev + 1);

        const activeCategories = Object.keys(updatedCounts).filter((k) => updatedCounts[k] > 0);
        localStorage.setItem("visionbin_categories_seen", JSON.stringify(activeCategories));
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
      setAnalyzeProgress(null);
    }
  };

  const handleResetClassify = () => {
    handleClearAll();
  };

  // Helper values for dashboard stats
  const uniqueCategoriesCount = Object.values(categoryCounts).filter((c: any) => (c as number) > 0).length;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-150 flex flex-col antialiased">
      <Header activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 lg:py-12 relative">
        {/* Ambient reactive transition background */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[440px] pointer-events-none overflow-hidden -z-10 opacity-70"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${ambientColor}, transparent 80%)`,
            transition: "background 0.8s ease-in-out"
          }}
        />

        <AnimatePresence mode="wait">
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8 fade-slide-up"
            >
              {/* Welcome Alert banner */}
              <div className="bg-[#111827] border border-emerald-950 rounded-2xl p-6 lg:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 card-hover">
                <div className="space-y-2 text-center md:text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5" />
                    Zero-Waste Initiative
                  </span>
                  <h2 className="syne-font text-white text-2xl lg:text-3xl font-extrabold tracking-tight">
                    Smart AI Household Waste Segregator
                  </h2>
                  <p className="text-body max-w-lg">
                    VisionBin automates domestic waste sorting using Advanced Multimodal Computer Vision to lower methane emissions in open dumps.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("analyze")}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-1 shrink-0 shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  <span>Start Categorizing</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>
              </div>

              {/* Stats Counters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Stat 1 */}
                <div className="bg-[#111827] border border-slate-850 p-5 rounded-xl relative overflow-hidden flex justify-between items-center group card-hover">
                  <div>
                    <span className="text-label block">
                      Processed Lifetime Items
                    </span>
                    <h3 className="text-3xl font-black font-mono text-white mt-1.5 leading-none">
                      {totalAnalyses}
                    </h3>
                  </div>
                  <span className="text-2xl opacity-80 bg-slate-900 border border-slate-800 p-2.5 rounded-lg select-none">
                    ♻️
                  </span>
                </div>

                {/* Stat 2 */}
                <div className="bg-[#111827] border border-slate-850 p-5 rounded-xl relative overflow-hidden flex justify-between items-center group card-hover">
                  <div>
                    <span className="text-label block">
                      Active Bin Types Spotted
                    </span>
                    <h3 className="text-3xl font-black font-mono text-emerald-400 mt-1.5 leading-none">
                      {uniqueCategoriesCount} <span className="text-xs text-slate-500">of 6</span>
                    </h3>
                  </div>
                  <span className="text-2xl opacity-80 bg-slate-900 border border-slate-800 p-2.5 rounded-lg select-none">
                    🗑️
                  </span>
                </div>

                {/* Stat 3 */}
                <div className="bg-[#111827] border border-slate-850 p-5 rounded-xl relative overflow-hidden flex justify-between items-center group card-hover">
                  <div>
                    <span className="text-label block">
                      This Active Tab Session
                    </span>
                    <h3 className="text-3xl font-black font-mono text-blue-400 mt-1.5 leading-none">
                      {sessionCount}
                    </h3>
                  </div>
                  <span className="text-2xl opacity-80 bg-slate-900 border border-slate-800 p-2.5 rounded-lg select-none">
                    ⚡
                  </span>
                </div>
              </div>

              {/* SDG Pillars Card Block */}
              <SdgImpact />
            </motion.div>
          )}

          {/* TAB 2: ANALYZE WASTE */}
          {activeTab === "analyze" && (
            <motion.div
              key="analyze-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 fade-slide-up"
            >
              {/* Compact hero row */}
              <div className="text-center space-y-2">
                <h2 className="syne-font text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                  Analyze Household Waste
                </h2>
                <p className="text-body max-w-lg mx-auto">
                  Supply single or cumulative batch photos to analyze composition percentage and segregation bins immediately.
                </p>
              </div>

              {/* Upload element */}
              <UploadZone
                images={images}
                onImagesSelected={handleImagesSelected}
                onRemoveImage={handleRemoveImage}
                onClearAll={handleClearAll}
                onClassify={handleClassify}
                isAnalyzing={isAnalyzing}
                error={error}
                setError={setError}
                analyzeProgress={analyzeProgress}
              />

              {/* Results panel */}
              {classifyResult && (
                <ResultsPanel
                  result={classifyResult}
                  onReset={handleResetClassify}
                />
              )}
            </motion.div>
          )}

          {/* TAB 3: GUIDE */}
          {activeTab === "guide" && (
            <motion.div
              key="guide-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="fade-slide-up"
            >
              <CategoryGuide />
            </motion.div>
          )}

          {/* TAB 4: IMPACT TRACKER */}
          {activeTab === "impact" && (
            <motion.div
              key="impact-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 fade-slide-up"
            >
              <div className="text-center space-y-2">
                <h2 className="syne-font text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                  Environmental Impact Tracker
                </h2>
                <p className="text-body max-w-lg mx-auto mt-2">
                  See how active household segregation directly diverts mass from general garbage landfills to useful circular streams.
                </p>
              </div>

              {/* Statistics bar chart */}
              <div className="bg-[#111827] border border-slate-800 p-6 lg:p-8 rounded-2xl space-y-6 shadow-2xl card-hover">
                <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-xl border border-slate-850">
                  <span className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    Total Hand-Segregated Items
                  </span>
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    {totalAnalyses}
                  </span>
                </div>

                {totalAnalyses === 0 ? (
                  <div className="text-center p-8 border border-dashed border-slate-800 rounded-xl space-y-3">
                    <span className="text-3xl" role="img" aria-label="Inbox">🔍</span>
                    <h4 className="text-slate-300 font-bold font-syne text-sm">No Classifications Scanned Yet</h4>
                    <p className="text-body max-w-sm mx-auto pb-2">
                      Register scans on the "Analyze Waste" tab using your smartphone camera or file attachments to generate real metric reports!
                    </p>
                    <button
                      onClick={() => setActiveTab("analyze")}
                      className="px-4 py-2 mt-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs tracking-wider transition-colors cursor-pointer"
                    >
                      Go to Analyze Tab
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-label mb-2">
                      Materials Distribution Metrics
                    </h4>

                    <div className="space-y-4">
                      {Object.values(CATEGORIES).map((cat) => {
                        const count = categoryCounts[cat.name] || 0;
                        const percentage = totalAnalyses > 0 ? (count / totalAnalyses) * 100 : 0;

                        return (
                          <div key={cat.name} className="space-y-1.5 animate-grow">
                            <div className="flex justify-between text-sm font-medium">
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <span className="select-none">{cat.emoji}</span>
                                <span>{cat.name}</span>
                              </span>
                              <span className="text-slate-400 font-mono text-sm">
                                {count} item{count !== 1 ? "s" : ""} ({Math.round(percentage)}%)
                              </span>
                            </div>
                            {/* Proportional bar */}
                            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850">
                              <div
                                className="h-full rounded-full transition-all duration-800"
                                style={{
                                  backgroundColor: cat.color,
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Informative advice section */}
              <div className="p-5 bg-slate-900/30 border border-slate-850 rounded-xl space-y-2 max-w-3xl mx-auto card-hover">
                <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Leaf className="w-1.5 h-1.5 text-emerald-400 text-xs shrink-0" />
                  Why Every Item Segregated Counts:
                </h5>
                <p className="text-body">
                  In Indian municipalities, mixed waste is dumped into municipal landfills, forming highly toxic chemical leachate cocktails. Sorting organic materials into Green bins allows conversion to high-nutrient farm compost, reducing the reliance on chemical fertilizers while recycling paper/plastic saves millions of liters of pristine groundwater.
                </p>
              </div>

              <SdgImpact />
            </motion.div>
          )}

          {/* TAB 5: ABOUT */}
          {activeTab === "about" && (
            <motion.div
              key="about-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8 fade-slide-up"
            >
              <div className="text-center space-y-2">
                <h2 className="syne-font text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                  VisionBin Project Presentation
                </h2>
                <p className="text-body max-w-lg mx-auto mt-2">
                  CBSE Class 12 AI Capstone Presentation objectives.
                </p>
              </div>

              {/* Capstone detail card */}
              <div className="bg-[#111827] border border-slate-850 rounded-2xl p-6 lg:p-8 space-y-6 card-hover">
                <div className="flex items-center gap-2.5 border-b border-slate-850 pb-5">
                  <BookOpen className="w-6 h-6 text-emerald-500" />
                  <h3 className="syne-font text-xl font-bold text-white tracking-wide">
                    Interactive System Documentation
                  </h3>
                </div>

                <p className="text-body">
                  VisionBin demonstrates structured deployment of Generative AI (multimodal vision processing) on community-level waste streams. By classifying domestic materials sequentially or in batch lists, the system ensures local residents segregate waste accurately at source. This protects municipal sanitation workers and encourages creative circular upcycling.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold px-2.5 py-1 rounded bg-slate-900 text-slate-350 border border-slate-800">
                    React 19 & Vite
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold px-2.5 py-1 rounded bg-slate-900 text-emerald-400 border border-slate-800">
                    Gemini 3.5 Flash Model
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold px-2.5 py-1 rounded bg-slate-900 text-slate-350 border border-slate-800">
                    Tailwind CSS
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold px-2.5 py-1 rounded bg-slate-900 text-blue-400 border border-slate-800">
                    UN SDG Goal 11 & 12
                  </span>
                </div>
              </div>

              {/* Project Working Group / Team section */}
              <div className="bg-[#111827] border border-slate-850 rounded-2xl p-6 lg:p-8 space-y-6 card-hover animate-fade-in">
                <div className="flex items-center gap-2.5 border-b border-slate-850 pb-5">
                  <Award className="w-6 h-6 text-emerald-500" />
                  <h3 className="syne-font text-xl font-bold text-white tracking-wide">
                    Project Working Group
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { initials: "AR", name: "Aditya Rawat" },
                    { initials: "KS", name: "Kartik Saini" },
                    { initials: "HS", name: "Harsh Singh" },
                  ].map((member, mIdx) => (
                    <div key={mIdx} className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center gap-3 card-hover">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center font-mono select-none text-sm shrink-0">
                        {member.initials}
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-sm leading-tight">{member.name}</h5>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-body text-center pt-3 border-t border-slate-850/60 font-medium italic">
                  We extend our heartfelt gratitude to the CBSE Class XII Examination Board for evaluating this dynamic environmental engineering capstone project.
                </p>
              </div>

              {/* 3 Steps visual layout */}
              <div className="space-y-3.5">
                <h4 className="syne-font text-white font-extrabold text-base text-center">
                  How The System Integrates
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-xl border border-slate-850 bg-slate-900/30 text-center space-y-2 card-hover">
                    <span className="text-2xl" role="img" aria-label="Camera">📸</span>
                    <h5 className="syne-font font-bold text-white text-sm">1. Capture</h5>
                    <p className="text-body text-[11px]">
                      Snapshot waste with smartphone or append files array.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-slate-850 bg-slate-900/30 text-center space-y-2 card-hover">
                    <span className="text-2xl" role="img" aria-label="Brain">🤖</span>
                    <h5 className="syne-font font-bold text-white text-sm">2. AI Diagnosis</h5>
                    <p className="text-body text-[11px]">
                      Gemini parses exact composite items and risk profiles.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-slate-850 bg-slate-900/30 text-center space-y-2 card-hover">
                    <span className="text-2xl" role="img" aria-label="Seed">♻️</span>
                    <h5 className="syne-font font-bold text-white text-sm">3. Segment & Reuse</h5>
                    <p className="text-body text-[11px]">
                      Follow disposal guide and active upcycle suggestions.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center bg-[#070b16] space-y-2">
        <p className="text-slate-500 text-xs px-4">Developed in alignment with CBSE Class 12 AI Integration and Environmental Education directives.</p>
        <p className="font-mono text-[10px] text-slate-600 px-4">
          VisionBin &copy; 2026 | Promoting Dynamic Municipal Segregation and Sustainable Resource Conservation
        </p>
      </footer>
    </div>
  );
}
