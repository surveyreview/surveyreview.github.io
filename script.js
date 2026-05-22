function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.addEventListener("scroll", () => {
  const button = document.querySelector(".scroll-to-top");
  if (!button) return;
  button.classList.toggle("visible", window.scrollY > 320);
});
