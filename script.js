document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const pageKey = body.dataset.page;

  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 24) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
  }

  const closeMenu = () => {
    body.classList.remove("menu-open");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
  };

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = body.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const clickedInsideMenu = target.closest(".nav-menu") || target.closest(".menu-toggle");
      if (!clickedInsideMenu) {
        closeMenu();
      }
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (event.defaultPrevented) {
          return;
        }

        if (window.matchMedia("(max-width: 980px)").matches) {
          closeMenu();
        }
      });
    });
  }

  document.querySelectorAll(".nav-item.has-dropdown > .nav-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (!window.matchMedia("(max-width: 980px)").matches) {
        return;
      }

      const parent = link.parentElement;
      if (!parent) {
        return;
      }

      if (!parent.classList.contains("open")) {
        event.preventDefault();
        document.querySelectorAll(".nav-item.has-dropdown.open").forEach((item) => {
          if (item !== parent) {
            item.classList.remove("open");
          }
        });
        parent.classList.add("open");
      }
    });
  });

  if (pageKey) {
    const activeItem = document.querySelector(`.nav-item[data-page="${pageKey}"]`);
    if (activeItem) {
      activeItem.classList.add("active");
    }

    if (pageKey === "ministries") {
      const dropItem = document.querySelector(".nav-item.has-dropdown");
      if (dropItem) {
        dropItem.classList.add("active");
      }
    }
  }

  if (window.AOS) {
    window.AOS.init({
      duration: 850,
      offset: 60,
      once: true,
      easing: "ease-out-cubic"
    });
  }
});
