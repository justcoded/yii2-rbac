(function ($) {
  $(document).ready(function(){
    init_role_permissions_tree();
  })

  function init_role_permissions_tree() {
    $.fn.treePanels({
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
      removeAllButtonElement:'#permissions-left-all',
      hiddenMultiselect:'#allowPermissionsCntrl'
    });

    // inherit permissions init
    $('#inheritPermissions').jstree({
      'plugins': ['search'],
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

})(jQuery);
