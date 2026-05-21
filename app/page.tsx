"use client";

import { useMemo, useState } from "react";
import type { ItineraryResult, Day, DayPart, FlightLeg, HotelInfo, Place, VisaInfo } from "@/lib/itinerary/schema";
import { SEED, DESTINATION_LIST } from "@/lib/seed";

const INTERESTS = ["Beach", "Sightseeing", "Shopping", "Family", "Adventure", "Wildlife", "Wellness", "Culture", "Temples", "Food"];

const KIND_ICON: Record<string, string> = {
  travel: "✈️", transfer: "🚐", checkin: "🏨", sightseeing: "🏛️",
  activity: "🎟️", leisure: "🌴", cruise: "⛵", meal: "🍽️",
};
const SLOT_ICON: Record<string, string> = { Morning: "🌅", Afternoon: "☀️", Evening: "🌙" };

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

/** A computed client-facing quote (base + agent markup). */
interface Quote {
  base: number;
  pax: number;
  markupPct: number;
  markupAmt: number;
  total: number;
  perPerson: number;
}

/** Locked-scenario summary, derived client-side from the seed. */
function scenarioOf(key: string) {
  const s = SEED[key] ?? SEED.thailand;
  const start = new Date(s.startDate + "T00:00:00Z");
  const end = new Date(s.startDate + "T00:00:00Z");
  end.setUTCDate(end.getUTCDate() + s.nights);
  const f = (d: Date) => d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const pax = s.pax.adults + s.pax.children + s.pax.infants;
  return {
    nights: s.nights,
    days: s.nights + 1,
    dateRange: `${f(start)} – ${f(end)}`,
    pax,
    group: `${s.pax.adults} adults · ${s.pax.children} children`,
    route: s.cities.map((c) => c.name).join(" → "),
  };
}

