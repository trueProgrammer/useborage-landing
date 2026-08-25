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

    const workSection = document.querySelector("[data-work-removed]");
    const frictionItems = [...document.querySelectorAll("[data-friction-item]")];
    const replayButtons = [...document.querySelectorAll("[data-replay-friction]")];
    let frictionTimers = [];

    const clearFrictionTimers = () => {
        frictionTimers.forEach((timer) => window.clearTimeout(timer));
        frictionTimers = [];
    };

    const playFriction = (audience = document.body.dataset.audience || "buyer") => {
        clearFrictionTimers();
        frictionItems.forEach((item) => item.classList.remove("is-removed"));
        frictionItems.filter((item) => item.dataset.frictionItem === audience).forEach((item, index) => {
            const delay = reducedMotion ? 0 : 140 + index * 115;
            frictionTimers.push(window.setTimeout(() => item.classList.add("is-removed"), delay));
        });
    };

    replayButtons.forEach((button) => button.addEventListener("click", () => playFriction()));

    const audienceCopy = {
        buyer: {
            pageTitle: "Borage | Managed Project Delivery for Business",
            status: "Buyer view",
            heroEyebrow: "Managed project delivery",
            heroTitle: "Tell us what<br>you need. <em>Get it done.</em>",
            heroLede: "Tell Borage what you need. We define the project, find the right professional, manage the work, and check the result before you approve it.",
            heroPrimary: "Describe your project",
            heroPrimaryHref: "#describe",
            heroReassurance: "No job post. No candidate search. No obligation to proceed.",
            signalRequestLabel: "01 · Your request",
            signalRequestCopy: "“We need the cup artwork ready for our printer by September.”",
            signalCoreSteps: "scope · source · manage",
            signalResultLabel: "02 · Ready to approve",
            signalResults: [["Scope", "Confirmed"], ["Professional", "Confirmed"], ["Delivery", "05 Sep"]],
            signalCaption: "Work done. No more work to manage.",
            proof: ["One accountable partner", "One clear price", "Managed delivery", "Checked before review"],
            frictionEyebrow: "The work around the work",
            frictionTitle: "Two simple facts. One<br>needlessly complicated process.",
            frictionDescription: "A business needs a result. A professional has the expertise to deliver it. Everything in between is the work around the work.",
            headerCta: "Start a project",
            headerCtaHref: "#describe",
            howHref: "/how-it-works",
            finalKicker: "Whatever is sitting on your list—",
            finalTitle: "What needs<br>to be done?",
            finalCta: "Tell Borage",
            finalCtaHref: "#describe",
        },
        professional: {
            pageTitle: "Borage for Professionals | Clear Projects, Fair Terms",
            status: "Professional view",
            heroEyebrow: "For independent professionals",
            heroTitle: "Do the work.<br><em>Not the chasing.</em>",
            heroLede: "Receive relevant, private invitations with the scope, fee range, date and acceptance criteria already clear. Borage manages the contract, reviews and follow-through around your work.",
            heroPrimary: "See the professional path",
            heroPrimaryHref: "#professionals",
            heroReassurance: "Private invitations. No public bid wall. No unpaid pitch.",
            signalRequestLabel: "01 · Private invitation",
            signalRequestCopy: "Packaging artwork · $1,400–$1,900 · Sep 5 · 2 revisions",
            signalCoreSteps: "brief · terms · protect",
            signalResultLabel: "02 · Ready to respond",
            signalResults: [["Scope", "Clear"], ["Files", "Attached"], ["Review", "Defined"]],
            signalCaption: "Clear projects. Fair terms. No chasing.",
            proof: ["Private invitations", "Visible fee range", "Controlled scope", "Defined review window"],
            frictionEyebrow: "The work around your work",
            frictionTitle: "Your expertise should not come<br>with a second job.",
            frictionDescription: "Borage removes the repeated clarification, contract admin, open-ended reviews and chasing between a clear invitation and paid delivery.",
            headerCta: "Join the network",
            headerCtaHref: "#professionals",
            howHref: "/for-professionals",
            finalKicker: "Ready for properly formed work—",
            finalTitle: "Clear projects.<br>Fair terms.",
            finalCta: "Join Borage",
            finalCtaHref: "/sign-in",
        },
    };

    const audienceButtons = [...document.querySelectorAll("[data-audience-button]")];
    const frictionViews = [...document.querySelectorAll("[data-friction-view]")];
    const setText = (selector, value) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = value;
    };
    const setHtml = (selector, value) => {
        const element = document.querySelector(selector);
        if (element) element.innerHTML = value;
    };

    const selectAudience = (audience) => {
        const copy = audienceCopy[audience];
        if (!copy) return;

        document.body.dataset.audience = audience;
        document.title = copy.pageTitle;
        audienceButtons.forEach((button) => {
            const active = button.dataset.audienceButton === audience;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });
        frictionViews.forEach((view) => {
            const active = view.dataset.frictionView === audience;
            view.hidden = !active;
            if (active) {
                view.querySelectorAll("[data-reveal]").forEach((item) => item.classList.add("is-visible"));
            }
        });

        setText("[data-audience-status]", copy.status);
        setText("[data-hero-eyebrow]", copy.heroEyebrow);
        setHtml("[data-hero-title]", copy.heroTitle);
        setText("[data-hero-lede]", copy.heroLede);
        setText("[data-hero-primary-label]", copy.heroPrimary);
        document.querySelector("[data-hero-primary]")?.setAttribute("href", copy.heroPrimaryHref);
        setText("[data-hero-reassurance]", copy.heroReassurance);
        setText("[data-signal-request-label]", copy.signalRequestLabel);
        setText("[data-signal-request-copy]", copy.signalRequestCopy);
        setText("[data-signal-core-steps]", copy.signalCoreSteps);
        setText("[data-signal-result-label]", copy.signalResultLabel);
        copy.signalResults.forEach(([label, value], index) => {
            setText(`[data-result-label="${index}"]`, label);
            setText(`[data-result-value="${index}"]`, value);
        });
        setText("[data-signal-caption]", copy.signalCaption);
        copy.proof.forEach((value, index) => setText(`[data-proof="${index}"]`, value));
        setText("[data-friction-eyebrow]", copy.frictionEyebrow);
        setHtml("[data-friction-title]", copy.frictionTitle);
        setText("[data-friction-description]", copy.frictionDescription);
        setText("[data-header-cta-label]", copy.headerCta);
        document.querySelector("[data-header-cta]")?.setAttribute("href", copy.headerCtaHref);
        document.querySelectorAll("[data-how-link]").forEach((link) => link.setAttribute("href", copy.howHref));
        setText("[data-final-kicker]", copy.finalKicker);
        setHtml("[data-final-title]", copy.finalTitle);
        setText("[data-final-cta-label]", copy.finalCta);
        document.querySelector("[data-final-cta]")?.setAttribute("href", copy.finalCtaHref);
        playFriction(audience);
    };

    audienceButtons.forEach((button) => button.addEventListener("click", () => {
        selectAudience(button.dataset.audienceButton);
    }));
    document.querySelectorAll("[data-select-audience]").forEach((link) => link.addEventListener("click", () => {
        selectAudience(link.dataset.selectAudience);
    }));

    if (workSection && "IntersectionObserver" in window && !reducedMotion) {
        const frictionObserver = new IntersectionObserver((entries, observer) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            playFriction(document.body.dataset.audience);
            observer.disconnect();
        }, { threshold: 0.28 });
        frictionObserver.observe(workSection);
    } else {
        playFriction();
    }

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
