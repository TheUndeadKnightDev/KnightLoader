/* KnightLoader — live release list.
 * Pulls every release (old and new) from the GitHub API at page load, so the
 * site never needs manual edits: tag a release on GitHub and it appears here. */
(function () {
  var OWNER = "TheUndeadKnightDev";
  var REPO  = "KnightLoader";
  var API   = "https://api.github.com/repos/" + OWNER + "/" + REPO + "/releases?per_page=100";
  var list  = document.getElementById("release-list");
  if (!list) return;

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString(undefined,
        { year: "numeric", month: "short", day: "numeric" });
    } catch (e) { return iso.slice(0, 10); }
  }

  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function render(releases) {
    list.innerHTML = "";
    if (!releases.length) {
      var p = el("p", "release-loading",
        "No releases yet — the first one will appear here automatically.");
      list.appendChild(p);
      return;
    }

    releases.forEach(function (r, i) {
      var row = el("article", "release" + (i === 0 ? " latest" : ""));

      var head = el("div", "release-head");
      var title = el("a", "release-tag", r.name || r.tag_name);
      title.href = r.html_url;
      title.target = "_blank";
      title.rel = "noopener";
      head.appendChild(title);
      if (i === 0) head.appendChild(el("span", "release-badge", "LATEST"));
      if (r.prerelease) head.appendChild(el("span", "release-badge pre", "PRE-RELEASE"));
      head.appendChild(el("span", "release-date", fmtDate(r.published_at)));
      row.appendChild(head);

      if (r.body) {
        var firstLines = r.body.split("\n").filter(function (l) { return l.trim(); }).slice(0, 3).join(" · ");
        if (firstLines.length > 220) firstLines = firstLines.slice(0, 217) + "…";
        row.appendChild(el("p", "release-notes", firstLines));
      }

      var assets = el("div", "release-assets");
      (r.assets || []).forEach(function (a) {
        var link = el("a", "release-asset");
        link.href = a.browser_download_url;
        link.appendChild(el("span", null, a.name));
        link.appendChild(el("small", null, fmtSize(a.size) + " · " + a.download_count + " downloads"));
        assets.appendChild(link);
      });
      if (!assets.children.length) {
        var src = el("a", "release-asset");
        src.href = r.zipball_url;
        src.appendChild(el("span", null, "Source code (zip)"));
        assets.appendChild(src);
      }
      row.appendChild(assets);

      list.appendChild(row);
    });
  }

  fetch(API, { headers: { Accept: "application/vnd.github+json" } })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(render)
    .catch(function () {
      list.innerHTML = "";
      var p = el("p", "release-loading");
      p.appendChild(document.createTextNode("Couldn't load the release list right now — "));
      var a = el("a", null, "view all releases on GitHub");
      a.href = "https://github.com/" + OWNER + "/" + REPO + "/releases";
      p.appendChild(a);
      p.appendChild(document.createTextNode("."));
      list.appendChild(p);
    });
})();
