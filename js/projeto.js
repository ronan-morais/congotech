/* CongoTech — página de detalhes do projeto (projeto.html?p=slug) */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);

  const root = $("#detailRoot");
  const slug = new URLSearchParams(location.search).get("p");
  const project = slug && window.getProject ? window.getProject(slug) : null;

  /* slug inválido ou ausente: volta para o portfólio */
  if (!root || !project) {
    if (root) location.replace("index.html#portfolio");
    return;
  }

  const p = project;
  const total = p.images.length;

  document.title = p.title + " — CongoTech";

  $("#detailCategory").textContent = p.category;
  $("#detailTitle").textContent = p.title;
  $("#detailType").textContent = p.type + " · " + p.year;

  const services = $("#detailServices");
  p.services.forEach((s) => {
    const li = document.createElement("li");
    const name = document.createElement("b");
    name.textContent = s.name;
    const desc = document.createElement("span");
    desc.textContent = s.desc;
    li.append(name, desc);
    services.appendChild(li);
  });

  /* ---------- galeria: todas as imagens do projeto ---------- */
  const gallery = $("#detailGallery");
  p.images.forEach((src, i) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = src;
    img.alt = p.title + " — imagem " + (i + 1) + " de " + total;
    img.loading = i < 2 ? "eager" : "lazy";
    figure.appendChild(img);
    figure.addEventListener("click", () => lb.open(i));
    gallery.appendChild(figure);
  });

  /* ---------- lightbox ---------- */
  const box = $("#lightbox");
  const boxImg = $("#lightboxImg");
  const boxCount = $("#lightboxCount");
  const btnPrev = box.querySelector(".lightbox__prev");
  const btnNext = box.querySelector(".lightbox__next");
  let index = 0;

  const render = () => {
    boxImg.src = p.images[index];
    boxImg.alt = p.title + " — imagem " + (index + 1) + " de " + total;
    boxCount.textContent = index + 1 + " / " + total;
    btnPrev.hidden = total < 2;
    btnNext.hidden = total < 2;
  };

  const lb = {
    open(i) {
      index = i;
      render();
      box.hidden = false;
      document.body.style.overflow = "hidden";
    },
    close() {
      box.hidden = true;
      document.body.style.overflow = "";
    },
    step(delta) {
      index = (index + delta + total) % total;
      render();
    },
  };

  box.querySelector(".lightbox__close").addEventListener("click", lb.close);
  btnPrev.addEventListener("click", () => lb.step(-1));
  btnNext.addEventListener("click", () => lb.step(1));
  box.addEventListener("click", (e) => {
    if (e.target === box) lb.close();
  });

  addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") lb.close();
    else if (e.key === "ArrowLeft") lb.step(-1);
    else if (e.key === "ArrowRight") lb.step(1);
  });

  /* swipe no toque */
  let startX = null;
  box.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
    },
    { passive: true }
  );
  box.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) lb.step(dx < 0 ? 1 : -1);
    startX = null;
  });
})();
