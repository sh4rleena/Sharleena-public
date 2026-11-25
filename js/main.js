// Setzt im Fussbereich automatisch das aktuelle Jahr.
// Ohne JavaScript steht dort einfach die Jahreszahl aus dem HTML.
const jahr = document.getElementById("jahr");
if (jahr) {
  jahr.textContent = new Date().getFullYear();
}

// ---------- Tag oder Nacht? ----------
const html = document.documentElement;
const geraetDunkel = window.matchMedia("(prefers-color-scheme: dark)");

// Ist gerade Nacht? Entweder selbst gewählt oder vom Gerät übernommen.
function istNacht() {
  if (html.dataset.theme) {
    return html.dataset.theme === "dark";
  }
  return geraetDunkel.matches;
}

// ---------- Bei jedem Besuch ein anderes Foto ----------
// x / y = wo im Foto die Blüte ist (0% = links/oben, 100% = rechts/unten).
// vertraeumt: true = extra weich und milchig (für die eigenen Fotos).
// nur: "nacht" / "tag" = dieses Foto erscheint nur im Nacht- bzw. Tagmodus.
// ohneMilch: true = kein milchiger Schleier, nur die vorbeiziehenden Nebelschwaden.
// wenigNebel: true = Milchglas, Schwaden und Weichzeichnung deutlich zurückgenommen.
// fliessend: true = der scharfe Bereich ist keine runde Fläche, sondern eine fliessende, sich langsam verändernde Form.
// ton = Durchschnittsfarbe des Fotos. Danach färben sich die Kreise auf «Angebot» passend ein.
// oben = Farbe im oberen Teil des Fotos (so hell, wie man sie hinter dem Milchglas sieht).
//        Daraus wird die Fläche hinter der Navigation, sobald man auf Unterseiten scrollt.
// nebelLinks: true = links hinter den Schwerpunkten weichgezeichnet (nicht milchig), damit die Schrift gut lesbar ist.
// Ohne JavaScript zeigt die Seite das Foto aus dem <noscript> im HTML.
const fotos = [
  // Eigene Fotos von Sharleena
  { datei: "winde", x: "54%", y: "38%", ton: "#ad95a7", oben: "#dacbd3", vertraeumt: true, nur: "tag" },
  { datei: "sternbluete", x: "57%", y: "45%", ton: "#858686", oben: "#bcb8b6", vertraeumt: true, nur: "tag" },
  { datei: "schlauchpflanze", x: "55%", y: "45%", ton: "#95786f", oben: "#c8b4ae", vertraeumt: true, nur: "tag" },
  { datei: "wermut", x: "50%", y: "45%", ton: "#7b8a75", oben: "#555e52", vertraeumt: true, nur: "nacht", wenigNebel: true, fliessend: true },
  { datei: "frauenmantel-perlen", x: "48%", y: "48%", ton: "#252c1a", oben: "#242a1e", vertraeumt: true, nur: "nacht", wenigNebel: true, fliessend: true },
  { datei: "distel", x: "48%", y: "45%", ton: "#151613", oben: "#222321", vertraeumt: true, nur: "nacht", fliessend: true },
];
const buehne = document.querySelector(".buehne");
let aktuellesFoto = null;

// Passt das Foto zum aktuellen Modus?
function passtZumModus(foto) {
  if (foto.nur === "nacht") return istNacht();
  if (foto.nur === "tag") return !istNacht();
  return true;
}

function fotoZeigen(foto) {
  aktuellesFoto = foto;
  buehne.querySelectorAll(".foto").forEach((bild) => {
    bild.src = `bilder/${foto.datei}.jpg`;
  });
  buehne.style.setProperty("--fokus-x", foto.x);
  buehne.style.setProperty("--fokus-y", foto.y);
  // Farbton des Fotos für die ganze Seite (z. B. für die Kreise auf «Angebot»)
  html.style.setProperty("--foto-ton", foto.ton);
  html.style.setProperty("--kopf-ton", foto.oben);
  buehne.classList.toggle("vertraeumt", Boolean(foto.vertraeumt));
  buehne.classList.toggle("ohne-milch", Boolean(foto.ohneMilch));
  buehne.classList.toggle("wenig-nebel", Boolean(foto.wenigNebel));
  buehne.classList.toggle("fliessend", Boolean(foto.fliessend));
  buehne.classList.toggle("nebel-links", Boolean(foto.nebelLinks));
  // Wenig oder kein Nebel: die Schrift bekommt einen stärkeren Schein, damit sie lesbar bleibt
  html.classList.toggle("starker-schein", Boolean(foto.ohneMilch || foto.wenigNebel));
  try {
    localStorage.setItem("foto", foto.datei);
  } catch (fehler) {}
}

function zufaelligesFoto() {
  let letztes = null;
  try {
    letztes = localStorage.getItem("foto");
  } catch (fehler) {}
  const passend = fotos.filter(passtZumModus);
  // Nicht zweimal hintereinander dasselbe Foto
  const moeglich = passend.filter((foto) => foto.datei !== letztes);
  const auswahl = moeglich.length ? moeglich : passend;
  fotoZeigen(auswahl[Math.floor(Math.random() * auswahl.length)]);
}

// Nach einem Wechsel zwischen Tag und Nacht: passt das Foto nicht mehr, ein anderes zeigen
function fotoPruefen() {
  if (aktuellesFoto && !passtZumModus(aktuellesFoto)) {
    zufaelligesFoto();
  }
}

