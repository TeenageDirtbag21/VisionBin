import { useRef, useState, useEffect, DragEvent, ChangeEvent } from "react";
import { Upload, FileImage, Camera, X, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface ImageItem {
  id: string;
  url: string;
  base64: string;
  mime: string;
}

interface UploadZoneProps {
  images: ImageItem[];
  onImagesSelected: (newImages: ImageItem[]) => void;
  onRemoveImage: (id: string) => void;
  onClearAll: () => void;
  onClassify: () => void;
  isAnalyzing: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  analyzeProgress?: { current: number; total: number } | null;
}

export default function UploadZone({
  images,
  onImagesSelected,
  onRemoveImage,
  onClearAll,
  onClassify,
  isAnalyzing,
  error,
  setError,
  analyzeProgress,
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Camera & Simulator states
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [selectedSimType, setSelectedSimType] = useState<"peel" | "bottle" | "battery" | "box" | "can" | "glass">("peel");
  const [simImageUrl, setSimImageUrl] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Canvas Generator for Simulated Scanner Feed
  const generateSimulationImage = (type: string): { url: string; base64: string } => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { url: "", base64: "" };

    // Draw background gradient
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    if (type === "peel") {
      grad.addColorStop(0, "#1e3a1e"); // Organic
      grad.addColorStop(1, "#061a06");
    } else if (type === "battery") {
      grad.addColorStop(0, "#451a03"); // Hazardous orange-brown
      grad.addColorStop(1, "#1c0b02");
    } else if (type === "bottle") {
      grad.addColorStop(0, "#1e293b"); // Recyclable Plastic
      grad.addColorStop(1, "#0f172a");
    } else if (type === "box") {
      grad.addColorStop(0, "#3f2f1f"); // Cardboard
      grad.addColorStop(1, "#1e150d");
    } else if (type === "can") {
      grad.addColorStop(0, "#1e1b4b"); // Metal
      grad.addColorStop(1, "#0f0e26");
    } else {
      grad.addColorStop(0, "#27272a"); // Non-recyclable Glass/Trash
      grad.addColorStop(1, "#09090b");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    // Draw simulation grid/reticle
    ctx.strokeStyle = "rgba(16, 185, 129, 0.12)";
    ctx.lineWidth = 1;
    for (let i = 40; i < 640; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 485);
      ctx.stroke();
    }
    for (let j = 40; j < 480; j += 40) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(640, j);
      ctx.stroke();
    }

    // Draw reticle circle
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(320, 240, 110, 0, Math.PI * 2);
    ctx.stroke();

    // Draw item illustration text overlay
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";

    if (type === "peel") {
      ctx.fillStyle = "#fbbf24";
      ctx.fillText("🍌 COMPOSITE ORGANIC BANANA PEEL", 320, 220);
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("[BIODEGRADABLE WASTE - GREEN BIN]", 320, 260);
    } else if (type === "bottle") {
      ctx.fillStyle = "#38bdf8";
      ctx.fillText("🧪 DEPOSITED PET DRINK BOTTLE", 320, 220);
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("[RECYCLABLE PLASTIC - BLUE BIN]", 320, 260);
    } else if (type === "battery") {
      ctx.fillStyle = "#f97316";
      ctx.fillText("🔋 DISCARDED DRY CELL ALKALINE BATTERY", 320, 220);
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("[HAZARDOUS E-WASTE - BLACK BIN]", 320, 260);
    } else if (type === "box") {
      ctx.fillStyle = "#f59e0b";
      ctx.fillText("📦 FLAT CARDBOARD PACKAGING BOX", 320, 220);
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("[RECYCLABLE PAPER - BLUE/YELLOW BIN]", 320, 260);
    } else if (type === "can") {
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("🥤 CRUSHED ALUMINUM SODA CAN", 320, 220);
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("[RECYCLABLE METALS - BLUE BIN]", 320, 260);
    } else {
      ctx.fillStyle = "#f87171";
      ctx.fillText("🍷 SHATTERED GLASS CONTAINER PIECES", 320, 220);
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("[DOMESTIC HAZARDOUS / NON-RECYCLABLE]", 320, 260);
    }

    // Common labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "12px monospace";
    ctx.fillText("VISIONBIN DYNAMIC INSTRUMENT SCANNER V3", 320, 360);
    ctx.fillText("STATUS: ACTIVE SANDBOX CAPTURE SIMULATION", 320, 385);

    const url = canvas.toDataURL("image/jpeg", 0.85);
    const base64 = url.split(",")[1];
    return { url, base64 };
  };

  // Close camera and stop streamtracks
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCameraError(null);
  };

  // Safe release on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Update simulator preview feed when parameters change
  useEffect(() => {
    if (showCamera && isSimulationMode) {
      const generated = generateSimulationImage(selectedSimType);
      setSimImageUrl(generated.url);
    }
  }, [selectedSimType, showCamera, isSimulationMode]);

  const startCamera = async () => {
    setError(null);
    setCameraError(null);
    setIsSimulationMode(false);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("WebRTC getUserMedia API is unsupported or blocked in this browser context.");
      }
      
      let stream: MediaStream;
      try {
        // Try back/environmental camera first
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
      } catch (e) {
        console.warn("Back camera environment constraint not satisfied, trying default video channel:", e);
        // Fallback to any available webcam
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      }
      
      streamRef.current = stream;
      setShowCamera(true);
      
      // Attempt immediate binding, and also rely on callback ref during state transition
      if (videoRef.current) {
        try {
          videoRef.current.srcObject = stream;
        } catch (bindingErr) {
          console.warn("Immediate srcObject assignment warning:", bindingErr);
        }
      }
    } catch (err: any) {
      console.warn("Real camera access denied/blocked, falling back to Simulation Mode:", err);
      // Soft fallback: open the camera modal anyway but in simulator mode!
      setIsSimulationMode(true);
      setShowCamera(true);
      setCameraError(err.message || "Camera permission blocked or unavailable. Dynamic Scanner Simulation is active!");
    }
  };

  const captureCameraPhoto = () => {
    try {
      if (isSimulationMode) {
        const { url, base64 } = generateSimulationImage(selectedSimType);
        const newItem: ImageItem = {
          id: `cam-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          url: url,
          base64: base64,
          mime: "image/jpeg"
        };
        onImagesSelected([...images, newItem]);
        stopCamera();
        return;
      }

      if (!videoRef.current) {
        setCameraError("Camera device screen is not connected.");
        return;
      }

      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      // Use original resolution of the feed
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        const base64Part = dataUrl.split(",")[1];
        
        const newItem: ImageItem = {
          id: `cam-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          url: dataUrl,
          base64: base64Part,
          mime: "image/jpeg"
        };

        onImagesSelected([...images, newItem]);
        stopCamera();
      }
    } catch (err: any) {
      setCameraError("Failed to snap picture feed: " + err.message);
    }
  };

  // File parsing and compression logic
  const parseFiles = (files: FileList) => {
    const loadedItems: ImageItem[] = [];
    const filesArray = Array.from(files);

    if (filesArray.length === 0) return;

    setError(null);

    filesArray.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Please select images only (JPG, PNG, or WEBP).");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("One or more images are too large. Max limit is 10MB per file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileUrl = e.target?.result as string;

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_DIM = 800;
          let w = img.width;
          let h = img.height;

          if (w > MAX_DIM || h > MAX_DIM) {
            if (w > h) {
              h = (h * MAX_DIM) / w;
              w = MAX_DIM;
            } else {
              w = (w * MAX_DIM) / h;
              h = MAX_DIM;
            }
          }

          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
            const base64Part = dataUrl.split(",")[1];

            loadedItems.push({
              id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              url: fileUrl,
              base64: base64Part,
              mime: "image/jpeg"
            });

            // Once all files finished rendering onto canvas, dispatch selection
            if (loadedItems.length === filesArray.filter(f => f.type.startsWith("image/")).length) {
              onImagesSelected([...images, ...loadedItems]);
            }
          }
        };
        img.src = fileUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      parseFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      parseFiles(e.target.files);
    }
  };

  return (
    <div className="w-full bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
      <AnimatePresence mode="wait">
        {images.length === 0 ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
              isDragOver
                ? "border-emerald-500 bg-emerald-500/5"
                : "border-slate-700/60 hover:border-emerald-500/40"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="w-14 h-14 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700/30">
              <Upload className="w-7 h-7 text-emerald-400" />
            </div>

            <p className="font-semibold text-slate-200 text-base">
              Drag & Drop your waste image here
            </p>
            <p className="text-caption mt-1">
              or select multiple files / capture a quick live photo
            </p>

            <div className="flex gap-3 mt-6" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-sm font-medium text-slate-200 hover:border-slate-650 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileImage className="w-4 h-4 text-emerald-400" />
                Browse Files
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-sm font-medium text-slate-200 hover:border-slate-650 transition-colors cursor-pointer"
                onClick={startCamera}
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                Use Camera
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="previews-container"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col"
          >
            {/* If Single Image: show full view */}
            {images.length === 1 ? (
              <div className="relative max-w-full mx-auto">
                {isAnalyzing && (
                  <div className="absolute inset-0 rounded-xl z-15 overflow-hidden pointer-events-none">
                    {/* Scanning line that sweeps top to bottom */}
                    <div className="absolute inset-0 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-xl animate-pulse" />
                    <div className="scan-line" />
                  </div>
                )}
                <img
                  src={images[0].url}
                  alt="Single waste selection"
                  className={`max-h-[320px] rounded-xl border border-slate-800 object-contain mx-auto bg-black transition-all ${
                    isAnalyzing ? "blur-[2px] opacity-80" : ""
                  }`}
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-500 text-white p-1.5 rounded-lg shadow-lg hover:scale-105 transition-all text-xs flex items-center gap-1 z-20 outline-none"
                  onClick={onClearAll}
                  disabled={isAnalyzing}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            ) : (
              /* If Multi-Image: show Grid view */
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs font-semibold text-slate-300">
                    📂 Batch Selection ({images.length} file{images.length > 1 ? "s" : ""} active)
                  </span>
                  <button
                    disabled={isAnalyzing}
                    onClick={onClearAll}
                    className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((item) => (
                    <div key={item.id} className="relative group aspect-video bg-black rounded-lg border border-slate-805 overflow-hidden">
                      <img
                        src={item.url}
                        alt="Batch item"
                        className="w-full h-full object-cover"
                      />
                      <button
                        title="Delete selected item"
                        disabled={isAnalyzing}
                        onClick={() => onRemoveImage(item.id)}
                        className="absolute top-1 right-1 bg-red-600/95 hover:bg-red-500 text-white p-1 rounded-md opacity-90 hover:scale-105 transition-all outline-none"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {/* Append more files tile */}
                  <button
                    disabled={isAnalyzing}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-emerald-500/40 bg-slate-900/10 hover:bg-slate-900/30 rounded-lg aspect-video transition-colors cursor-pointer"
                  >
                    <Upload className="w-5 h-5 text-slate-500 mb-1" />
                    <span className="text-[10px] font-bold text-slate-400">Add More</span>
                  </button>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    disabled={isAnalyzing}
                    onClick={startCamera}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-all cursor-pointer animate-fade-in"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    Add Live Photo
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={onClassify}
              disabled={isAnalyzing || images.length === 0}
              type="button"
              className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/10 transition-transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-md tracking-wider cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  <span>
                    {analyzeProgress && analyzeProgress.total > 1
                      ? `Analyzing ${analyzeProgress.total} images with Gemini AI...`
                      : "Analyzing waste — Gemini AI processing..."}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 shrink-0" />
                  <span>
                    {images.length > 1 ? `Classify All ${images.length} Images` : "Classify Waste"}
                  </span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden fallback file input (essential to let 'Browse Files' work across states) */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Camera Live Modal Overlay */}
      <AnimatePresence>
        {showCamera && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative flex flex-col my-auto"
            >
              {/* Camera header */}
              <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                <span className="syne-font text-white font-bold text-sm tracking-wide flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  {isSimulationMode ? "Instrument Scanner Simulator" : "Live Camera Scanner"}
                </span>
                <button
                  onClick={stopCamera}
                  className="text-slate-450 hover:text-white p-1 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video or Simulator interface */}
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden border-b border-slate-850">
                {isSimulationMode ? (
                  <div className="w-full h-full relative bg-slate-950 flex flex-col items-center justify-center p-2">
                    {simImageUrl ? (
                      <img
                        src={simImageUrl}
                        alt="Simulated Scanner Feed View"
                        className="max-h-[200px] w-auto rounded-lg border border-emerald-500/30 object-contain shadow-md animate-pulse"
                      />
                    ) : (
                      <span className="text-caption font-mono text-[11px]">Initializing Sandbox feed...</span>
                    )}
                    <span className="absolute top-2 left-2 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest select-none">
                      EMULATOR LINK ACTIVE
                    </span>
                  </div>
                ) : (
                  <video
                    ref={(el) => {
                      videoRef.current = el;
                      if (el && streamRef.current) {
                        try {
                          el.srcObject = streamRef.current;
                        } catch (e) {
                          console.warn("Callback ref srcObject binding update warning:", e);
                        }
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Corner crosshairs */}
                <div className="absolute inset-6 border border-white/10 pointer-events-none rounded-lg flex items-center justify-center">
                  <div className="w-10 h-10 border-t border-l border-emerald-400/60 absolute top-0 left-0" />
                  <div className="w-10 h-10 border-t border-r border-emerald-400/60 absolute top-0 right-0" />
                  <div className="w-10 h-10 border-b border-l border-emerald-400/60 absolute bottom-0 left-0" />
                  <div className="w-10 h-10 border-b border-r border-emerald-400/60 absolute bottom-0 right-0" />
                </div>
              </div>

              {/* Simulation controls selection panel */}
              {isSimulationMode && (
                <div className="w-full space-y-2 px-5 py-3.5 bg-slate-950/80 border-b border-slate-800">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block text-center mb-1.5">
                    Select Simulated Waste Item to scan:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: "peel", label: "🍌 Banana Peel", style: "hover:border-emerald-500/40 text-yellow-400" },
                      { type: "bottle", label: "🧪 Plastic Bottle", style: "hover:border-emerald-500/40 text-sky-400" },
                      { type: "battery", label: "🔋 AA Battery", style: "hover:border-emerald-500/40 text-orange-400" },
                      { type: "box", label: "📦 Cardboard", style: "hover:border-emerald-500/40 text-amber-500" },
                      { type: "can", label: "🥤 Soda Can", style: "hover:border-emerald-500/40 text-slate-350" },
                      { type: "glass", label: "🍷 Shattered Glass", style: "hover:border-emerald-500/40 text-red-450" },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setSelectedSimType(item.type as any)}
                        className={`px-1.5 py-2 rounded-lg border text-[11px] font-extrabold transition-all text-center leading-none select-none cursor-pointer ${
                          selectedSimType === item.type
                            ? "border-emerald-500 bg-emerald-500/10 text-white scale-102 ring-1 ring-emerald-500/30"
                            : "border-slate-800 bg-slate-900/60 " + item.style
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Details & Capture Panel */}
              <div className="p-5 flex flex-col items-center gap-4 bg-slate-900">
                {cameraError && (
                  <div className="text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                )}
                
                <p className="text-center text-caption leading-relaxed max-w-sm">
                  {isSimulationMode 
                    ? "Choose a product above to simulate placing it in the frame, then capture"
                    : "Align your household waste item in the center frame and capture a high-fidelity image"
                  }
                </p>

                {/* Simulated Mode manual toggle */}
                <div className="flex w-full justify-center mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (isSimulationMode) {
                        setIsSimulationMode(false);
                        startCamera();
                      } else {
                        if (streamRef.current) {
                          streamRef.current.getTracks().forEach((track) => track.stop());
                          streamRef.current = null;
                        }
                        setIsSimulationMode(true);
                        setCameraError("Sandbox simulation feed initialized manual lock.");
                      }
                    }}
                    className="text-[11px] font-extrabold text-slate-400 hover:text-emerald-400 transition-colors border border-slate-800 rounded-lg px-3 py-1.5 bg-slate-950/50 hover:bg-slate-950/90 cursor-pointer animate-fade-in"
                  >
                    {isSimulationMode ? "🔌 Switch to Live Webcam" : "🧪 Load Live Image Simulator"}
                  </button>
                </div>

                <div className="flex justify-center items-center gap-4 w-full mt-2">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-800 text-slate-350 hover:border-slate-600 transition-colors font-medium text-xs text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={captureCameraPhoto}
                    className="flex-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold transition-all active:scale-[0.97] text-xs text-center flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-550/10 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{isSimulationMode ? "Capture Simulated Photo" : "Capture Photo"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
