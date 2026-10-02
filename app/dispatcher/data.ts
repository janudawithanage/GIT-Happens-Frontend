export type Segment = "Fresh" | "Style" | "Tech";
export type LoadType = "Chilled" | "Ambient" | "Controlled";
export type OrderStatus = "Confirmed" | "Deferred";

export type Order = {
  id: string; outletId: string; outlet: string; address: string; segment: Segment; district: "Colombo" | "Gampaha";
  window: [string, string]; load: LoadType; temp?: string; status: OrderStatus; weightKg: number; volumeM3: number;
  packaging: string; dock: string; parking: string;
};

export type FleetVehicle = { id: string; type: string; reefer: boolean; volumeCap: number; weightCap: number; baseVolume: number; baseWeight: number; driver: string; departure: string; trip: string; fuelLeft: number };

const outlets: [string, string, string, "Colombo" | "Gampaha"][] = [
  ["OUT041", "Colombo Flagship", "Galle Road, Zone 01", "Colombo"], ["OUT067", "Gampaha Central", "Kandy Road, Gampaha", "Gampaha"], ["OUT102", "Kadawatha Tech Store", "Colombo Road, Kadawatha", "Gampaha"],
  ["OUT018", "Negombo Metro", "Main Street, Coastal Route", "Gampaha"], ["OUT089", "Wattala Super", "Negombo Road Corridor", "Gampaha"], ["OUT023", "Dehiwala Hub", "Hill Street Junction", "Colombo"],
  ["OUT052", "Bambalapitiya Fresh Express", "Galle Road, Colombo 04", "Colombo"], ["OUT058", "Kollupitiya Metro Hub", "R. A. De Mel Mawatha", "Colombo"], ["OUT061", "Havelock Town MiniMart", "Havelock Road, Colombo 05", "Colombo"],
  ["OUT033", "Rajagiriya Market", "Parliament Road", "Colombo"], ["OUT074", "Ja-Ela Corner", "Colombo Road, Ja-Ela", "Gampaha"], ["OUT081", "Kiribathgoda Plaza", "Kandy Road, Kiribathgoda", "Gampaha"],
  ["OUT046", "Wellawatte Point", "Marine Drive", "Colombo"], ["OUT093", "Minuwangoda Store", "Airport Road", "Gampaha"], ["OUT027", "Borella Junction", "Baseline Road", "Colombo"],
  ["OUT069", "Kelaniya Outlet", "Biyagama Road", "Gampaha"], ["OUT038", "Nugegoda Square", "Stanley Thilakaratne Mw.", "Colombo"], ["OUT097", "Veyangoda Mart", "Station Road", "Gampaha"],
];
const windows: [string, string][] = [["05:30", "08:00"], ["08:00", "10:30"], ["13:00", "15:00"], ["05:30", "08:00"], ["10:00", "12:00"], ["15:30", "17:30"], ["06:00", "08:30"], ["09:00", "11:00"], ["11:30", "13:30"]];
const docks = ["Rear Dock (Elevated)", "Side Bay (Ground)", "Rear Dock (Ground)", "Mall Loading Bay"];
const parking = ["Normal (No Curfew)", "Morning curfew after 09:00", "Normal (No Curfew)", "Permit required"];

// Builds the 86-order confirmed run. Mix matches the Figma counts:
// Fresh 58 (24 chilled), Style 17, Tech 11; 15 deferred (Fresh 10, Style 3, Tech 2).
const areas = ["Maharagama", "Kotte", "Ragama", "Homagama", "Kottawa", "Piliyandala", "Kadana", "Gampola", "Divulapitiya", "Malabe", "Pannipitiya", "Kandana"];
const outletTypes = ["Fresh Mart", "Style Studio", "Tech Corner", "Express", "City Store", "Market"];

