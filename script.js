document.addEventListener("DOMContentLoaded", function () {
  const desktopSlides = document.querySelectorAll("#desktop-slideshow .slide");
  let desktopIndex = 0;
  let desktopCycles = 0;
  const desktopMaxCycles = 3;

  function showDesktopSlide(index) {
    desktopSlides.forEach((slide, i) => {
      slide.style.display = i === index ? "block" : "none";
    });
  }

  function changeDesktopSlide(n) {
    desktopIndex = (desktopIndex + n + desktopSlides.length) % desktopSlides.length;
    showDesktopSlide(desktopIndex);
  }

  if (desktopSlides.length > 0) {
    showDesktopSlide(desktopIndex);
    window.changeSlide = changeDesktopSlide;

    const desktopInterval = setInterval(() => {
      desktopIndex = (desktopIndex + 1) % desktopSlides.length;
      showDesktopSlide(desktopIndex);

      if (desktopIndex === 0) {
        desktopCycles++;
        if (desktopCycles >= desktopMaxCycles) {
          clearInterval(desktopInterval);
        }
      }
    }, 5000);

    // Optional: allow manual prev/next if IDs exist
    const prevBtn = document.getElementById("prevSlide");
    const nextBtn = document.getElementById("nextSlide");

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener("click", () => changeDesktopSlide(-1));
      nextBtn.addEventListener("click", () => changeDesktopSlide(1));
    }
  }
});



      // === MOBILE SLIDESHOW ===
    const mobileSlides = document.querySelectorAll("#mobile-slideshow .slide");
    let mobileIndex = 0;
    let mobileCycles = 0;
    const mobileMaxCycles = 3;

    function showMobileSlide(index) {
      mobileSlides.forEach((slide, i) => {
        slide.style.display = i === index ? "block" : "none";
      });
    }

    function changeMobileSlide(n) {
      mobileIndex = (mobileIndex + n + mobileSlides.length) % mobileSlides.length;
      showMobileSlide(mobileIndex);
    }

    if (mobileSlides.length > 0) {
      showMobileSlide(mobileIndex);
      window.changeSlide = changeMobileSlide;

      const mobileInterval = setInterval(() => {
        mobileIndex = (mobileIndex + 1) % mobileSlides.length;
        showMobileSlide(mobileIndex);

        if (mobileIndex === 0) {
          mobileCycles++;
          if (mobileCycles >= mobileMaxCycles) {
            clearInterval(mobileInterval);
          }
        }
      }, 8000);
    }

    // === Accordion Scroll + Toggle ===
    document.querySelectorAll(".accordion-header").forEach((header) => {
      header.addEventListener("click", () => {
        const content = header.nextElementSibling;
        const isOpen = content.style.maxHeight;
        header.classList.toggle("active");
        content.style.maxHeight = isOpen ? null : content.scrollHeight + "px";

        setTimeout(() => {
          const fixedHeaderHeight = 105;
          const elementTop = header.getBoundingClientRect().top + window.scrollY;
          const scrollTarget = elementTop - fixedHeaderHeight;

          window.scrollTo({
            top: scrollTarget,
            behavior: "smooth",
          });
        }, 200);
      });
    });

    // === MOBILE ABOUT IMAGE MODAL ===
    const imgModal = document.getElementById("imgModal");
    const modalImg = document.getElementById("modalImg");
    const modalCaption = document.getElementById("modalCaption");
    const modalClose = document.getElementById("modalClose");

    if (imgModal && modalImg && modalCaption && modalClose) {
      document.querySelectorAll(".mobile-newspaper-img-left img").forEach(function (img) {
        img.style.cursor = "pointer";
        img.addEventListener("click", function () {
          modalImg.src = this.src;
          const caption = this.closest(".mobile-newspaper-img-left")?.querySelector(".mob-about-img-caption");
          modalCaption.textContent = caption ? caption.textContent : "";
          imgModal.style.display = "flex";
        });
      });

      modalClose.addEventListener("click", function () {
        imgModal.style.display = "none";
      });

      imgModal.addEventListener("click", function (e) {
        if (e.target === imgModal) {
          imgModal.style.display = "none";
        }
      });
    }

    // === Unified Modal ===
    const unifiedModal = document.getElementById("unified-modal");
    const unifiedBody = document.getElementById("unified-modal-body");
    const pilotRatingsBtn = document.getElementById("pilotRatingsBtn");

    if (unifiedModal && unifiedBody && pilotRatingsBtn) {
      pilotRatingsBtn.addEventListener("click", () => {
        unifiedBody.innerHTML = `
        <p><u>Aircraft Delivery Solutions pilot type ratings</u></p> 
        <ul>
          <li><b>BEECHCRAFT:</b> BE300 (King Air 350)</li> 
          <li><b>BOEING:</b> B747-200, B747-400/8, DC-9</li> 
          <li><b>BOMBARDIER:</b> CL-65, DHC-8, LR-JET</li> 
          <li><b>CESSNA:</b> CE-750 (Citation X)</li> 
          <li><b>DASSAULT:</b> FA-20, FA-50 [SIC]</li> 
          <li><b>EMBRAER:</b> EMB-120, EMB-170–195, EMB-550</li> 
          <li><b>FAIRCHILD:</b> SA-227</li> 
          <li><b>GULFSTREAM:</b> IAI-1125 (G100), Gulfstream IV [SIC]</li> 
          <li><b>LOCKHEED:</b> L-300 (C141)</li> 
          <li><b>SIKORSKY:</b> S-70 (UH-60)</li> 
        </ul>`;
        unifiedModal.style.display = "flex";
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          unifiedModal.style.display = "none";
        }
      });

      unifiedModal.addEventListener("click", function (e) {
        if (e.target === unifiedModal) {
          unifiedModal.style.display = "none";
        }
      });
    }

    // === Testimonial Modal Trigger ===
    document.querySelectorAll(".testimonial-thumb").forEach((img) => {
      img.addEventListener("click", function () {
        const fullImageUrl = this.getAttribute("data-full");
        if (fullImageUrl) {
          openModal(`<img src="${fullImageUrl}" style="width: 100%; height: auto;" alt="Full Testimonial Image">`);
        }
      });
    });

    // === Quote Form Submission ===
    const desktopForm = document.getElementById("quote-form-desktop");
    const mobileForm = document.getElementById("quote-form-mobile");

    function isVisible(elem) {
      return elem && elem.offsetParent !== null;
    }

    function handleSubmit(event) {
      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);
      console.log("Form submitted:", Object.fromEntries(formData.entries()));
      alert("Your quote request has been submitted!");
    }

    if (isVisible(desktopForm)) {
      desktopForm.addEventListener("submit", handleSubmit);
    }
    if (isVisible(mobileForm)) {
      mobileForm.addEventListener("submit", handleSubmit);
    }

    // === Hamburger Mobile Menu ===
    const hamburger = document.querySelector(".hamburger");
    const mobileMenu = document.getElementById("mobileMenu");

    if (hamburger && mobileMenu) {
      hamburger.addEventListener("click", function () {
        mobileMenu.classList.toggle("show");
      });
    }

    window.addEventListener("pageshow", function () {
      if (mobileMenu && mobileMenu.classList.contains("show")) {
        mobileMenu.classList.remove("show");
      }
      if (hamburger && hamburger.classList.contains("open")) {
        hamburger.classList.remove("open");
      }
    });

