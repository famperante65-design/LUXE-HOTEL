// CLIENT DESIGN - every client page uses the Royal Burgundy design (client-royal.css).
// To change colors, edit the variables at the top of client-royal.css.
(function () {
  const link = document.createElement('link');
  link.rel = 'stylesheet'; link.id = 'themeCss'; link.href = 'client-royal.css';
  document.head.appendChild(link);
})();