function buildOrders(): Order[] {
  type Slot = { segment: Segment; load: LoadType; deferred: boolean };
  const pool: Slot[] = [];
  const push = (n: number, segment: Segment, load: LoadType, deferred = false) => { for (let i = 0; i < n; i++) pool.push({ segment, load, deferred }); };
  push(20, "Fresh", "Chilled"); push(4, "Fresh", "Chilled", true); push(28, "Fresh", "Ambient"); push(6, "Fresh", "Ambient", true);
  push(14, "Style", "Ambient"); push(3, "Style", "Ambient", true); push(6, "Tech", "Ambient"); push(3, "Tech", "Controlled"); push(2, "Tech", "Controlled", true);
  const fixed: (Slot & { temp?: string })[] = [
    { segment: "Fresh", load: "Chilled", deferred: false, temp: "2.8°C" }, { segment: "Style", load: "Ambient", deferred: false }, { segment: "Tech", load: "Controlled", deferred: true, temp: "21°C" },
    { segment: "Fresh", load: "Chilled", deferred: false, temp: "3.1°C" }, { segment: "Tech", load: "Ambient", deferred: false }, { segment: "Style", load: "Ambient", deferred: false },
  ];
  // take the six design rows out of the pool so the totals stay exact
  for (const f of fixed) pool.splice(pool.findIndex(p => p.segment === f.segment && p.load === f.load && p.deferred === f.deferred), 1);
  // deterministic interleave so brands and loads are spread across pages
  const rest = pool.map((slot, i) => ({ slot, key: (i * 37) % pool.length })).sort((a, b) => a.key - b.key).map(x => x.slot);
  const slots: (Slot & { temp?: string })[] = [...fixed, ...rest];
  const orders = slots.map((pick, i): Order => {
    const o: [string, string, string, "Colombo" | "Gampaha"] = i < outlets.length ? outlets[i] : [`OUT${100 + i}`, `${areas[i % areas.length]} ${outletTypes[i % outletTypes.length]}`, `${areas[i % areas.length]} Main Road`, i % 2 ? "Colombo" : "Gampaha"];
    const n = 92308 + (i < 6 ? [0, 4, 11, 16, 22, 27][i] : 27 + (i - 5) * 3);
    return {
      id: `ORD00${n}`, outletId: o[0], outlet: o[1], address: o[2], district: o[3], segment: pick.segment, load: pick.load,
      temp: pick.temp ?? (pick.load === "Chilled" ? `${(2.4 + (i % 7) * 0.2).toFixed(1)}°C` : pick.load === "Controlled" ? "21°C" : undefined),
      window: windows[i % windows.length], status: pick.deferred ? "Deferred" : "Confirmed",
      weightKg: i === 0 ? 420 : 110 + ((i * 53) % 190), volumeM3: i === 0 ? 3.2 : Math.round((0.6 + ((i * 17) % 13) / 10) * 10) / 10,
      packaging: i === 0 ? "28 Totes / 4 Pallets" : `${8 + (i % 20)} Totes / ${1 + (i % 4)} Pallets`, dock: docks[i % docks.length], parking: parking[i % parking.length],
    };
  });
  // keep the run totals at 14,820 kg and 92.4 m³ (shown in the orders footer)
  const last = orders[orders.length - 1];
  last.weightKg += 14820 - orders.reduce((s, o) => s + o.weightKg, 0);
  last.volumeM3 = Math.round((last.volumeM3 + 92.4 - orders.reduce((s, o) => s + o.volumeM3, 0)) * 10) / 10;
  return orders;
}

export const seedOrders = buildOrders();

export const fleet: FleetVehicle[] = [
  { id: "VEH014", type: "3.5T Reefer Rigid", reefer: true, volumeCap: 10.8, weightCap: 2000, baseVolume: 4.6, baseWeight: 800, driver: "K. Silva", departure: "05:15", trip: "TRP-COL-04", fuelLeft: 68 },
  { id: "VEH021", type: "5T Ambient Rigid", reefer: false, volumeCap: 16, weightCap: 5000, baseVolume: 7.2, baseWeight: 2250, driver: "S. Dias", departure: "06:00", trip: "TRP-COL-07", fuelLeft: 74 },
  { id: "VEH034", type: "3.5T Reefer Rigid", reefer: true, volumeCap: 10.8, weightCap: 2000, baseVolume: 9.5, baseWeight: 1640, driver: "A. Fernando", departure: "05:30", trip: "TRP-GAM-02", fuelLeft: 41 },
];

export type WaveEntry = { orderId: string; vehicle: string | null; label: "Confirmed" | "Ready" };

