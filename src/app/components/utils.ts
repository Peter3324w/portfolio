export function scrollToSocialsFooter(triggerPulse: () => void) {
  const isNearBottom = () =>
    window.innerHeight + window.scrollY >= document.body.scrollHeight - 120;

  if (isNearBottom()) {
    triggerPulse();
    return;
  }

  const onScroll = () => {
    if (isNearBottom()) {
      triggerPulse();
      window.removeEventListener("scroll", onScroll);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.setTimeout(() => window.removeEventListener("scroll", onScroll), 5000);
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}
