import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";

function MainLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    const cardSelector = [
      ".dark-card",
      ".card",
      ".step-item",
      ".analysis-step-card",
      ".result-hero",
      ".dashboard-hero",
      ".result-info-card",
      ".score-card",
      ".insight-card",
      ".section-check-item",
      ".history-card",
      ".dashboard-stat-card",
      ".recent-item",
      ".upload-dropzone",
      ".analyze-summary > div",
      ".history-score-box",
      ".hero-stats > div",
      ".preview-score-row",
    ].join(",");

    const observedCards = new WeakSet();
    let cardIndex = 0;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -45px",
      }
    );

    function registerCards(root = document) {
      root.querySelectorAll(cardSelector).forEach((card) => {
        if (observedCards.has(card)) {
          return;
        }

        observedCards.add(card);
        card.classList.add(
          "scroll-reveal",
          cardIndex % 2 === 0 ? "reveal-left" : "reveal-right"
        );
        cardIndex += 1;
        revealObserver.observe(card);
      });
    }

    registerCards();

    const contentObserver = new MutationObserver(() => registerCards());
    const pageContent = document.querySelector("main");

    if (pageContent) {
      contentObserver.observe(pageContent, { childList: true, subtree: true });
    }

    return () => {
      revealObserver.disconnect();
      contentObserver.disconnect();
    };
  }, [pathname]);

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default MainLayout;