// Wave 1 orders on the planning board. Only ORD0092308 is still awaiting a vehicle;
// the rest are already on a vehicle that suits their load.
export const seedWave: WaveEntry[] = [
  { orderId: "ORD0092308", vehicle: null, label: "Confirmed" },
  ...seedOrders.slice(6).filter(o => o.status === "Confirmed").slice(0, 12).map((o, i): WaveEntry => ({ orderId: o.id, vehicle: o.load === "Ambient" ? "VEH021" : i % 2 ? "VEH034" : "VEH014", label: i % 3 === 2 ? "Ready" : "Confirmed" })),
];

export type LiveStatus = "On route" | "At stop" | "Delivery risk" | "Offline";
export type Stop = { time: string; state: "done" | "next" | "up" | "tight" | "risk" };
export type LiveVehicle = {
  id: string; area: string; brand: Segment; trip: number; status: LiveStatus; eta: string; depot: "Peliyagoda" | "Kandy"; driver: string; vehicleType: string;
  stops: Stop[]; tripStart: string; tripEnd: string; noSignal?: [string, string]; current: string; load: number; chip?: { x: number; y: number; label?: string }; risk?: "At risk" | "Tight";
};

export const seedVehicles: LiveVehicle[] = [
  { id: "VEH016", area: "Gampaha", brand: "Fresh", trip: 1, status: "On route", eta: "06:48", depot: "Peliyagoda", driver: "Nuwan Jayasuriya", vehicleType: "Reefer truck", tripStart: "03:45", tripEnd: "07:15", stops: [{ time: "05:05", state: "done" }, { time: "05:40", state: "done" }, { time: "06:48", state: "next" }, { time: "07:05", state: "up" }], current: "Gampaha Fresh Point", load: 72, chip: { x: 341.9, y: 153.5 } },
  { id: "VEH019", area: "Kaduwela", brand: "Fresh", trip: 1, status: "On route", eta: "06:35", depot: "Peliyagoda", driver: "Dinesh Ranasinghe", vehicleType: "Reefer truck", tripStart: "03:50", tripEnd: "07:30", stops: [{ time: "05:10", state: "done" }, { time: "05:55", state: "done" }, { time: "06:35", state: "next" }, { time: "07:10", state: "up" }], current: "Kaduwela Fresh Hub", load: 64, chip: { x: 383.7, y: 261.6 } },
  { id: "VEH008", area: "Nugegoda", brand: "Fresh", trip: 1, status: "At stop", eta: "07:42", depot: "Peliyagoda", driver: "Chamara Perera", vehicleType: "Reefer van", tripStart: "04:00", tripEnd: "08:00", stops: [{ time: "05:30", state: "done" }, { time: "06:15", state: "done" }, { time: "07:42", state: "tight" }], current: "Nugegoda Fresh Mart", load: 58, chip: { x: 362.8, y: 418.6, label: "VEH008 · At stop" }, risk: "Tight" },
  { id: "VEH044", area: "Kandy", brand: "Fresh", trip: 1, status: "On route", eta: "06:30", depot: "Kandy", driver: "Ruwan Bandara", vehicleType: "Reefer truck", tripStart: "03:40", tripEnd: "07:20", stops: [{ time: "05:00", state: "done" }, { time: "05:50", state: "done" }, { time: "06:30", state: "next" }, { time: "07:00", state: "up" }], current: "Kandy City Centre", load: 81, chip: { x: 872.1, y: 155.2 } },
  { id: "VEH031", area: "A1 · Kegalle", brand: "Tech", trip: 1, status: "Offline", eta: "07:40", depot: "Peliyagoda", driver: "Lahiru Wickrama", vehicleType: "Dry-box truck", tripStart: "05:30", tripEnd: "10:30", noSignal: ["06:05", "06:21"], stops: [{ time: "07:40", state: "next" }, { time: "09:10", state: "up" }, { time: "10:15", state: "up" }], current: "A1 · Kegalle stretch", load: 47, chip: { x: 708.2, y: 174.4, label: "VEH031 · Last ping 06:14" } },
  { id: "VEH021", area: "Colombo", brand: "Style", trip: 1, status: "Delivery risk", eta: "11:35", depot: "Peliyagoda", driver: "Sahan Dias", vehicleType: "Dry-box truck", tripStart: "06:00", tripEnd: "12:00", stops: [{ time: "08:40", state: "up" }, { time: "09:50", state: "up" }, { time: "10:45", state: "up" }, { time: "11:35", state: "risk" }], current: "Departed Peliyagoda", load: 69, chip: { x: 109.9, y: 261.6, label: "VEH021 · Risk" }, risk: "At risk" },
  ...["VEH002", "VEH005", "VEH011", "VEH012", "VEH024", "VEH027", "VEH028", "VEH033", "VEH037", "VEH040", "VEH046", "VEH051"].map((id, i): LiveVehicle => ({
    id, area: i % 3 === 0 ? "Peliyagoda depot" : i % 3 === 1 ? "Returning · A1" : "Kandy hub", brand: (["Fresh", "Style", "Tech"] as Segment[])[i % 3], trip: i % 2 + 1, status: "At stop",
    eta: `${String(8 + (i % 4)).padStart(2, "0")}:${i % 2 ? "15" : "40"}`, depot: i % 3 === 2 ? "Kandy" : "Peliyagoda", driver: ["Amal", "Nimal", "Suresh", "Pradeep", "Kavindu", "Thilina"][i % 6] + " " + ["Perera", "Silva", "Fernando", "Jayawardena"][i % 4],
    vehicleType: i % 2 ? "Dry-box truck" : "Small van", tripStart: "08:00", tripEnd: "11:00", stops: [], current: i % 3 === 1 ? "Returning to depot" : "Loading for trip 2", load: 0,
  })),
];

