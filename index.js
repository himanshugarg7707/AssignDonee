var sub = "ALL";
var search = "";

function makeCard(obj) {
    var box = document.createElement("div");
    box.className = "card";
    box.setAttribute("data-id", obj.id);

    var img = document.createElement("div");
    img.className = "card-img";
    img.style.backgroundImage = "url('" + obj.image + "')";

    var stat = document.createElement("span");
    stat.className = "status";
    stat.textContent = obj.status;
    if (obj.status == "IN PROGRESS") {
        stat.style.background = "#DBEAFE";
        stat.style.color = "#1E40AF";
    }

    var price = document.createElement("span");
    price.className = "price";
    price.textContent = formatPrice(obj.price);

    img.appendChild(stat);
    img.appendChild(price);

    var info = document.createElement("div");
    info.className = "card-info";

    var tag = document.createElement("span");
    tag.className = "sub-tag";
    tag.textContent = obj.subject;

    var who = document.createElement("span");
    who.style.cssText = "font-size:0.8rem; color:#666;";
    who.textContent = " • " + obj.author;

    var h = document.createElement("h3");
    h.textContent = obj.title;

    var p = document.createElement("p");
    p.textContent = obj.description;

    var bot = document.createElement("div");
    bot.className = "card-bottom";

    var d = document.createElement("span");
    d.textContent = shortDate(obj.deadline);

    var a = document.createElement("a");
    a.href = "details.html?id=" + obj.id;
    a.textContent = "Details →";

    bot.appendChild(d);
    bot.appendChild(a);

    info.appendChild(tag);
    info.appendChild(who);
    info.appendChild(h);
    info.appendChild(p);
    info.appendChild(bot);

    box.appendChild(img);
    box.appendChild(info);

    return box;
}

function showGigs() {
    var arr = getGigs();
    var grid = document.getElementById("gig-grid");
    var empty = document.getElementById("empty-state");
    var cnt = document.getElementById("gig-count");

    while (grid.firstChild) {
        grid.removeChild(grid.firstChild);
    }

    var res = [];
    for (var i = 0; i < arr.length; i++) {
        var gig = arr[i];
        if (sub != "ALL" && gig.subject != sub) continue;
        if (search.length > 0) {
            var txt = (gig.title + " " + gig.description + " " + gig.subject).toLowerCase();
            if (txt.indexOf(search.toLowerCase()) == -1) continue;
        }
        res.push(gig);
    }

    cnt.textContent = res.length + " Available";

    if (res.length == 0) {
        empty.style.display = "block";
    } else {
        empty.style.display = "none";
        for (var j = 0; j < res.length; j++) {
            var card = makeCard(res[j]);
            card.style.opacity = "0";
            card.style.transform = "translateY(20px)";
            grid.appendChild(card);
            fadeIn(card, j * 120);
        }
    }
}

function fadeIn(el, delay) {
    setTimeout(function () {
        el.style.transition = "opacity 0.4s, transform 0.4s";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
    }, delay);
}

function searchBox() {
    var inp = document.getElementById("search-input");
    var btn = document.getElementById("filter-btn");
    var timer;

    inp.addEventListener("input", function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
            search = inp.value.trim();
            showGigs();
        }, 300);
    });

    btn.addEventListener("click", function () {
        search = inp.value.trim();
        showGigs();
        if (search) showToast('Results for "' + search + '"', "info");
    });

    inp.addEventListener("keydown", function (e) {
        if (e.key == "Enter") {
            search = inp.value.trim();
            showGigs();
        }
    });
}

function chips() {
    var chips = document.querySelectorAll(".chip");
    for (var i = 0; i < chips.length; i++) {
        chips[i].onclick = function () {
            for (var j = 0; j < chips.length; j++) chips[j].classList.remove("chip-active");
            this.classList.add("chip-active");
            sub = this.getAttribute("data-subject");
            showGigs();
        }
    }
}

function cardDelete() {
    document.getElementById("gig-grid").oncontextmenu = function (e) {
        var t = e.target;
        while (t && !t.classList.contains("card")) t = t.parentElement;
        if (!t) return;
        e.preventDefault();

        var id = parseInt(t.getAttribute("data-id"));
        if (window.confirm("Delete this gig?")) {
            var arr = getGigs();
            var newArr = [];
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].id != id) newArr.push(arr[i]);
            }
            saveGigs(newArr);
            t.style.transition = "opacity 0.3s, transform 0.3s";
            t.style.opacity = "0";
            t.style.transform = "scale(0.9)";
            setTimeout(function () {
                showGigs();
                showToast("Gig removed!", "success");
            }, 300);
        }
    }
}

function scrollBtn() {
    var btn = document.createElement("button");
    btn.className = "scroll-top-btn";
    btn.textContent = "↑";
    btn.title = "Scroll to top";
    document.body.appendChild(btn);

    window.onscroll = function () {
        if (window.scrollY > 400) btn.classList.add("scroll-top-visible");
        else btn.classList.remove("scroll-top-visible");
    };

    btn.onclick = function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
}

window.onload = function () {
    showGigs();
    searchBox();
    chips();
    cardDelete();
    scrollBtn();
}

const a = ((e) =>{
    console.log();

})