// === Mobile Tooltip ===
console.log("Tooltip script loaded");
    const tooltips = document.querySelectorAll(".tappable-mob-tooltip");
    console.log("Found", tooltips.length, "tooltip(s)");

    document.addEventListener("click", function () {
      tooltips.forEach((el) => el.classList.remove("active"));
    });

    tooltips.forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.stopPropagation();
        const isActive = this.classList.contains("active");
        tooltips.forEach((t) => t.classList.remove("active"));
        if (!isActive) {
          this.classList.add("active");
          console.log("Tapped tooltip: ", this.textContent);

          if (!isActive) {
  this.classList.add("active");
  console.log("Tapped tooltip: ", this.textContent);

  // --- Shift tooltip if it's too close to edge ---
  const tooltipText = this.getAttribute("data-tooltip");
  const tempSpan = document.createElement("span");
  tempSpan.style.visibility = "hidden";
  tempSpan.style.position = "absolute";
  tempSpan.style.whiteSpace = "nowrap";
  tempSpan.style.fontSize = "14px";
  tempSpan.textContent = tooltipText;
  document.body.appendChild(tempSpan);

  const tooltipWidth = tempSpan.offsetWidth;
  const elRect = this.getBoundingClientRect();
  const spaceLeft = elRect.left;
  const spaceRight = window.innerWidth - elRect.right;

  if (tooltipWidth / 2 > spaceLeft) {
    this.style.setProperty('--tooltip-shift', `${tooltipWidth / 2 - spaceLeft + 8}px`);
  } else if (tooltipWidth / 2 > spaceRight) {
    this.style.setProperty('--tooltip-shift', `-${tooltipWidth / 2 - spaceRight + 8}px`);
  } else {
    this.style.setProperty('--tooltip-shift', `0px`);
  }

  document.body.removeChild(tempSpan);
}

        }
      });
    });



  // === Global Modal Fallbacks ===
  function closeModal() {
    const modal = document.getElementById("imgModal");
    if (modal) modal.style.display = "none";
  }

  function openMobileModal() {
    const modal = document.getElementById("mobile-modal");
    if (modal) modal.style.display = "flex";
  }

  function closeMobileModal() {
    const modal = document.getElementById("mobile-modal");
    if (modal) modal.style.display = "none";
  }

  function openModal(content) {
    const modal = document.getElementById("custom-modal");
    const body = document.getElementById("modal-body");
    if (modal && body) {
      body.innerHTML = content;
      modal.style.display = "flex";
    }
  }

  document.querySelectorAll('.past-delivery-img').forEach(div => {
  const img = div.querySelector('img');
  const fullImg = div.getAttribute('data-full') || img.src;
  const caption = div.querySelector('.past-delivery-caption')?.textContent || "";

  div.style.cursor = 'pointer';
  div.addEventListener('click', () => {
    openModal(`
      <img src="${fullImg}" alt="" style="width: 100%; height: auto; margin-bottom: 12px;">
      <div style="text-align: center; font-size: 14px; color: #444;">${caption}</div>
    `);
  });
});

