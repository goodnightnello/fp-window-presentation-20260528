const slides = Array.from(document.querySelectorAll("[data-slide]"));
const slideMap = new Map(slides.map((slide) => [slide.dataset.slide, slide]));
const previousButton = document.querySelector("#prev-slide-button");
const nextButton = document.querySelector("#next-slide-button");
const jumpButtons = Array.from(document.querySelectorAll("[data-go-to]"));
const compareToggleButtons = Array.from(document.querySelectorAll("[data-compare-target]"));
const comparePanels = Array.from(document.querySelectorAll("[data-compare-panel]"));
const compareOrder = comparePanels.map((panel) => panel.dataset.comparePanel);

let currentIndex = 0;
const historyStack = [];
let activeCompareTarget = "condition-01";
let compareAnimationFrame = null;

function renderSlide(index) {
  currentIndex = Math.max(0, Math.min(index, slides.length - 1));

  slides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === currentIndex;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
  });
}

function goToSlide(slideId, pushHistory = true) {
  const targetSlide = slideMap.get(slideId);
  if (!targetSlide) {
    return;
  }

  if (pushHistory) {
    historyStack.push(slides[currentIndex].dataset.slide);
  }

  renderSlide(slides.indexOf(targetSlide));
}

function nextSlide() {
  renderSlide(currentIndex + 1);
}

function previousSlide() {
  if (historyStack.length > 0) {
    goToSlide(historyStack.pop(), false);
    return;
  }

  renderSlide(currentIndex - 1);
}

previousButton?.addEventListener("click", previousSlide);
nextButton?.addEventListener("click", nextSlide);

jumpButtons.forEach((button) => {
  button.addEventListener("click", () => {
    goToSlide(button.dataset.goTo);
  });
});

function setComparePanel(target) {
  if (target === activeCompareTarget) {
    return;
  }

  const previousTarget = activeCompareTarget;
  const previousPanel = comparePanels.find((panel) => panel.dataset.comparePanel === previousTarget);
  const nextPanel = comparePanels.find((panel) => panel.dataset.comparePanel === target);
  const previousOrder = compareOrder.indexOf(previousTarget);
  const nextOrder = compareOrder.indexOf(target);
  const movingForward = nextOrder > previousOrder;

  compareToggleButtons.forEach((button) => {
    const isActive = button.dataset.compareTarget === target;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  comparePanels.forEach((panel) => {
    panel.classList.remove(
      "is-active",
      "is-before",
      "is-entering-from-right",
      "is-entering-from-left",
      "is-exiting-to-left",
      "is-exiting-to-right",
    );
  });

  if (!previousPanel || !nextPanel) {
    nextPanel?.classList.add("is-active");
    activeCompareTarget = target;
    return;
  }

  previousPanel.classList.add("is-before", movingForward ? "is-exiting-to-left" : "is-exiting-to-right");
  nextPanel.classList.add("is-before", movingForward ? "is-entering-from-right" : "is-entering-from-left");

  if (compareAnimationFrame) {
    clearTimeout(compareAnimationFrame);
  }

  compareAnimationFrame = setTimeout(() => {
    previousPanel.classList.remove("is-before", "is-exiting-to-left", "is-exiting-to-right");
    nextPanel.classList.remove("is-before", "is-entering-from-right", "is-entering-from-left");
    nextPanel.classList.add("is-active");
    compareAnimationFrame = null;
  }, 430);

  activeCompareTarget = target;
}

compareToggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setComparePanel(button.dataset.compareTarget);
  });
});

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowRight":
    case " ":
    case "Enter":
      event.preventDefault();
      nextSlide();
      break;
    case "ArrowLeft":
      event.preventDefault();
      previousSlide();
      break;
    case "1":
      event.preventDefault();
      goToSlide("page-2");
      break;
    case "2":
      event.preventDefault();
      goToSlide("page-3");
      break;
    case "3":
      event.preventDefault();
      goToSlide("page-4");
      break;
    case "Home":
      event.preventDefault();
      historyStack.length = 0;
      goToSlide("page-1", false);
      break;
    case "End":
      event.preventDefault();
      goToSlide("page-7");
      break;
    default:
      break;
  }
});

renderSlide(0);
comparePanels.forEach((panel) => {
  panel.classList.toggle("is-active", panel.dataset.comparePanel === activeCompareTarget);
});
