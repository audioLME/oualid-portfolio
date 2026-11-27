(() => {
  const time = document.getElementById("local-time");
  const year = document.getElementById("year");
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.getElementById("site-nav");

  function updateTime() {
    if (!time) return;
    time.textContent = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Algiers",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(new Date());
  }

  updateTime();
  window.setInterval(updateTime, 60000);
  if (year) year.textContent = String(new Date().getFullYear());

  if (menuButton && navigation) {
    const closeMenu = () => {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
      navigation.classList.remove("is-open");
    };

    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      navigation.classList.toggle("is-open", !isOpen);
    });

    navigation.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }
})();
