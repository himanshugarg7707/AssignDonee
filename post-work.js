document.addEventListener("DOMContentLoaded", function () {
    var t = document.getElementById("gig-title");
    var s = document.getElementById("gig-subject");
    var d = document.getElementById("gig-deadline");
    var desc = document.getElementById("gig-desc");
    var b = document.getElementById("gig-budget");
    var f = document.getElementById("post-form");
    var tc = document.getElementById("title-count");
    var dc = document.getElementById("desc-count");
    var fi = document.getElementById("file-input");
    var fl = document.getElementById("file-label");
    var ui = document.getElementById("upload-icon");
    var flist = document.getElementById("file-list");
    var dz = document.getElementById("file-drop-zone");
    var prevSec = document.getElementById("live-preview");
    var prevCard = document.getElementById("preview-card");

    var today = new Date();
    d.setAttribute("min", today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0"));

    t.addEventListener("input", function () {
        tc.textContent = t.value.length + " / 80";
        tc.style.color = t.value.length >= 75 ? "#EF4444" : "#9CA3AF";
        updatePrev();
    });

    desc.addEventListener("input", function () {
        dc.textContent = desc.value.length + " / 500";
        dc.style.color = desc.value.length >= 480 ? "#EF4444" : "#9CA3AF";
        updatePrev();
    });

    s.addEventListener("change", updatePrev);
    d.addEventListener("change", updatePrev);
    b.addEventListener("input", updatePrev);

    function updatePrev() {
        var title = t.value.trim();
        var description = desc.value.trim();
        if (!title && !description) {
            prevSec.style.display = "none";
            return;
        }
        prevSec.style.display = "block";
        while (prevCard.firstChild) prevCard.removeChild(prevCard.firstChild);

        var tag = document.createElement("span");
        tag.className = "sub-tag";
        tag.textContent = s.value;
        prevCard.appendChild(tag);

        if (title) {
            var h4 = document.createElement("h4");
            h4.textContent = title;
            h4.style.margin = "8px 0";
            h4.style.color = "#E5E7EB";
            prevCard.appendChild(h4);
        }

        if (description) {
            var p = document.createElement("p");
            p.textContent = description.substring(0, 120) + (description.length > 120 ? "..." : "");
            p.style.cssText = "color:#9CA3AF; font-size:0.85rem; line-height:1.4;";
            prevCard.appendChild(p);
        }

        var meta = document.createElement("div");
        meta.style.cssText = "display:flex; gap:15px; margin-top:10px; font-size:0.8rem; color:#6B7280;";

        if (b.value) {
            var price = document.createElement("span");
            price.textContent = "💰 " + formatPrice(parseInt(b.value));
            price.style.color = "#C084FC";
            price.style.fontWeight = "bold";
            meta.appendChild(price);
        }

        if (d.value) {
            var date = document.createElement("span");
            date.textContent = "📅 " + formatDate(d.value);
            meta.appendChild(date);
        }

        prevCard.appendChild(meta);
    }

    var files = [];

    fi.addEventListener("change", function () {
        addFiles(fi.files);
    });

    dz.addEventListener("dragover", function (e) {
        e.preventDefault();
        dz.style.borderColor = "#6D28D9";
        dz.style.background = "rgba(109, 40, 217, 0.1)";
    });

    dz.addEventListener("dragleave", function () {
        dz.style.borderColor = "#4B5563";
        dz.style.background = "transparent";
    });

    dz.addEventListener("drop", function (e) {
        e.preventDefault();
        dz.style.borderColor = "#4B5563";
        dz.style.background = "transparent";
        addFiles(e.dataTransfer.files);
    });

    function addFiles(fa) {
        for (var i = 0; i < fa.length; i++) files.push(fa[i]);
        showFiles();
        ui.textContent = "✅";
        fl.textContent = files.length + " file(s) selected";
    }

    function showFiles() {
        while (flist.firstChild) flist.removeChild(flist.firstChild);
        for (var i = 0; i < files.length; i++) {
            var item = document.createElement("div");
            item.className = "file-item";
            var name = document.createElement("span");
            name.textContent = "📄 " + files[i].name;
            name.style.color = "#D1D5DB";
            var size = document.createElement("span");
            size.textContent = (files[i].size / 1024).toFixed(1) + " KB";
            size.style.cssText = "color:#6B7280; font-size:0.8rem;";
            var rm = document.createElement("button");
            rm.textContent = "✕";
            rm.className = "file-remove-btn";
            rm.setAttribute("data-index", i);
            rm.addEventListener("click", function () {
                var idx = parseInt(this.getAttribute("data-index"));
                files.splice(idx, 1);
                showFiles();
                if (files.length === 0) {
                    ui.textContent = "⬆";
                    fl.textContent = "Drop files here or browse";
                } else {
                    fl.textContent = files.length + " file(s) selected";
                }
            });
            item.appendChild(name);
            item.appendChild(size);
            item.appendChild(rm);
            flist.appendChild(item);
        }
    }

    f.addEventListener("submit", function (e) {
        e.preventDefault();
        var errs = [];
        if (!t.value.trim()) errs.push("Title is required");
        if (!d.value) errs.push("Deadline is required");
        if (!desc.value.trim()) errs.push("Description is required");
        if (!b.value || parseInt(b.value) < 100) errs.push("Budget must be at least ₹100");
        if (errs.length > 0) {
            for (var i = 0; i < errs.length; i++) showToast(errs[i], "error");
            if (!t.value.trim()) t.style.borderColor = "#EF4444";
            if (!d.value) d.style.borderColor = "#EF4444";
            if (!desc.value.trim()) desc.style.borderColor = "#EF4444";
            if (!b.value) b.style.borderColor = "#EF4444";
            return;
        }
        t.style.borderColor = "";
        d.style.borderColor = "";
        desc.style.borderColor = "";
        b.style.borderColor = "";

        var ctype = "Digital Only";
        var radios = document.querySelectorAll('input[name="ctype"]');
        for (var r = 0; r < radios.length; r++) {
            if (radios[r].checked) ctype = radios[r].value;
        }

        var gigs = getGigs();
        var maxId = 0;
        for (var g = 0; g < gigs.length; g++) {
            if (gigs[g].id > maxId) maxId = gigs[g].id;
        }

        var imgs = [
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500",
            "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=500",
            "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500",
            "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500"
        ];

        var newGig = {
            id: maxId + 1,
            title: t.value.trim(),
            subject: s.value,
            author: "You",
            price: parseInt(b.value),
            deadline: d.value,
            status: "OPEN",
            description: desc.value.trim(),
            image: imgs[Math.floor(Math.random() * imgs.length)],
            contractType: ctype,
            client: "You"
        };

        gigs.unshift(newGig);
        saveGigs(gigs);

        var submitBtn = document.getElementById("submit-btn");
        submitBtn.textContent = "✓ Posted!";
        submitBtn.style.background = "#059669";
        submitBtn.disabled = true;

        showToast("Assignment posted successfully!", "success");

        setTimeout(function () {
            window.location.href = "index.html";
        }, 1500);
    });

    var allInputs = f.querySelectorAll("input, textarea, select");
    for (var i = 0; i < allInputs.length; i++) {
        allInputs[i].addEventListener("focus", function () {
            this.style.borderColor = "#6D28D9";
        });
        allInputs[i].addEventListener("blur", function () {
            this.style.borderColor = "";
        });
    }
});