function copyBibTeX() {
  const code = document.getElementById("bibtex-code");
  const button = document.querySelector(".copy-bibtex-btn");
  if (!code) return;

  if (!navigator.clipboard?.writeText) {
    return;
  }

  navigator.clipboard.writeText(code.textContent).then(() => {
    if (!button) return;
    const original = button.textContent;
    button.textContent = "Copied";
    window.setTimeout(() => {
      button.textContent = original;
    }, 1400);
  }).catch(() => {});
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.addEventListener("scroll", () => {
  const button = document.querySelector(".scroll-to-top");
  if (!button) return;
  button.classList.toggle("visible", window.scrollY > 320);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.activeElement?.blur?.();
  }
});