export const seedRisks = [
  { id: "ORD-10251", area: "Colombo", vehicle: "VEH021", brand: "Style", eta: "11:35", closes: "11:30", note: "ETA 5 min after window", level: "At risk" as const, outlet: "Colombo mall bay", cause: "Slower traffic on the Colombo approach and a queue at the mall loading bay." },
  { id: "ORD-10234", area: "Nugegoda", vehicle: "VEH008", brand: "Fresh", eta: "07:42", closes: "08:00", note: "Tight · 18 min margin", level: "Tight" as const, outlet: "Nugegoda Fresh Mart", cause: "Previous stop ran long; remaining drive time leaves an 18 minute margin." },
];

export type DeferReason = "Refrigerated capacity unavailable" | "Delivery window cannot be met" | "Van-only access · no van free" | "Vehicle capacity unavailable" | "Weekly fuel quota reached";
export type Deferred = { id: string; outlet: string; brand: Segment; reason: DeferReason; window: string; previous: number; lastServed: string };

export const seedDeferred: Deferred[] = [
  ["ORD-10288", "Nugegoda Fresh Mart", "Fresh", "Refrigerated capacity unavailable", "05:30–08:00", 0, "Sat, 26 Sep"],
  ["ORD-10292", "Wattala Fresh Market", "Fresh", "Refrigerated capacity unavailable", "05:00–07:30", 0, "Sat, 26 Sep"],
  ["ORD-10295", "Kiribathgoda Fresh", "Fresh", "Delivery window cannot be met", "05:30–07:00", 2, "Tue, 22 Sep"],
  ["ORD-10297", "Maharagama Fresh", "Fresh", "Van-only access · no van free", "06:00–08:00", 0, "Fri, 25 Sep"],
  ["ORD-10301", "Kaduwela Style Outlet", "Style", "Vehicle capacity unavailable", "10:00–14:00", 1, "Thu, 24 Sep"],
  ["ORD-10305", "Colombo Tech Store", "Tech", "Weekly fuel quota reached", "09:00–17:00", 0, "Fri, 25 Sep"],
  ["ORD-10307", "Borella Fresh Point", "Fresh", "Refrigerated capacity unavailable", "05:30–08:00", 1, "Thu, 24 Sep"],
  ["ORD-10310", "Gampaha Style Hub", "Style", "Vehicle capacity unavailable", "08:00–10:00", 0, "Sat, 26 Sep"],
  ["ORD-10312", "Ja-Ela Fresh Corner", "Fresh", "Refrigerated capacity unavailable", "05:30–07:30", 0, "Sat, 26 Sep"],
  ["ORD-10314", "Kelaniya Fresh Stop", "Fresh", "Refrigerated capacity unavailable", "06:00–08:00", 0, "Fri, 25 Sep"],
  ["ORD-10318", "Dehiwala Fresh Market", "Fresh", "Refrigerated capacity unavailable", "05:00–07:00", 0, "Sat, 26 Sep"],
  ["ORD-10321", "Moratuwa Fresh Plaza", "Fresh", "Refrigerated capacity unavailable", "05:30–08:00", 0, "Fri, 25 Sep"],
  ["ORD-10323", "Battaramulla Fresh", "Fresh", "Delivery window cannot be met", "05:00–06:30", 0, "Sat, 26 Sep"],
  ["ORD-10326", "Negombo Style Store", "Style", "Vehicle capacity unavailable", "09:00–13:00", 0, "Sat, 26 Sep"],
  ["ORD-10329", "Kadawatha Tech Point", "Tech", "Vehicle capacity unavailable", "10:00–15:00", 0, "Fri, 25 Sep"],
].map(([id, outlet, brand, reason, window, previous, lastServed]) => ({ id, outlet, brand, reason, window, previous, lastServed }) as Deferred);