document.querySelectorAll('.mob-past-deliv-thumb').forEach(function (img) {
  img.style.cursor = "pointer";
  img.addEventListener("click", function () {
    const wrapper = this.closest(".mob-past-deliv-img");
    if (!wrapper) {
      console.log("Wrapper not found for thumbnail.");
      return;
    }

    const fullImageUrl = wrapper.getAttribute("data-full") || this.src;
    const captionEl = wrapper.querySelector(".mob-past-deliv-caption");
    const caption = captionEl ? captionEl.textContent : "";

    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("modalImg");
    const modalCaption = document.getElementById("modalCaption");

    if (modal && modalImg && modalCaption) {
      modalImg.src = fullImageUrl;
      modalCaption.textContent = caption;
      modal.style.display = "flex";
    } else {
      console.log("Modal elements not found");
    }
  });
});


// === CLOSE MODAL ON ANY TAP INSIDE ===
document.getElementById("imgModal").addEventListener("click", function () {
  this.style.display = "none";
});

document.querySelectorAll(".mob-past-deliv-thumb").forEach(img => {
  img.addEventListener("click", function () {
    const textRow = this.closest("tr").nextElementSibling;
    if (textRow && textRow.classList.contains("mob-past-deliv-text-row")) {
      textRow.classList.toggle("open");
    }
  });
});

// === Restore scroll position on load ===
if (window.location.pathname === "/past-deliveries") {
  const savedScroll = localStorage.getItem("scrollPosition");
  if (savedScroll !== null) {
    setTimeout(() => {
      window.scrollTo(0, parseInt(savedScroll, 10));
      localStorage.removeItem("scrollPosition");
    }, 100); // slight delay helps layout settle
  }

  // === Save scroll position before navigating away
  document.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", function () {
      localStorage.setItem("scrollPosition", window.scrollY);
    });
  });
}



