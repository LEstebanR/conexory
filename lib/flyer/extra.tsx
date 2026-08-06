import type { ReactElement } from "react"
import {
  PAD,
  CANVAS,
  INK,
  BODY,
  type FlyerData,
  has,
  bigTitle,
  featureList,
  featureRow,
  locationLine,
  photo,
  photoCard,
  priceBox,
  footerBar,
  descriptionText,
  highlightBadge,
  truncate,
} from "./shared"

function features(d: FlyerData, count = 4) {
  return has(d, "caracteristicas") ? featureList(d.property).slice(0, count) : []
}

export function templateEditorial(d: FlyerData): ReactElement {
  const specs = features(d, 3)
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#171717" }}>
      <div style={{ display: "flex", flexDirection: "column", padding: `${PAD}px ${PAD}px 28px`, color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: d.accentColor, letterSpacing: 5, textTransform: "uppercase" }}>Conexory / 01</span>
          {highlightBadge(d, 17, 380)}
        </div>
        <div style={{ display: "flex", marginTop: 30 }}>
          <span style={{ fontSize: 82, fontWeight: 900, color: "#fff", letterSpacing: -4, lineHeight: 0.98, textTransform: "uppercase" }}>{d.typeLabel}</span>
        </div>
        {d.transactionLabel && <span style={{ fontSize: 38, fontWeight: 700, color: d.accentColor, textTransform: "uppercase", marginTop: 8 }}>en {d.transactionLabel}</span>}
      </div>
      <div style={{ display: "flex", position: "relative", height: 590, padding: `0 ${PAD}px` }}>
        {photo(d.photos[0], { width: "100%", height: "100%", borderRadius: 4 })}
        <div style={{ display: "flex", position: "absolute", left: PAD + 28, bottom: 28, background: "#fff", padding: "18px 24px", borderRadius: 2 }}>
          <span style={{ fontSize: 27, fontWeight: 900, color: INK, textTransform: "uppercase" }}>{truncate(locationLine(d.property), 34)}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, padding: "28px 48px 0", background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
          <div style={{ display: "flex", gap: 28 }}>{specs.map((f, i) => <div key={i} style={{ display: "flex" }}>{featureRow(f, 21)}</div>)}</div>
          {priceBox(d, 42)}
        </div>
        {descriptionText(d, 150, 20) && <div style={{ display: "flex", marginTop: 24 }}>{descriptionText(d, 150, 20)}</div>}
      </div>
      {footerBar(d)}
    </div>
  )
}

export function templatePoster(d: FlyerData): ReactElement {
  const specs = features(d, 4)
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: d.accentColor }}>
      <div style={{ display: "flex", position: "relative", height: 820 }}>
        {photo(d.photos[0], { width: "100%", height: "100%" })}
        <div style={{ display: "flex", position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.82) 100%)" }} />
        <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: PAD, right: PAD, bottom: 46 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: 4, textTransform: "uppercase" }}>{d.typeLabel} · {d.transactionLabel ?? "propiedad"}</span>
          <span style={{ fontSize: 76, fontWeight: 900, color: "#fff", letterSpacing: -3, lineHeight: 0.98, textTransform: "uppercase", marginTop: 16 }}>{truncate(d.property.title, 38)}</span>
          <span style={{ fontSize: 26, fontWeight: 700, color: "#fff", marginTop: 20 }}>{truncate(locationLine(d.property), 44)}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, background: "#fff", padding: `${PAD}px` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>{priceBox(d, 44)}{highlightBadge(d, 17, 380)}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 30 }}>{specs.map((f, i) => <div key={i} style={{ display: "flex", background: CANVAS, padding: "14px 20px", borderRadius: 3 }}>{featureRow(f, 20)}</div>)}</div>
      </div>
      {footerBar(d)}
    </div>
  )
}