export type AccessRequest = { id: string; name: string; role: "Loader" | "Driver"; employeeId: string; username: string; depot: string; dock: string; mobile: string; submitted: string; submittedShort: string; status: "Pending" | "Approved" | "Declined"; note: string };

export const seedRequests: AccessRequest[] = [
  { id: "AR-0142", name: "Ruwan Perera", role: "Loader", employeeId: "WP-LD-0142", username: "r.perera", depot: "Peliyagoda", dock: "Dock 3", mobile: "+94 77 123 4567", submitted: "Mon 28 Sep · 09:18", submittedShort: "Submitted 09:18 today", status: "Pending", note: "Staff record found. Confirm the employee and requested role before approval." },
  { id: "AR-0143", name: "Ishara Fernando", role: "Driver", employeeId: "WP-DR-0217", username: "i.fernando", depot: "Peliyagoda", dock: "Fleet bay B", mobile: "+94 71 884 2019", submitted: "Mon 28 Sep · 08:51", submittedShort: "Submitted 08:51 today", status: "Pending", note: "Staff record found. Licence class C1 on file — confirm before granting driver access." },
  { id: "AR-0144", name: "Kasun Wijesinghe", role: "Loader", employeeId: "WP-LD-0155", username: "k.wijesinghe", depot: "Kandy Regional Hub", dock: "Dock 1", mobile: "+94 76 330 9182", submitted: "Mon 28 Sep · 07:40", submittedShort: "Submitted 07:40 today", status: "Pending", note: "Staff record found. Requested depot differs from home depot — confirm transfer." },
  ...["Nadeesha Silva", "Tharindu Jayasena", "Malith Gunawardena", "Sanduni Herath", "Chathura Peiris", "Amaya Ratnayake", "Dilan Abeysekara", "Hiruni Senanayake", "Pasan Karunaratne", "Ravindu Mendis", "Sachini Kumari", "Janith Liyanage"].map((name, i): AccessRequest => ({
    id: `AR-01${String(29 + i).padStart(2, "0")}`, name, role: i % 3 === 0 ? "Driver" : "Loader", employeeId: `WP-${i % 3 === 0 ? "DR" : "LD"}-0${120 + i}`, username: name.toLowerCase().replace(/^(\w)\w* /, "$1."), depot: i % 4 === 3 ? "Kandy Regional Hub" : "Peliyagoda",
    dock: `Dock ${1 + (i % 4)}`, mobile: `+94 7${i % 8} ${400 + i * 7} ${1000 + i * 131}`, submitted: `${["Fri 25", "Sat 26", "Sun 27"][i % 3]} Sep · ${String(8 + (i % 9)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}`,
    submittedShort: `Reviewed ${["Fri", "Sat", "Sun"][i % 3]}`, status: i % 5 === 4 ? "Declined" : "Approved", note: "",
  })),
];

export const weeks = Array.from({ length: 10 }, (_, i) => `Week ${i + 1}`);
export const projectedVolume = [410, 425, 440, 465, 520, 505, 440, 435, 430, 455];
export const chilledDemand = [150, 156, 162, 168, 198, 190, 165, 160, 158, 166];
export const brandShare: Record<"All" | Segment, number> = { All: 1, Fresh: 0.62, Style: 0.22, Tech: 0.16 };

export function minutes(time: string) { const [h, m] = time.split(":").map(Number); return h * 60 + m; }
