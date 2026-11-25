// Wird ganz am Anfang geladen: Hat jemand früher Tag oder Nacht gewählt,
// wird das sofort gesetzt. Sonst richtet sich die Seite nach dem Gerät.
try {
  const gespeichert = localStorage.getItem("thema");
  if (gespeichert === "light" || gespeichert === "dark") {
    document.documentElement.dataset.theme = gespeichert;
  }
} catch (fehler) {
  // Speichern ist blockiert (z. B. privates Fenster) – dann einfach nichts tun.
}
