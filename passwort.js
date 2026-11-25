// ==========================================================
// VORLÄUFIGER PASSWORTSCHUTZ – nur solange die Website im Aufbau ist.
//
// So funktioniert es: Beim Laden jeder Seite wird der Inhalt versteckt
// und ein Passwortfeld gezeigt. Bei richtigem Passwort merkt sich der
// Browser das für diesen Tab (sessionStorage), damit man auf den
// anderen Seiten nicht nochmals gefragt wird. Schliesst man den Tab,
// wird beim nächsten Besuch wieder gefragt.
//
// ACHTUNG: Das ist nur ein «Vorhang», kein echter Schutz. Wer sich
// auskennt, kann den Quelltext trotzdem lesen. Ohne JavaScript ist
// die Seite ganz sichtbar.
//
// ENTFERNEN, wenn die Website fertig ist:
// 1. Diese Datei löschen.
// 2. In allen .html-Dateien die zwei Zeilen
//    <meta name="robots" …> und <script src="passwort.js"> löschen.
// ==========================================================
(function () {
  const PASSWORT = "Vorschau1992";
  const SCHLUESSEL = "vorschau-frei";   // Name des Eintrags im sessionStorage
  const html = document.documentElement;

  // Wurde das Passwort in diesem Tab schon eingegeben? Dann nichts tun.
  try {
    if (sessionStorage.getItem(SCHLUESSEL) === "ja") return;
  } catch (fehler) {
    // Speichern blockiert (z. B. privates Fenster) – dann wird jedes Mal gefragt.
  }

  // Sofort (noch bevor die Seite erscheint) den Inhalt verstecken.
  // Das Blütenfoto im Hintergrund bleibt sichtbar.
  html.classList.add("gesperrt");

  // Aussehen des Passwortfelds. Farben und Schrift kommen aus css/style.css,
  // deshalb passt es automatisch zu Tag- und Nachtmodus.
  const stil = document.createElement("style");
  stil.textContent = `
    html.gesperrt body > :is(.skip-link, header, main, footer) {
      display: none !important;
    }
    .passwort-schutz {
      position: fixed;
      inset: 0;
      z-index: 20;
      display: grid;
      place-items: center;
      padding: 1rem;
      overflow-y: auto;
    }
    .passwort-schutz form {
      width: min(24rem, 100%);
      margin: 0;
      text-align: center;
    }
    .passwort-schutz p {
      margin: 0 0 1.5rem;
      color: var(--text-sanft);
    }
    .passwort-schutz label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: var(--schrift-klein);
      letter-spacing: var(--sperrung);
      text-transform: uppercase;
    }
    .passwort-schutz input {
      box-sizing: border-box;
      width: 100%;
      padding: 0.6rem 1rem;
      border: 1px solid var(--akzent);
      border-radius: 999px;
      background: var(--glas);
      color: var(--text);
      font: inherit;
      text-align: center;
    }
    .passwort-schutz .button {
      margin-top: 1.25rem;
      font-family: inherit;
      cursor: pointer;
    }
    .passwort-schutz .fehler {
      min-height: 1.6em;
      margin: 1rem 0 0;
      color: var(--text);
    }
  `;
  document.head.appendChild(stil);

  // Das Passwortfeld einsetzen, sobald die Seite geladen ist
  document.addEventListener("DOMContentLoaded", function () {
    // Texte auf Deutsch oder Englisch, je nach Sprache der Seite
    const englisch = html.lang.startsWith("en");
    const text = englisch
      ? { hinweis: "This website is still being built. Please enter the password.",
          feld: "Password", knopf: "Open", falsch: "That password is not correct. Please try again." }
      : { hinweis: "Diese Website ist noch im Aufbau. Bitte gib das Passwort ein.",
          feld: "Passwort", knopf: "Öffnen", falsch: "Das Passwort stimmt leider nicht. Bitte versuche es nochmals." };

    const schutz = document.createElement("div");
    schutz.className = "passwort-schutz";
    schutz.innerHTML = `
      <form class="karte karte-weich" novalidate>
        <p>${text.hinweis}</p>
        <label for="passwort-feld">${text.feld}</label>
        <input id="passwort-feld" type="password" autocomplete="current-password"
               aria-describedby="passwort-fehler" required>
        <button class="button" type="submit">${text.knopf}</button>
        <p class="fehler" id="passwort-fehler" aria-live="polite"></p>
      </form>`;
    document.body.prepend(schutz);

    const formular = schutz.querySelector("form");
    const feld = schutz.querySelector("input");
    const meldung = schutz.querySelector(".fehler");
    feld.focus();

    formular.addEventListener("submit", function (ereignis) {
      ereignis.preventDefault();   // Formular nicht wirklich abschicken

      if (feld.value === PASSWORT) {
        try {
          sessionStorage.setItem(SCHLUESSEL, "ja");
        } catch (fehler) {
          // nicht speicherbar – dann wird auf der nächsten Seite nochmals gefragt
        }
        // Passwortfeld entfernen und die Seite zeigen
        schutz.remove();
        stil.remove();
        html.classList.remove("gesperrt");
      } else {
        meldung.textContent = text.falsch;
        feld.setAttribute("aria-invalid", "true");
        feld.select();
      }
    });
  });
})();
