
        jQuery('#testimonials .fusion-column-wrapper').slick({
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          arrows: false,
          autoplay: true,
          responsive: [{
              breakpoint: 1024,
              settings: {
                slidesToShow: 1
              }
            },
            {
              breakpoint: 720,
              settings: {
                slidesToShow: 1
              }
            }
          ]
        });
        var isIE = false;
        var ua = window.navigator.userAgent;
        var old_ie = ua.indexOf('MSIE ');
        var new_ie = ua.indexOf('Trident/');
        if ((old_ie > -1) || (new_ie > -1)) {
          isIE = true;
        }
        if (isIE) {
          var $ = jQuery
          $(document).ready(function() {
            $('#boxed-wrapper').append('<div id="myModal" class="modal"><div class="modal-content"> <span class="close">&times;</span><p>For the best experince please use a modern browser. <a href="https://www.google.com/intl/en_uk/chrome/"> <strong>Click here to download chrome.</strong> </a> </p> <img src="https://dwkujuq9vpuly.cloudfront.net/news/wp-content/uploads/2020/08/Browser-icons-615x369.jpg"> </div></div>')
            $('.close').click(function() {
              $('#myModal').hide()
            })
          })
        }
      