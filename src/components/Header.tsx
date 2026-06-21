import { Trash2, BarChart2, BookOpen, Compass, Info } from "lucide-react";

type Tab = "dashboard" | "analyze" | "guide" | "impact" | "about";

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: Info },
    { id: "analyze", label: "Analyze Waste", icon: Trash2 },
    { id: "guide", label: "Waste Guide", icon: BookOpen },
    { id: "impact", label: "Impact Tracker", icon: BarChart2 },
    { id: "about", label: "About Project", icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a0f1e]/90 backdrop-blur-md border-b border-slate-800/80 shadow-md">
      <div className="max-w-4xl mx-auto px-4">
        {/* Main Logo row */}
        <div className="flex justify-between items-center py-4">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onTabChange("dashboard");
            }}
            className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-white transition-all hover:opacity-95"
          >
            <Trash2 className="w-7 h-7 text-emerald-500" />
            <span className="syne-font text-white tracking-wide">VisionBin</span>
          </a>
          <div className="flex gap-2">
            <span className="text-[10px] font-extrabold tracking-wider px-2 py-1 rounded bg-blue-600/10 text-blue-400 border border-blue-500/20 uppercase select-none">
              SDG 11
            </span>
            <span className="text-[10px] font-extrabold tracking-wider px-2 py-1 rounded bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 uppercase select-none">
              SDG 12
            </span>
          </div>
        </div>

        {/* Tab row */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-2.5 pt-0.5 -mx-4 px-4 scrollbar-none scroll-smooth">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold tracking-wide rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 outline-none ${
                  isActive
                    ? "bg-emerald-500/10 text-white border-b-2 border-emerald-500 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
