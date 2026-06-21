import { WasteCategoryInfo } from "./types";

export const CATEGORIES: Record<string, WasteCategoryInfo> = {
  "Wet/Organic": {
    name: "Wet/Organic",
    color: "#22c55e",
    emoji: "🟢",
    disposal: "Place in the GREEN bin. Compost at home or give to municipal composting vans.",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/40",
    bgLight: "rgba(16, 185, 129, 0.08)",
    definition: "Waste generated from biological sources such as food preparation, consumption, and garden maintenance. It is biodegradable and can be composted into nutrient-rich manure.",
    examples: [
      "Fruit and vegetable peels",
      "Cooked and uncooked food leftovers",
      "Tea leaves and coffee grounds",
      "Eggshells",
      "Garden clippings and fallen leaves",
      "Coconut shells",
      "Flowers and plant trimmings"
    ],
    disposalSteps: [
      "Separate organic waste at source into a green bin or container",
      "Avoid mixing with plastics, glass, or hazardous waste",
      "Hand over to municipal composting van or home compost pit",
      "Never pour cooking oil or liquid waste into drains — absorb in newspaper first",
      "Keep the bin covered to prevent pests"
    ],
    environmentalImpact: "When organic waste reaches landfills instead of compost facilities, it decomposes anaerobically and produces methane — a greenhouse gas 25× more potent than CO₂. In India, organic waste in landfills is a primary driver of urban air pollution and groundwater contamination.",
    recyclingChallenges: "Contamination from non-organic materials (plastic bags, foil wrappers) ruins entire compost batches. Lack of segregation habits at the household level remains the biggest barrier to composting success in Indian cities.",
    reductionTips: [
      "Plan meals in advance to avoid food waste",
      "Compost peels and scraps at home using a small terracotta pot",
      "Buy only what you need — avoid over-purchasing perishables"
    ],
    facts: [
      "Organic waste makes up ~50% of India's municipal solid waste by weight.",
      "A single kilogram of food waste in a landfill produces approximately 0.25 kg of methane.",
      "Home composting can reduce household waste sent to landfill by up to 30%.",
      "Banana peels decompose in 2–5 weeks when composted vs. 2 years in a plastic bag in landfill.",
      "India wastes approximately ₹92,000 crore worth of food every year.",
      "Composted organic matter improves soil water retention by up to 20%.",
      "One tonne of composted food waste can replace 200 kg of chemical fertiliser.",
      "Fruit and vegetable peels contain more nutrients than the food itself — they're perfect for compost.",
      "The world wastes one-third of all food produced — enough to feed 3 billion people.",
      "Urban composting programmes in Pune have diverted over 700 tonnes of organic waste per day from landfills.",
      "Vermicomposting with red wigglers can break down organic matter 4× faster than regular composting.",
      "Eggshells are rich in calcium and make an excellent compost amendment for vegetable gardens.",
      "Food waste in landfills produces leachate that can contaminate groundwater for decades.",
      "A biogas plant powered by kitchen waste can generate enough gas to cook 2 meals a day for a family of 4.",
      "Leaves and garden trimmings can be turned into mulch that reduces the need for watering by 30%."
    ]
  },
  "Dry/Recyclable": {
    name: "Dry/Recyclable",
    color: "#3b82f6",
    emoji: "🔵",
    disposal: "Place in the BLUE bin. Rinse containers before recycling. Flatten cardboard.",
    badgeClass: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    hoverBorder: "hover:border-blue-500/40",
    bgLight: "rgba(59, 130, 246, 0.08)",
    definition: "Waste made of materials that can be reprocessed into new products — including paper, cardboard, glass, metals, and most rigid plastics. Properly segregated dry waste is a valuable industrial resource.",
    examples: [
      "PET plastic water bottles",
      "Cardboard boxes and newspapers",
      "Glass jars and bottles",
      "Aluminium cans and foil",
      "Steel tins and containers",
      "Magazines and office paper",
      "Hard plastic containers (HDPE, PP)"
    ],
    disposalSteps: [
      "Rinse all containers — food residue contaminates entire recycling batches",
      "Flatten cardboard boxes to save space",
      "Remove caps and labels where possible",
      "Place in the BLUE bin or give to your local kabadiwala",
      "Avoid putting shredded paper (too small to sort mechanically)"
    ],
    environmentalImpact: "Recycling aluminium uses 95% less energy than producing it from raw ore. Recycling paper prevents deforestation and reduces water usage by 60%. Every tonne of recycled plastic prevents approximately 1.5 tonnes of CO₂ from entering the atmosphere.",
    recyclingChallenges: "Multi-layer packaging (chip packets, juice cartons) combines materials that cannot be separated economically. Greasy or wet paper cannot be recycled. Sorting infrastructure in most Indian municipalities remains underfunded and manual.",
    reductionTips: [
      "Choose products with single-material packaging over multi-layer packaging",
      "Carry reusable bags and refuse single-use plastic",
      "Donate old newspapers to the local kabadiwala weekly"
    ],
    facts: [
      "Recycling one ton of paper saves 17 full-grown trees.",
      "Aluminium can be recycled indefinitely without losing quality — it is the perfect circular material.",
      "Recycling a single glass bottle saves enough energy to power a 100W light bulb for 4 hours.",
      "India's informal recycling sector (kabadiwalas) recovers approximately 20 million tonnes of material annually.",
      "Making new aluminium from recycled metal uses 95% less energy than extracting it from bauxite ore.",
      "Cardboard can typically be recycled 5–7 times before fibres become too short to be reused.",
      "Only 9% of all plastic ever produced globally has been recycled.",
      "PET plastic bottles (marked with recycling code 1) are among the most widely recycled plastics in India.",
      "Recycling 1 tonne of steel saves 1.5 tonnes of CO₂ emissions compared to virgin steel production.",
      "Glass is 100% recyclable and can be melted and remoulded infinitely.",
      "Newspaper recycled in India is primarily used to make lower-grade paper like tissue, packaging, and newsprint.",
      "Most recycled plastic in India is downcycled — made into lower-value products like pipes or bin bags.",
      "The global paper recycling rate is about 58% — one of the highest of any material.",
      "Tin cans are made from steel with a thin tin coating — both are fully recyclable separately.",
      "Switching from single-use plastic bags to reusable jute bags for one year saves the equivalent of 22 kg of plastic."
    ]
  },
  "Hazardous": {
    name: "Hazardous",
    color: "#ef4444",
    emoji: "🔴",
    disposal: "Do NOT mix with regular waste. Take to a designated hazardous waste collection point or municipal special collection drive.",
    badgeClass: "bg-red-500/10 text-red-400 border border-red-500/20",
    hoverBorder: "hover:border-red-500/40",
    bgLight: "rgba(239, 68, 68, 0.08)",
    definition: "Waste that poses a substantial threat to human health or the environment due to its toxic, flammable, corrosive, or reactive nature. Hazardous waste requires special handling and cannot be disposed of in regular bins.",
    examples: [
      "Household batteries (AA, AAA, lithium)",
      "Paint tins and aerosol cans",
      "Pesticides and insecticides",
      "Cleaning chemicals and bleach",
      "Expired medicines and pills",
      "Fluorescent tube lights and CFLs",
      "Automotive oil and brake fluid"
    ],
    disposalSteps: [
      "Never mix hazardous waste with household garbage",
      "Store in original sealed containers if possible",
      "Check your municipal corporation's website for scheduled hazardous waste collection drives",
      "Drop batteries at collection boxes available in electronics stores (Croma, Reliance Digital)",
      "Return expired medicines to pharmacies that participate in medicine take-back programmes"
    ],
    environmentalImpact: "A single fluorescent bulb contains enough mercury to contaminate a small lake. Battery acid leaching into soil renders agricultural land infertile for decades. Chemicals poured into drains bypass sewage treatment and directly enter rivers and groundwater tables.",
    recyclingChallenges: "Hazardous waste collection infrastructure in India is concentrated in industrial zones, making residential disposal difficult. Consumer awareness of what qualifies as hazardous is extremely low — most batteries end up in household bins.",
    reductionTips: [
      "Switch to rechargeable batteries to reduce hazardous battery waste",
      "Choose water-based paints over solvent-based paints",
      "Buy only the quantity of chemicals you need — avoid stockpiling"
    ],
    facts: [
      "A single AA battery can contaminate 400 litres of groundwater with heavy metals.",
      "Fluorescent bulbs contain 3–5 mg of mercury — enough to contaminate a small pond.",
      "Used motor oil poured on the ground takes 100 years to break down naturally.",
      "Household chemical waste makes up less than 1% of total waste volume but causes 30% of toxic contamination.",
      "Lead from discarded car batteries is one of the most common sources of soil contamination near urban waste dumps.",
      "Over 80% of India's hazardous household waste is mixed with regular trash and goes to uncontrolled landfills.",
      "Pesticide containers retain traces of active chemicals even when empty — they must be treated as hazardous.",
      "Chromium from discarded leather industry chemical waste has contaminated groundwater in parts of Tamil Nadu.",
      "Aerosol cans are pressurised and can explode in high-temperature landfill environments.",
      "Most Indian cities have mobile hazardous waste collection drives only 2–4 times per year.",
      "CFL bulbs contain mercury vapour that is released when they break — clean up with gloves, never vacuum.",
      "Children are 10× more sensitive to lead poisoning than adults — lead-based paint waste is especially dangerous near homes.",
      "Expired medicines in waterways cause antibiotic resistance — a global health emergency.",
      "Many cleaning product containers are classified as hazardous even when empty due to residual chemical films.",
      "The Basel Convention, ratified by India, restricts the international trade of hazardous waste — but enforcement remains limited."
    ]
  },
  "E-Waste": {
    name: "E-Waste",
    color: "#6366f1",
    emoji: "⚫",
    disposal: "Drop at an authorized e-waste recycler. Never burn or crush old electronics.",
    badgeClass: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    hoverBorder: "hover:border-indigo-500/40",
    bgLight: "rgba(99, 102, 241, 0.08)",
    definition: "Discarded electrical and electronic equipment containing valuable metals and toxic substances. E-waste is both an environmental hazard and a valuable resource — it contains more gold per tonne than most gold mines.",
    examples: [
      "Old smartphones and feature phones",
      "Chargers, cables, and adapters",
      "Laptops and desktop computers",
      "Circuit boards and RAM chips",
      "LED and LCD monitors",
      "Keyboards, mice, and printers",
      "Earphones and speakers"
    ],
    disposalSteps: [
      "Do not throw e-waste in household bins or on the street",
      "Wipe personal data from devices before disposal (factory reset)",
      "Drop at authorised e-waste recyclers: Karo Sambhav, E-Parisaraa, Attero Recycling",
      "Many smartphone brands (Samsung, Apple, Xiaomi) run take-back programmes — check their websites",
      "Sell working devices to refurbishers like Cashify or OLX before considering disposal"
    ],
    environmentalImpact: "Burning e-waste — the most common informal recycling method — releases dioxins and furans that cause cancer, neurological damage, and hormonal disruption. Heavy metals like lead, cadmium, and mercury leach from improperly dumped e-waste into soil for generations.",
    recyclingChallenges: "India's e-waste recycling sector is dominated by informal workers operating without protective gear. The Extended Producer Responsibility (EPR) regulations mandate brands to fund recycling, but enforcement is inconsistent. Consumers rarely know where to drop e-waste legally.",
    reductionTips: [
      "Repair devices instead of replacing them — visit local repair shops first",
      "Donate working electronics to schools or NGOs",
      "Choose electronics with longer warranties and repairability ratings"
    ],
    facts: [
      "India generated 3.23 million metric tonnes of e-waste in 2024, the 3rd highest globally.",
      "Less than 20% of India's e-waste is processed by formal recyclers.",
      "A smartphone contains over 60 different elements, including gold, silver, palladium, and cobalt.",
      "One tonne of circuit boards contains 40–800 times more gold than one tonne of gold ore.",
      "Burning e-waste releases brominated dioxins linked to thyroid cancer and developmental disorders in children.",
      "The global e-waste stream is the fastest-growing solid waste category, growing at 4% per year.",
      "Informal e-waste workers in India often work without gloves or masks, suffering chronic heavy metal poisoning.",
      "A laptop contains up to 1.8 kg of potentially recyclable materials including copper, aluminium, and steel.",
      "India's E-Waste (Management) Rules 2022 mandate that producers take back and recycle their products.",
      "The Democratic Republic of Congo supplies 60% of global cobalt — mining it for EV and phone batteries causes severe environmental and human rights harm.",
      "Data stored on old hard drives can be recovered even after deletion — always securely wipe or physically shred.",
      "Refurbished smartphones have a 50% lower carbon footprint than new ones.",
      "Every year, e-waste worth $57 billion is thrown away globally — more than the GDP of most countries.",
      "Older CRT monitors contain up to 4 kg of lead in the glass panel alone.",
      "EU regulations now mandate that all phones sold must use a universal USB-C charger — a step toward reducing charger waste."
    ]
  },
  "Medical/Biomedical": {
    name: "Medical/Biomedical",
    color: "#f59e0b",
    emoji: "🟡",
    disposal: "Place in a YELLOW bag. Contact your local municipal health office. Never put in household bins.",
    badgeClass: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    hoverBorder: "hover:border-amber-500/40",
    bgLight: "rgba(245, 158, 11, 0.08)",
    definition: "Waste generated from medical treatment, diagnosis, or research that may be contaminated with blood, bodily fluids, or infectious agents. Even household medical waste can transmit dangerous pathogens.",
    examples: [
      "Insulin syringes and lancets",
      "Used bandages and wound dressings",
      "Expired or unused prescription medicines",
      "Surgical gloves and masks",
      "Home dialysis supplies",
      "Blood glucose test strips",
      "COVID-19 rapid test kits"
    ],
    disposalSteps: [
      "Place sharps (needles, lancets) in a puncture-resistant container — never loose in bins",
      "Seal used bandages and masks in a zip-lock bag before disposal",
      "Contact your local municipal health office or PHC for biomedical waste pickup",
      "Never flush medicines down the toilet — they pass through water treatment plants unchanged",
      "Some pharmacies and hospitals accept unused medicines for safe incineration"
    ],
    environmentalImpact: "Improperly disposed syringes are a leading cause of needlestick injuries among waste workers, transmitting HIV, Hepatitis B, and Hepatitis C. Pharmaceutical compounds flushed into waterways disrupt aquatic ecosystems and are increasingly detected in drinking water globally.",
    recyclingChallenges: "At-home biomedical waste generation has surged post-COVID (masks, gloves, test kits). No standardised residential collection system exists in most Indian cities. Patients are often unaware that home medical waste requires special handling.",
    reductionTips: [
      "Use pill organisers to avoid forgetting medications and wasting them",
      "Choose reusable cloth masks over disposable ones for non-medical use",
      "Ask your doctor for exact quantities — avoid stockpiling prescription drugs"
    ],
    facts: [
      "Improper disposal of syringes is responsible for over 8 million Hepatitis B infections globally each year.",
      "A used syringe can remain infectious for HIV for up to 42 days under the right conditions.",
      "India generates approximately 617 tonnes of biomedical waste per day from healthcare facilities alone.",
      "Home medical waste generation surged 400% in India during the COVID-19 pandemic.",
      "Pharmaceutical compounds flushed down drains have been found in rivers and drinking water across India.",
      "Antibiotic residues in waterways contribute to antimicrobial resistance — one of the top 10 global health threats.",
      "Sharps (needles, lancets) should always go in a rigid puncture-proof container — never loose in a bin bag.",
      "Single-use surgical gloves are made of latex or nitrile — neither is recyclable in standard recycling streams.",
      "India's Biomedical Waste Management Rules (2016) apply to hospitals and clinics — home patients have no binding guidelines.",
      "Many Indian pharmacies accept unused or expired medicines for safe incineration under take-back programmes.",
      "COVID-19 test kits are classified as potentially infectious biomedical waste — not regular household trash.",
      "Improper sharps disposal is the leading cause of needlestick injuries among sanitation workers in India.",
      "Mercury thermometers, once standard in Indian homes, contain 0.5g of mercury — enough to contaminate a room if broken.",
      "Blood-contaminated materials must be double-bagged in red biohazard bags before any form of disposal.",
      "The WHO recommends that all sharps waste be treated with autoclaving (steam sterilisation) before final disposal."
    ]
  },
  "Non-Recyclable": {
    name: "Non-Recyclable",
    color: "#94a3b8",
    emoji: "⬜",
    disposal: "Place in the BLACK/GREY bin. Minimize by choosing products with less packaging.",
    badgeClass: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
    hoverBorder: "hover:border-slate-500/40",
    bgLight: "rgba(148, 163, 184, 0.08)",
    definition: "Waste that cannot be composted or economically recycled with current technology. Also called 'reject waste' or 'dry residual waste', it must go to landfill — making reduction and avoidance the only real solution.",
    examples: [
      "Multi-layer chip and snack packets",
      "Soiled and greasy paper or cardboard",
      "Broken ceramics, mirrors, and crockery",
      "Disposable diapers and sanitary products",
      "Thermocol (expanded polystyrene) packaging",
      "Candy wrappers and straw wrappers",
      "Carbon paper and wax paper"
    ],
    disposalSteps: [
      "Place in the BLACK or GREY household bin",
      "Wrap broken glass or ceramics in newspaper before binning to protect waste workers",
      "Compact items to reduce volume where possible",
      "This waste will go to a sanitary landfill — minimise it through purchasing decisions",
      "Check if your municipality has a 'dry residual' compaction centre"
    ],
    environmentalImpact: "Non-recyclable waste in Indian landfills produces leachate — a toxic liquid cocktail — that seeps into groundwater. Landfill gas from mixed waste is a major urban methane source. Thermocol takes over 500 years to break down and cannot be recycled in most Indian cities.",
    recyclingChallenges: "Multi-layer packaging is the fastest-growing waste stream globally and the hardest to address — it requires either chemical recycling (expensive) or pyrolysis (limited scale). Consumer demand for convenient, long-shelf-life packaged food is the primary driver.",
    reductionTips: [
      "Refuse thermocol packaging — choose cardboard alternatives when ordering online",
      "Avoid individually wrapped products — buy in bulk",
      "Switch to reusable cloth sanitary products or a menstrual cup"
    ],
    facts: [
      "Multi-layer plastic packaging (chip packets) is made of up to 7 different bonded layers that cannot be separated.",
      "Thermocol (expanded polystyrene) takes over 500 years to break down and is not accepted at most recycling facilities.",
      "Disposable diapers take approximately 500 years to decompose in a landfill.",
      "India generates approximately 26,000 tonnes of municipal solid waste daily, a significant portion of which is non-recyclable residual waste.",
      "Greasy pizza boxes cannot be recycled — grease contaminates the paper fibres during the pulping process.",
      "Sanitary products account for over 45 billion items sent to landfill globally every year.",
      "Non-recyclable waste is the primary input to waste-to-energy (WTE) incineration plants where they exist.",
      "Candy wrappers and straw wrappers are among the most frequently found items in ocean plastic surveys.",
      "\"Biodegradable\" plastics often require industrial composting conditions — in a landfill, they behave like regular plastic.",
      "Carbon paper and thermal paper (receipts) contain BPA and cannot be recycled.",
      "Wax-coated paper cups are non-recyclable — the wax layer prevents paper fibre separation.",
      "Most non-recyclable waste in India ends up in open dumpsites, not engineered sanitary landfills.",
      "Zero-waste packaging design is growing — some brands now offer fully compostable or monomaterial packaging as alternatives.",
      "Extended Producer Responsibility (EPR) regulations in India aim to hold brands financially accountable for their non-recyclable packaging.",
      "Choosing loose fruit and vegetables over pre-packaged ones can eliminate up to 2 kg of non-recyclable plastic per household per month."
    ]
  }
};