export default function Page() {
  const [f, setF] = useState({
    clientName: "Rajesh Shah",
    clientPhone: "+91 98250 11111",
    email: "",
    destinationKey: "thailand",
    diet: "veg",
    groupType: "family",
    specialRequests: "",
  });
  const [interests, setInterests] = useState<string[]>(["Family", "Beach", "Sightseeing"]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<ItineraryResult | null>(null);
  const [markupStr, setMarkupStr] = useState("12");

  const up = (k: string, v: any) => setF((s) => ({ ...s, [k]: v }));
  const scenario = useMemo(() => scenarioOf(f.destinationKey), [f.destinationKey]);

  // ── Agent markup (client-side only — never sent to the API or the PDF) ──
  const markupPct = Math.max(0, parseFloat(markupStr) || 0);
  const quote: Quote | null = useMemo(() => {
    if (!result) return null;
    const base = result.pricing.totalINR;
    const pax = result.pricing.pax || 1;
    const markupAmt = Math.round(base * markupPct / 100);
    const total = base + markupAmt;
    return { base, pax, markupPct, markupAmt, total, perPerson: Math.round(total / pax) };
  }, [result, markupPct]);

  async function generate() {
    setErr(null); setLoading(true); setResult(null); setMarkupStr("12");
    try {
      const { email, ...rest } = f;
      const r = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...rest,
          ...(email && email.trim() ? { email: email.trim() } : {}),
          interests,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detail || j.error || "Failed to build itinerary");
      setResult(j as ItineraryResult);
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Native browser print → "Save as PDF". Real pagination, real images,
  // crisp vector text. The @media print stylesheet hides the app chrome and
  // the markup panel so only the client brochure (.doc) is printed.
  function downloadPDF() {
    if (!result) return;
    const prev = document.title;
    document.title = `RiseAndShine_${result.meta.destinationName}_${f.clientName}`.replace(/\s+/g, "_");
    const restore = () => {
      document.title = prev;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  }

  function whatsapp() {
    if (!result || !quote) return;
    let n = f.clientPhone.replace(/\D/g, "");
    if (n.length === 10) n = "91" + n;
    const msg = `Dear ${f.clientName.split(" ")[0]}, here is your customised ${result.meta.destinationName} itinerary from Rise & Shine Travel — ${result.meta.dateRangeLabel}, ${inr(quote.perPerson)} per person.`;
    window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  }

  return (
    <>
      <header className="topbar">
        <a className="logo" href="https://www.riseandshinetravel.com/" target="_blank" rel="noopener noreferrer">
          <img className="brand-img" src="/assets/logo.png" alt="Rise & Shine Travel" />
          <div className="wm">
            <b>Rise &amp; Shine</b>
            <span>TRAVEL · AHMEDABAD</span>
          </div>
        </a>
        <div className="topdiv" />
        <div className="toptitle">
          <b>AI Itinerary Generator</b>
          <span>Client-ready itineraries · v3.0</span>
        </div>
        <div className="topright">
          <div className="certbadge">IATTE · ADTOI · Gujarat Tourism</div>
        </div>
      </header>

      <div className="layout">
        <aside className="form-panel">
          <div className="formhead">
            <div className="hd-left">
              <div className="eyebrow">Build a trip</div>
              <h2>Plan the journey</h2>
            </div>
            <p>Fill the client brief — a branded, client-ready itinerary in seconds.</p>
          </div>

          <div className="formbody">
            <div className="formcols">
              <div className="formcol">
                <div className="section-title"><span className="st-ic">👤</span>Client</div>
                <div className="fg"><label>Client name</label>
                  <input value={f.clientName} onChange={(e) => up("clientName", e.target.value)} /></div>
                <div className="fg"><label>Contact (WhatsApp)</label>
                  <input value={f.clientPhone} onChange={(e) => up("clientPhone", e.target.value)} /></div>
                <div className="fg"><label>Email <span className="opt-lbl">(optional)</span></label>
                  <input type="email" placeholder="client@example.com" value={f.email}
                    onChange={(e) => up("email", e.target.value)} /></div>
              </div>

              <div className="formcol">
                <div className="section-title"><span className="st-ic">📍</span>Destination</div>
                <div className="fg"><label>Package</label>
                  <select value={f.destinationKey} onChange={(e) => up("destinationKey", e.target.value)}>
                    {DESTINATION_LIST.map((d) => (
                      <option key={d.key} value={d.key}>{d.flag} {d.title}</option>
                    ))}
                  </select></div>
                <div className="scenario">
                  <div className="sc-row"><span>Route</span><b>{scenario.route}</b></div>
                  <div className="sc-row"><span>Duration</span><b>{scenario.nights} nights / {scenario.days} days</b></div>
                  <div className="sc-row"><span>Travel dates</span><b>{scenario.dateRange}</b></div>
                  <div className="sc-row"><span>Travellers</span><b>{scenario.group}</b></div>
                  <div className="sc-row"><span>Departing</span><b>Ahmedabad (AMD)</b></div>
                </div>
              </div>

              <div className="formcol">
                <div className="section-title"><span className="st-ic">🧭</span>Preferences</div>
                <div className="row2">
                  <div className="fg"><label>Dietary preference</label>
                    <select value={f.diet} onChange={(e) => up("diet", e.target.value)}>
                      <option value="veg">Vegetarian</option>
                      <option value="jain">Jain</option>
                      <option value="non-veg">Non-Vegetarian</option>
                      <option value="mixed">Mixed</option>
                    </select></div>
                  <div className="fg"><label>Traveller profile</label>
                    <select value={f.groupType} onChange={(e) => up("groupType", e.target.value)}>
                      <option value="family">Family</option>
                      <option value="honeymoon">Honeymoon</option>
                      <option value="solo">Solo traveller</option>
                      <option value="bikers">Bike riders</option>
                    </select></div>
                </div>
                <div className="fg"><label>Interests</label>
                  <div className="chips">
                    {INTERESTS.map((i) => (
                      <span key={i} className={"chip" + (interests.includes(i) ? " on" : "")}
                        onClick={() => setInterests((s) => s.includes(i) ? s.filter((x) => x !== i) : [...s, i])}>{i}</span>
                    ))}
                  </div></div>
                <div className="fg"><label>Special requests / notes <span className="opt-lbl">(optional)</span></label>
                  <textarea rows={3} maxLength={600}
                    placeholder="e.g. Anniversary trip — surprise element. Client's mother is 68, needs an easy walking pace. Kids nervous around water."
                    value={f.specialRequests} onChange={(e) => up("specialRequests", e.target.value)} /></div>
              </div>
            </div>

            <div className="formfoot">
              <div className="ff-cta">
                <button className="btn btn-primary" disabled={loading} onClick={generate}>
                  {loading
                    ? <><span className="spin" />&nbsp;Building itinerary…</>
                    : <><svg className="cta-ic" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 6.3L20.5 10l-6.3 2.2L12 18l-2.2-5.8L3.5 10l6.3-1.7z" /></svg>Generate Itinerary</>}
                </button>
                <div className="gennote">Branded · client-ready · about a minute</div>
                {err && <p className="err">⚠ {err}</p>}
              </div>
            </div>
          </div>
        </aside>

        <main className="preview-panel">
          {!result && !loading && (
            <div className="empty">
              <div className="ic">🗺️</div>
              <h2>No itinerary yet</h2>
              <p>Pick a package, fill the client brief and hit <b>Generate</b>. A branded, client-ready
                itinerary — with a real visa section, transparent pricing and a day-by-day plan — appears here.</p>
            </div>
          )}
          {loading && (
            <div className="empty">
              <div className="ic"><span className="spin" /></div>
              <h2>Building the itinerary…</h2>
              <p>Composing the day-by-day plan. About a minute.</p>
            </div>
          )}
          {result && quote && (
            <Itinerary
              r={result} quote={quote}
              markupStr={markupStr} onMarkup={setMarkupStr}
              onPDF={downloadPDF} onWA={whatsapp} />
          )}
        </main>
      </div>
    </>
  );
}

/* ════════════════════════ BROCHURE ════════════════════════ */

function Stars({ n }: { n: number }) {
  return <span className="stars">{"★".repeat(n)}{"☆".repeat(Math.max(0, 5 - n))}</span>;
}

function PageHead({ section }: { section: string }) {
  return (
    <div className="ph">
      <div className="l"><img src="/assets/logo.png" alt="" />Rise &amp; Shine Travel</div>
      <div className="pn">{section}</div>
    </div>
  );
}

function Itinerary({ r, quote, markupStr, onMarkup, onPDF, onWA }: {
  r: ItineraryResult;
  quote: Quote;
  markupStr: string;
  onMarkup: (v: string) => void;
  onPDF: () => void; onWA: () => void;
}) {
  const visaPhrase =
    r.visa.status === "free" ? "Visa-free — TDAC handled by us"
    : r.visa.status === "required" ? "Visa included in package"
    : "No visa required";

  return (
    <>
      <div className="toolbar">
        <div>
          <div className="tb-title">{r.meta.flag} {r.meta.title}</div>
          <div className="tb-sub">{r.meta.dateRangeLabel} · {r.meta.groupLabel} · {inr(quote.perPerson)} per person</div>
        </div>
        <div className="acts">
          <button type="button" className="ba" onClick={onWA}>📱 Send on WhatsApp</button>
          <button type="button" className="ba dl" onClick={onPDF}>⬇ Download Client PDF</button>
        </div>
      </div>

      {/* ── INTERNAL agent control — hidden in @media print, never in the PDF ── */}
      <MarkupPanel quote={quote} markupStr={markupStr} onMarkup={onMarkup} onDownload={onPDF} />

      <div className="doc">
        {/* ── Cover ── */}
        <div className="cover">
          <div className="bc">
            <div className="brand-logo-chip"><img src="/assets/logo.png" alt="Rise & Shine" /></div>
            <div><h3>Rise &amp; Shine Travel</h3><p>Ahmedabad · IATTE · BNI · ADTOI · Gujarat Tourism</p></div>
          </div>
          <div className="tag">Customised Itinerary · Prepared for {r.meta.clientName}</div>
          <h1>{r.meta.flag} {r.meta.title}</h1>
          <div className="sub">{r.meta.tagline}</div>
          <div className="grid">
            <div className="gi"><div className="l">Travel dates</div><div className="v">{r.meta.dateRangeLabel}</div></div>
            <div className="gi"><div className="l">Duration</div><div className="v">{r.meta.nights}N / {r.meta.days}D</div></div>
            <div className="gi"><div className="l">Travellers</div><div className="v">{r.meta.groupLabel}</div></div>
            <div className="gi"><div className="l">Per person</div><div className="v">{inr(quote.perPerson)}</div></div>
          </div>
        </div>

        {/* ── Pricing — client sees ONLY the final quote, never the base or markup ── */}
        <div className="page">
          <PageHead section="Package Price" />
          <div className="h2">Indicative Package Price</div>
          <div className="subm">Everything below is included in your package — one transparent price.</div>
          <div className="incl">
            {r.pricing.lines.map((l, i) => (
              <div className="incl-item" key={i}><span className="tick">✓</span>{l.label}</div>
            ))}
            <div className="incl-item"><span className="tick">✓</span>Rise &amp; Shine planning &amp; on-trip support</div>
          </div>
          <div className="pricebox">
            <div className="pb-row">
              <div className="pb-l">Total package · {quote.pax} travellers</div>
              <div className="pb-a">{inr(quote.total)}</div>
            </div>
            <div className="pb-div" />
            <div className="pb-row">
              <div className="pb-l">Per person · {quote.pax} sharing</div>
              <div className="pb-a pp">{inr(quote.perPerson)}</div>
            </div>
          </div>
          <div className="banner">
            Approx. {inr(quote.perPerson)} per person · {quote.pax} sharing · {visaPhrase} ·
            All prices indicative — confirmed exactly on the booking call · Subject to availability.
          </div>
        </div>

        {/* ── Visa ── */}
        <VisaSection v={r.visa} />

        {/* ── Flights ── */}
        <div className="page">
          <PageHead section="Flights" />
          <div className="h2">Your Flights · from {r.meta.originCity}</div>
          <div className="subm">{r.flights.note}</div>
          {r.flights.legs.map((l, i) => <FlightCard key={i} l={l} />)}
        </div>

        {/* ── Hotels ── */}
        <div className="page">
          <PageHead section="Your Stay" />
          <div className="h2">Where You Stay</div>
          <div className="subm">Hand-picked 4★ stays — each one chosen, not auto-listed.</div>
          {r.hotels.map((h, i) => <HotelCard key={i} h={h} />)}
        </div>

        {/* ── Day by day ── */}
        <div className="page">
          <PageHead section="Day-by-Day Plan" />
          <div className="h2">Your Day-by-Day Journey</div>
          <div className="subm">A clear morning / afternoon / evening plan — built around your family's pace.</div>
          {r.days.map((d) => <DayCard key={d.dayIndex} d={d} />)}
        </div>

        {/* ── Intel ── */}
        <div className="page">
          <PageHead section="Traveller Intel" />
          <div className="h2">Local Know-How</div>
          <div className="subm">The things a good agent tells you — what to do, what to skip, what not to miss.</div>
          <div className="intel">
            <div className="ic do"><h4>✅ Do</h4><ul>{r.intel.do.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            <div className="ic sk"><h4>⛔ Skip</h4><ul>{r.intel.skip.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            <div className="ic ms"><h4>⭐ Don&apos;t miss</h4><ul>{r.intel.miss.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
          </div>
          <div className="idiet">🍃 <b>Matched to your {r.meta.dietLabel.toLowerCase()} preference:</b> {r.intel.diet}</div>
        </div>

        <div className="foot">
          <div><span className="iata">IATTE</span> Rise &amp; Shine Travel · Ahmedabad</div>
          <div>+91-79-2329 7232 · info@riseandshinetravel.com</div>
        </div>
      </div>
    </>
  );
}

/** Internal-only markup tool. Lives OUTSIDE the PDF capture region. */
function MarkupPanel({ quote, markupStr, onMarkup, onDownload }: {
  quote: Quote; markupStr: string; onMarkup: (v: string) => void; onDownload: () => void;
}) {
  return (
    <div className="markup-panel">
      <div className="mk-head">
        <div className="mk-title">🔒 Agent Markup</div>
        <div className="mk-internal">Internal · never shown to the client</div>
      </div>
      <div className="mk-grid">
        <div className="mk-calc">
          <div className="mk-row">
            <span className="mk-l">Base package cost</span>
            <span className="mk-v">{inr(quote.base)}</span>
          </div>
          <div className="mk-row">
            <span className="mk-l">Your markup</span>
            <span className="mk-input">
              <input type="number" min={0} step={0.5} value={markupStr}
                onChange={(e) => onMarkup(e.target.value)} />
              <span className="mk-pct">%</span>
            </span>
          </div>
          <div className="mk-row">
            <span className="mk-l">Markup amount</span>
            <span className="mk-v gold">+ {inr(quote.markupAmt)}</span>
          </div>
        </div>
        <div className="mk-quote">
          <div className="mk-q-eyebrow">Final client quote</div>
          <div className="mk-q-total">{inr(quote.total)}</div>
          <div className="mk-q-pp">{inr(quote.perPerson)} per person · {quote.pax} sharing</div>
          <div className="mk-q-margin">
            <span>Your margin on this trip</span>
            <b>{inr(quote.markupAmt)}</b>
          </div>
        </div>
      </div>
      <div className="mk-footbar">
        <button type="button" className="mk-btn" onClick={onDownload}>
          ⬇ Apply &amp; Download Client PDF
        </button>
        <div className="mk-foot">The client PDF carries only the final quote — base cost and markup never leave this panel.</div>
      </div>
    </div>
  );
}

function VisaSection({ v }: { v: VisaInfo }) {
  const tone = v.status === "free" ? "ok" : v.status === "required" ? "warn" : "neutral";
  return (
    <div className="page">
      <PageHead section="Visa & Entry" />
      <div className="h2">Visa &amp; Entry Requirements</div>
      <div className={"visa-status " + tone}>
        <span className="vs-badge">{v.statusLabel}</span>
        <span className="vs-type">{v.type}</span>
      </div>
      <div className="visa-grid">
        <div className="vg"><div className="l">Visa fee</div><div className="v">{v.feeLabel}</div></div>
        <div className="vg"><div className="l">Stay permitted</div><div className="v">{v.stay}</div></div>
        <div className="vg"><div className="l">Processing time</div><div className="v">{v.processing}</div></div>
      </div>

      {v.mandatory && (
        <div className="visa-mandatory">
          <div className="vm-h">⚠ Mandatory — {v.mandatory.title}</div>
          <p>{v.mandatory.detail}</p>
        </div>
      )}

      <div className="visa-cols">
        <div className="vc">
          <div className="vc-h">📋 Documents to carry</div>
          <ul>{v.documents.map((d, i) => <li key={i}>{d}</li>)}</ul>
        </div>
        <div className="vc handles">
          <div className="vc-h">🤝 Rise &amp; Shine handles this</div>
          <ul>{v.riseShineHandles.map((d, i) => <li key={i}>{d}</li>)}</ul>
        </div>
      </div>
      {v.note && <div className="visa-note">{v.note}</div>}
    </div>
  );
}

function FlightCard({ l }: { l: FlightLeg }) {
  return (
    <div className="fleg-card">
      <div className="fl-head">
        <span className="fl-label">{l.label}</span>
        <span className="fl-airline">{l.airline} · {l.flightNo}</span>
        <span className="fl-date">{l.dateLabel}</span>
      </div>
      <div className="fl-route">
        <div className="fl-end">
          <div className="fl-code">{l.fromCode}</div>
          <div className="fl-time">{l.depTime}</div>
          <div className="fl-city">{l.fromCity}</div>
        </div>
        <div className="fl-mid">
          <div className="fl-dur">{l.duration}</div>
          <div className="fl-line"><span /></div>
          <div className="fl-stops">{l.stops}</div>
        </div>
        <div className="fl-end r">
          <div className="fl-code">{l.toCode}</div>
          <div className="fl-time">{l.arrTime}</div>
          <div className="fl-city">{l.toCity}</div>
        </div>
      </div>
      <div className="fl-meta">{l.cabin} · Baggage {l.baggage}</div>
    </div>
  );
}

function HotelCard({ h }: { h: HotelInfo }) {
  return (
    <div className="hcard">
      <iframe className="map" loading="lazy"
        src={`https://www.google.com/maps?q=${h.lat},${h.lng}&z=14&output=embed`} title={h.name} />
      <div className="bd">
        <div className="h-top">
          <div>
            <div className="nm">{h.name}</div>
            <div className="ar">{h.area}</div>
          </div>
          <span className={"h-kind" + (h.kind === "houseboat" ? " boat" : "")}>
            {h.kind === "houseboat" ? "⛵ Houseboat" : "🏨 Hotel"}
          </span>
        </div>
        <div className="h-line"><Stars n={h.stars} /><span className="h-nights">{h.dateLabel} · {h.nights} night{h.nights > 1 ? "s" : ""}</span></div>
        <p className="h-why">{h.why}</p>
        <div className="h-amen">{h.amenities.map((a, i) => <span key={i} className="amen">{a}</span>)}</div>
        <a className="lnk" href={`https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lng}`}
          target="_blank" rel="noopener">📍 View location</a>
      </div>
    </div>
  );
}

function DayCard({ d }: { d: Day }) {
  return (
    <div className="day">
      <div className="dhead">
        <div className="dh-left">
          <span className="dn">DAY {d.dayIndex + 1}</span>
          <span className="dt">{d.headline}</span>
        </div>
        <div className="dd">{d.weekday}, {d.dateLabel} · {d.cityLabel}</div>
      </div>
      {d.efficiency && <div className="effic">🧭 <b>Travel-smart:</b> {d.efficiency}</div>}
      <div className="dparts">
        {d.parts.map((p, i) => <PartRow key={i} p={p} />)}
      </div>
      {d.dining.length > 0 && (
        <div className="ddining">
          <div className="dd-h">🍽️ Dining today · diet-matched, choose one</div>
          <div className="dd-opts">
            {d.dining.map((p, i) => <DiningChip key={i} p={p} />)}
          </div>
        </div>
      )}
      {d.skip.length > 0 && (
        <div className="skip">
          <div className="sl">⛔ Skip today</div>
          <ul>{d.skip.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

function PartRow({ p }: { p: DayPart }) {
  const hero = p.place?.photoUrl ?? null;
  return (
    <div className={"dpart" + (hero ? " has-hero" : "")}>
      <div className="dp-slot">
        <span className="dp-sic">{SLOT_ICON[p.slot]}</span>
        <span className="dp-sl">{p.slot}</span>
      </div>
      <div className="dp-body">
        {hero && (
          <a className="dp-hero" href={p.place!.mapsUrl} target="_blank" rel="noopener">
            <img src={hero} alt={p.place!.name} loading="lazy" />
            {p.place!.rating != null && <span className="dp-rate">★ {p.place!.rating.toFixed(1)}</span>}
          </a>
        )}
        <div className="dp-title">
          <span className="dp-kic">{KIND_ICON[p.kind] ?? "•"}</span>
          {p.title}
        </div>
        <div className="dp-detail">{p.detail}</div>
        {p.place && (
          <a className="dp-map" href={p.place.mapsUrl} target="_blank" rel="noopener">
            📍 {p.place.name} — view on map
          </a>
        )}
      </div>
    </div>
  );
}

function DiningChip({ p }: { p: Place }) {
  return (
    <a className="dchip" href={p.mapsUrl} target="_blank" rel="noopener">
      {p.photoUrl
        ? <img src={p.photoUrl} alt={p.name} loading="lazy" />
        : <div className="dchip-fb">🍽️</div>}
      <div className="dchip-b">
        <div className="dchip-n">{p.name}</div>
        <div className="dchip-m">{p.tag}{p.rating != null ? ` · ★ ${p.rating.toFixed(1)}` : ""}</div>
      </div>
    </a>
  );
}
