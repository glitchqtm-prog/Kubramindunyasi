/* onizleme.js — YALNIZCA dal önizlemesi (raw.githack) içindir; canlı sitede çalışmaz ve canlıya alınmadan önce silinir.
 * 1) Üyelik yerine örnek bir üye ("Deniz") gösterir; gerçek hesaplara ve veritabanına hiç dokunmaz.
 * 2) Sunucu hesaplarını (harita, dönüm yılları, tanışma işaretleri) önceden kaydedilmiş örnek veriden verir.
 * 3) Kökten verilen bağlantıları (/sayfa.html) önizleme klasörüne çevirir. */
(function () {
  "use strict";
  if (!/githack\.com$/.test(location.hostname)) return;
  var kok = location.pathname.replace(/[^/]*$/, "");
  var meta = { full_name: "Deniz Aydın", birth_date: "1994-03-18", birth_time: "09:40", birth_place: "İzmir", weekly_mail: false, takimyildiz: [] };
  var user = { id: "00000000-0000-4000-8000-000000000001", email: "deniz@ornek.com", created_at: "2026-09-20T10:00:00Z", user_metadata: meta };
  var acik = !/[?&](cikis|mod)=/.test(location.search) && !/giris\.html$/.test(location.pathname);
  var kisiler = [{ id: "k1", name: "Mert", birth_date: "1992-11-02", birth_time: "14:10", birth_place: "Ankara", gender: "Erkek", created_at: "2026-10-01T10:00:00Z" }];
  function q(rows) {
    var o = { then: function (f, r) { return Promise.resolve({ data: rows, error: null }).then(f, r); } };
    ["select", "eq", "neq", "order", "limit", "gte", "lte", "in", "insert", "upsert", "update", "delete"].forEach(function (k) { o[k] = function () { return o; }; });
    o.single = o.maybeSingle = function () { return Promise.resolve({ data: null, error: null }); };
    return o;
  }
  var ornek = { message: "Önizlemede giriş yapılmaz; bu sayfa canlıya alınınca çalışır." };
  window.supabase = { createClient: function () { return {
    auth: {
      getSession: function () { return Promise.resolve({ data: { session: acik ? { access_token: "onizleme", user: user } : null }, error: null }); },
      getUser: function () { return Promise.resolve({ data: { user: acik ? user : null }, error: null }); },
      onAuthStateChange: function () { return { data: { subscription: { unsubscribe: function () {} } } }; },
      updateUser: function (d) { if (d && d.data) for (var k in d.data) meta[k] = d.data[k]; return Promise.resolve({ data: { user: user }, error: null }); },
      signOut: function () { return Promise.resolve({ error: null }); },
      signUp: function () { return Promise.resolve({ data: { user: null, session: null }, error: ornek }); },
      signInWithPassword: function () { return Promise.resolve({ data: {}, error: ornek }); },
      resetPasswordForEmail: function () { return Promise.resolve({ error: ornek }); },
      resend: function () { return Promise.resolve({ error: ornek }); }
    },
    from: function (t) { return q(t === "charts" ? kisiler : []); },
    rpc: function () { return Promise.resolve({ data: null, error: null }); }
  }; } };

  var veri = null, f0 = window.fetch;
  window.fetch = function (u, o) {
    var m = String((u && u.url) || u).match(/onrender\.com\/api\/([a-z-]+)/);
    if (!m) return f0.apply(this, arguments);
    var hazir = veri ? Promise.resolve(veri) : f0(kok + "onizleme/veri.json").then(function (r) { return r.json(); }).then(function (j) { veri = j; return j; });
    return hazir.then(function (j) {
      var g = {}; try { g = JSON.parse((o && o.body) || "{}"); } catch (e) {}
      var v = m[1] === "harita" ? (j["harita-" + g.birthDate] || j["harita-1994-03-18"]) : j[m[1]];
      return new Response(JSON.stringify(v || { ok: false }), { headers: { "Content-Type": "application/json" } });
    });
  };

  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="/"]') : null; if (!a) return;
    var h = a.getAttribute("href"); if (h.indexOf("//") === 0) return;
    e.preventDefault(); location.href = kok + (h === "/" || h.indexOf("/#") === 0 ? "index.html" + h.slice(1) : h.slice(1));
  }, true);

  addEventListener("load", function () {
    setTimeout(function () { if (!document.getElementById("asterna-fab")) { var s = document.createElement("script"); s.src = kok + "asterna-widget.js"; document.body.appendChild(s); } }, 1800);
    if (!acik) return;
    var b = document.createElement("div");
    b.textContent = "Önizleme: bu sayfa örnek bir üyeyle (Deniz, 18 Mart 1994, İzmir) gösteriliyor. Canlıya alınınca herkes kendi haritasını görür.";
    b.style.cssText = "position:relative;z-index:50;background:#0b1020;border-bottom:1px solid rgba(217,185,106,.3);color:#e7cf95;font:13px system-ui,sans-serif;padding:9px 16px;text-align:center";
    document.body.insertBefore(b, document.body.firstChild);
  });
})();
