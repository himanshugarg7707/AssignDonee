var defaultGigs = [
    {
        id: 1,
        title: "Advanced Calculus III Integration Set",
        subject: "MATHEMATICS",
        author: "Rohan Mehta",
        price: 2500,
        deadline: "2026-03-14",
        status: "OPEN",
        description: "I need help solving 10 advanced integration problems involving triple integrals and spherical coordinates. Must show all steps clearly for semester finals.",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500",
        contractType: "Digital Only",
        client: "Yogendra Mehta"
    },
    {
        id: 2,
        title: "React Native Payment Gateway",
        subject: "COMPUTER SCIENCE",
        author: "Priya Sharma",
        price: 8000,
        deadline: "2026-03-17",
        status: "OPEN",
        description: "Build a prototype app integrating Razorpay or PhonePe in React Native (Expo). Needs to handle callbacks.",
        image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=500",
        contractType: "Digital Only",
        client: "Priya Sharma"
    },
    {
        id: 3,
        title: "Analysis of Colonialism",
        subject: "LITERATURE",
        author: "Arjun Verma",
        price: 1500,
        deadline: "2026-02-15",
        status: "IN PROGRESS",
        description: "A 2000-word essay analyzing the post-colonial themes in Midnight's Children. Needs diverse references.",
        image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500",
        contractType: "Offline Copy",
        client: "Arjun Verma"
    }
];

function getGigs() {
    var stored = localStorage.getItem("assigndone_gigs");
    if (stored) {
        return JSON.parse(stored);
    }
    localStorage.setItem("assigndone_gigs", JSON.stringify(defaultGigs));
    return defaultGigs;
}

function saveGigs(gigs) {
    localStorage.setItem("assigndone_gigs", JSON.stringify(gigs));
}

function getWallet() {
    var w = localStorage.getItem("assigndone_wallet");
    return w ? parseInt(w) : 50000;
}

function setWallet(val) {
    localStorage.setItem("assigndone_wallet", String(val));
}

function isPremium() {
    return localStorage.getItem("assigndone_premium") === "true";
}

function setPremium(val) {
    localStorage.setItem("assigndone_premium", val ? "true" : "false");
}

function getPremiumPlan() {
    return localStorage.getItem("assigndone_premium_plan") || "Free";
}

function setPremiumPlan(plan) {
    localStorage.setItem("assigndone_premium_plan", plan);
}

function getTheme() {
    return localStorage.getItem("assigndone_theme") || "dark";
}

function setTheme(t) {
    localStorage.setItem("assigndone_theme", t);
}

function applyTheme() {
    var theme = getTheme();
    if (theme === "light") {
        document.body.classList.add("light-mode");
    } else {
        document.body.classList.remove("light-mode");
    }
    var toggleLinks = document.querySelectorAll(".theme-toggle-link");
    for (var i = 0; i < toggleLinks.length; i++) {
        toggleLinks[i].textContent = theme === "dark" ? "☀ Light Mode" : "🌙 Dark Mode";
    }
}

function showToast(message, type) {
    type = type || "info";
    var toast = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function () {
        toast.classList.add("toast-show");
    }, 50);

    setTimeout(function () {
        toast.classList.remove("toast-show");
        setTimeout(function () {
            document.body.removeChild(toast);
        }, 400);
    }, 3000);
}

function formatPrice(num) {
    return "₹" + num.toLocaleString("en-IN");
}

function formatDate(dateStr) {
    var d = new Date(dateStr);
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + ", " + d.getFullYear();
}

function shortDate(dateStr) {
    var d = new Date(dateStr);
    return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
}

function updateWalletDisplay() {
    var walletSpans = document.querySelectorAll(".wallet-amount");
    var bal = getWallet();
    for (var i = 0; i < walletSpans.length; i++) {
        walletSpans[i].textContent = formatPrice(bal);
    }
    var badges = document.querySelectorAll(".premium-badge");
    for (var j = 0; j < badges.length; j++) {
        badges[j].style.display = isPremium() ? "inline-block" : "none";
    }
}

