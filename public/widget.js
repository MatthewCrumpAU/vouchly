(function () {
  "use strict";
  try {
    var script = document.currentScript;
    if (!script) return;
    var siteKey = script.getAttribute("data-site-key");
    if (!siteKey) return;
    var base;
    try { base = new URL(script.src).origin; } catch (e) { base = ""; }

    /* ---------------- helpers ---------------- */
    function timeAgo(iso) {
      var s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
      if (s < 45) return "just now";
      var m = Math.round(s / 60); if (m < 60) return m + " minute" + (m > 1 ? "s" : "") + " ago";
      var h = Math.round(m / 60); if (h < 24) return h + " hour" + (h > 1 ? "s" : "") + " ago";
      var d = Math.round(h / 24); return d + " day" + (d > 1 ? "s" : "") + " ago";
    }
    function fill(tpl, ctx) {
      return String(tpl).replace(/{(\w+)}/g, function (_, k) { return ctx[k] != null ? ctx[k] : ""; });
    }
    function defaultCopy(type, c) {
      var who = (c.name || "Someone") + (c.city ? " from " + c.city : "");
      switch (type) {
        case "recent_purchase": return who + " just purchased " + (c.product || "a product");
        case "recent_signup": return who + " just signed up";
        case "recent_download": return (c.name || "Someone") + " just downloaded " + (c.product || "a product");
        case "live_visitors": return c.count + " people are viewing this page right now";
        case "low_stock": return "Only " + c.count + " spots left";
        case "page_visits": return c.count + " people viewed this page today";
        case "review": return (c.name || "Someone") + " gave us a " + (c.rating || 5) + "-star review";
        case "countdown": return (c.time || "") + " remaining";
        default: return who;
      }
    }
    var SVG = {
      recent_purchase: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
      live_visitors: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
      low_stock: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z"/>',
      announcement: '<path d="M3 11l18-5v12L3 14v-3Z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
      review: '<path d="M11.5 2.5 14 8l5.5.5-4 4 1 5.5-5-3-5 3 1-5.5-4-4L9 8Z"/>',
      countdown: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/>',
      _: '<path d="M20 6 9 17l-5-5"/>'
    };
    function icon(type) { return SVG[type] || SVG._; }

    function track(path, campaignId) {
      try {
        var body = JSON.stringify({ siteKey: siteKey, campaignId: campaignId, url: location.pathname });
        if (navigator.sendBeacon) navigator.sendBeacon(base + "/api/widget/" + path, body);
        else fetch(base + "/api/widget/" + path, { method: "POST", body: body, keepalive: true });
      } catch (e) {}
    }

    /* session cap */
    function shown(id) { try { return +sessionStorage.getItem("vouch_" + id) || 0; } catch (e) { return 0; } }
    function bump(id) { try { sessionStorage.setItem("vouch_" + id, shown(id) + 1); } catch (e) {} }

    /* url + device eligibility (static per page load) */
    function urlOk(c) {
      var href = location.href, path = location.pathname;
      var hit = function (arr) { return (arr || []).some(function (u) { return u && (href.indexOf(u) >= 0 || path.indexOf(u) >= 0); }); };
      if (hit(c.excluded_urls)) return false;
      if (c.show_all_pages) return true;
      return hit(c.included_urls);
    }
    function deviceOk(c) {
      var mobile = window.matchMedia("(max-width:768px)").matches;
      return mobile ? c.show_mobile !== false : c.show_desktop !== false;
    }

    /* build the notice list for a campaign from real/manual events */
    function notices(c, events) {
      var type = c.notification_type, content = c.content || {}, custom = content.message;
      function mk(ev) {
        var meta = (ev && ev.metadata) || {};
        var ctx = {
          name: ev && ev.name || "Someone",
          city: ev && ev.city || "",
          product: ev && ev.product || "",
          count: meta.count != null ? meta.count : (content.count != null ? content.count : ""),
          time: content.time || "",
          rating: meta.rating || content.rating || 5,
          created_at: ev && ev.created_at || new Date().toISOString()
        };
        return {
          message: custom ? fill(custom, ctx) : defaultCopy(type, ctx),
          ago: timeAgo(ctx.created_at),
          rating: type === "review" ? ctx.rating : 0
        };
      }
      var evs = events.filter(function (e) { return e.campaign_id === c.id; });
      if (!evs.length) evs = events.filter(function (e) { return e.event_type === type; });
      if (evs.length) return evs.map(mk).filter(function (n) { return n.message; });
      var aggregate = ["live_visitors", "low_stock", "page_visits", "countdown", "announcement", "custom"];
      if (custom || (aggregate.indexOf(type) >= 0 && (content.count != null || content.time)))
        return [mk(null)].filter(function (n) { return n.message; });
      return [];
    }

    /* ---------------- render ---------------- */
    function start(config) {
      var BRAND = (config.brand && config.brand.name) ? config.brand.name : "Vouch";
      var campaigns = (config.campaigns || []).map(function (c) {
        return { c: c, list: notices(c, config.events || []), i: 0 };
      }).filter(function (q) {
        return q.list.length && urlOk(q.c) && deviceOk(q.c);
      });
      if (!campaigns.length) return;

      var host = document.createElement("div");
      host.style.cssText = "position:fixed;z-index:2147483000;";
      host.setAttribute("aria-live", "polite");
      document.body.appendChild(host);
      var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;

      var style = document.createElement("style");
      style.textContent =
        ".v{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;display:flex;gap:11px;align-items:center;" +
        "max-width:320px;padding:12px 14px;opacity:0;}" +
        ".v.show{opacity:1;}" +
        ".v .ic{width:38px;height:38px;border-radius:999px;display:flex;align-items:center;justify-content:center;flex:0 0 auto;color:#fff;}" +
        ".v .ic svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}" +
        ".v .tx{min-width:0;}" +
        ".v .msg{font-size:13px;line-height:1.35;}" +
        ".v .mt{margin-top:3px;font-size:11px;color:#94a3b8;}" +
        ".v .st{color:#f59e0b;letter-spacing:1px;font-size:11px;}" +
        ".v .cl{margin-left:auto;align-self:flex-start;cursor:pointer;color:#cbd5e1;background:none;border:0;font-size:16px;line-height:1;padding:0 2px;}" +
        ".v .br{color:#cbd5e1;}";
      root.appendChild(style);

      var box = document.createElement("div");
      box.className = "v";
      root.appendChild(box);

      var ci = 0;

      function place(c) {
        var p = c.position || "bottom-left";
        host.style.left = host.style.right = host.style.top = host.style.bottom = "auto";
        if (p.indexOf("left") >= 0) host.style.left = "20px"; else host.style.right = "20px";
        if (p.indexOf("top") >= 0) host.style.top = "20px"; else host.style.bottom = "20px";
        var isTop = p.indexOf("top") >= 0;
        var hidden = c.design && c.design.animation === "fade" ? "translateY(0)" : (isTop ? "translateY(-14px)" : "translateY(14px)");
        return { hidden: hidden, anim: c.design && c.design.animation };
      }

      function next() {
        // find next eligible campaign not over its session cap
        for (var n = 0; n < campaigns.length; n++) {
          var q = campaigns[(ci + n) % campaigns.length];
          var max = q.c.max_per_session || 20;
          if (shown(q.c.id) < max) { ci = (ci + n) % campaigns.length; return q; }
        }
        return null;
      }

      function render() {
        var q = next();
        if (!q) return; // every campaign hit its session cap
        var c = q.c, d = c.design || {}, notice = q.list[q.i % q.list.length];
        q.i++;

        var pos = place(c);
        box.style.background = d.bg || "#ffffff";
        box.style.color = d.text || "#0f172a";
        box.style.borderRadius = (d.radius != null ? d.radius : 12) + "px";
        box.style.boxShadow = d.shadow === false ? "none" : "0 12px 40px rgba(15,23,42,.18)";
        box.style.boxSizing = "border-box";
        box.style.transform = pos.hidden;
        box.style.transition = "opacity .3s ease, transform .3s ease-out";

        box.innerHTML =
          '<div class="ic" style="background:' + (d.accent || "#4f46e5") + '"><svg viewBox="0 0 24 24">' + icon(c.notification_type) + '</svg></div>' +
          '<div class="tx"><div class="msg">' + esc(notice.message) + '</div>' +
          (notice.rating ? '<div class="st">' + stars(notice.rating) + '</div>' : '') +
          '<div class="mt">' + esc(notice.ago) + (c.branding ? ' <span class="br">· via ' + esc(BRAND) + '</span>' : '') + '</div></div>' +
          (d.closeButton === false ? '' : '<button class="cl" aria-label="Close">&times;</button>');

        var cls = box.querySelector(".cl");
        if (cls) cls.onclick = function (e) { e.stopPropagation(); host.remove(); };

        var cta = (c.content && c.content.cta) || {};
        if (cta.url) {
          box.style.cursor = "pointer";
          box.onclick = function () { track("click", c.id); window.open(cta.url, "_blank", "noopener"); };
        } else { box.style.cursor = "default"; box.onclick = null; }

        // animate in
        requestAnimationFrame(function () {
          if (pos.anim === "bounce") box.style.transition = "opacity .3s ease, transform .55s cubic-bezier(.34,1.56,.64,1)";
          box.style.transform = "translateY(0)";
          box.classList.add("show");
        });
        track("impression", c.id);
        bump(c.id);

        setTimeout(function () {
          box.classList.remove("show");
          box.style.transform = pos.hidden;
          setTimeout(function () {
            ci = (ci + 1) % campaigns.length;
            setTimeout(render, (c.interval_seconds || 8) * 1000);
          }, 320);
        }, (c.duration_seconds || 6) * 1000);
      }

      function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : s; return d.innerHTML; }
      function stars(n) { var s = ""; for (var i = 0; i < n; i++) s += "\u2605"; return s; }

      var firstDelay = (campaigns[0].c.delay_seconds || 3) * 1000;
      setTimeout(render, firstDelay);
    }

    fetch(base + "/api/widget/config?siteKey=" + encodeURIComponent(siteKey))
      .then(function (r) { return r.json(); })
      .then(start)
      .catch(function () { /* graceful: never break the host page */ });
  } catch (e) { /* swallow — the widget must never throw on a customer site */ }
})();
