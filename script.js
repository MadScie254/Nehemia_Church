document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-style]").forEach((element) => {
    const inlineStyle = element.getAttribute("data-style");
    if (inlineStyle) {
      element.setAttribute("style", inlineStyle);
    }
  });

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

  const formatKes = (amount) => `KES ${Math.round(amount).toLocaleString("en-KE")}`;

  const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const initGiveProjectDonations = () => {
    if (pageKey !== "give") {
      return;
    }

    const projectCards = Array.from(document.querySelectorAll("[data-project-card]"));
    const projectSelect = document.querySelector("[data-project-select]");
    const donationForm = document.getElementById("project-donation-form");
    const amountInput = document.querySelector("[data-donation-amount]");
    const donationFeedback = document.querySelector("[data-donation-feedback]");
    const activeProjectTitle = document.querySelector("[data-project-active-title]");
    const donationButtons = Array.from(document.querySelectorAll("[data-project-donate]"));
    const donationSection = document.getElementById("project-donation");

    if (!projectCards.length || !(projectSelect instanceof HTMLSelectElement)) {
      return;
    }

    const storageKey = "nmkProjectDonations";
    let storedDonations = {};

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          storedDonations = parsed;
        }
      }
    } catch (_error) {
      storedDonations = {};
    }

    const projects = new Map();

    projectCards.forEach((card) => {
      const projectId = card.getAttribute("data-project-id") || "";
      if (!projectId) {
        return;
      }

      projects.set(projectId, {
        card,
        name: card.getAttribute("data-project-name") || projectId,
        target: toNumber(card.getAttribute("data-target")),
        initialRaised: toNumber(card.getAttribute("data-initial-raised"))
      });
    });

    const readStoredAmount = (projectId) => toNumber(storedDonations[projectId]);

    const setFeedback = (message, type) => {
      if (!(donationFeedback instanceof HTMLElement)) {
        return;
      }

      donationFeedback.textContent = message;
      donationFeedback.classList.remove("success", "error");
      if (type) {
        donationFeedback.classList.add(type);
      }
    };

    const updateActiveProjectTitle = (projectId) => {
      if (!(activeProjectTitle instanceof HTMLElement)) {
        return;
      }

      const project = projects.get(projectId);
      if (!project) {
        activeProjectTitle.textContent = "Support a Project You Care About";
        return;
      }

      activeProjectTitle.textContent = `Donate to ${project.name}`;
    };

    const renderProjectProgress = () => {
      projects.forEach((project, projectId) => {
        const totalRaised = project.initialRaised + readStoredAmount(projectId);
        const percent = project.target > 0 ? Math.min((totalRaised / project.target) * 100, 100) : 0;
        const displayPercent = Number.isInteger(percent) ? String(percent) : percent.toFixed(1);

        const raisedElement = project.card.querySelector("[data-project-raised]");
        if (raisedElement) {
          raisedElement.textContent = formatKes(totalRaised);
        }

        const targetElement = project.card.querySelector("[data-project-target]");
        if (targetElement) {
          targetElement.textContent = formatKes(project.target);
        }

        const percentElement = project.card.querySelector("[data-project-percent]");
        if (percentElement) {
          percentElement.textContent = `${displayPercent}%`;
        }

        const progressFill = project.card.querySelector("[data-progress-fill]");
        if (progressFill instanceof HTMLElement) {
          progressFill.style.width = `${percent}%`;
        }

        const progressTrack = project.card.querySelector(".progress-track");
        if (progressTrack instanceof HTMLElement) {
          progressTrack.setAttribute("aria-valuenow", String(Number(percent.toFixed(1))));
        }
      });
    };

    const focusProjectDonation = (projectId) => {
      if (!projects.has(projectId)) {
        return;
      }

      projectSelect.value = projectId;
      updateActiveProjectTitle(projectId);
      setFeedback(`You are giving to ${projects.get(projectId).name}. Enter amount to continue.`, null);

      projectCards.forEach((card) => card.classList.remove("project-highlight"));
      const highlighted = projects.get(projectId);
      if (highlighted) {
        highlighted.card.classList.add("project-highlight");
      }

      if (donationSection) {
        donationSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      if (amountInput instanceof HTMLInputElement) {
        window.setTimeout(() => {
          amountInput.focus();
        }, 300);
      }
    };

    donationButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const projectId = button.getAttribute("data-project-donate") || "";
        focusProjectDonation(projectId);
      });
    });

    projectSelect.addEventListener("change", () => {
      updateActiveProjectTitle(projectSelect.value);
    });

    if (donationForm instanceof HTMLFormElement && amountInput instanceof HTMLInputElement) {
      donationForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const selectedProject = projectSelect.value;
        const amount = toNumber(amountInput.value);

        if (!selectedProject || !projects.has(selectedProject)) {
          setFeedback("Please choose a project before recording your donation.", "error");
          return;
        }

        if (amount <= 0) {
          setFeedback("Please enter a valid amount greater than zero.", "error");
          return;
        }

        storedDonations[selectedProject] = readStoredAmount(selectedProject) + amount;

        try {
          window.localStorage.setItem(storageKey, JSON.stringify(storedDonations));
        } catch (_error) {
          // Ignore storage errors and keep UI responsive.
        }

        renderProjectProgress();
        setFeedback(`Asante! ${formatKes(amount)} recorded for ${projects.get(selectedProject).name}.`, "success");
        amountInput.value = "";
      });
    }

    renderProjectProgress();
  };

  const initSermonFilters = () => {
    if (pageKey !== "sermons") {
      return;
    }

    const sermonCards = Array.from(document.querySelectorAll("[data-sermon-card]"));
    const filterControls = Array.from(document.querySelectorAll("[data-sermon-filter]"));
    const clearButton = document.querySelector("[data-sermon-clear]");
    const resultText = document.querySelector("[data-sermon-results]");
    const seriesButtons = Array.from(document.querySelectorAll("[data-series-view]"));
    const archiveSection = document.getElementById("sermon-archive");

    if (!sermonCards.length || !filterControls.length) {
      return;
    }

    const normalize = (value) => String(value || "").trim().toLowerCase();

    const applyFilters = () => {
      let visibleCount = 0;

      sermonCards.forEach((card) => {
        const isVisible = filterControls.every((control) => {
          const key = control.getAttribute("data-sermon-filter");
          const selectedValue = normalize(control.value);

          if (!key || !selectedValue) {
            return true;
          }

          return normalize(card.dataset[key]) === selectedValue;
        });

        card.hidden = !isVisible;
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (resultText instanceof HTMLElement) {
        if (visibleCount === sermonCards.length) {
          resultText.textContent = `Showing all ${sermonCards.length} sermons.`;
        } else {
          resultText.textContent = `Showing ${visibleCount} of ${sermonCards.length} sermons.`;
        }
      }
    };

    filterControls.forEach((control) => {
      control.addEventListener("change", applyFilters);
    });

    if (clearButton instanceof HTMLElement) {
      clearButton.addEventListener("click", () => {
        filterControls.forEach((control) => {
          control.value = "";
        });
        applyFilters();
      });
    }

    seriesButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const seriesValue = button.getAttribute("data-series-view") || "";
        const seriesFilter = filterControls.find((control) => control.getAttribute("data-sermon-filter") === "series");

        if (!seriesFilter) {
          return;
        }

        seriesFilter.value = seriesValue;
        applyFilters();

        if (archiveSection) {
          archiveSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    applyFilters();
  };

  initGiveProjectDonations();
  initSermonFilters();

  if (window.AOS) {
    window.AOS.init({
      duration: 850,
      offset: 60,
      once: true,
      easing: "ease-out-cubic"
    });
  }
});