function setupDropdown() {
    var container = document.querySelector(".dropdown-container");
    var btn = document.querySelector(".new-btn");
    if (!container || !btn) return;

    btn.addEventListener("click", function (e) {
        e.preventDefault();
        container.classList.toggle("dropdown-open");
    });

    document.addEventListener("click", function (e) {
        if (!container.contains(e.target)) {
            container.classList.remove("dropdown-open");
        }
    });
}

function setupThemeToggle() {
    var toggleLinks = document.querySelectorAll(".theme-toggle-link");
    for (var i = 0; i < toggleLinks.length; i++) {
        toggleLinks[i].addEventListener("click", function (e) {
            e.preventDefault();
            var current = getTheme();
            var next = current === "dark" ? "light" : "dark";
            setTheme(next);
            applyTheme();
            showToast("Switched to " + next + " mode", "info");
        });
    }
}

function setupSignOut() {
    var signOutLinks = document.querySelectorAll(".sign-out-link");
    for (var i = 0; i < signOutLinks.length; i++) {
        signOutLinks[i].addEventListener("click", function (e) {
            e.preventDefault();
            showToast("Signed out successfully!", "success");
            setTimeout(function () {
                localStorage.removeItem("assigndone_wallet");
                localStorage.removeItem("assigndone_theme");
                location.reload();
            }, 1500);
        });
    }
}

function setupAddMoney() {
    var links = document.querySelectorAll(".add-money-link");
    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener("click", function (e) {
            e.preventDefault();
            showAddMoneyModal();
        });
    }
}

function showAddMoneyModal() {
    var overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "add-money-overlay";

    var modal = document.createElement("div");
    modal.className = "modal-box";

    modal.innerHTML =
        '<h2>💳 Add Money</h2>' +
        '<p style="margin-bottom:20px; color:#9CA3AF;">Enter amount to add to your wallet</p>' +
        '<input type="number" id="add-money-input" placeholder="Enter amount (₹)" class="modal-input" min="100" max="100000">' +
        '<div class="modal-buttons">' +
        '  <button id="add-money-cancel" class="modal-btn modal-btn-cancel">Cancel</button>' +
        '  <button id="add-money-confirm" class="modal-btn modal-btn-confirm">Add Funds</button>' +
        '</div>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    setTimeout(function () { overlay.classList.add("modal-visible"); }, 10);

    document.getElementById("add-money-cancel").addEventListener("click", function () {
        closeModal("add-money-overlay");
    });
    overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeModal("add-money-overlay");
    });
    document.getElementById("add-money-confirm").addEventListener("click", function () {
        var input = document.getElementById("add-money-input");
        var amount = parseInt(input.value);
        if (!amount || amount < 100) {
            input.style.borderColor = "#EF4444";
            showToast("Minimum ₹100 required", "error");
            return;
        }
        var newBal = getWallet() + amount;
        setWallet(newBal);
        updateWalletDisplay();
        closeModal("add-money-overlay");
        showToast(formatPrice(amount) + " added to wallet!", "success");
    });
}

function setupPremium() {
    var links = document.querySelectorAll(".premium-link");
    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener("click", function (e) {
            e.preventDefault();
            if (isPremium()) {
                showToast("You're already on " + getPremiumPlan() + " plan! ⭐", "info");
                return;
            }
            showPremiumModal();
        });
    }
}