// Startseite: jedes Mal ein neues Foto.
// Unterseiten: dasselbe Foto wie zuletzt, damit es beim Klicken durchs Menü ruhig bleibt.
function fotoWaehlen() {
  if (!document.body.classList.contains("startseite")) {
    let letztes = null;
    try {
      letztes = localStorage.getItem("foto");
    } catch (fehler) {}
    const gleiches = fotos.find((foto) => foto.datei === letztes && passtZumModus(foto));
    if (gleiches) {
      fotoZeigen(gleiches);
      return;
    }
  }
  zufaelligesFoto();
}

if (buehne) {
  fotoWaehlen();
}

// ---------- Schalter Tag / Nacht ----------
const schalter = document.querySelector(".thema-schalter");

// aria-pressed sagt Screenreadern, ob der Nachtmodus an ist
function schalterAktualisieren() {
  if (schalter) {
    schalter.setAttribute("aria-pressed", String(istNacht()));
  }
}

if (schalter) {
  schalter.hidden = false; // nur mit JavaScript sichtbar, weil er nur dann funktioniert
  schalterAktualisieren();

  schalter.addEventListener("click", () => {
    const neu = istNacht() ? "light" : "dark";
    html.dataset.theme = neu;
    try {
      localStorage.setItem("thema", neu); // Wahl merken für den nächsten Besuch
    } catch (fehler) {}
    schalterAktualisieren();
    fotoPruefen();
  });
}

geraetDunkel.addEventListener("change", () => {
  schalterAktualisieren();
  fotoPruefen();
});

// ---------- Hintergrund folgt sanft der Maus ----------
// Nur mit Maus und nur, wenn Bewegung nicht abgeschaltet ist.
// Die Werte landen nur auf dem Hintergrund (.buehne): Dort nutzen sie klarer Fleck, Nebelöffnung
// und Schwaden. So muss der Browser nicht bei jeder Bewegung die ganze Seite neu berechnen.
const bewegungOk = window.matchMedia("(prefers-reduced-motion: no-preference) and (pointer: fine)");

if (buehne && bewegungOk.matches) {
  let wartet = false;
  window.addEventListener("pointermove", (ereignis) => {
    if (wartet) return;
    wartet = true;
    // requestAnimationFrame: höchstens einmal pro Bild rechnen, schont den Computer
    requestAnimationFrame(() => {
      const x = ereignis.clientX / window.innerWidth - 0.5;
      const y = ereignis.clientY / window.innerHeight - 0.5;
      buehne.style.setProperty("--maus-x", x.toFixed(3));
      buehne.style.setProperty("--maus-y", y.toFixed(3));
      wellenAnstossen(x, y);
      wartet = false;
    });
  });
}

// ---------- Wellen beim Darüberfahren ----------
// Bewegt sich die Maus, schwillt die Welle langsam an – in der Bildmitte
// stärker als am Rand. Hört die Maus auf, klingt sie langsam wieder ab.
const welle = document.querySelector("#welle feDisplacementMap");
const MAX_WELLE = 28; // wie weit das Foto höchstens verzerrt wird (in Pixeln) – bewusst sanft
let wellenStaerke = 0;
let wellenZiel = 0;
let letzteBewegung = 0;
let wellenLaufen = false;

function wellenAnstossen(x, y) {
  if (!welle) return;
  const abstandZurMitte = Math.min(1, Math.hypot(x, y) * 2); // 0 = Mitte, 1 = Rand
  wellenZiel = 1 - abstandZurMitte * 0.7;
  letzteBewegung = performance.now();
  if (!wellenLaufen) {
    wellenLaufen = true;
    buehne.classList.add("wellen");
    requestAnimationFrame(wellenSchritt);
  }
}

function wellenSchritt() {
  // Nach einer halben Sekunde ohne Bewegung: Welle beruhigt sich
  if (performance.now() - letzteBewegung > 500) {
    wellenZiel = 0;
  }
  // Langsam auf das Ziel zugleiten (je kleiner die Zahl, desto weicher)
  wellenStaerke += (wellenZiel - wellenStaerke) * 0.03;
  welle.setAttribute("scale", (wellenStaerke * MAX_WELLE).toFixed(1));

  if (wellenZiel === 0 && wellenStaerke < 0.01) {
    // Ganz ruhig: Filter ausschalten, damit der Computer nicht unnötig rechnet
    welle.setAttribute("scale", "0");
    buehne.classList.remove("wellen");
    wellenLaufen = false;
    return;
  }
  requestAnimationFrame(wellenSchritt);
}

// ---------- Links zu einem Aufklapp-Teil (z. B. «Humoralmedizin») ----------
// Ein Klick öffnet den Aufklapp-Teil und scrollt hin.
// Ohne JavaScript springt der Link trotzdem an die richtige Stelle (dann noch zugeklappt).
const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)");
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const ziel = document.getElementById(link.getAttribute("href").slice(1));
  if (!ziel || ziel.tagName !== "DETAILS") return;
  link.addEventListener("click", (ereignis) => {
    ereignis.preventDefault();
    ziel.open = true;
    ziel.scrollIntoView({ behavior: ruhig.matches ? "auto" : "smooth", block: "start" });
    ziel.querySelector("summary").focus({ preventScroll: true }); // Tastatur-Fokus mitnehmen
  });
});

// ---------- Fläche hinter der Navigation: erst beim Scrollen ----------
// Sobald man etwas nach unten scrollt, bekommt <html> die Klasse «gescrollt».
// Dann blendet style.css die farbige Fläche hinter der Navigation ein.
function scrollPruefen() {
  html.classList.toggle("gescrollt", window.scrollY > 8);
}
window.addEventListener("scroll", scrollPruefen, { passive: true });
scrollPruefen();
