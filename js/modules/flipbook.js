// js/modules/flipbook.js

export function initFlipbook() {



  // DOM references
  const prevBtn = document.querySelector("#prev-btn");
  const nextBtn = document.querySelector("#next-btn");
  const book = document.querySelector("#book");

  const paper1  = document.getElementById("p1");
  const paper2  = document.getElementById("p2");
  const paper3  = document.getElementById("p3");
  const paper4  = document.getElementById("p4");
  const paper5  = document.getElementById("p5");
  const paper6  = document.getElementById("p6");
  const paper7  = document.getElementById("p7");
  const paper8  = document.getElementById("p8");
  const paper9  = document.getElementById("p9");
  const paper10 = document.getElementById("p10");

  // Business logic
  let numOfPapers = 10;
  let maxLocation = numOfPapers + 1;
  let currentLocation = 1;

  let flipIsProgrammatic = false;
  let isFlipping = false;

  function openBook() {
    book.style.transform = "translateX(50%)";
    prevBtn.style.transform = "translateX(-180px)";
    nextBtn.style.transform = "translateX(180px)";
  }

  function closeBook(isAtBeginning) {
    if (isAtBeginning) {
      book.style.transform = "translateX(0%)";
    } else {
      book.style.transform = "translateX(100%)";
    }

    prevBtn.style.transform = "translateX(0px)";
    nextBtn.style.transform = "translateX(0px)";
  }

  // ------------------------------------------------------------
  // PAGE TURNING: NEXT
  // ------------------------------------------------------------
  function goNextPage() {
    console.log(
      `[FLIP] goNextPage fired — currentLocation BEFORE flip = ${currentLocation}`
    );

    if (currentLocation < maxLocation) {
      isFlipping = true;

      switch (currentLocation) {
        case 1: openBook(); paper1.classList.add("flipped"); paper1.style.zIndex = 1; break;
        case 2: paper2.classList.add("flipped"); paper2.style.zIndex = 2; break;
        case 3: paper3.classList.add("flipped"); paper3.style.zIndex = 3; break;
        case 4: paper4.classList.add("flipped"); paper4.style.zIndex = 4; break;
        case 5: paper5.classList.add("flipped"); paper5.style.zIndex = 5; break;
        case 6: paper6.classList.add("flipped"); paper6.style.zIndex = 6; break;
        case 7: paper7.classList.add("flipped"); paper7.style.zIndex = 7; break;
        case 8: paper8.classList.add("flipped"); paper8.style.zIndex = 8; break;
        case 9: paper9.classList.add("flipped"); paper9.style.zIndex = 9; break;
        case 10: paper10.classList.add("flipped"); paper10.style.zIndex = 10; closeBook(false); break;
        default: throw new Error("unknown state");
      }

      currentLocation++;
    }

    if (!flipIsProgrammatic) releaseQuoteButtonGroups();

    isFlipping = false;

    import("../modules/armview.js").then((m) => m.initArmview());
  }

  // ------------------------------------------------------------
  // PAGE TURNING: PREVIOUS
  // ------------------------------------------------------------
  function goPrevPage() {
    console.log(
      `[FLIP] goPrevPage fired — currentLocation BEFORE flip = ${currentLocation}`
    );

    if (currentLocation > 1) {
      isFlipping = true;

      switch (currentLocation) {
        case 2: closeBook(true); paper1.classList.remove("flipped"); paper1.style.zIndex = 10; break;
        case 3: paper2.classList.remove("flipped"); paper2.style.zIndex = 9; break;
        case 4: paper3.classList.remove("flipped"); paper3.style.zIndex = 8; break;
        case 5: paper4.classList.remove("flipped"); paper4.style.zIndex = 7; break;
        case 6: paper5.classList.remove("flipped"); paper5.style.zIndex = 6; break;
        case 7: paper6.classList.remove("flipped"); paper6.style.zIndex = 5; break;
        case 8: paper7.classList.remove("flipped"); paper7.style.zIndex = 4; break;
        case 9: paper8.classList.remove("flipped"); paper8.style.zIndex = 3; break;
        case 10: paper9.classList.remove("flipped"); paper9.style.zIndex = 2; break;
        case 11: paper10.classList.remove("flipped"); paper10.style.zIndex = 1; openBook(); break;
        default: throw new Error("unknown state");
      }

      currentLocation--;
    }

    if (!flipIsProgrammatic) releaseQuoteButtonGroups();

    isFlipping = false;

    import("../modules/armview.js").then((m) => m.initArmview());
  }

  // ------------------------------------------------------------
  // PROGRAMMATIC FLIPS
  // ------------------------------------------------------------
  function programmaticNext() {
    flipIsProgrammatic = true;
    goNextPage();
    flipIsProgrammatic = false;
  }

  function programmaticPrev() {
    flipIsProgrammatic = true;
    goPrevPage();
    flipIsProgrammatic = false;
  }

  // ------------------------------------------------------------
  // RELEASE RADIO BUTTON GROUPS ON MANUAL FLIP
  // ------------------------------------------------------------
  function releaseQuoteButtonGroups() {
    const groups = ["button-group-size", "button-group-length"];
    groups.forEach((name) => {
      const checked = document.querySelector(`input[name="${name}"]:checked`);
      if (checked) checked.checked = false;
    });
  }

  // Button listeners
  prevBtn.addEventListener("click", () => {
    console.log("[CLICK] prevBtn handler fired");
    goPrevPage();
  });

  nextBtn.addEventListener("click", () => {
    console.log("[CLICK] nextBtn handler fired");
    goNextPage();
  });

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goPrevPage();
    else if (e.key === "ArrowRight") goNextPage();
  });

  // ------------------------------------------------------------
  // MOBILE SWIPE NAVIGATION (<1400px)
  // ------------------------------------------------------------
  function initSwipeNavigation() {
    if (window.innerWidth >= 1400) return; // mobile only

    const swipeTargets = document.querySelectorAll(".flipbook");
    if (!swipeTargets.length) return;

    let startX = 0;
    let endX = 0;
    const THRESHOLD = 40; // minimum swipe distance in px

    const onTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };

    const onTouchEnd = (e) => {
      endX = e.changedTouches[0].clientX;
      const delta = endX - startX;

      // RIGHT → LEFT swipe (next page)
      if (delta < -THRESHOLD) {
        if (!isFlipping) goNextPage();
      }

      // LEFT → RIGHT swipe (previous page)
      if (delta > THRESHOLD) {
        if (!isFlipping) goPrevPage();
      }
    };

    swipeTargets.forEach((el) => {
      el.addEventListener("touchstart", onTouchStart, { passive: true });
      el.addEventListener("touchend", onTouchEnd, { passive: true });
    });
  }

  // activate swipe
  initSwipeNavigation();




  // ------------------------------------------------------------
  // EXPOSE API
  // ------------------------------------------------------------
  window.flipbook = {
    goNextPage,
    goPrevPage,
    programmaticNext,
    programmaticPrev,

    get currentLocation() {
      return currentLocation;
    },
    get maxLocation() {
      return maxLocation;
    },
    get isFlipping() {
      return isFlipping;
    }
  };

  initGifAutoHide();
}