function showPremiumModal() {
    var overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "premium-overlay";

    var modal = document.createElement("div");
    modal.className = "modal-box premium-modal";

    var h2 = document.createElement("h2");
    h2.textContent = "⭐ Upgrade to Premium";
    h2.style.textAlign = "center";
    modal.appendChild(h2);

    var subtitle = document.createElement("p");
    subtitle.style.cssText = "text-align:center; color:#9CA3AF; margin-bottom:24px;";
    subtitle.textContent = "Unlock powerful features to supercharge your workflow";
    modal.appendChild(subtitle);

    var plans = [
        { name: "Pro", price: 999, color: "#8B5CF6", features: ["Unlimited Quick Views", "AI Budget Estimator", "Priority Support", "No Ads"] },
        { name: "Elite", price: 2499, color: "#F59E0B", features: ["Everything in Pro", "Full PDF Access", "Direct Chat with Experts", "Exclusive Gigs", "Refund Protection+"] }
    ];

    var planGrid = document.createElement("div");
    planGrid.className = "premium-plan-grid";

    for (var i = 0; i < plans.length; i++) {
        var plan = plans[i];
        var card = document.createElement("div");
        card.className = "premium-plan-card";
        if (i === 1) card.classList.add("premium-plan-popular");
        card.style.borderColor = plan.color;

        if (i === 1) {
            var popularTag = document.createElement("div");
            popularTag.className = "popular-tag";
            popularTag.textContent = "MOST POPULAR";
            card.appendChild(popularTag);
        }

        var planName = document.createElement("h3");
        planName.textContent = plan.name;
        planName.style.color = plan.color;
        card.appendChild(planName);

        var planPrice = document.createElement("div");
        planPrice.className = "premium-price";
        planPrice.textContent = formatPrice(plan.price);
        card.appendChild(planPrice);

        var perMonth = document.createElement("div");
        perMonth.style.cssText = "font-size:0.75rem; color:#6B7280; margin-bottom:15px;";
        perMonth.textContent = "per month";
        card.appendChild(perMonth);

        var ul = document.createElement("ul");
        ul.className = "premium-features";
        for (var f = 0; f < plan.features.length; f++) {
            var li = document.createElement("li");
            li.textContent = "✓ " + plan.features[f];
            ul.appendChild(li);
        }
        card.appendChild(ul);

        var buyBtn = document.createElement("button");
        buyBtn.className = "premium-buy-btn";
        buyBtn.style.background = plan.color;
        buyBtn.textContent = "Get " + plan.name;
        buyBtn.setAttribute("data-plan", plan.name);
        buyBtn.setAttribute("data-price", plan.price);
        buyBtn.addEventListener("click", function () {
            var pName = this.getAttribute("data-plan");
            var pPrice = parseInt(this.getAttribute("data-price"));
            handlePremiumPurchase(pName, pPrice);
        });
        card.appendChild(buyBtn);

        planGrid.appendChild(card);
    }

    modal.appendChild(planGrid);

    var cancelRow = document.createElement("div");
    cancelRow.style.cssText = "text-align:center; margin-top:20px;";
    var cancelLink = document.createElement("a");
    cancelLink.href = "#";
    cancelLink.style.cssText = "color:#6B7280; text-decoration:none; font-size:0.85rem;";
    cancelLink.textContent = "Maybe later";
    cancelLink.addEventListener("click", function (e) {
        e.preventDefault();
        closeModal("premium-overlay");
    });
    cancelRow.appendChild(cancelLink);
    modal.appendChild(cancelRow);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    setTimeout(function () { overlay.classList.add("modal-visible"); }, 10);

    overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeModal("premium-overlay");
    });
}

function handlePremiumPurchase(planName, price) {
    var wallet = getWallet();
    if (wallet < price) {
        showToast("Insufficient balance! Add " + formatPrice(price - wallet) + " more.", "error");
        return;
    }
    setWallet(wallet - price);
    setPremium(true);
    setPremiumPlan(planName);
    updateWalletDisplay();
    closeModal("premium-overlay");
    showToast("🎉 Welcome to " + planName + "! Premium activated.", "success");

    var links = document.querySelectorAll(".premium-link");
    for (var i = 0; i < links.length; i++) {
        links[i].textContent = "⭐ " + planName + " Plan";
        links[i].style.color = "#F59E0B";
    }
}

function closeModal(id) {
    var overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.remove("modal-visible");
    setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 300);
}

function initCommon() {
    applyTheme();
    updateWalletDisplay();
    setupDropdown();
    setupThemeToggle();
    setupSignOut();
    setupAddMoney();
    setupPremium();

    if (isPremium()) {
        var links = document.querySelectorAll(".premium-link");
        for (var i = 0; i < links.length; i++) {
            links[i].textContent = "⭐ " + getPremiumPlan() + " Plan";
            links[i].style.color = "#F59E0B";
        }
    }
}

document.addEventListener("DOMContentLoaded", initCommon);
