// details.js — Details page with Preview + PDF Viewer
document.addEventListener("DOMContentLoaded", function () {
    var grid = document.getElementById("details-grid");
    var params = new URLSearchParams(window.location.search);
    var gigId = parseInt(params.get("id"));
    var gigs = getGigs();
    var gig = null;
    for (var i = 0; i < gigs.length; i++) {
        if (gigs[i].id === gigId) { gig = gigs[i]; break; }
    }
    if (!gig && gigs.length > 0) gig = gigs[0];
    if (!gig) {
        grid.innerHTML = '<div style="text-align:center;padding:60px;color:white;"><h2>Gig not found</h2><a href="index.html" style="color:#C084FC;">← Back</a></div>';
        return;
    }
    document.title = "AssignDone — " + gig.title;

    // Track if this gig is paid
    var paidGigs = JSON.parse(localStorage.getItem("assigndone_paid") || "[]");
    var isPaid = paidGigs.indexOf(gig.id) !== -1;

    // === LEFT COLUMN ===
    var mainCard = document.createElement("div");
    mainCard.className = "main-detail-card";

    var headerRow = document.createElement("div");
    headerRow.className = "detail-header";
    var tagSpan = document.createElement("span");
    tagSpan.className = "detail-tag";
    tagSpan.textContent = gig.subject;
    var dateSpan = document.createElement("span");
    dateSpan.className = "detail-date";
    dateSpan.textContent = "🕐 " + shortDate(gig.deadline);
    headerRow.appendChild(tagSpan);
    headerRow.appendChild(dateSpan);
    mainCard.appendChild(headerRow);

    var h1 = document.createElement("h1");
    h1.textContent = gig.title;
    mainCard.appendChild(h1);

    var descLabel = document.createElement("strong");
    descLabel.className = "desc-label";
    descLabel.textContent = "Description";
    mainCard.appendChild(descLabel);
    var descText = document.createElement("p");
    descText.className = "desc-text";
    descText.textContent = gig.description;
    mainCard.appendChild(descText);

    // PROJECT FILES
    var filesLabel = document.createElement("strong");
    filesLabel.className = "desc-label";
    filesLabel.textContent = "PROJECT FILES";
    mainCard.appendChild(filesLabel);

    var filesGrid = document.createElement("div");
    filesGrid.className = "files-grid";
    filesGrid.id = "files-grid";

    // Locked/Unlocked PDF card
    var fileCard1 = document.createElement("div");
    fileCard1.className = "file-card";
    fileCard1.id = "pdf-file-card";
    fileCard1.style.cursor = "pointer";
    var iconBox1 = document.createElement("div");
    iconBox1.className = "file-icon-box";
    iconBox1.textContent = "PDF";
    var fileInfo1 = document.createElement("div");
    fileInfo1.className = "file-info";
    var fname1 = document.createElement("strong");
    fname1.id = "pdf-file-name";
    var fspan1 = document.createElement("span");
    fspan1.id = "pdf-file-status";
    fileInfo1.appendChild(fname1);
    fileInfo1.appendChild(fspan1);
    var lockDiv = document.createElement("div");
    lockDiv.id = "pdf-lock-icon";
    lockDiv.style.cssText = "margin-left:auto; color:#9CA3AF; font-size:1.2rem;";
    fileCard1.appendChild(iconBox1);
    fileCard1.appendChild(fileInfo1);
    fileCard1.appendChild(lockDiv);

    // Quick View card
    var fileCard2 = document.createElement("div");
    fileCard2.className = "file-card";
    fileCard2.id = "quick-view-card";
    fileCard2.style.cssText = "border-color:#C4B5FD; background:#F5F3FF; cursor:pointer;";
    var iconBox2 = document.createElement("div");
    iconBox2.className = "file-icon-box";
    iconBox2.style.cssText = "background:white; color:#6D28D9;";
    iconBox2.textContent = "👁";
    var fileInfo2 = document.createElement("div");
    fileInfo2.className = "file-info";
    var fname2 = document.createElement("strong");
    fname2.style.color = "#6D28D9";
    fname2.textContent = "Quick View";
    var fspan2 = document.createElement("span");
    fspan2.textContent = "Preview First 2 Pages";
    fileInfo2.appendChild(fname2);
    fileInfo2.appendChild(fspan2);
    fileCard2.appendChild(iconBox2);
    fileCard2.appendChild(fileInfo2);

    filesGrid.appendChild(fileCard1);
    filesGrid.appendChild(fileCard2);
    mainCard.appendChild(filesGrid);

    // PDF Viewer container (hidden initially)
    var viewerWrap = document.createElement("div");
    viewerWrap.id = "pdf-viewer-section";
    viewerWrap.className = "pdf-viewer-section";
    viewerWrap.style.display = "none";
    mainCard.appendChild(viewerWrap);

    // === RIGHT COLUMN (sidebar) ===
    var sidebar = document.createElement("div");
    sidebar.className = "sidebar-card";
    var budgetLabel = document.createElement("div");
    budgetLabel.className = "budget-label";
    budgetLabel.textContent = "PROJECT BUDGET";
    var budgetAmount = document.createElement("div");
    budgetAmount.className = "budget-amount";
    budgetAmount.textContent = formatPrice(gig.price);
    var statusDiv = document.createElement("div");
    statusDiv.className = "detail-status-badge";
    statusDiv.id = "detail-status";
    statusDiv.textContent = gig.status;
    if (gig.status === "IN PROGRESS" || isPaid) {
        statusDiv.style.background = "#DBEAFE"; statusDiv.style.color = "#1E40AF";
        if (isPaid) statusDiv.textContent = "IN PROGRESS";
    }
    var payBtn = document.createElement("button");
    payBtn.className = "pay-btn";
    payBtn.id = "pay-btn";
    if (isPaid) {
        payBtn.textContent = "✓ Payment Complete";
        payBtn.style.background = "#059669";
        payBtn.disabled = true;
    } else {
        payBtn.textContent = "Accept & Pay via UPI";
    }
    var escrowNote = document.createElement("p");
    escrowNote.className = "escrow-note";
    escrowNote.textContent = "Funds are held securely in escrow until you approve the final submission.";
    var countdownDiv = document.createElement("div");
    countdownDiv.id = "countdown";
    countdownDiv.className = "countdown-box";

    var infoList = document.createElement("div");
    infoList.className = "info-list";
    var infoItems = [
        {icon:"📅",label:"DEADLINE",value:formatDate(gig.deadline)},
        {icon:"👤",label:"CLIENT",value:gig.client||gig.author},
        {icon:"📦",label:"CONTRACT TYPE",value:gig.contractType||"Digital Only"}
    ];
    for (var k = 0; k < infoItems.length; k++) {
        var ii = document.createElement("div"); ii.className = "info-item";
        var ic = document.createElement("div"); ic.className = "info-icon"; ic.textContent = infoItems[k].icon;
        var it = document.createElement("div"); it.className = "info-text";
        var sm = document.createElement("small"); sm.textContent = infoItems[k].label;
        var st = document.createElement("strong"); st.textContent = infoItems[k].value;
        it.appendChild(sm); it.appendChild(st);
        ii.appendChild(ic); ii.appendChild(it);
        infoList.appendChild(ii);
    }

    var upiBox = document.createElement("div"); upiBox.className = "UPI-box";
    var shi = document.createElement("div"); shi.style.cssText = "font-size:1.2rem;color:#059669;"; shi.textContent = "🛡";
    var utd = document.createElement("div");
    var us = document.createElement("strong"); us.textContent = "UPI Protected";
    var up = document.createElement("p"); up.textContent = "100% money back guarantee if the work doesn't meet requirements.";
    utd.appendChild(us); utd.appendChild(up);
    upiBox.appendChild(shi); upiBox.appendChild(utd);

    sidebar.appendChild(budgetLabel);
    sidebar.appendChild(budgetAmount);
    sidebar.appendChild(statusDiv);
    sidebar.appendChild(payBtn);
    sidebar.appendChild(escrowNote);
    sidebar.appendChild(countdownDiv);
    sidebar.appendChild(infoList);
    sidebar.appendChild(upiBox);

    grid.appendChild(mainCard);
    grid.appendChild(sidebar);

    // === Update file card state ===
    function updateFileState() {
        var fn = document.getElementById("pdf-file-name");
        var fs = document.getElementById("pdf-file-status");
        var li = document.getElementById("pdf-lock-icon");
        var fc = document.getElementById("pdf-file-card");
        if (isPaid) {
            fn.textContent = "Project_Full_Brief.pdf";
            fs.textContent = "Click to view full document";
            fs.style.color = "#059669";
            li.textContent = "📄";
            fc.style.borderColor = "#10B981";
            fc.style.background = "#F0FDF4";
        } else {
            fn.textContent = "Project_Full_Brief...";
            fs.textContent = "Payment Required to Unlock";
            li.textContent = "🔒";
        }
    }
    updateFileState();

    // === QUICK VIEW — Preview Modal ===
    fileCard2.addEventListener("click", function () {
        showPreviewModal(gig);
    });

    function showPreviewModal(gig) {
        var overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "preview-overlay";
        var modal = document.createElement("div");
        modal.className = "modal-box preview-modal";

        var header = document.createElement("div");
        header.className = "preview-header";
        var title = document.createElement("h2");
        title.textContent = "👁 Quick Preview";
        var closeBtn = document.createElement("button");
        closeBtn.className = "preview-close-btn";
        closeBtn.textContent = "✕";
        header.appendChild(title);
        header.appendChild(closeBtn);
        modal.appendChild(header);

        var subtitle = document.createElement("p");
        subtitle.style.cssText = "color:#9CA3AF;margin-bottom:20px;font-size:0.85rem;";
        subtitle.textContent = "Showing first 2 pages of the project brief";
        modal.appendChild(subtitle);

        // Page 1
        var page1 = document.createElement("div");
        page1.className = "preview-page";
        var p1title = document.createElement("h3");
        p1title.textContent = gig.title;
        p1title.style.cssText = "color:#111827;margin-bottom:10px;";
        var p1sub = document.createElement("div");
        p1sub.style.cssText = "display:flex;gap:10px;margin-bottom:15px;font-size:0.8rem;color:#6B7280;";
        p1sub.innerHTML = "<span>Subject: " + gig.subject + "</span><span>Client: " + (gig.client || gig.author) + "</span>";
        var p1desc = document.createElement("p");
        p1desc.style.cssText = "color:#374151;line-height:1.7;font-size:0.9rem;";
        p1desc.textContent = gig.description;
        var p1extra = document.createElement("div");
        p1extra.style.cssText = "margin-top:15px;padding:12px;background:#F3E8FF;border-radius:8px;font-size:0.85rem;color:#6D28D9;";
        p1extra.textContent = "📋 Requirements: Detailed solution with step-by-step explanation. Format: PDF/Word. References required.";
        page1.appendChild(p1title);
        page1.appendChild(p1sub);
        page1.appendChild(p1desc);
        page1.appendChild(p1extra);

        // Page 2 (blurred for non-premium)
        var page2 = document.createElement("div");
        page2.className = "preview-page";
        if (!isPremium()) page2.classList.add("preview-page-blurred");
        var p2title = document.createElement("h3");
        p2title.textContent = "Detailed Specifications";
        p2title.style.cssText = "color:#111827;margin-bottom:10px;";
        var p2text = document.createElement("p");
        p2text.style.cssText = "color:#374151;line-height:1.7;font-size:0.9rem;";
        p2text.textContent = "The deliverable must include comprehensive analysis with proper citations. All work should be original and plagiarism-free. Include diagrams where applicable. Submission deadline is strict — late submissions will not be accepted. Budget includes one round of revisions.";
        var p2specs = document.createElement("div");
        p2specs.style.cssText = "margin-top:12px;";
        p2specs.innerHTML = '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #E5E7EB;font-size:0.85rem;"><span style="color:#6B7280;">Budget</span><strong style="color:#111827;">' + formatPrice(gig.price) + '</strong></div><div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #E5E7EB;font-size:0.85rem;"><span style="color:#6B7280;">Deadline</span><strong style="color:#111827;">' + formatDate(gig.deadline) + '</strong></div><div style="display:flex;justify-content:space-between;padding:8px 0;font-size:0.85rem;"><span style="color:#6B7280;">Type</span><strong style="color:#111827;">' + (gig.contractType || "Digital") + '</strong></div>';
        page2.appendChild(p2title);
        page2.appendChild(p2text);
        page2.appendChild(p2specs);

        // Blur overlay for non-premium
        if (!isPremium()) {
            var blurOverlay = document.createElement("div");
            blurOverlay.className = "blur-upgrade-overlay";
            var lockMsg = document.createElement("div");
            lockMsg.className = "blur-upgrade-msg";
            lockMsg.innerHTML = '<div style="font-size:2rem;">🔒</div><strong>Premium Required</strong><p>Upgrade to view full preview</p>';
            var upgradeBtn = document.createElement("button");
            upgradeBtn.className = "premium-buy-btn";
            upgradeBtn.style.cssText = "background:#F59E0B;margin-top:10px;font-size:0.85rem;padding:8px 20px;";
            upgradeBtn.textContent = "⭐ Get Premium";
            upgradeBtn.addEventListener("click", function () {
                closeModal("preview-overlay");
                showPremiumModal();
            });
            lockMsg.appendChild(upgradeBtn);
            blurOverlay.appendChild(lockMsg);
            page2.appendChild(blurOverlay);
        }

        var pageLabel1 = document.createElement("div");
        pageLabel1.className = "page-label";
        pageLabel1.textContent = "Page 1 of 2";
        var pageLabel2 = document.createElement("div");
        pageLabel2.className = "page-label";
        pageLabel2.textContent = "Page 2 of 2";

        modal.appendChild(page1);
        modal.appendChild(pageLabel1);
        modal.appendChild(page2);
        modal.appendChild(pageLabel2);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        setTimeout(function () { overlay.classList.add("modal-visible"); }, 10);
        closeBtn.addEventListener("click", function () { closeModal("preview-overlay"); });
        overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal("preview-overlay"); });
    }

    // === PDF FILE CARD — Full PDF Viewer ===
    fileCard1.addEventListener("click", function () {
        if (!isPaid) {
            showToast("Complete payment first to unlock this file", "error");
            return;
        }
        showPDFViewer(gig);
    });

    function showPDFViewer(gig) {
        var overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "pdf-viewer-overlay";
        var modal = document.createElement("div");
        modal.className = "modal-box pdf-viewer-modal";

        // Toolbar
        var toolbar = document.createElement("div");
        toolbar.className = "pdf-toolbar";
        var tbTitle = document.createElement("span");
        tbTitle.textContent = "📄 " + gig.title + ".pdf";
        tbTitle.style.fontWeight = "bold";
        var tbActions = document.createElement("div");
        tbActions.style.cssText = "display:flex;gap:10px;align-items:center;";
        var pageInfo = document.createElement("span");
        pageInfo.id = "pdf-page-info";
        pageInfo.style.cssText = "font-size:0.8rem;color:#9CA3AF;";
        var prevBtn = document.createElement("button");
        prevBtn.className = "pdf-nav-btn";
        prevBtn.textContent = "◀";
        prevBtn.id = "pdf-prev";
        var nextBtn = document.createElement("button");
        nextBtn.className = "pdf-nav-btn";
        nextBtn.textContent = "▶";
        nextBtn.id = "pdf-next";
        var closeB = document.createElement("button");
        closeB.className = "preview-close-btn";
        closeB.textContent = "✕";
        tbActions.appendChild(pageInfo);
        tbActions.appendChild(prevBtn);
        tbActions.appendChild(nextBtn);
        tbActions.appendChild(closeB);
        toolbar.appendChild(tbTitle);
        toolbar.appendChild(tbActions);
        modal.appendChild(toolbar);

        // PDF pages container
        var pagesWrap = document.createElement("div");
        pagesWrap.className = "pdf-pages-wrap";
        pagesWrap.id = "pdf-pages";

        // Generate 5 fake PDF pages
        var pageData = [
            {title: "Project Brief", content: gig.description + "\n\nThis document outlines the complete requirements for the project. All deliverables must meet the specified quality standards."},
            {title: "Requirements & Scope", content: "Detailed analysis required with step-by-step solutions. Must include proper formatting, citations, and references. Original work only — plagiarism check will be performed."},
            {title: "Timeline & Milestones", content: "Milestone 1: Initial draft — 50% of deadline\nMilestone 2: Review round — 75% of deadline\nMilestone 3: Final submission — 100% of deadline\n\nLate submissions will incur a 10% penalty per day."},
            {title: "Budget Breakdown", content: "Base cost: " + formatPrice(Math.round(gig.price * 0.7)) + "\nPlatform fee: " + formatPrice(Math.round(gig.price * 0.1)) + "\nRevision buffer: " + formatPrice(Math.round(gig.price * 0.2)) + "\n\nTotal: " + formatPrice(gig.price)},
            {title: "Terms & Conditions", content: "By accepting this project you agree to deliver original, high-quality work within the specified deadline. AssignDone holds funds in escrow until the client approves. One round of revisions is included in the budget."}
        ];

        for (var p = 0; p < pageData.length; p++) {
            var page = document.createElement("div");
            page.className = "pdf-page";
            if (p > 0) page.style.display = "none";
            var ph = document.createElement("div");
            ph.className = "pdf-page-header";
            ph.innerHTML = '<span style="font-weight:800;color:#6D28D9;">AssignDone</span><span style="color:#9CA3AF;font-size:0.8rem;">CONFIDENTIAL</span>';
            page.appendChild(ph);
            var pt = document.createElement("h3");
            pt.style.cssText = "color:#111827;margin:15px 0 10px;";
            pt.textContent = pageData[p].title;
            page.appendChild(pt);
            var lines = pageData[p].content.split("\n");
            for (var l = 0; l < lines.length; l++) {
                var lp = document.createElement("p");
                lp.style.cssText = "color:#374151;line-height:1.8;font-size:0.9rem;margin-bottom:6px;";
                lp.textContent = lines[l];
                page.appendChild(lp);
            }
            var footer = document.createElement("div");
            footer.className = "pdf-page-footer";
            footer.textContent = "Page " + (p + 1) + " of " + pageData.length + "  |  " + gig.title;
            page.appendChild(footer);
            pagesWrap.appendChild(page);
        }
        modal.appendChild(pagesWrap);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        setTimeout(function () { overlay.classList.add("modal-visible"); }, 10);

        // Page navigation
        var currentPage = 0;
        var totalPages = pageData.length;
        var allPages = pagesWrap.querySelectorAll(".pdf-page");
        document.getElementById("pdf-page-info").textContent = "1 / " + totalPages;

        document.getElementById("pdf-prev").addEventListener("click", function () {
            if (currentPage > 0) { allPages[currentPage].style.display = "none"; currentPage--; allPages[currentPage].style.display = "block"; document.getElementById("pdf-page-info").textContent = (currentPage + 1) + " / " + totalPages; }
        });
        document.getElementById("pdf-next").addEventListener("click", function () {
            if (currentPage < totalPages - 1) { allPages[currentPage].style.display = "none"; currentPage++; allPages[currentPage].style.display = "block"; document.getElementById("pdf-page-info").textContent = (currentPage + 1) + " / " + totalPages; }
        });

        closeB.addEventListener("click", function () { closeModal("pdf-viewer-overlay"); });
        overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal("pdf-viewer-overlay"); });
    }

    // === Countdown ===
    function updateCountdown() {
        var now = new Date();
        var deadline = new Date(gig.deadline + "T23:59:59");
        var diff = deadline - now;
        var el = document.getElementById("countdown");
        if (diff <= 0) { el.textContent = "⏰ Deadline passed!"; el.style.color = "#EF4444"; return; }
        var d = Math.floor(diff / 86400000);
        var h = Math.floor((diff % 86400000) / 3600000);
        var m = Math.floor((diff % 3600000) / 60000);
        var s = Math.floor((diff % 60000) / 1000);
        el.textContent = "⏳ " + d + "d " + h + "h " + m + "m " + s + "s left";
        el.style.color = d < 2 ? "#F59E0B" : "#10B981";
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // === Pay button ===
    payBtn.addEventListener("click", function () {
        if (isPaid) return;
        if (getWallet() < gig.price) { showToast("Insufficient balance! Add money first.", "error"); return; }
        showPayModal(gig);
    });

    function showPayModal(gig) {
        var overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "pay-overlay";
        var modal = document.createElement("div");
        modal.className = "modal-box";
        var mh = document.createElement("h2");
        mh.textContent = "💳 Confirm Payment";
        modal.appendChild(mh);
        var summary = document.createElement("div");
        summary.style.cssText = "margin:20px 0;padding:15px;background:#1F2128;border-radius:10px;border:1px solid #374151;";
        summary.innerHTML = '<p style="color:#E5E7EB;font-weight:bold;">' + gig.title + '</p><p style="color:#C084FC;font-size:1.5rem;font-weight:800;margin-top:5px;">' + formatPrice(gig.price) + '</p><p style="color:#6B7280;font-size:0.8rem;margin-top:5px;">Wallet: ' + formatPrice(getWallet()) + '</p>';
        modal.appendChild(summary);
        var btns = document.createElement("div");
        btns.className = "modal-buttons";
        var cb = document.createElement("button");
        cb.className = "modal-btn modal-btn-cancel";
        cb.textContent = "Cancel";
        var cfb = document.createElement("button");
        cfb.className = "modal-btn modal-btn-confirm";
        cfb.textContent = "Pay " + formatPrice(gig.price);
        btns.appendChild(cb);
        btns.appendChild(cfb);
        modal.appendChild(btns);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        setTimeout(function () { overlay.classList.add("modal-visible"); }, 10);
        cb.addEventListener("click", function () { closeModal("pay-overlay"); });
        overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal("pay-overlay"); });

        cfb.addEventListener("click", function () {
            setWallet(getWallet() - gig.price);
            updateWalletDisplay();
            var allGigs = getGigs();
            for (var g = 0; g < allGigs.length; g++) {
                if (allGigs[g].id === gig.id) { allGigs[g].status = "IN PROGRESS"; break; }
            }
            saveGigs(allGigs);
            // Mark as paid
            var paid = JSON.parse(localStorage.getItem("assigndone_paid") || "[]");
            if (paid.indexOf(gig.id) === -1) paid.push(gig.id);
            localStorage.setItem("assigndone_paid", JSON.stringify(paid));
            isPaid = true;
            closeModal("pay-overlay");
            payBtn.textContent = "✓ Payment Complete";
            payBtn.style.background = "#059669";
            payBtn.disabled = true;
            var badge = document.getElementById("detail-status");
            if (badge) { badge.textContent = "IN PROGRESS"; badge.style.background = "#DBEAFE"; badge.style.color = "#1E40AF"; }
            updateFileState();
            showToast("Payment successful! PDF is now unlocked 📄", "success");
        });
    }
});
