(() => {
  'use strict';

  /* =========================================================
     MAX & SHERRY — MAIN JAVASCRIPT
     Premium Hospitality Experience
     Built to match the existing HTML + CSS
     ========================================================= */

  const CONFIG = Object.freeze({
    selectors: Object.freeze({
      loader: '#site-loader',
      loaderLogo: '.site-loader__logo',
      loaderProgress: '.site-loader__progress-bar',
      loaderProgressTrack: '.site-loader__progress',

      header: '.js-header',
      hero: '#hero',

      menuToggle: '.js-menu-toggle',
      mobileNav: '.js-mobile-nav',
      mobileNavLinks: '.js-mobile-nav a:not(.js-future-link)',

      reveal: '.js-scroll-reveal',
      imageReveal: '.js-image-reveal',
      images: 'img',

      parallax: '.js-parallax',
      staggerGroup: '.js-stagger-group',

      futureLink: '.js-future-link',
      whatsapp: '.js-whatsapp',

      faqTrigger: '.js-faq-trigger',
      faqAnswer: '.faq__answer',

      scrollProgress: '.js-scroll-progress',

      navLinks: '.site-nav__link:not(.js-future-link)',
      allNavLinks: '.site-nav__link, .site-nav__mobile-link',

      year: '[data-current-year]'
    }),

    whatsappNumber: '265995700800',
    hiproniaNumber: '265999469705',

    whatsappMessages: Object.freeze({
      reservation:
        "Hi Max & Sherry 👋🏽 I'd like to make a reservation. Please let me know the available options.",

      menu:
        "Hi Max & Sherry 👋🏽 I'd like to ask about your current menu.",

      group:
        "Hi Max & Sherry 👋🏽 I'd like to enquire about a group booking.",

      event:
        "Hi Max & Sherry 👋🏽 I'd like to enquire about planning a gathering.",

      general:
        "Hi Max & Sherry 👋🏽 I'd like to make an enquiry."
    }),

    sections: [
      'hero',
      'welcome',
      'experience',
      'signature-dishes',
      'menu-preview',
      'story-preview',
      'people',
      'moments',
      'recognition',
      'events',
      'reviews',
      'faq',
      'visit',
      'reservation',
      'social'
    ],

    headerScrollThreshold: 40,
    loaderFallback: 5000,
    loaderMinimum: 450,
    parallaxMax: 28
  });

  /* =========================================================
     STATE
     ========================================================= */

  const state = {
    initialized: false,

    reducedMotion: false,

    loaderStartedAt: 0,
    loaderTimer: null,
    loaderFallbackTimer: null,

    headerRaf: 0,
    progressRaf: 0,
    parallaxRaf: 0,

    lastProgress: -1,
    lastHeaderScrolled: null,
    lastParallaxY: 0,

    parallaxElements: [],
    parallaxEnabled: false,

    mobileNavOpen: false,

    faqItems: [],
    faqResizeObserver: null
  };

  /* =========================================================
     DOM HELPERS
     ========================================================= */

  const $ = (selector, scope = document) =>
    scope.querySelector(selector);

  const $$ = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));

  /* =========================================================
     UTILITY HELPERS
     ========================================================= */

  const getReducedMotion = () => {
    try {
      return window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
    } catch {
      return false;
    }
  };

  const getHeader = () =>
    $(CONFIG.selectors.header);

  const getScrollY = () =>
    window.scrollY ||
    window.pageYOffset ||
    0;

  const clamp = (
    value,
    min = 0,
    max = 1
  ) =>
    Math.min(
      max,
      Math.max(min, value)
    );

  const safeDecode = (value) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  const setBodyScrollLocked = (locked) => {
    document.body.classList.toggle(
      'is-menu-open',
      locked
    );
  };

  const setElementHidden = (
    element,
    hidden
  ) => {
    if (!element) return;

    element.hidden = hidden;
  };

  const getWhatsAppUrl = (
    number,
    message = ''
  ) => {
    const base =
      `https://wa.me/${number}`;

    return message
      ? `${base}?text=${encodeURIComponent(message)}`
      : base;
  };

  /* =========================================================
     1. PREMIUM LOADER
     ========================================================= */

  function initLoader() {
    const loader =
      $(CONFIG.selectors.loader);

    if (!loader) {
      document.body.classList.remove(
        'is-loading'
      );

      document.documentElement.classList.remove(
        'is-loading'
      );

      return;
    }

    const logo =
      $(CONFIG.selectors.loaderLogo, loader);

    const progressBar =
      $(CONFIG.selectors.loaderProgress, loader);

    const progressTrack =
      $(CONFIG.selectors.loaderProgressTrack, loader);

    const status =
      $('.site-loader__status', loader);

    const reducedMotion =
      getReducedMotion();

    const startedAt =
      performance.now();

    state.loaderStartedAt =
      startedAt;

    document.body.classList.add(
      'is-loading'
    );

    document.documentElement.classList.add(
      'is-loading'
    );

    loader.setAttribute(
      'aria-busy',
      'true'
    );

    if (
      logo &&
      reducedMotion
    ) {
      logo.classList.add(
        'is-visible'
      );
    }

    const updateProgress = (
      value
    ) => {
      const progress =
        clamp(
          value / 100,
          0,
          1
        );

      if (progressBar) {
        progressBar.style.transform =
          `scaleX(${progress})`;
      }

      if (progressTrack) {
        progressTrack.setAttribute(
          'aria-valuenow',
          String(Math.round(value))
        );
      }
    };

    const finish = () => {
      if (
        !document.body.contains(loader)
      ) {
        return;
      }

      if (
        loader.classList.contains(
          'is-loaded'
        )
      ) {
        return;
      }

      if (state.loaderTimer) {
        window.clearTimeout(
          state.loaderTimer
        );
      }

      if (state.loaderFallbackTimer) {
        window.clearTimeout(
          state.loaderFallbackTimer
        );
      }

      updateProgress(100);

      if (logo) {
        logo.classList.add(
          'is-visible'
        );
      }

      loader.classList.add(
        'is-ready'
      );

      loader.setAttribute(
        'aria-busy',
        'false'
      );

      const elapsed =
        performance.now() -
        state.loaderStartedAt;

      const remaining =
        reducedMotion
          ? 0
          : Math.max(
              0,
              CONFIG.loaderMinimum -
                elapsed
            );

      state.loaderTimer =
        window.setTimeout(() => {
          loader.classList.add(
            'is-loaded'
          );

          document.body.classList.remove(
            'is-loading'
          );

          document.documentElement.classList.remove(
            'is-loading'
          );

          window.setTimeout(() => {
            if (
              document.body.contains(
                loader
              )
            ) {
              loader.setAttribute(
                'aria-hidden',
                'true'
              );
            }
          }, reducedMotion ? 20 : 800);
        }, remaining);
    };

    loader.classList.add(
      'is-ready'
    );

    /* Reduced motion:
       show immediately */
    if (reducedMotion) {
      updateProgress(100);

      if (status) {
        status.textContent =
          'Ready';
      }

      finish();

      return;
    }

    updateProgress(18);

    if (status) {
      status.textContent =
        'Preparing your experience';
    }

    window.requestAnimationFrame(() => {
      updateProgress(42);
    });

    const finishWhenReady = () => {
      if (
        document.readyState ===
        'complete'
      ) {
        updateProgress(100);
        finish();
      } else {
        updateProgress(78);

        window.addEventListener(
          'load',
          () => {
            updateProgress(100);
            finish();
          },
          { once: true }
        );
      }
    };

    if (
      document.readyState ===
      'complete'
    ) {
      finishWhenReady();
    } else {
      window.setTimeout(
        finishWhenReady,
        120
      );
    }

    /* Defensive fallback */
    state.loaderFallbackTimer =
      window.setTimeout(() => {
        if (status) {
          status.textContent =
            'Ready';
        }

        finish();
      }, CONFIG.loaderFallback);
  }

  /* =========================================================
     2. TRANSFORMING HEADER
     ========================================================= */

  function initHeader() {
    const header =
      getHeader();

    if (!header) return;

    const update = () => {
      state.headerRaf = 0;

      const scrolled =
        getScrollY() >
        CONFIG.headerScrollThreshold;

      if (
        scrolled ===
        state.lastHeaderScrolled
      ) {
        return;
      }

      state.lastHeaderScrolled =
        scrolled;

      header.classList.toggle(
        'is-scrolled',
        scrolled
      );
    };

    const requestUpdate = () => {
      if (state.headerRaf) {
        return;
      }

      state.headerRaf =
        window.requestAnimationFrame(
          update
        );
    };

    window.addEventListener(
      'scroll',
      requestUpdate,
      { passive: true }
    );

    window.addEventListener(
      'resize',
      requestUpdate,
      { passive: true }
    );

    update();
  }

  /* =========================================================
     3. MOBILE NAVIGATION
     ========================================================= */

  function initMobileNav() {
    const toggle =
      $(CONFIG.selectors.menuToggle);

    const mobileNav =
      $(CONFIG.selectors.mobileNav);

    if (
      !toggle ||
      !mobileNav
    ) {
      return;
    }

    const getFocusable = () =>
      $$(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        mobileNav
      ).filter(
        (element) =>
          !element.hidden
      );

    const close = ({
      restoreFocus = true
    } = {}) => {
      if (
        !state.mobileNavOpen
      ) {
        return;
      }

      state.mobileNavOpen =
        false;

      mobileNav.classList.remove(
        'is-open'
      );

      toggle.setAttribute(
        'aria-expanded',
        'false'
      );

      toggle.setAttribute(
        'aria-label',
        'Open navigation menu'
      );

      mobileNav.setAttribute(
        'aria-hidden',
        'true'
      );

      setBodyScrollLocked(
        false
      );

      if (
        restoreFocus
      ) {
        try {
          toggle.focus({
            preventScroll: true
          });
        } catch {
          toggle.focus();
        }
      }
    };

    const open = () => {
      state.mobileNavOpen =
        true;

      mobileNav.classList.add(
        'is-open'
      );

      toggle.setAttribute(
        'aria-expanded',
        'true'
      );

      toggle.setAttribute(
        'aria-label',
        'Close navigation menu'
      );

      mobileNav.setAttribute(
        'aria-hidden',
        'false'
      );

      setBodyScrollLocked(
        true
      );

      const firstFocusable =
        getFocusable()[0];

      if (firstFocusable) {
        window.requestAnimationFrame(
          () => {
            try {
              firstFocusable.focus({
                preventScroll: true
              });
            } catch {
              firstFocusable.focus();
            }
          }
        );
      }
    };

    const toggleMenu = () => {
      if (
        state.mobileNavOpen
      ) {
        close();
      } else {
        open();
      }
    };

    toggle.addEventListener(
      'click',
      toggleMenu
    );

    /* Close after normal mobile
       navigation */
    $$(CONFIG.selectors.mobileNavLinks, mobileNav)
      .forEach((link) => {
        link.addEventListener(
          'click',
          () => {
            close({
              restoreFocus: false
            });
          }
        );
      });

    /* Close when backdrop itself
       is clicked */
    mobileNav.addEventListener(
      'click',
      (event) => {
        if (
          event.target ===
          mobileNav
        ) {
          close();
        }
      }
    );

    /* Escape + focus trap */
    document.addEventListener(
      'keydown',
      (event) => {
        if (
          !state.mobileNavOpen
        ) {
          return;
        }

        if (
          event.key ===
          'Escape'
        ) {
          event.preventDefault();
          close();
          return;
        }

        if (
          event.key !==
          'Tab'
        ) {
          return;
        }

        const focusable =
          getFocusable();

        if (
          !focusable.length
        ) {
          return;
        }

        const first =
          focusable[0];

        const last =
          focusable[
            focusable.length - 1
          ];

        if (
          event.shiftKey &&
          document.activeElement ===
            first
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement ===
            last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    );

    /* If viewport becomes desktop,
       close mobile menu */
    let desktopQuery;

    try {
      desktopQuery =
        window.matchMedia(
          '(min-width: 1024px)'
        );
    } catch {
      desktopQuery = null;
    }

    if (desktopQuery) {
      const closeOnDesktop =
        (event) => {
          if (
            event.matches
          ) {
            close({
              restoreFocus: false
            });
          }
        };

      if (
        typeof desktopQuery.addEventListener ===
        'function'
      ) {
        desktopQuery.addEventListener(
          'change',
          closeOnDesktop
        );
      } else if (
        typeof desktopQuery.addListener ===
        'function'
      ) {
        desktopQuery.addListener(
          closeOnDesktop
        );
      }
    }
  }

  /* =========================================================
     4. ACTIVE NAVIGATION
     ========================================================= */

  function initActiveNavigation() {
    const links =
      $$(CONFIG.selectors.navLinks);

    if (
      !links.length ||
      !('IntersectionObserver' in window)
    ) {
      return;
    }

    const linkMap =
      new Map();

    links.forEach((link) => {
      const href =
        link.getAttribute(
          'href'
        );

      if (
        !href ||
        !href.startsWith('#')
      ) {
        return;
      }

      const id =
        href.slice(1);

      if (
        !id ||
        linkMap.has(id)
      ) {
        return;
      }

      linkMap.set(
        id,
        link
      );
    });

    const sections =
      CONFIG.sections
        .map((id) =>
          document.getElementById(id)
        )
        .filter(Boolean);

    if (
      !sections.length
    ) {
      return;
    }

    let activeId = '';

    const setActive = (
      id
    ) => {
      if (
        !id ||
        id === activeId
      ) {
        return;
      }

      activeId = id;

      links.forEach((link) => {
        const href =
          link.getAttribute(
            'href'
          );

        const isActive =
          href === `#${id}`;

        link.classList.toggle(
          'is-active',
          isActive
        );

        if (isActive) {
          link.setAttribute(
            'aria-current',
            'page'
          );
        } else {
          link.removeAttribute(
            'aria-current'
          );
        }
      });
    };

    const observer =
      new IntersectionObserver(
        (entries) => {
          const visible =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              );

          if (
            visible[0]
          ) {
            setActive(
              visible[0]
                .target
                .id
            );
          }
        },
        {
          root: null,
          rootMargin:
            '-35% 0px -55% 0px',
          threshold: [
            0,
            0.2,
            0.5,
            0.8
          ]
        }
      );

    sections.forEach(
      (section) =>
        observer.observe(section)
    );
  }

  /* =========================================================
     5. SMOOTH SCROLL
     ========================================================= */

  function initSmoothScroll() {
    const internalLinks =
      $$(
        'a[href^="#"]:not(.js-future-link)'
      );

    if (
      !internalLinks.length
    ) {
      return;
    }

    internalLinks.forEach(
      (link) => {
        link.addEventListener(
          'click',
          (event) => {
            const href =
              link.getAttribute(
                'href'
              );

            if (
              !href ||
              href === '#'
            ) {
              return;
            }

            const targetId =
              safeDecode(
                href.slice(1)
              );

            const target =
              document.getElementById(
                targetId
              );

            if (!target) {
              return;
            }

            event.preventDefault();

            /* Close mobile nav */
            const mobileNav =
              $(CONFIG.selectors.mobileNav);

            const toggle =
              $(CONFIG.selectors.menuToggle);

            if (
              mobileNav &&
              state.mobileNavOpen
            ) {
              mobileNav.classList.remove(
                'is-open'
              );

              mobileNav.setAttribute(
                'aria-hidden',
                'true'
              );

              state.mobileNavOpen =
                false;

              setBodyScrollLocked(
                false
              );

              if (toggle) {
                toggle.setAttribute(
                  'aria-expanded',
                  'false'
                );

                toggle.setAttribute(
                  'aria-label',
                  'Open navigation menu'
                );
              }
            }

            if (
              state.reducedMotion
            ) {
              target.scrollIntoView({
                block: 'start',
                behavior: 'auto'
              });

              return;
            }

            const header =
              getHeader();

            const headerHeight =
              header
                ? header.getBoundingClientRect()
                    .height
                : 0;

            const top =
              Math.max(
                0,
                target
                  .getBoundingClientRect()
                  .top +
                  getScrollY() -
                  headerHeight -
                  12
              );

            window.scrollTo({
              top,
              behavior: 'smooth'
            });
          }
        );
      }
    );
  }

  /* =========================================================
     6. SCROLL REVEALS
     ========================================================= */

  function initScrollReveal() {
    const elements =
      $$(CONFIG.selectors.reveal);

    if (
      !elements.length
    ) {
      return;
    }

    /* -----------------------------------------
       Stagger support
       Reads data-stagger-delay
       ----------------------------------------- */

    const groups =
      $$(CONFIG.selectors.staggerGroup);

    groups.forEach(
      (group) => {
        const rawDelay =
          Number.parseFloat(
            group.getAttribute(
              'data-stagger-delay'
            )
          );

        const delay =
          Number.isFinite(
            rawDelay
          ) &&
          rawDelay >= 0
            ? rawDelay
            : 0;

        const children =
          $$(CONFIG.selectors.reveal, group);

        children.forEach(
          (child, index) => {
            child.style.setProperty(
              '--stagger-delay',
              `${delay * index}ms`
            );
          }
        );
      }
    );

    /* Reduced motion / fallback */
    if (
      state.reducedMotion ||
      !('IntersectionObserver' in window)
    ) {
      elements.forEach(
        (element) =>
          element.classList.add(
            'is-visible'
          )
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries, currentObserver) => {
          entries.forEach(
            (entry) => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              entry.target.classList.add(
                'is-visible'
              );

              currentObserver.unobserve(
                entry.target
              );
            }
          );
        },
        {
          root: null,
          rootMargin:
            '0px 0px -8% 0px',
          threshold: 0.08
        }
      );

    elements.forEach(
      (element) =>
        observer.observe(element)
    );
  }

  /* =========================================================
     7. IMAGE REVEALS
     ========================================================= */

  function initImageReveal() {
    const elements =
      $$(CONFIG.selectors.imageReveal);

    if (
      !elements.length
    ) {
      return;
    }

    if (
      state.reducedMotion ||
      !('IntersectionObserver' in window)
    ) {
      elements.forEach(
        (element) =>
          element.classList.add(
            'is-visible'
          )
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries, currentObserver) => {
          entries.forEach(
            (entry) => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              entry.target.classList.add(
                'is-visible'
              );

              currentObserver.unobserve(
                entry.target
              );
            }
          );
        },
        {
          root: null,
          rootMargin:
            '0px 0px -5% 0px',
          threshold: 0.05
        }
      );

    elements.forEach(
      (element) =>
        observer.observe(element)
    );
  }

  /* =========================================================
     8. IMAGE LOADING STATES
     ========================================================= */

  function initImageStates() {
    const images =
      $$(CONFIG.selectors.images);

    if (
      !images.length
    ) {
      return;
    }

    images.forEach(
      (image) => {
        const frame =
          image.closest(
            '.image-frame'
          );

        const markLoaded =
          () => {
            image.classList.remove(
              'is-error'
            );

            image.classList.add(
              'is-loaded'
            );

            if (frame) {
              frame.classList.remove(
                'is-error'
              );

              frame.classList.add(
                'is-loaded'
              );
            }
          };

        const markError =
          () => {
            image.classList.remove(
              'is-loaded'
            );

            image.classList.add(
              'is-error'
            );

            if (frame) {
              frame.classList.remove(
                'is-loaded'
              );

              frame.classList.add(
                'is-error'
              );
            }
          };

        image.addEventListener(
          'load',
          markLoaded,
          { once: true }
        );

        image.addEventListener(
          'error',
          markError,
          { once: true }
        );

        /* Cached images */
        if (
          image.complete
        ) {
          if (
            image.naturalWidth >
            0
          ) {
            markLoaded();
          } else {
            markError();
          }
        }
      }
    );
  }

  /* =========================================================
     9. SUBTLE PARALLAX
     ========================================================= */

  function initParallax() {
    const elements =
      $$(CONFIG.selectors.parallax);

    if (
      !elements.length
    ) {
      return;
    }

    state.parallaxElements =
      elements;

    const mobileQuery =
      window.matchMedia(
        '(max-width: 767px)'
      );

    const shouldEnable =
      () =>
        !state.reducedMotion &&
        !mobileQuery.matches &&
        elements.length > 0;

    const apply = () => {
      state.parallaxRaf =
        0;

      if (
        !state.parallaxEnabled
      ) {
        return;
      }

      const viewportHeight =
        window.innerHeight ||
        document.documentElement
          .clientHeight;

      const scrollY =
        getScrollY();

      const header =
        getHeader();

      const headerHeight =
        header
          ? header.getBoundingClientRect()
              .height
          : 0;

      elements.forEach(
        (element) => {
          const rect =
            element.getBoundingClientRect();

          /* Only calculate visible/
             nearby elements */
          if (
            rect.bottom < -100 ||
            rect.top >
              viewportHeight + 100
          ) {
            return;
          }

          const center =
            rect.top +
            rect.height / 2;

          const viewportCenter =
            viewportHeight / 2;

          const distance =
            center -
            viewportCenter;

          const normalized =
            clamp(
              distance /
                Math.max(
                  viewportHeight,
                  1
                ),
              -1,
              1
            );

          const movement =
            clamp(
              normalized *
                CONFIG.parallaxMax,
              -CONFIG.parallaxMax,
              CONFIG.parallaxMax
            );

          element.style.transform =
            `translate3d(0, ${movement.toFixed(
              2
            )}px, 0)`;
        }
      );

      state.lastParallaxY =
        scrollY +
        headerHeight;
    };

    const request = () => {
      if (
        !state.parallaxEnabled ||
        state.parallaxRaf
      ) {
        return;
      }

      state.parallaxRaf =
        window.requestAnimationFrame(
          apply
        );
    };

    const setEnabled =
      (enabled) => {
        state.parallaxEnabled =
          enabled;

        if (!enabled) {
          elements.forEach(
            (element) => {
              element.style.transform =
                '';
            }
          );

          return;
        }

        request();
      };

    const handleViewportChange =
      () =>
        setEnabled(
          shouldEnable()
        );

    if (
      typeof mobileQuery.addEventListener ===
      'function'
    ) {
      mobileQuery.addEventListener(
        'change',
        handleViewportChange
      );
    } else if (
      typeof mobileQuery.addListener ===
      'function'
    ) {
      mobileQuery.addListener(
        handleViewportChange
      );
    }

    window.addEventListener(
      'scroll',
      request,
      { passive: true }
    );

    window.addEventListener(
      'resize',
      request,
      { passive: true }
    );

    setEnabled(
      shouldEnable()
    );
  }

  /* =========================================================
     10. FAQ ACCORDION
     ========================================================= */

  function initFAQ() {
    const triggers =
      $$(CONFIG.selectors.faqTrigger);

    if (
      !triggers.length
    ) {
      return;
    }

    const items =
      triggers
        .map((trigger) => {
          const id =
            trigger.getAttribute(
              'aria-controls'
            );

          const answer =
            id
              ? document.getElementById(
                  id
                )
              : null;

          const item =
            trigger.closest(
              '.faq__item'
            );

          if (!answer) {
            return null;
          }

          return {
            trigger,
            answer,
            item
          };
        })
        .filter(Boolean);

    state.faqItems =
      items;

    const getOpenItem =
      () =>
        items.find(
          ({ trigger }) =>
            trigger.getAttribute(
              'aria-expanded'
            ) === 'true'
        );

    const setIcon = (
      trigger,
      open
    ) => {
      const icon =
        $('.faq__icon', trigger);

      if (icon) {
        icon.textContent =
          open
            ? '−'
            : '+';
      }
    };

    const setClosedState =
      ({
        trigger,
        answer
      }) => {
        trigger.setAttribute(
          'aria-expanded',
          'false'
        );

        trigger.classList.remove(
          'is-open'
        );

        answer.classList.remove(
          'is-open'
        );

        answer.style.height =
          '0px';

        setElementHidden(
          answer,
          true
        );

        setIcon(
          trigger,
          false
        );
      };

    const open = ({
      trigger,
      answer
    }) => {
      const currentlyOpen =
        getOpenItem();

      if (
        currentlyOpen &&
        currentlyOpen.trigger !==
          trigger
      ) {
        close(
          currentlyOpen
        );
      }

      /* Important:
         remove hidden before measuring */
      setElementHidden(
        answer,
        false
      );

      answer.style.height =
        '0px';

      answer.classList.add(
        'is-open'
      );

      trigger.classList.add(
        'is-open'
      );

      trigger.setAttribute(
        'aria-expanded',
        'true'
      );

      setIcon(
        trigger,
        true
      );

      if (
        state.reducedMotion
      ) {
        answer.style.height =
          'auto';

        return;
      }

      /* Force layout before
         measuring scrollHeight */
      void answer.offsetHeight;

      answer.style.height =
        `${answer.scrollHeight}px`;

      const onTransitionEnd =
        (event) => {
          if (
            event.propertyName !==
            'height'
          ) {
            return;
          }

          if (
            trigger.getAttribute(
              'aria-expanded'
            ) !== 'true'
          ) {
            return;
          }

          answer.style.height =
            'auto';

          answer.removeEventListener(
            'transitionend',
            onTransitionEnd
          );
        };

      answer.addEventListener(
        'transitionend',
        onTransitionEnd
      );
    };

    function close(item) {
      const {
        trigger,
        answer
      } = item;

      if (
        trigger.getAttribute(
          'aria-expanded'
        ) !== 'true' &&
        answer.hidden
      ) {
        setClosedState(
          item
        );

        return;
      }

      trigger.setAttribute(
        'aria-expanded',
        'false'
      );

      trigger.classList.remove(
        'is-open'
      );

      answer.classList.remove(
        'is-open'
      );

      setIcon(
        trigger,
        false
      );

      if (
        state.reducedMotion
      ) {
        answer.style.height =
          '0px';

        setElementHidden(
          answer,
          true
        );

        return;
      }

      const currentHeight =
        answer.getBoundingClientRect()
          .height;

      answer.style.height =
        `${currentHeight}px`;

      void answer.offsetHeight;

      answer.style.height =
        '0px';

      const onTransitionEnd =
        (event) => {
          if (
            event.propertyName !==
            'height'
          ) {
            return;
          }

          setElementHidden(
            answer,
            true
          );

          answer.removeEventListener(
            'transitionend',
            onTransitionEnd
          );
        };

      answer.addEventListener(
        'transitionend',
        onTransitionEnd
      );
    }

    /* Initialize each FAQ */
    items.forEach(
      (item) => {
        const {
          trigger,
          answer
        } = item;

        const initiallyOpen =
          trigger.getAttribute(
            'aria-expanded'
          ) === 'true';

        if (
          !initiallyOpen
        ) {
          setClosedState(
            item
          );
        } else {
          setElementHidden(
            answer,
            false
          );

          answer.classList.add(
            'is-open'
          );

          trigger.classList.add(
            'is-open'
          );

          setIcon(
            trigger,
            true
          );

          answer.style.height =
            state.reducedMotion
              ? 'auto'
              : `${answer.scrollHeight}px`;
        }

        trigger.addEventListener(
          'click',
          () => {
            const isOpen =
              trigger.getAttribute(
                'aria-expanded'
              ) === 'true';

            if (isOpen) {
              close(item);
            } else {
              open(item);
            }
          }
        );
      }
    );

    /* Keep open FAQ heights
       correct if content changes */
    if (
      'ResizeObserver' in window
    ) {
      state.faqResizeObserver =
        new ResizeObserver(
          (entries) => {
            entries.forEach(
              (entry) => {
                const answer =
                  entry.target;

                const item =
                  items.find(
                    (candidate) =>
                      candidate.answer ===
                      answer
                  );

                if (
                  !item ||
                  item.trigger.getAttribute(
                    'aria-expanded'
                  ) !== 'true'
                ) {
                  return;
                }

                if (
                  answer.style.height !==
                  'auto'
                ) {
                  answer.style.height =
                    `${answer.scrollHeight}px`;
                }
              }
            );
          }
        );

      items.forEach(
        ({ answer }) =>
          state.faqResizeObserver.observe(
            answer
          )
      );
    }

    /* Recalculate on resize */
    window.addEventListener(
      'resize',
      () => {
        items.forEach(
          ({
            trigger,
            answer
          }) => {
            if (
              trigger.getAttribute(
                'aria-expanded'
              ) !== 'true'
            ) {
              return;
            }

            if (
              state.reducedMotion
            ) {
              answer.style.height =
                'auto';
            } else {
              answer.style.height =
                'auto';

              answer.style.height =
                `${answer.scrollHeight}px`;
            }
          }
        );
      },
      { passive: true }
    );
  }

  /* =========================================================
     11. FUTURE LINKS
     ========================================================= */

  function initFutureLinks() {
    const links =
      $$(CONFIG.selectors.futureLink);

    if (
      !links.length
    ) {
      return;
    }

    links.forEach(
      (link) => {
        /* Make future destinations
           clearly non-navigational
           to assistive technology */
        link.setAttribute(
          'aria-disabled',
          'true'
        );

        link.addEventListener(
          'click',
          (event) => {
            event.preventDefault();
          }
        );
      }
    );
  }

  /* =========================================================
     12. WHATSAPP CONVERSION SYSTEM
     ========================================================= */

  function initWhatsApp() {
    const links =
      $$(CONFIG.selectors.whatsapp);

    if (
      !links.length
    ) {
      return;
    }

    links.forEach(
      (link) => {
        const intent =
          (
            link.getAttribute(
              'data-whatsapp-intent'
            ) || ''
          )
            .trim()
            .toLowerCase();

        /* -----------------------------------------
           HIPRONIA FOOTER CTA
           ----------------------------------------- */

        if (
          intent ===
          'hipronia'
        ) {
          const existing =
            link.getAttribute(
              'href'
            ) || '';

          if (
            !existing.includes(
              '/265999469705'
            )
          ) {
            const message =
              "Hi Hipronia 👋🏽 I'd like to enquire about a website for my business.";

            link.setAttribute(
              'href',
              getWhatsAppUrl(
                CONFIG.hiproniaNumber,
                message
              )
            );
          }

          return;
        }

        /* -----------------------------------------
           MAX & SHERRY WHATSAPP
           ----------------------------------------- */

        const message =
          CONFIG.whatsappMessages[
            intent
          ] ||
          CONFIG.whatsappMessages.general;

        link.setAttribute(
          'href',
          getWhatsAppUrl(
            CONFIG.whatsappNumber,
            message
          )
        );
      }
    );
  }

  /* =========================================================
     13. SCROLL PROGRESS
     ========================================================= */

  function initScrollProgress() {
    const bar =
      $(CONFIG.selectors.scrollProgress);

    if (!bar) {
      return;
    }

    const update = () => {
      state.progressRaf =
        0;

      const documentElement =
        document.documentElement;

      const scrollTop =
        getScrollY();

      const viewportHeight =
        window.innerHeight ||
        documentElement.clientHeight ||
        0;

      const scrollHeight =
        Math.max(
          documentElement.scrollHeight,
          document.body
            ? document.body.scrollHeight
            : 0
        );

      const scrollable =
        Math.max(
          0,
          scrollHeight -
            viewportHeight
        );

      const progress =
        scrollable > 0
          ? clamp(
              scrollTop /
                scrollable
            )
          : 0;

      /* Avoid needless DOM writes */
      if (
        Math.abs(
          progress -
            state.lastProgress
        ) < 0.001
      ) {
        return;
      }

      state.lastProgress =
        progress;

      bar.style.transform =
        `scaleX(${progress})`;
    };

    const request = () => {
      if (
        state.progressRaf
      ) {
        return;
      }

      state.progressRaf =
        window.requestAnimationFrame(
          update
        );
    };

    window.addEventListener(
      'scroll',
      request,
      { passive: true }
    );

    window.addEventListener(
      'resize',
      request,
      { passive: true }
    );

    window.addEventListener(
      'orientationchange',
      request,
      { passive: true }
    );

    update();
  }

  /* =========================================================
     14. CURRENT YEAR
     ========================================================= */

  function initCurrentYear() {
    const year =
      new Date().getFullYear();

    $$(CONFIG.selectors.year)
      .forEach(
        (element) => {
          element.textContent =
            String(year);
        }
      );
  }

  /* =========================================================
     15. MASTER INITIALIZATION
     ========================================================= */

  function init() {
    if (
      state.initialized
    ) {
      return;
    }

    state.initialized =
      true;

    state.reducedMotion =
      getReducedMotion();

    /* Core systems */
    initLoader();
    initHeader();
    initMobileNav();
    initActiveNavigation();
    initSmoothScroll();

    /* Visual systems */
    initScrollReveal();
    initImageReveal();
    initParallax();
    initImageStates();

    /* Interaction systems */
    initFAQ();
    initFutureLinks();
    initWhatsApp();

    /* Utility */
    initScrollProgress();
    initCurrentYear();

    /* -----------------------------------------
       Listen for reduced-motion changes
       ----------------------------------------- */

    try {
      const motionQuery =
        window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        );

      const handleMotionChange =
        (event) => {
          state.reducedMotion =
            event.matches;

          /* Disable parallax immediately */
          if (
            state.reducedMotion &&
            state.parallaxElements.length
          ) {
            state.parallaxEnabled =
              false;

            state.parallaxElements.forEach(
              (element) => {
                element.style.transform =
                  '';
              }
            );
          }
        };

      if (
        typeof motionQuery.addEventListener ===
        'function'
      ) {
        motionQuery.addEventListener(
          'change',
          handleMotionChange
        );
      } else if (
        typeof motionQuery.addListener ===
        'function'
      ) {
        motionQuery.addListener(
          handleMotionChange
        );
      }
    } catch {
      /* CSS still handles
         reduced motion */
    }
  }

  /* =========================================================
     DOM READY
     ========================================================= */

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      init,
      { once: true }
    );
  } else {
    init();
  }
})();