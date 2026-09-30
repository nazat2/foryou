/* Trimmed from the original "Flowers for Someone" repo: no title
   typewriter here (the host page already has its own heading) —
   this just kicks off the grow/bloom animation shortly after the
   embed loads (which, thanks to loading="lazy" on the <iframe> in
   the host page, is roughly when it scrolls into view). */
onload = () => {
  setTimeout(() => {
    document.body.classList.remove("not-loaded");
  }, 500);
};

/* Halaman utama mengirim "play"/"pause" — animasi hanya jalan saat bunga terlihat,
   jadi tidak membebani HP/laptop ketika user sedang di bagian lain. */
addEventListener("message", (e) => {
  const d = e.data;
  if (!d || typeof d.flower !== "string") return;
  document.documentElement.classList.toggle("is-paused", d.flower === "pause");
});