export function templateSplit(d: FlyerData): ReactElement {
  const specs = features(d, 5)
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: CANVAS }}>
      <div style={{ display: "flex", flexDirection: "column", width: "56%", background: "#fff" }}>
        {photoCard(d.photos[0], { width: "100%", height: 640, borderRadius: 0, boxShadow: "none", padding: 0 }, 0)}
        {d.photos[1] && photo(d.photos[1], { width: "100%", height: 250, marginTop: 10 })}
        <div style={{ display: "flex", padding: "30px 38px", marginTop: "auto" }}>{footerBar(d)}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: "44%", padding: "70px 34px 0", background: d.accentColor }}>
        <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: 4, color: d.accentOnColor, textTransform: "uppercase" }}>Disponible</span>
        <span style={{ fontSize: 62, fontWeight: 900, color: d.accentOnColor, lineHeight: 0.98, letterSpacing: -3, textTransform: "uppercase", marginTop: 26 }}>{d.typeLabel}</span>
        {d.transactionLabel && <span style={{ fontSize: 34, fontWeight: 700, color: d.accentOnColor, textTransform: "uppercase", marginTop: 8 }}>en {d.transactionLabel}</span>}
        {d.options.highlight && <div style={{ display: "flex", alignSelf: "flex-start", marginTop: 24, borderLeft: `5px solid ${d.accentOnColor}`, paddingLeft: 16 }}><span style={{ fontSize: 20, fontWeight: 900, color: d.accentOnColor, lineHeight: 1.25 }}>{truncate(d.options.highlight, 40)}</span></div>}
        <div style={{ display: "flex", height: 4, width: 70, background: d.accentOnColor, marginTop: 34 }} />
        <span style={{ fontSize: 28, fontWeight: 900, color: d.accentOnColor, lineHeight: 1.05, marginTop: 30 }}>{truncate(d.property.title, 48)}</span>
        <span style={{ fontSize: 21, fontWeight: 700, color: d.accentOnColor, marginTop: 18 }}>{truncate(locationLine(d.property), 38)}</span>
        {has(d, "precio") && <div style={{ display: "flex", marginTop: 48 }}>{priceBox(d, 36)}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: "auto", paddingBottom: 56 }}>{specs.map((f, i) => <div key={i} style={{ display: "flex", background: "rgba(255,255,255,0.16)", padding: "14px 16px", borderRadius: 2 }}>{featureRow(f, 18)}</div>)}</div>
      </div>
    </div>
  )
}

export function templateGallery(d: FlyerData): ReactElement {
  const specs = features(d, 3)
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#fff", padding: PAD }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}><div style={{ display: "flex", flexDirection: "column" }}>{bigTitle(d, 50)}<span style={{ fontSize: 23, fontWeight: 700, color: BODY, marginTop: 16 }}>{truncate(locationLine(d.property), 44)}</span>{d.options.highlight && <span style={{ fontSize: 20, fontWeight: 900, color: d.primaryTextColor, marginTop: 18, textTransform: "uppercase" }}>· {truncate(d.options.highlight, 42)}</span>}</div>{priceBox(d, 36)}</div>
      <div style={{ display: "flex", gap: 14, height: 700, marginTop: 34 }}>
        <div style={{ display: "flex", width: "60%" }}>{photo(d.photos[0], { width: "100%", height: "100%", borderRadius: 3 })}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "40%" }}>{d.photos.slice(1, 4).map((src, i) => photo(src, { width: "100%", height: 224, borderRadius: 3 }, i))}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 30, marginTop: 30 }}>{specs.map((f, i) => <div key={i} style={{ display: "flex" }}>{featureRow(f, 20)}</div>)}</div>
      <div style={{ display: "flex", marginTop: "auto" }}>{footerBar(d)}</div>
    </div>
  )
}

export function templateMinimal(d: FlyerData): ReactElement {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#fafaf8", padding: PAD }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18 }}><span style={{ fontSize: 24, fontWeight: 900, color: INK, letterSpacing: -1 }}>conexory</span>{d.options.highlight ? <span style={{ maxWidth: 390, fontSize: 19, fontWeight: 900, color: d.primaryTextColor, textAlign: "right", textTransform: "uppercase" }}>{truncate(d.options.highlight, 48)}</span> : <span style={{ fontSize: 19, fontWeight: 700, color: BODY }}>01 / propiedad</span>}</div>
      <div style={{ display: "flex", marginTop: 36, height: 620 }}>{photo(d.photos[0], { width: "100%", height: "100%", borderRadius: 0 })}</div>
      <span style={{ fontSize: 70, fontWeight: 900, color: d.primaryTextColor, letterSpacing: -3, lineHeight: 0.98, textTransform: "uppercase", marginTop: 34 }}>{truncate(d.property.title, 38)}</span>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 28 }}><div style={{ display: "flex", flexDirection: "column", gap: 12 }}><span style={{ fontSize: 24, fontWeight: 700, color: BODY }}>{truncate(locationLine(d.property), 40)}</span>{descriptionText(d, 155, 19)}</div>{priceBox(d, 38)}</div>
      <div style={{ display: "flex", marginTop: "auto" }}>{footerBar(d)}</div>
    </div>
  )
}

