
        jQuery(document).ready(function() {
          var ajaxurl = 'https://corushotels.com/burnham-beeches-hotel/wp-admin/admin-ajax.php';
          if (0 < jQuery('.fusion-login-nonce').length) {
            jQuery.get(ajaxurl, {
              'action': 'fusion_login_nonce'
            }, function(response) {
              jQuery('.fusion-login-nonce').html(response);
            });
          }
        });
      