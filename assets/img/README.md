# Avatar / portrait slot

The hero illustration is a hand-drawn SVG placeholder (`#avatarSketch` in `index.html`).

To swap in a real portrait **without touching the layout**, drop a file here named:

    avatar.png

Set `data-avatar-src="assets/img/avatar.png"` on `<figure id="avatar">` in index.html.

Recommended: a transparent-background cut-out or line-art portrait, roughly 3:4,
around 640×880px. `assets/js/main.js` detects the file, shows it, and hides the
sketch automatically. Nothing else needs to change.

# Résumé

Place the résumé PDF at:

    assets/Shadab_Hossain_Shaikh_Resume.pdf

The hero "Download résumé" button links there. Until the file exists, the button
degrades to a mailto: résumé request (see `main.js`, section 6).
