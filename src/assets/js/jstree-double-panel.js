(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// You can write a call and import your functions in this file.
//
// This file will be compiled into app.js and will not be minified.
// Feel free with using ES6 here.
(function ($) {
  var TreePanels = function TreePanels(options) {
    var defaultList = {
      'plugins': ['search', 'checkbox'],
      'core': {
        'data': [],
        'animation': false,
        'expand_selected_onload': true,
        'dblclick_toggle': false,
        'themes': {
          'icons': false
        }
      },
      'checkbox': {
        'three_state': true,
        'whole_node': false,
        'tie_selection': false
      },
      'search': {
        'show_only_matches': true,
        'show_only_matches_children': true
      },
      'selected': []
    };

    var fromList = JSON.parse(JSON.stringify(defaultList));
    fromList.acceptor = false;

    var toList = JSON.parse(JSON.stringify(defaultList));
    toList.acceptor = true;

    var deleteSelected = function deleteSelected(list) {
      list.selected.forEach(function (el) {
        list.core.data.splice(list.core.data.findIndex(function (elem) {
          return elem.id === el;
        }), 1);
      });
    };

    var checkFunc = function checkFunc(data, list, node) {
      if (!data.node.state.checkbox_disabled) {
        var shouldCheck = data.node.state.checked ? 'uncheck_node' : 'check_node';
        $(node).jstree(shouldCheck, data.node.id);
      }
    };

    var checkNodes = function checkNodes(data, list, node) {
      if (list.selected.indexOf(data.node.id) == -1) {
        list.selected.push(data.node.id);
        if (data.node.children_d.length) {
          data.node.children_d.forEach(function (childNode) {
            if (list.selected.indexOf(childNode) == -1) {
              list.selected.push(childNode);
              $(node).jstree('check_node', childNode);
            }
            $(node).jstree('disable_node', childNode);
          });
        }
      }
    };

    var unCheckNodes = function unCheckNodes(data, list, node) {
      list.selected.splice(list.selected.indexOf(data.node.id), 1);
      if (data.node.children_d.length) {
        data.node.children_d.forEach(function (childNode) {
          $(node).jstree('uncheck_node', childNode);
          if (list.acceptor) {
            $(node).jstree('enable_node', childNode);
          }
          var childNodeIndex = list.selected.indexOf(childNode);
          if (childNodeIndex != -1) {
            list.selected.splice(childNodeIndex, 1);
          }
        });
      }
    };

    var selectFunc = function selectFunc(data, list, node) {
      return data.node.state.checked ? checkNodes(data, list, node) : unCheckNodes(data, list, node);
    };

    var moveEntries = function moveEntries(fromList, toList) {
      fromList.selected.forEach(function (element) {
        toList.core.data.push(fromList.core.data.find(function (el) {
          return el.id === element;
        }));
      });
    };

    var moveAllEntries = function moveAllEntries(fromList, toList, options) {
      fromList.selected = [];
      fromList.core.data.forEach(function (element) {
        fromList.selected.push(element.id);
      });
      moveTreeSlice(fromList, toList, options);
    };

    var checkIfHasParrent = function checkIfHasParrent(entry, index, array, isAcceptor) {
      if (!array.some(function (el) {
        return el.id === entry.parent;
      })) {
        entry.parent = "#";
        if (!isAcceptor) {
          entry.state = { "checkbox_disabled": false };
        }
      } else if (!isAcceptor) {
        entry.state = { "checkbox_disabled": true };
      }
      return entry;
    };

    var fillTree = function fillTree(list, node) {
      var tempList = JSON.parse(JSON.stringify(list));
      tempList.core.data.map(function (entry) {
        return entry.state = { "checkbox_disabled": false };
      });
      tempList.core.data.map(function (entry, index, array) {
        checkIfHasParrent(entry, index, array, tempList.acceptor);
      });
      $(node).jstree(tempList);

      $(node).off('check_node.jstree uncheck_node.jstree').on('check_node.jstree uncheck_node.jstree', function (e, data) {
        return selectFunc(data, list, node);
      });
      $(node).off('changed.jstree').on('changed.jstree', function (e, data) {
        return checkFunc(data, list, node);
      });
      $(node).off('ready.jstree').on('ready.jstree', function () {
        $(this).jstree('open_all');
        if (!tempList.acceptor) {
          tempList.core.data.map(function (entry) {
            if (entry.parent != '#') {
              $(node).jstree('disable_node', entry.id);
            }
          });
        }
      });
    };

    var moveTreeSlice = function moveTreeSlice(from, to, options) {
      if (from.selected.length) {
        $(options.fromTreeElement).jstree('destroy');
        $(options.toTreeElement).jstree('destroy');
        moveEntries(from, to);
        deleteSelected(from);

        fillTree(toList, options.toTreeElement);
        fillTree(fromList, options.fromTreeElement);
        fillMultiSelect(from, to, options);

        from.selected = [];
        to.selected = [];
        $(options.toSearchElement).val(null);
        $(options.fromSearchElement).val(null);
      }
    };

    var fillSelectOption = function fillSelectOption(list, options) {
      if (list.core.data.length) {
        var isSelected = list.acceptor ? '' : 'selected';
        list.core.data.forEach(function (e) {
          $(options.hiddenMultiselect).append('<option value="' + e.id + '" ' + isSelected + ' data-order="' + e.order + '">' + e.text + '</option>');
        });
      }
    };

    var sortSelectOptions = function sortSelectOptions(hiddenMultiselect) {
      var $hiddenMultiselect = $(hiddenMultiselect),
          $hiddenMultiselectOptions = $hiddenMultiselect.children('option');

      $hiddenMultiselectOptions.sort(function (a, b) {
        var an = +a.getAttribute('data-order'),
            bn = +b.getAttribute('data-order');

        if (an > bn) {
          return 1;
        }
        if (an < bn) {
          return -1;
        }
        return 0;
      });

      $hiddenMultiselect.empty();
      $hiddenMultiselectOptions.detach().appendTo($hiddenMultiselect);
    };

    var fillMultiSelect = function fillMultiSelect(from, to, options) {
      $(options.hiddenMultiselect).empty();
      fillSelectOption(from, options);
      fillSelectOption(to, options);
      sortSelectOptions(options.hiddenMultiselect);
    };

    return function (options) {
      fromList.core.data = options.dataFrom;
      toList.core.data = options.dataTo;
      $(options.fromSearchElement).on("keyup change", function () {
        $(options.fromTreeElement).jstree(true).search($(options.fromSearchElement).val());
      });

      $(options.toSearchElement).on("keyup change", function () {
        $(options.toTreeElement).jstree(true).search($(options.toSearchElement).val());
      });

      $(options.fromClearElement).click(function (e) {
        $(options.fromSearchElement).val('').change().focus();
      });

      $(options.toClearElement).click(function (e) {
        $(options.toSearchElement).val('').change().focus();
      });

      fillTree(toList, options.toTreeElement);
      fillTree(fromList, options.fromTreeElement);
      fillMultiSelect(fromList, toList, options);

      $(options.addButtonElement).click(function () {
        moveTreeSlice(fromList, toList, options);
      });
      $(options.removeButtonElement).click(function () {
        moveTreeSlice(toList, fromList, options);
      });
      $(options.addAllButtonElement).click(function () {
        moveAllEntries(fromList, toList, options);
      });
      $(options.removeAllButtonElement).click(function () {
        moveAllEntries(toList, fromList, options);
      });
    }(options);
  };

  $.fn.treePanels = function (options) {
    var settings = $.extend({}, $.fn.treePanels.defaults, options);
    return TreePanels(settings);
  };

  $.fn.treePanels.defaults = {
    dataFrom: [],
    dataTo: [],
    fromTreeElement: '#jstree-in',
    fromSearchElement: '#search-in',
    addButtonElement: '#add',
    addAllButtonElement: '#add-all',
    toTreeElement: '#jstree-out',
    toSearchElement: '#search-out',
    removeButtonElement: '#remove',
    removeAllButtonElement: '#remove-all',
    hiddenMultiselect: '#selected-elements'
  };
})(jQuery);

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUUsVUFBQyxDQUFELEVBQU87QUFDUCxNQUFNLE9BQU8sU0FBUCxJQUFPLENBQVMsT0FBVCxFQUFrQjtBQUM3QixRQUFNLGNBQWM7QUFDbEIsaUJBQVcsQ0FBQyxRQUFELEVBQVcsVUFBWCxDQURPO0FBRWxCLGNBQVE7QUFDTixnQkFBUSxFQURGO0FBRU4scUJBQWEsS0FGUDtBQUdOLGtDQUEwQixJQUhwQjtBQUlOLDJCQUFtQixLQUpiO0FBS04sa0JBQVU7QUFDUixtQkFBUztBQUREO0FBTEosT0FGVTtBQVdsQixrQkFBWTtBQUNSLHVCQUFnQixJQURSO0FBRVIsc0JBQWUsS0FGUDtBQUdSLHlCQUFrQjtBQUhWLE9BWE07QUFnQmxCLGdCQUFVO0FBQ1IsNkJBQXFCLElBRGI7QUFFUixzQ0FBOEI7QUFGdEIsT0FoQlE7QUFvQmxCLGtCQUFZO0FBcEJNLEtBQXBCOztBQXVCQSxRQUFNLFdBQVcsS0FBSyxLQUFMLENBQVcsS0FBSyxTQUFMLENBQWUsV0FBZixDQUFYLENBQWpCO0FBQ0EsYUFBUyxRQUFULEdBQW9CLEtBQXBCOztBQUVBLFFBQU0sU0FBUyxLQUFLLEtBQUwsQ0FBVyxLQUFLLFNBQUwsQ0FBZSxXQUFmLENBQVgsQ0FBZjtBQUNBLFdBQU8sUUFBUCxHQUFrQixJQUFsQjs7QUFFQSxRQUFNLGlCQUFpQixTQUFqQixjQUFpQixDQUFDLElBQUQsRUFBVTtBQUMvQixXQUFLLFFBQUwsQ0FBYyxPQUFkLENBQXNCLGNBQU07QUFDMUIsYUFBSyxJQUFMLENBQVUsSUFBVixDQUFlLE1BQWYsQ0FBc0IsS0FBSyxJQUFMLENBQVUsSUFBVixDQUFlLFNBQWYsQ0FBeUI7QUFBQSxpQkFBUSxLQUFLLEVBQUwsS0FBWSxFQUFwQjtBQUFBLFNBQXpCLENBQXRCLEVB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UUFBdkIsRUFBaUMsT0FBakMsQ0FBZjtBQUNBLFdBQU8sS0FBSyxRQUFMLENBQVA7QUFDRCxHQUhEOztBQUtBLElBQUUsRUFBRixDQUFLLElBQUwsQ0FBVSxRQUFWLEdBQXFCO0FBQ25CLGNBQVUsRUFEUztBQUVuQixZQUFRLEVBRlc7QUFHbkIscUJBQWdCLFlBSEc7QUFJbkIsdUJBQWtCLFlBSkM7QUFLbkIsc0JBQWlCLE1BTEU7QUFNbkIseUJBQW9CLFVBTkQ7QUFPbkIsbUJBQWMsYUFQSztBQVFuQixxQkFBZ0IsYUFSRztBQVNuQix5QkFBb0IsU0FURDtBQVVuQiw0QkFBdUIsYUFWSjtBQVduQix1QkFBa0I7QUFYQyxHQUFyQjtBQWNELENBdE9ELEVBc09HLE1BdE9IIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIFlvdSBjYW4gd3JpdGUgYSBjYWxsIGFuZCBpbXBvcnQgeW91ciBmdW5jdGlvbnMgaW4gdGhpcyBmaWxlLlxuLy9cbi8vIFRoaXMgZmlsZSB3aWxsIGJlIGNvbXBpbGVkIGludG8gYXBwLmpzIGFuZCB3aWxsIG5vdCBiZSBtaW5pZmllZC5cbi8vIEZlZWwgZnJlZSB3aXRoIHVzaW5nIEVTNiBoZXJlLlxuKCAoJCkgPT4ge1xuICBjb25zdCBUcmVlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGNvbnN0IGRlZmF1bHRMaXN0ID0ge1xuICAgICAgJ3BsdWdpbnMnOiBbJ3NlYXJjaCcsICdjaGVja2JveCddLFxuICAgICAgJ2NvcmUnOiB7XG4gICAgICAgICdkYXRhJzogW10sXG4gICAgICAgICdhbmltYXRpb24nOiBmYWxzZSxcbiAgICAgICAgJ2V4cGFuZF9zZWxlY3RlZF9vbmxvYWQnOiB0cnVlLFxuICAgICAgICAnZGJsY2xpY2tfdG9nZ2xlJzogZmFsc2UsXG4gICAgICAgICd0aGVtZXMnOiB7XG4gICAgICAgICAgJ2ljb25zJzogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgICdjaGVja2JveCc6IHtcbiAgICAgICAgICAndGhyZWVfc3RhdGUnIDogdHJ1ZSxcbiAgICAgICAgICAnd2hvbGVfbm9kZScgOiBmYWxzZSxcbiAgICAgICAgICAndGllX3NlbGVjdGlvbicgOiBmYWxzZVxuICAgICAgfSxcbiAgICAgICdzZWFyY2gnOiB7XG4gICAgICAgICdzaG93X29ubHlfbWF0Y2hlcyc6IHRydWUsXG4gICAgICAgICdzaG93X29ubHlfbWF0Y2hlc19jaGlsZHJlbic6IHRydWVcbiAgICAgIH0sXG4gICAgICAnc2VsZWN0ZWQnOiBbXVxuICAgIH07XG5cbiAgICBjb25zdCBmcm9tTGlzdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmYXVsdExpc3QpKTtcbiAgICBmcm9tTGlzdC5hY2NlcHRvciA9IGZhbHNlO1xuXG4gICAgY29uc3QgdG9MaXN0ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0TGlzdCkpO1xuICAgIHRvTGlzdC5hY2NlcHRvciA9IHRydWU7XG5cbiAgICBjb25zdCBkZWxldGVTZWxlY3RlZCA9IChsaXN0KSA9PiB7XG4gICAgICBsaXN0LnNlbGVjdGVkLmZvckVhY2goZWwgPT4ge1xuICAgICAgICBsaXN0LmNvcmUuZGF0YS5zcGxpY2UobGlzdC5jb3JlLmRhdGEuZmluZEluZGV4KGVsZW0gPT4gZWxlbS5pZCA9PT0gZWwpLCAxKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCBjaGVja0Z1bmMgPSAoZGF0YSwgbGlzdCwgbm9kZSkgPT4ge1xuICAgICAgaWYgKCFkYXRhLm5vZGUuc3RhdGUuY2hlY2tib3hfZGlzYWJsZWQpIHtcbiAgICAgICAgY29uc3Qgc2hvdWxkQ2hlY2sgPSBkYXRhLm5vZGUuc3RhdGUuY2hlY2tlZCA/ICd1bmNoZWNrX25vZGUnIDogJ2NoZWNrX25vZGUnO1xuICAgICAgICAkKG5vZGUpLmpzdHJlZShzaG91bGRDaGVjaywgZGF0YS5ub2RlLmlkKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3QgY2hlY2tOb2RlcyA9IChkYXRhLCBsaXN0LCBub2RlKSA9PiB7XG4gICAgICBpZiAobGlzdC5zZWxlY3RlZC5pbmRleE9mKGRhdGEubm9kZS5pZCk9PS0xKSB7XG4gICAgICAgIGxpc3Quc2VsZWN0ZWQucHVzaChkYXRhLm5vZGUuaWQpO1xuICAgICAgICBpZiAoZGF0YS5ub2RlLmNoaWxkcmVuX2QubGVuZ3RoKSB7XG4gICAgICAgICAgZGF0YS5ub2RlLmNoaWxkcmVuX2QuZm9yRWFjaChjaGlsZE5vZGUgPT4ge1xuICAgICAgICAgICAgaWYgKGxpc3Quc2VsZWN0ZWQuaW5kZXhPZihjaGlsZE5vZGUpPT0tMSkge1xuICAgICAgICAgICAgICAgIGxpc3Quc2VsZWN0ZWQucHVzaChjaGlsZE5vZGUpO1xuICAgICAgICAgICAgICAgICQobm9kZSkuanN0cmVlKCdjaGVja19ub2RlJywgY2hpbGROb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICQobm9kZSkuanN0cmVlKCdkaXNhYmxlX25vZGUnLCBjaGlsZE5vZGUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IHVuQ2hlY2tOb2RlcyA9IChkYXRhLCBsaXN0LCBub2RlKSA9PiB7XG4gICAgICBsaXN0LnNlbGVjdGVkLnNwbGljZShsaXN0LnNlbGVjdGVkLmluZGV4T2YoZGF0YS5ub2RlLmlkKSwxKTtcbiAgICAgIGlmIChkYXRhLm5vZGUuY2hpbGRyZW5fZC5sZW5ndGgpIHtcbiAgICAgICAgZGF0YS5ub2RlLmNoaWxkcmVuX2QuZm9yRWFjaChjaGlsZE5vZGUgPT4ge1xuICAgICAgICAgICAgJChub2RlKS5qc3RyZWUoJ3VuY2hlY2tfbm9kZScsIGNoaWxkTm9kZSk7XG4gICAgICAgICAgICBpZiAobGlzdC5hY2NlcHRvcikge1xuICAgICAgICAgICAgICAkKG5vZGUpLmpzdHJlZSgnZW5hYmxlX25vZGUnLCBjaGlsZE5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY2hpbGROb2RlSW5kZXggPSBsaXN0LnNlbGVjdGVkLmluZGV4T2YoY2hpbGROb2RlKTtcbiAgICAgICAgICAgIGlmIChjaGlsZE5vZGVJbmRleCE9LTEpIHtcbiAgICAgICAgICAgICAgbGlzdC5zZWxlY3RlZC5zcGxpY2UoY2hpbGROb2RlSW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgc2VsZWN0RnVuYyA9IChkYXRhLCBsaXN0LCBub2RlKSA9PiB7XG4gICAgICByZXR1cm4gZGF0YS5ub2RlLnN0YXRlLmNoZWNrZWQgPyBjaGVja05vZGVzKGRhdGEsIGxpc3QsIG5vZGUpIDogdW5DaGVja05vZGVzKGRhdGEsIGxpc3QsIG5vZGUpO1xuICAgIH07XG5cbiAgICBjb25zdCBtb3ZlRW50cmllcyA9IChmcm9tTGlzdCwgdG9MaXN0KSA9PiB7XG4gICAgICBmcm9tTGlzdC5zZWxlY3RlZC5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICB0b0xpc3QuY29yZS5kYXRhLnB1c2goZnJvbUxpc3QuY29yZS5kYXRhLmZpbmQoZWwgPT4gZWwuaWQgPT09IGVsZW1lbnQpKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCBtb3ZlQWxsRW50cmllcyA9IChmcm9tTGlzdCwgdG9MaXN0LCBvcHRpb25zKSA9PiB7XG4gICAgICBmcm9tTGlzdC5zZWxlY3RlZCA9IFtdO1xuICAgICAgZnJvbUxpc3QuY29yZS5kYXRhLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIGZyb21MaXN0LnNlbGVjdGVkLnB1c2goZWxlbWVudC5pZCk7XG4gICAgICB9KTtcbiAgICAgIG1vdmVUcmVlU2xpY2UoZnJvbUxpc3QsIHRvTGlzdCwgb3B0aW9ucyk7XG4gICAgfTtcblxuICAgIGNvbnN0IGNoZWNrSWZIYXNQYXJyZW50ID0gKGVudHJ5LCBpbmRleCwgYXJyYXksIGlzQWNjZXB0b3IpID0+e1xuICAgICAgICBpZiAoIWFycmF5LnNvbWUoZWw9PihcbiAgICAgICAgICAgIGVsLmlkID09PSBlbnRyeS5wYXJlbnRcbiAgICAgICAgICApKSkge1xuICAgICAgICAgIGVudHJ5LnBhcmVudCA9IFwiI1wiO1xuICAgICAgICAgIGlmICghaXNBY2NlcHRvcil7XG4gICAgICAgICAgICBlbnRyeS5zdGF0ZSA9IHsgXCJjaGVja2JveF9kaXNhYmxlZFwiIDogZmFsc2UgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIWlzQWNjZXB0b3IpIHtcbiAgICAgICAgICBlbnRyeS5zdGF0ZSA9IHsgXCJjaGVja2JveF9kaXNhYmxlZFwiIDogdHJ1ZSB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbnRyeTtcbiAgICB9O1xuXG4gICAgY29uc3QgZmlsbFRyZWUgPSAobGlzdCwgbm9kZSkgPT57XG4gICAgICBsZXQgdGVtcExpc3QgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGxpc3QpKTtcbiAgICAgIHRlbXBMaXN0LmNvcmUuZGF0YS5tYXAoZW50cnkgPT4gZW50cnkuc3RhdGUgPSB7IFwiY2hlY2tib3hfZGlzYWJsZWRcIiA6IGZhbHNlIH0pO1xuICAgICAgdGVtcExpc3QuY29yZS5kYXRhLm1hcCgoZW50cnksIGluZGV4LCBhcnJheSkgPT57Y2hlY2tJZkhhc1BhcnJlbnQoZW50cnksIGluZGV4LCBhcnJheSwgdGVtcExpc3QuYWNjZXB0b3IpO30pO1xuICAgICAgJChub2RlKS5qc3RyZWUodGVtcExpc3QpO1xuICAgICAgXG4gICAgICAkKG5vZGUpLm9mZignY2hlY2tfbm9kZS5qc3RyZWUgdW5jaGVja19ub2RlLmpzdHJlZScpLm9uKCdjaGVja19ub2RlLmpzdHJlZSB1bmNoZWNrX25vZGUuanN0cmVlJywgKGUsIGRhdGEpID0+IHNlbGVjdEZ1bmMoZGF0YSwgbGlzdCwgbm9kZSkpO1xuICAgICAgJChub2RlKS5vZmYoJ2NoYW5nZWQuanN0cmVlJykub24oJ2NoYW5nZWQuanN0cmVlJywgKGUsIGRhdGEpID0+IGNoZWNrRnVuYyhkYXRhLCBsaXN0LCBub2RlKSk7XG4gICAgICAkKG5vZGUpLm9mZigncmVhZHkuanN0cmVlJykub24oJ3JlYWR5LmpzdHJlZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICQodGhpcykuanN0cmVlKCdvcGVuX2FsbCcpO1xuICAgICAgICBpZiAoIXRlbXBMaXN0LmFjY2VwdG9yKSB7XG4gICAgICAgIHRlbXBMaXN0LmNvcmUuZGF0YS5tYXAoZW50cnkgPT4ge1xuICAgICAgICAgIGlmIChlbnRyeS5wYXJlbnQgIT0gJyMnKSB7XG4gICAgICAgICAgICAkKG5vZGUpLmpzdHJlZSgnZGlzYWJsZV9ub2RlJywgZW50cnkuaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9fSk7XG4gICAgfTtcblxuICAgIGNvbnN0IG1vdmVUcmVlU2xpY2UgPSAoZnJvbSwgdG8sIG9wdGlvbnMpID0+IHtcbiAgICAgIGlmIChmcm9tLnNlbGVjdGVkLmxlbmd0aCkge1xuICAgICAgICAkKG9wdGlvbnMuZnJvbVRyZWVFbGVtZW50KS5qc3RyZWUoJ2Rlc3Ryb3knKTtcbiAgICAgICAgJChvcHRpb25zLnRvVHJlZUVsZW1lbnQpLmpzdHJlZSgnZGVzdHJveScpO1xuICAgICAgICBtb3ZlRW50cmllcyhmcm9tLCB0byk7XG4gICAgICAgIGRlbGV0ZVNlbGVjdGVkKGZyb20pO1xuXG4gICAgICAgIGZpbGxUcmVlKHRvTGlzdCwgb3B0aW9ucy50b1RyZWVFbGVtZW50KTtcbiAgICAgICAgZmlsbFRyZWUoZnJvbUxpc3QsIG9wdGlvbnMuZnJvbVRyZWVFbGVtZW50KTtcbiAgICAgICAgZmlsbE11bHRpU2VsZWN0KGZyb20sIHRvLCBvcHRpb25zKTtcblxuICAgICAgICBmcm9tLnNlbGVjdGVkID0gW107XG4gICAgICAgIHRvLnNlbGVjdGVkID0gW107XG4gICAgICAgICQob3B0aW9ucy50b1NlYXJjaEVsZW1lbnQpLnZhbChudWxsKTtcbiAgICAgICAgJChvcHRpb25zLmZyb21TZWFyY2hFbGVtZW50KS52YWwobnVsbCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IGZpbGxTZWxlY3RPcHRpb24gPSAobGlzdCwgb3B0aW9ucykgPT4ge1xuICAgICAgaWYgKGxpc3QuY29yZS5kYXRhLmxlbmd0aCl7XG4gICAgICAgIGxldCBpc1NlbGVjdGVkID0gbGlzdC5hY2NlcHRvciA/ICcnIDogJ3NlbGVjdGVkJztcbiAgICAgICAgbGlzdC5jb3JlLmRhdGEuZm9yRWFjaChlPT57XG4gICAgICAgICAgJChvcHRpb25zLmhpZGRlbk11bHRpc2VsZWN0KS5hcHBlbmQoYDxvcHRpb24gdmFsdWU9XCIke2UuaWR9XCIgJHtpc1NlbGVjdGVkfSBkYXRhLW9yZGVyPVwiJHtlLm9yZGVyfVwiPiR7ZS50ZXh0fTwvb3B0aW9uPmApO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgc29ydFNlbGVjdE9wdGlvbnMgPSAoaGlkZGVuTXVsdGlzZWxlY3QpID0+IHtcbiAgICAgIGNvbnN0ICRoaWRkZW5NdWx0aXNlbGVjdCA9ICQoaGlkZGVuTXVsdGlzZWxlY3QpLFxuICAgICAgICAkaGlkZGVuTXVsdGlzZWxlY3RPcHRpb25zID0gJGhpZGRlbk11bHRpc2VsZWN0LmNoaWxkcmVuKCdvcHRpb24nKTtcblxuICAgICAgJGhpZGRlbk11bHRpc2VsZWN0T3B0aW9ucy5zb3J0KGZ1bmN0aW9uKGEsYil7XG4gICAgICAgIGNvbnN0IGFuID0gK2EuZ2V0QXR0cmlidXRlKCdkYXRhLW9yZGVyJyksXG4gICAgICAgICAgYm4gPSArYi5nZXRBdHRyaWJ1dGUoJ2RhdGEtb3JkZXInKTtcblxuICAgICAgICBpZihhbiA+IGJuKSB7XG4gICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYoYW4gPCBibikge1xuICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH0pO1xuXG4gICAgICAkaGlkZGVuTXVsdGlzZWxlY3QuZW1wdHkoKTtcbiAgICAgICRoaWRkZW5NdWx0aXNlbGVjdE9wdGlvbnMuZGV0YWNoKCkuYXBwZW5kVG8oJGhpZGRlbk11bHRpc2VsZWN0KTtcbiAgICB9O1xuXG4gICAgY29uc3QgZmlsbE11bHRpU2VsZWN0ID0gKGZyb20sIHRvLCBvcHRpb25zKSA9PiB7XG4gICAgICAkKG9wdGlvbnMuaGlkZGVuTXVsdGlzZWxlY3QpLmVtcHR5KCk7XG4gICAgICBmaWxsU2VsZWN0T3B0aW9uKGZyb20sIG9wdGlvbnMpO1xuICAgICAgZmlsbFNlbGVjdE9wdGlvbih0bywgb3B0aW9ucyk7XG4gICAgICBzb3J0U2VsZWN0T3B0aW9ucyhvcHRpb25zLmhpZGRlbk11bHRpc2VsZWN0KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIGZyb21MaXN0LmNvcmUuZGF0YSA9IG9wdGlvbnMuZGF0YUZyb207XG4gICAgICB0b0xpc3QuY29yZS5kYXRhID0gb3B0aW9ucy5kYXRhVG87XG4gICAgICAkKG9wdGlvbnMuZnJvbVNlYXJjaEVsZW1lbnQpLm9uKFwia2V5dXAgY2hhbmdlXCIsICgpID0+IHtcbiAgICAgICAgJChvcHRpb25zLmZyb21UcmVlRWxlbWVudCkuanN0cmVlKHRydWUpLnNlYXJjaCgkKG9wdGlvbnMuZnJvbVNlYXJjaEVsZW1lbnQpLnZhbCgpKTtcbiAgICAgIH0pO1xuXG4gICAgICAkKG9wdGlvbnMudG9TZWFyY2hFbGVtZW50KS5vbihcImtleXVwIGNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgICQob3B0aW9ucy50b1RyZWVFbGVtZW50KS5qc3RyZWUodHJ1ZSkuc2VhcmNoKCQob3B0aW9ucy50b1NlYXJjaEVsZW1lbnQpLnZhbCgpKTtcbiAgICAgIH0pO1xuXG4gICAgICAkKG9wdGlvbnMuZnJvbUNsZWFyRWxlbWVudCkuY2xpY2soZSA9PiB7XG4gICAgICAgICQob3B0aW9ucy5mcm9tU2VhcmNoRWxlbWVudCkudmFsKCcnKS5jaGFuZ2UoKS5mb2N1cygpO1xuICAgICAgfSk7XG5cbiAgICAgICQob3B0aW9ucy50b0NsZWFyRWxlbWVudCkuY2xpY2soZSA9PiB7XG4gICAgICAgICQob3B0aW9ucy50b1NlYXJjaEVsZW1lbnQpLnZhbCgnJykuY2hhbmdlKCkuZm9jdXMoKTtcbiAgICAgIH0pO1xuXG4gICAgICBmaWxsVHJlZSh0b0xpc3QsIG9wdGlvbnMudG9UcmVlRWxlbWVudCk7XG4gICAgICBmaWxsVHJlZShmcm9tTGlzdCwgb3B0aW9ucy5mcm9tVHJlZUVsZW1lbnQpO1xuICAgICAgZmlsbE11bHRpU2VsZWN0KGZyb21MaXN0LCB0b0xpc3QsIG9wdGlvbnMpO1xuXG4gICAgICAkKG9wdGlvbnMuYWRkQnV0dG9uRWxlbWVudCkuY2xpY2soKCk9Pnttb3ZlVHJlZVNsaWNlKGZyb21MaXN0LCB0b0xpc3QsIG9wdGlvbnMpO30pO1xuICAgICAgJChvcHRpb25zLnJlbW92ZUJ1dHRvbkVsZW1lbnQpLmNsaWNrKCgpPT57bW92ZVRyZWVTbGljZSh0b0xpc3QsIGZyb21MaXN0LCBvcHRpb25zKTt9KTtcbiAgICAgICQob3B0aW9ucy5hZGRBbGxCdXR0b25FbGVtZW50KS5jbGljaygoKT0+e21vdmVBbGxFbnRyaWVzKGZyb21MaXN0LCB0b0xpc3QsIG9wdGlvbnMpO30pO1xuICAgICAgJChvcHRpb25zLnJlbW92ZUFsbEJ1dHRvbkVsZW1lbnQpLmNsaWNrKCgpPT57bW92ZUFsbEVudHJpZXModG9MaXN0LCBmcm9tTGlzdCwgb3B0aW9ucyk7fSk7XG4gICAgfShvcHRpb25zKTtcbiAgfTtcblxuICAkLmZuLnRyZWUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdmFyIHNldHRpbmdzID0gJC5leHRlbmQoe30sICQuZm4udHJlZS5kZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgcmV0dXJuIFRyZWUoc2V0dGluZ3MpO1xuICB9O1xuXG4gICQuZm4udHJlZS5kZWZhdWx0cyA9IHtcbiAgICBkYXRhRnJvbTogW10sXG4gICAgZGF0YVRvOiBbXSxcbiAgICBmcm9tVHJlZUVsZW1lbnQ6JyNqc3RyZWUtaW4nLFxuICAgIGZyb21TZWFyY2hFbGVtZW50Oicjc2VhcmNoLWluJyxcbiAgICBhZGRCdXR0b25FbGVtZW50OicjYWRkJyxcbiAgICBhZGRBbGxCdXR0b25FbGVtZW50OicjYWRkLWFsbCcsXG4gICAgdG9UcmVlRWxlbWVudDonI2pzdHJlZS1vdXQnLFxuICAgIHRvU2VhcmNoRWxlbWVudDonI3NlYXJjaC1vdXQnLFxuICAgIHJlbW92ZUJ1dHRvbkVsZW1lbnQ6JyNyZW1vdmUnLFxuICAgIHJlbW92ZUFsbEJ1dHRvbkVsZW1lbnQ6JyNyZW1vdmUtYWxsJyxcbiAgICBoaWRkZW5NdWx0aXNlbGVjdDonI3NlbGVjdGVkLWVsZW1lbnRzJ1xuICB9O1xuXG59KShqUXVlcnkpO1xuIl19
