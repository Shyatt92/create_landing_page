
        var fusionNavIsCollapsed = function(e) {
            var t;
            window.innerWidth <= e.getAttribute("data-breakpoint") ? (e.classList.add("collapse-enabled"), e.classList.contains("expanded") || (e.setAttribute("aria-expanded", "false"), window.dispatchEvent(new Event("fusion-mobile-menu-collapsed", {
              bubbles: !0,
              cancelable: !0
            })))) : (null !== e.querySelector(".menu-item-has-children.expanded .fusion-open-nav-submenu-on-click") && e.querySelector(".menu-item-has-children.expanded .fusion-open-nav-submenu-on-click").click(), e.classList.remove("collapse-enabled"), e.setAttribute("aria-expanded", "true"), e.querySelector(".fusion-custom-menu").removeAttribute("style")), e.classList.add("no-wrapper-transition"), clearTimeout(t), t = setTimeout(function() {
              e.classList.remove("no-wrapper-transition")
            }, 400), e.classList.remove("loading")
          },
          fusionRunNavIsCollapsed = function() {
            var e, t = document.querySelectorAll(".fusion-menu-element-wrapper");
            for (e = 0; e < t.length; e++) fusionNavIsCollapsed(t[e])
          };
        function avadaGetScrollBarWidth() {
          var e, t, n, s = document.createElement("p");
          return s.style.width = "100%", s.style.height = "200px", (e = document.createElement("div")).style.position = "absolute", e.style.top = "0px", e.style.left = "0px", e.style.visibility = "hidden", e.style.width = "200px", e.style.height = "150px", e.style.overflow = "hidden", e.appendChild(s), document.body.appendChild(e), t = s.offsetWidth, e.style.overflow = "scroll", t == (n = s.offsetWidth) && (n = e.clientWidth), document.body.removeChild(e), t - n
        }
        fusionRunNavIsCollapsed(), window.addEventListener("fusion-resize-horizontal", fusionRunNavIsCollapsed);
      