document.addEventListener("DOMContentLoaded", () => {
  const buildLocalImageFallbacks = (assetPath) => {
    const withoutExtension = assetPath.replace(/\.(jpe?g|png|webp|gif|svg)$/i, "");
    const candidates = [
      `${withoutExtension}.jpg`,
      `${withoutExtension}.jpeg`,
      `${withoutExtension}.png`,
      `${withoutExtension}.webp`
    ];

    return candidates.map((candidate) => `url('${candidate}')`).join(", ");
  };

  const applyLocalImageFallbacks = (inlineStyle) => {
    if (!inlineStyle) {
      return inlineStyle;
    }

    let patchedStyle = inlineStyle.replace(
      /url\((['"]?)(assets\/[^?'"\)\s]+)\1\)/g,
      (_match, _quote, assetPath) => buildLocalImageFallbacks(assetPath)
    );

    patchedStyle = patchedStyle.replace(
      /url\((['"]?)(https:\/\/images\.unsplash\.com\/(photo-[^?'"\)\s]+)[^'"\)\s]*)\1\)/g,
      (_match, _quote, remoteUrl, photoId) =>
        `${buildLocalImageFallbacks(`assets/${photoId}`)}, url('${remoteUrl}')`
    );

    return patchedStyle;
  };

  document.querySelectorAll("[data-style]").forEach((element) => {
    const inlineStyle = element.getAttribute("data-style");
    if (inlineStyle) {
      element.setAttribute("style", applyLocalImageFallbacks(inlineStyle));
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

  // Load Google Translate widget if container exists on the page
  const translateContainer = document.getElementById('google_translate_element');
  if (translateContainer) {
    window.googleTranslateElementInit = function() {
      try {
        new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE}, 'google_translate_element');
      } catch (e) {
        // ignore init errors
      }
    };

    const gtScript = document.createElement('script');
    gtScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    gtScript.async = true;
    document.body.appendChild(gtScript);
  }

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

    const projectApiUrl = "/api/projects";
    const donationApiUrl = "/api/donations";

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
        raised: toNumber(card.getAttribute("data-initial-raised"))
      });
    });

    const updateProjectQuery = (projectId) => {
      const url = new URL(window.location.href);

      if (projectId) {
        url.searchParams.set("project", projectId);
      } else {
        url.searchParams.delete("project");
      }

      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    };

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

    const highlightProjectCard = (projectId) => {
      projectCards.forEach((card) => card.classList.remove("project-highlight"));
      const highlighted = projects.get(projectId);
      if (highlighted) {
        highlighted.card.classList.add("project-highlight");
      }
    };

    const renderProjectProgress = () => {
      projects.forEach((project, projectId) => {
        const percent = project.target > 0 ? Math.min((project.raised / project.target) * 100, 100) : 0;
        const displayPercent = Number.isInteger(percent) ? String(percent) : percent.toFixed(1);

        const raisedElement = project.card.querySelector("[data-project-raised]");
        if (raisedElement) {
          raisedElement.textContent = formatKes(project.raised);
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

    const fetchJson = async (url, options = {}) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          Accept: "application/json",
          ...(options.headers || {})
        }
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || "Request failed.");
      }

      return payload;
    };

    const hydrateProjectsFromApi = async () => {
      const payload = await fetchJson(projectApiUrl);
      const apiProjects = Array.isArray(payload.projects) ? payload.projects : [];

      apiProjects.forEach((apiProject) => {
        const local = projects.get(apiProject.id);
        if (!local) {
          return;
        }

        local.name = String(apiProject.name || local.name);
        local.target = toNumber(apiProject.target) || local.target;
        local.raised = toNumber(apiProject.raised);
      });

      renderProjectProgress();
    };

    const focusProjectDonation = (projectId, options = {}) => {
      if (!projects.has(projectId)) {
        return;
      }

      const shouldScroll = options.scroll !== false;
      const shouldUpdateUrl = options.updateUrl !== false;

      projectSelect.value = projectId;
      updateActiveProjectTitle(projectId);
      setFeedback(`You are giving to ${projects.get(projectId).name}. Enter amount to continue.`, null);

      highlightProjectCard(projectId);
      if (shouldUpdateUrl) {
        updateProjectQuery(projectId);
      }

      if (shouldScroll && donationSection) {
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
      highlightProjectCard(projectSelect.value);
      updateProjectQuery(projectSelect.value);
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

        const formData = new FormData(donationForm);
        const donorName = String(formData.get("donorName") || "");
        const donorEmail = String(formData.get("donorEmail") || "");
        const paymentMethod = String(formData.get("paymentMethod") || "");
        const note = String(formData.get("note") || "");

        const submitButton = donationForm.querySelector("button[type='submit']");
        if (submitButton instanceof HTMLButtonElement) {
          submitButton.disabled = true;
        }

        fetchJson(donationApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            projectId: selectedProject,
            amount,
            donorName,
            donorEmail,
            paymentMethod,
            note
          })
        })
          .then(() => hydrateProjectsFromApi())
          .then(() => {
            setFeedback(`Asante! ${formatKes(amount)} recorded for ${projects.get(selectedProject).name}.`, "success");
            amountInput.value = "";
          })
          .catch((error) => {
            setFeedback(error.message || "Unable to record donation right now.", "error");
          })
          .finally(() => {
            if (submitButton instanceof HTMLButtonElement) {
              submitButton.disabled = false;
            }
          });
      });
    }

    renderProjectProgress();

    hydrateProjectsFromApi().catch(() => {
      setFeedback("Donation backend unavailable. Start the website using npm install then npm start.", "error");
    });

    const projectFromQuery = new URLSearchParams(window.location.search).get("project");
    if (projectFromQuery && projects.has(projectFromQuery)) {
      focusProjectDonation(projectFromQuery, { scroll: false, updateUrl: false });
    }

    window.setInterval(() => {
      hydrateProjectsFromApi().catch(() => {
        // Ignore transient sync errors during background refresh.
      });
    }, 45000);
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

    const syncFiltersToUrl = () => {
      const url = new URL(window.location.href);

      ["series", "preacher", "topic", "book"].forEach((key) => {
        url.searchParams.delete(key);
      });

      filterControls.forEach((control) => {
        const key = control.getAttribute("data-sermon-filter");
        if (!key) {
          return;
        }

        if (control.value) {
          url.searchParams.set(key, control.value);
        }
      });

      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    };

    const setFiltersFromUrl = () => {
      const params = new URLSearchParams(window.location.search);

      filterControls.forEach((control) => {
        const key = control.getAttribute("data-sermon-filter");
        if (!key) {
          return;
        }

        const incomingValue = params.get(key);
        if (!incomingValue) {
          control.value = "";
          return;
        }

        const matchingOption = Array.from(control.options).find(
          (option) => normalize(option.value) === normalize(incomingValue)
        );

        control.value = matchingOption ? matchingOption.value : "";
      });
    };

    const applyFilters = (options = {}) => {
      const shouldSyncUrl = options.syncUrl !== false;
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

      if (shouldSyncUrl) {
        syncFiltersToUrl();
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

    setFiltersFromUrl();
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