function initGifAutoHide() {
  const gif = document.querySelector(".swipegif");
  if (!gif) return;


const anchor = document.querySelector(".swipegif-anchor");
if (!anchor) return;   // <-- REQUIRED FIX


  const HIDE_DELAY_MS = 7000;       // how long the gif stays visible once conditions are met
  const SCROLL_SETTLE_MS = 200;     // how long scroll must be quiet to treat velocity as 0

  let isInView = false;
  let hasStarted = false;
  let hideTimerId = null;
  let settleTimerId = null;

  const cleanup = () => {
    if (hideTimerId !== null) {
      clearTimeout(hideTimerId);
      hideTimerId = null;
    }
    if (settleTimerId !== null) {
      clearTimeout(settleTimerId);
      settleTimerId = null;
    }
    window.removeEventListener("scroll", onScroll, { passive: true });
    observer.disconnect();
  };

  const startHideTimer = () => {
    if (hasStarted) return;
    hasStarted = true;

    hideTimerId = setTimeout(() => {
      gif.classList.add("is-hidden");
      cleanup();
    }, HIDE_DELAY_MS);
  };

  const scheduleSettledCheck = () => {
    if (!isInView || hasStarted) return;

    if (settleTimerId !== null) {
      clearTimeout(settleTimerId);
    }

    // If no scroll happens again within this window, we treat velocity as ~0
    settleTimerId = setTimeout(() => {
      if (isInView && !hasStarted) {
        startHideTimer();
      }
    }, SCROLL_SETTLE_MS);
  };

  function onScroll() {
    // Only care about scrolls while the anchor is in view and we haven't started the timer
    if (!isInView || hasStarted) return;
    scheduleSettledCheck();
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target !== anchor) return;

        isInView = entry.isIntersecting;

      if (isInView) {
        // Anchor is in view: show the GIF if it started hidden
        gif.classList.remove("is-hidden");

        // Then start watching for scroll to "settle"
        scheduleSettledCheck();
      } else {
        // Out of view: cancel any pending settle check (user has moved away)
        if (settleTimerId !== null) {
          clearTimeout(settleTimerId);
          settleTimerId = null;
        }
      }

      });
    },
    {
      threshold: 0.3, // ~30% visible is "in view" (tune if you like)
    }
  );

  observer.observe(anchor);
  window.addEventListener("scroll", onScroll, { passive: true });

  // If the element starts already in view and there's no scrolling,
  // the observer callback + scheduleSettledCheck() will kick things off.
}
