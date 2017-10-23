(function ($) {
  $(document).ready(function(){
    //init_role_permissions_multiselect();
    init_role_permissions_tree();
  })

  function init_role_permissions_tree() {
    $.fn.tree({
      dataFrom: window.allowPermissions,
      dataTo: window.denyPermissions,
      fromTreeElement:'#allowPermissions',
      fromSearchElement:'#allowSearch',
      fromClearElement:'#allowSearchClear',
      addButtonElement:'#permissions-right',
      addAllButtonElement:'#permissions-right-all',
      toTreeElement:'#denyPermissions',
      toSearchElement:'#denySearch',
      toClearElement:'#denySearcClear',
      removeButtonElement:'#permissions-left',
      removeAllButtonElement:'#permissions-left-all'
    });

    // inherit permissions init
    $('#inheritPermissions').jstree({
      'plugins': ['search', 'wholerow'],
      'core': {
        'data': window.inheritPermissions,
        'animation': false,
        'themes': {
          'icons': false
        }
      },
      'search': {
        'show_only_matches': true,
        'show_only_matches_children': true
      }
    });
    $('#inheritSearch').on("keyup change", function () {
      $('#inheritPermissions').jstree(true).search($('#inheritSearch').val());
    });
  }

  function init_role_permissions_multiselect() {
    if (! $('#allow_permissions').length) {
      return;
    }

    $('#allow_permissions').multiselect({
      right: '#deny_permissions',
      sort: function(a, b) {
        console.log([$(a).data('weight'), $(b).data('weight')])
        return $(a).data('weight') > $(b).data('weight') ? 1 : -1;
      },
      search: {
        left: '<input type="text" name="q" class="form-control" placeholder="Search..." />',
        right: '<input type="text" name="q" class="form-control" placeholder="Search..." />',
      }
    });
  }
})(jQuery);
