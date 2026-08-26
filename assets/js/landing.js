(() => {
    "use strict";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = [...document.querySelectorAll("[data-reveal]")];

    if (reducedMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });
        revealItems.forEach((item) => revealObserver.observe(item));
    }

    const header = document.querySelector("[data-landing-header]");
    const updateHeader = () => header?.classList.toggle("is-stuck", window.scrollY > 90);
    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();


    const projects = {
        cups: {
            request: "We are opening a café and need takeaway cup designs. Scandinavian but not boring. Two sizes. The supplier sent a PDF, but I’m not sure what it is.",
            title: "Cup artwork",
            deliverables: "Artwork for 8oz and 12oz cups",
            formats: "Print-ready AI and PDF",
            direction: "Calm Scandinavian; distinctive, not playful",
            revisions: "Two consolidated rounds",
            date: "September 5",
            question: "Is the supplier PDF the final production dieline?",
        },
        deck: {
            request: "Our founder has a board meeting in three weeks. We have the numbers and rough notes, but need a clear, credible 15-slide presentation that makes the strategy easy to follow.",
            title: "Board presentation",
            deliverables: "15-slide narrative and visual deck",
            formats: "Editable PowerPoint and PDF",
            direction: "Credible, concise and decision-focused",
            revisions: "Two consolidated rounds",
            date: "September 12",
            question: "Who gives final approval on the financial narrative?",
        },
        research: {
            request: "We need to understand how five US competitors package and price their compliance products. We need useful evidence, not a huge report, for a strategy session next month.",
            title: "Competitor research",
            deliverables: "Five-company evidence-based comparison",
            formats: "Decision memo and source workbook",
            direction: "Commercially useful; concise and sourced",
            revisions: "One fact-check round",
            date: "September 18",
            question: "Which customer segment should the comparison prioritise?",
        },
    };

    const studio = document.querySelector("[data-project-studio]");
    if (!studio) return;

    const input = studio.querySelector("[data-project-input]");
    const scopeButton = studio.querySelector("[data-scope-button]");
    const status = studio.querySelector("[data-studio-status]");
    const exampleButtons = [...studio.querySelectorAll("[data-project-example]")];
    const fieldMap = {
        title: "[data-scope-title]",
        deliverables: "[data-scope-deliverables]",
        formats: "[data-scope-formats]",
        direction: "[data-scope-direction]",
        revisions: "[data-scope-revisions]",
        date: "[data-scope-date]",
        question: "[data-scope-question]",
    };
    let currentProject = "cups";
    let scopeTimers = [];

    const clearScopeTimers = () => {
        scopeTimers.forEach((timer) => window.clearTimeout(timer));
        scopeTimers = [];
    };

    const renderProject = (key) => {
        const project = projects[key];
        Object.entries(fieldMap).forEach(([field, selector]) => {
            const element = studio.querySelector(selector);
            if (element) element.textContent = project[field];
        });
    };

    exampleButtons.forEach((button) => button.addEventListener("click", () => {
        currentProject = button.dataset.projectExample;
        const project = projects[currentProject];
        input.value = project.request;
        exampleButtons.forEach((item) => item.classList.toggle("is-active", item === button));
        renderProject(currentProject);
        status.textContent = "Example changed. Ready to structure it.";
    }));

    input.addEventListener("input", () => {
        status.textContent = "Your words are saved in this preview only.";
    });

    scopeButton.addEventListener("click", () => {
        clearScopeTimers();
        studio.classList.add("is-working");
        scopeButton.disabled = true;
        const stages = [
            [0, "Clarifying the outcome…"],
            [550, "Identifying the right project requirements…"],
            [1100, "Making assumptions and open questions visible…"],
            [1650, "Project ready to confirm."],
        ];
        stages.forEach(([delay, message], index) => {
            scopeTimers.push(window.setTimeout(() => {
                status.textContent = message;
                if (index !== stages.length - 1) return;
                renderProject(currentProject);
                studio.classList.remove("is-working");
                scopeButton.disabled = false;
            }, reducedMotion ? index : delay));
        });
    });
})();
