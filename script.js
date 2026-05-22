function copyBibTeX() {
  const code = document.getElementById("bibtex-code");
  const button = document.querySelector(".copy-button");
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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.activeElement?.blur?.();
  }
});
