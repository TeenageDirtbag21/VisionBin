import { ArrowUpRight } from "lucide-react";

export default function SdgImpact() {
  return (
    <section className="w-full mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* SDG 11 */}
        <div className="bg-[#111827] border border-blue-900/20 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full filter blur-2xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-xl text-white shadow-lg shrink-0 select-none">
              11
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-xs uppercase tracking-wider mb-1.5">
                <span className="text-sm font-semibold">Sustainable Cities</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <h3 className="syne-font text-lg font-bold text-white mb-2">
                Unified Urban Solutions
              </h3>
              <p className="text-body">
                VisionBin directly advances SDG Goal 11 by promoting smarter urban waste collection mechanisms, reinforcing active source-level waste segregation, and lessening the heavy carbon load off central municipal transfer sites.
              </p>
            </div>
          </div>
        </div>

        {/* SDG 12 */}
        <div className="bg-[#111827] border border-emerald-900/20 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-2xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center font-extrabold text-xl text-white shadow-lg shrink-0 select-none">
              12
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1.5">
                <span className="text-sm font-semibold">Responsible Consumption</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <h3 className="syne-font text-lg font-bold text-white mb-2">
                Closing Material Loops
              </h3>
              <p className="text-body">
                By identifying organic materials and separating recyclable feedstock, we empower everyday consumers to form healthy closed-loop circular habits, significantly optimizing resources and supporting SDG Goal 12.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
