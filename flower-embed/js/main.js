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