export function templateBrutalist(d: FlyerData): ReactElement {
  const specs = features(d, 4)
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#fff", padding: 38 }}>
      <div style={{ display: "flex", border: `8px solid ${INK}`, padding: "18px 20px", justifyContent: "space-between", gap: 18 }}><span style={{ fontSize: 27, fontWeight: 900, color: INK, textTransform: "uppercase" }}>Venta / Arriendo</span>{d.options.highlight ? <span style={{ maxWidth: 370, fontSize: 19, fontWeight: 900, color: d.accentColor, textAlign: "right", textTransform: "uppercase" }}>{truncate(d.options.highlight, 42)}</span> : <span style={{ fontSize: 27, fontWeight: 900, color: d.accentColor }}>CONEXORY</span>}</div>
      <div style={{ display: "flex", position: "relative", marginTop: 28, height: 640, border: `8px solid ${INK}` }}>{photo(d.photos[0], { width: "100%", height: "100%" })}<div style={{ display: "flex", position: "absolute", left: 22, bottom: 22, background: d.accentColor, padding: "15px 20px" }}><span style={{ fontSize: 23, fontWeight: 900, color: d.accentOnColor }}>{truncate(locationLine(d.property), 35)}</span></div></div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginTop: 28 }}><div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: 62, fontWeight: 900, color: INK, letterSpacing: -3, lineHeight: 0.96, textTransform: "uppercase" }}>{d.typeLabel}</span><span style={{ fontSize: 30, fontWeight: 900, color: INK, marginTop: 14 }}>{truncate(d.property.title, 35)}</span></div>{priceBox(d, 36)}</div>
      <div style={{ display: "flex", gap: 12, marginTop: "auto" }}>{specs.map((f, i) => <div key={i} style={{ display: "flex", border: `3px solid ${INK}`, padding: "12px 14px" }}>{featureRow(f, 17)}</div>)}</div>
    </div>
  )
}

export function templatePanorama(d: FlyerData): ReactElement {
  const specs = features(d, 5)
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: CANVAS }}>
      <div style={{ display: "flex", position: "relative", height: 510 }}>{photo(d.photos[0], { width: "100%", height: "100%" })}<div style={{ display: "flex", position: "absolute", left: PAD, top: PAD, background: "#fff", padding: "12px 18px" }}><span style={{ fontSize: 22, fontWeight: 900, color: INK, letterSpacing: 3, textTransform: "uppercase" }}>Conexory</span></div>{d.options.highlight && <div style={{ display: "flex", position: "absolute", right: PAD, top: PAD, maxWidth: 400, background: d.accentColor, padding: "13px 18px" }}><span style={{ fontSize: 19, fontWeight: 900, color: d.accentOnColor, textTransform: "uppercase" }}>{truncate(d.options.highlight, 42)}</span></div>}</div>
      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, padding: "50px 58px 0" }}><span style={{ fontSize: 25, fontWeight: 700, color: d.primaryTextColor, letterSpacing: 3, textTransform: "uppercase" }}>{d.typeLabel} · {d.transactionLabel ?? "disponible"}</span><span style={{ fontSize: 75, fontWeight: 900, color: INK, letterSpacing: -4, lineHeight: 0.95, textTransform: "uppercase", marginTop: 18 }}>{truncate(d.property.title, 35)}</span><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 30 }}><span style={{ fontSize: 26, fontWeight: 700, color: BODY }}>{truncate(locationLine(d.property), 42)}</span>{priceBox(d, 38)}</div><div style={{ display: "flex", gap: 24, marginTop: 38 }}>{specs.map((f, i) => <div key={i} style={{ display: "flex" }}>{featureRow(f, 19)}</div>)}</div><div style={{ display: "flex", marginTop: "auto" }}>{footerBar(d)}</div></div>
    </div>
  )
}
