(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// You can write a call and import your functions in this file.
//
// This file will be compiled into app.js and will not be minified.
// Feel free with using ES6 here.
(function ($) {
  var Tree = function Tree(options) {
    var defaultList = {
      'plugins': ['search', 'checkbox', 'wholerow'],
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
          $(node).jstree('enable_node', childNode);
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
    };

    var moveTreeSlice = function moveTreeSlice(from, to, options) {
      if (from.selected.length) {
        $.jstree.destroy();
        moveEntries(from, to);
        deleteSelected(from);

        fillTree(toList, options.toTreeElement);
        fillTree(fromList, options.fromTreeElement);

        from.selected = [];
        to.selected = [];
        $(options.toSearchElement).val(null);
        $(options.fromSearchElement).val(null);
      }
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

  $.fn.tree = function (options) {
    var settings = $.extend({}, $.fn.tree.defaults, options);
    return Tree(settings);
  };

  $.fn.tree.defaults = {
    dataFrom: [],
    dataTo: [],
    fromTreeElement: '#jstree',
    fromSearchElement: '#search',
    fromClearElement: '#clear',
    addButtonElement: '#add',
    addAllButtonElement: '#add-all',
    toTreeElement: '#jstree2',
    toSearchElement: '#search2',
    toClearElement: '#clear2',
    removeButtonElement: '#remove',
    removeAllButtonElement: '#remove-all'
  };
})(jQuery);

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUUsVUFBQyxDQUFELEVBQU87QUFDUCxNQUFNLE9BQU8sU0FBUCxJQUFPLENBQVMsT0FBVCxFQUFrQjtBQUM3QixRQUFNLGNBQWM7QUFDbEIsaUJBQVcsQ0FBQyxRQUFELEVBQVcsVUFBWCxFQUF1QixVQUF2QixDQURPO0FBRWxCLGNBQVE7QUFDTixnQkFBUSxFQURGO0FBRU4scUJBQWEsS0FGUDtBQUdOLGtDQUEwQixJQUhwQjtBQUlOLDJCQUFtQixLQUpiO0FBS04sa0JBQVU7QUFDUixtQkFBUztBQUREO0FBTEosT0FGVTtBQVdsQixrQkFBWTtBQUNSLHVCQUFnQixJQURSO0FBRVIsc0JBQWUsS0FGUDtBQUdSLHlCQUFrQjtBQUhWLE9BWE07QUFnQmxCLGdCQUFVO0FBQ1IsNkJBQXFCLElBRGI7QUFFUixzQ0FBOEI7QUFGdEIsT0FoQlE7QUFvQmxCLGtCQUFZO0FBcEJNLEtBQXBCOztBQXVCQSxRQUFNLFdBQVcsS0FBSyxLQUFMLENBQVcsS0FBSyxTQUFMLENBQWUsV0FBZixDQUFYLENBQWpCO0FBQ0EsYUFBUyxRQUFULEdBQW9CLEtBQXBCOztBQUVBLFFBQU0sU0FBUyxLQUFLLEtBQUwsQ0FBVyxLQUFLLFNBQUwsQ0FBZSxXQUFmLENBQVgsQ0FBZjtBQUNBLFdBQU8sUUFBUCxHQUFrQixJQUFsQjs7QUFFQSxRQUFNLGlCQUFpQixTQUFqQixjQUFpQixDQUFDLElBQUQsRUFBVTtBQUMvQixXQUFLLFFBQUwsQ0FBYyxPQUFkLENBQXNCLGNBQU07QUFDMUIsYUFBSyxJQUFMLENBQVUsSUFBVixDQUFlLE1BQWYsQ0FBc0IsS0FBSyxJQUFMLENBQVUsSUFBVixDQUFlLFNBQWYsQ0FBeUI7QUFBQSxpQkFBUSxLQUFLLEVBQUwsS0FBWSxFQUFwQjtBQUFBLFNB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QVYsRUFBK0IsS0FBL0IsQ0FBcUMsWUFBSTtBQUFDLHVCQUFlLFFBQWYsRUFBeUIsTUFBekIsRUFBaUMsT0FBakM7QUFBMkMsT0FBckY7QUFDQSxRQUFFLFFBQVEsc0JBQVYsRUFBa0MsS0FBbEMsQ0FBd0MsWUFBSTtBQUFDLHVCQUFlLE1BQWYsRUFBdUIsUUFBdkIsRUFBaUMsT0FBakM7QUFBMkMsT0FBeEY7QUFDRCxLQTFCTSxDQTBCTCxPQTFCSyxDQUFQO0FBMkJELEdBNUpEOztBQThKQSxJQUFFLEVBQUYsQ0FBSyxJQUFMLEdBQVksVUFBUyxPQUFULEVBQWtCO0FBQzVCLFFBQUksV0FBVyxFQUFFLE1BQUYsQ0FBUyxFQUFULEVBQWEsRUFBRSxFQUFGLENBQUssSUFBTCxDQUFVLFFBQXZCLEVBQWlDLE9BQWpDLENBQWY7QUFDQSxXQUFPLEtBQUssUUFBTCxDQUFQO0FBQ0QsR0FIRDs7QUFLQSxJQUFFLEVBQUYsQ0FBSyxJQUFMLENBQVUsUUFBVixHQUFxQjtBQUNuQixjQUFVLEVBRFM7QUFFbkIsWUFBUSxFQUZXO0FBR25CLHFCQUFnQixTQUhHO0FBSW5CLHVCQUFrQixTQUpDO0FBS25CLHNCQUFpQixRQUxFO0FBTW5CLHNCQUFpQixNQU5FO0FBT25CLHlCQUFvQixVQVBEO0FBUW5CLG1CQUFjLFVBUks7QUFTbkIscUJBQWdCLFVBVEc7QUFVbkIsb0JBQWUsU0FWSTtBQVduQix5QkFBb0IsU0FYRDtBQVluQiw0QkFBdUI7QUFaSixHQUFyQjtBQWVELENBbkxELEVBbUxHLE1BbkxIIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIFlvdSBjYW4gd3JpdGUgYSBjYWxsIGFuZCBpbXBvcnQgeW91ciBmdW5jdGlvbnMgaW4gdGhpcyBmaWxlLlxuLy9cbi8vIFRoaXMgZmlsZSB3aWxsIGJlIGNvbXBpbGVkIGludG8gYXBwLmpzIGFuZCB3aWxsIG5vdCBiZSBtaW5pZmllZC5cbi8vIEZlZWwgZnJlZSB3aXRoIHVzaW5nIEVTNiBoZXJlLlxuKCAoJCkgPT4ge1xuICBjb25zdCBUcmVlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGNvbnN0IGRlZmF1bHRMaXN0ID0ge1xuICAgICAgJ3BsdWdpbnMnOiBbJ3NlYXJjaCcsICdjaGVja2JveCcsICd3aG9sZXJvdyddLFxuICAgICAgJ2NvcmUnOiB7XG4gICAgICAgICdkYXRhJzogW10sXG4gICAgICAgICdhbmltYXRpb24nOiBmYWxzZSxcbiAgICAgICAgJ2V4cGFuZF9zZWxlY3RlZF9vbmxvYWQnOiB0cnVlLFxuICAgICAgICAnZGJsY2xpY2tfdG9nZ2xlJzogZmFsc2UsXG4gICAgICAgICd0aGVtZXMnOiB7XG4gICAgICAgICAgJ2ljb25zJzogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgICdjaGVja2JveCc6IHtcbiAgICAgICAgICAndGhyZWVfc3RhdGUnIDogdHJ1ZSxcbiAgICAgICAgICAnd2hvbGVfbm9kZScgOiBmYWxzZSxcbiAgICAgICAgICAndGllX3NlbGVjdGlvbicgOiBmYWxzZVxuICAgICAgfSxcbiAgICAgICdzZWFyY2gnOiB7XG4gICAgICAgICdzaG93X29ubHlfbWF0Y2hlcyc6IHRydWUsXG4gICAgICAgICdzaG93X29ubHlfbWF0Y2hlc19jaGlsZHJlbic6IHRydWVcbiAgICAgIH0sXG4gICAgICAnc2VsZWN0ZWQnOiBbXVxuICAgIH07XG5cbiAgICBjb25zdCBmcm9tTGlzdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmYXVsdExpc3QpKTtcbiAgICBmcm9tTGlzdC5hY2NlcHRvciA9IGZhbHNlO1xuXG4gICAgY29uc3QgdG9MaXN0ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0TGlzdCkpO1xuICAgIHRvTGlzdC5hY2NlcHRvciA9IHRydWU7XG5cbiAgICBjb25zdCBkZWxldGVTZWxlY3RlZCA9IChsaXN0KSA9PiB7XG4gICAgICBsaXN0LnNlbGVjdGVkLmZvckVhY2goZWwgPT4ge1xuICAgICAgICBsaXN0LmNvcmUuZGF0YS5zcGxpY2UobGlzdC5jb3JlLmRhdGEuZmluZEluZGV4KGVsZW0gPT4gZWxlbS5pZCA9PT0gZWwpLCAxKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCBjaGVja0Z1bmMgPSAoZGF0YSwgbGlzdCwgbm9kZSkgPT4ge1xuICAgICAgaWYgKCFkYXRhLm5vZGUuc3RhdGUuY2hlY2tib3hfZGlzYWJsZWQpIHtcbiAgICAgICAgY29uc3Qgc2hvdWxkQ2hlY2sgPSBkYXRhLm5vZGUuc3RhdGUuY2hlY2tlZCA/ICd1bmNoZWNrX25vZGUnIDogJ2NoZWNrX25vZGUnO1xuICAgICAgICAkKG5vZGUpLmpzdHJlZShzaG91bGRDaGVjaywgZGF0YS5ub2RlLmlkKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3QgY2hlY2tOb2RlcyA9IChkYXRhLCBsaXN0LCBub2RlKSA9PiB7XG4gICAgICBpZiAobGlzdC5zZWxlY3RlZC5pbmRleE9mKGRhdGEubm9kZS5pZCk9PS0xKSB7XG4gICAgICAgIGxpc3Quc2VsZWN0ZWQucHVzaChkYXRhLm5vZGUuaWQpO1xuICAgICAgICBpZiAoZGF0YS5ub2RlLmNoaWxkcmVuX2QubGVuZ3RoKSB7XG4gICAgICAgICAgZGF0YS5ub2RlLmNoaWxkcmVuX2QuZm9yRWFjaChjaGlsZE5vZGUgPT4ge1xuICAgICAgICAgICAgaWYgKGxpc3Quc2VsZWN0ZWQuaW5kZXhPZihjaGlsZE5vZGUpPT0tMSkge1xuICAgICAgICAgICAgICAgIGxpc3Quc2VsZWN0ZWQucHVzaChjaGlsZE5vZGUpO1xuICAgICAgICAgICAgICAgICQobm9kZSkuanN0cmVlKCdjaGVja19ub2RlJywgY2hpbGROb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICQobm9kZSkuanN0cmVlKCdkaXNhYmxlX25vZGUnLCBjaGlsZE5vZGUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IHVuQ2hlY2tOb2RlcyA9IChkYXRhLCBsaXN0LCBub2RlKSA9PiB7XG4gICAgICBsaXN0LnNlbGVjdGVkLnNwbGljZShsaXN0LnNlbGVjdGVkLmluZGV4T2YoZGF0YS5ub2RlLmlkKSwxKTtcbiAgICAgIGlmIChkYXRhLm5vZGUuY2hpbGRyZW5fZC5sZW5ndGgpIHtcbiAgICAgICAgZGF0YS5ub2RlLmNoaWxkcmVuX2QuZm9yRWFjaChjaGlsZE5vZGUgPT4ge1xuICAgICAgICAgICAgJChub2RlKS5qc3RyZWUoJ3VuY2hlY2tfbm9kZScsIGNoaWxkTm9kZSk7XG4gICAgICAgICAgICAkKG5vZGUpLmpzdHJlZSgnZW5hYmxlX25vZGUnLCBjaGlsZE5vZGUpO1xuICAgICAgICAgICAgY29uc3QgY2hpbGROb2RlSW5kZXggPSBsaXN0LnNlbGVjdGVkLmluZGV4T2YoY2hpbGROb2RlKTtcbiAgICAgICAgICAgIGlmIChjaGlsZE5vZGVJbmRleCE9LTEpIHtcbiAgICAgICAgICAgICAgbGlzdC5zZWxlY3RlZC5zcGxpY2UoY2hpbGROb2RlSW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgc2VsZWN0RnVuYyA9IChkYXRhLCBsaXN0LCBub2RlKSA9PiB7XG4gICAgICByZXR1cm4gZGF0YS5ub2RlLnN0YXRlLmNoZWNrZWQgPyBjaGVja05vZGVzKGRhdGEsIGxpc3QsIG5vZGUpIDogdW5DaGVja05vZGVzKGRhdGEsIGxpc3QsIG5vZGUpO1xuICAgIH07XG5cbiAgICBjb25zdCBtb3ZlRW50cmllcyA9IChmcm9tTGlzdCwgdG9MaXN0KSA9PiB7XG4gICAgICBmcm9tTGlzdC5zZWxlY3RlZC5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICB0b0xpc3QuY29yZS5kYXRhLnB1c2goZnJvbUxpc3QuY29yZS5kYXRhLmZpbmQoZWwgPT4gZWwuaWQgPT09IGVsZW1lbnQpKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCBtb3ZlQWxsRW50cmllcyA9IChmcm9tTGlzdCwgdG9MaXN0LCBvcHRpb25zKSA9PiB7XG4gICAgICBmcm9tTGlzdC5zZWxlY3RlZCA9IFtdO1xuICAgICAgZnJvbUxpc3QuY29yZS5kYXRhLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIGZyb21MaXN0LnNlbGVjdGVkLnB1c2goZWxlbWVudC5pZCk7XG4gICAgICB9KTtcbiAgICAgIG1vdmVUcmVlU2xpY2UoZnJvbUxpc3QsIHRvTGlzdCwgb3B0aW9ucyk7XG4gICAgfTtcblxuICAgIGNvbnN0IGNoZWNrSWZIYXNQYXJyZW50ID0gKGVudHJ5LCBpbmRleCwgYXJyYXksIGlzQWNjZXB0b3IpID0+e1xuICAgICAgICBpZiAoIWFycmF5LnNvbWUoZWw9PihcbiAgICAgICAgICAgIGVsLmlkID09PSBlbnRyeS5wYXJlbnRcbiAgICAgICAgICApKSkge1xuICAgICAgICAgIGVudHJ5LnBhcmVudCA9IFwiI1wiO1xuICAgICAgICAgIGlmICghaXNBY2NlcHRvcil7XG4gICAgICAgICAgICBlbnRyeS5zdGF0ZSA9IHsgXCJjaGVja2JveF9kaXNhYmxlZFwiIDogZmFsc2UgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIWlzQWNjZXB0b3IpIHtcbiAgICAgICAgICBlbnRyeS5zdGF0ZSA9IHsgXCJjaGVja2JveF9kaXNhYmxlZFwiIDogdHJ1ZSB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbnRyeTtcbiAgICB9O1xuXG4gICAgY29uc3QgZmlsbFRyZWUgPSAobGlzdCwgbm9kZSkgPT57XG4gICAgICBsZXQgdGVtcExpc3QgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGxpc3QpKTtcbiAgICAgIHRlbXBMaXN0LmNvcmUuZGF0YS5tYXAoZW50cnkgPT4gZW50cnkuc3RhdGUgPSB7IFwiY2hlY2tib3hfZGlzYWJsZWRcIiA6IGZhbHNlIH0pO1xuICAgICAgdGVtcExpc3QuY29yZS5kYXRhLm1hcCgoZW50cnksIGluZGV4LCBhcnJheSkgPT57Y2hlY2tJZkhhc1BhcnJlbnQoZW50cnksIGluZGV4LCBhcnJheSwgdGVtcExpc3QuYWNjZXB0b3IpO30pO1xuICAgICAgJChub2RlKS5qc3RyZWUodGVtcExpc3QpO1xuICAgICAgJChub2RlKS5vZmYoJ2NoZWNrX25vZGUuanN0cmVlIHVuY2hlY2tfbm9kZS5qc3RyZWUnKS5vbignY2hlY2tfbm9kZS5qc3RyZWUgdW5jaGVja19ub2RlLmpzdHJlZScsIChlLCBkYXRhKSA9PiBzZWxlY3RGdW5jKGRhdGEsIGxpc3QsIG5vZGUpKTtcbiAgICAgICQobm9kZSkub2ZmKCdjaGFuZ2VkLmpzdHJlZScpLm9uKCdjaGFuZ2VkLmpzdHJlZScsIChlLCBkYXRhKSA9PiBjaGVja0Z1bmMoZGF0YSwgbGlzdCwgbm9kZSkpO1xuICAgIH07XG5cbiAgICBjb25zdCBtb3ZlVHJlZVNsaWNlID0gKGZyb20sIHRvLCBvcHRpb25zKSA9PiB7XG4gICAgICBpZiAoZnJvbS5zZWxlY3RlZC5sZW5ndGgpIHtcbiAgICAgICAgJC5qc3RyZWUuZGVzdHJveSgpO1xuICAgICAgICBtb3ZlRW50cmllcyhmcm9tLCB0byk7XG4gICAgICAgIGRlbGV0ZVNlbGVjdGVkKGZyb20pO1xuXG4gICAgICAgIGZpbGxUcmVlKHRvTGlzdCwgb3B0aW9ucy50b1RyZWVFbGVtZW50KTtcbiAgICAgICAgZmlsbFRyZWUoZnJvbUxpc3QsIG9wdGlvbnMuZnJvbVRyZWVFbGVtZW50KTtcblxuICAgICAgICBmcm9tLnNlbGVjdGVkID0gW107XG4gICAgICAgIHRvLnNlbGVjdGVkID0gW107XG4gICAgICAgICQob3B0aW9ucy50b1NlYXJjaEVsZW1lbnQpLnZhbChudWxsKTtcbiAgICAgICAgJChvcHRpb25zLmZyb21TZWFyY2hFbGVtZW50KS52YWwobnVsbCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBmcm9tTGlzdC5jb3JlLmRhdGEgPSBvcHRpb25zLmRhdGFGcm9tO1xuICAgICAgdG9MaXN0LmNvcmUuZGF0YSA9IG9wdGlvbnMuZGF0YVRvO1xuICAgICAgJChvcHRpb25zLmZyb21TZWFyY2hFbGVtZW50KS5vbihcImtleXVwIGNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgICQob3B0aW9ucy5mcm9tVHJlZUVsZW1lbnQpLmpzdHJlZSh0cnVlKS5zZWFyY2goJChvcHRpb25zLmZyb21TZWFyY2hFbGVtZW50KS52YWwoKSk7XG4gICAgICB9KTtcblxuICAgICAgJChvcHRpb25zLnRvU2VhcmNoRWxlbWVudCkub24oXCJrZXl1cCBjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICAkKG9wdGlvbnMudG9UcmVlRWxlbWVudCkuanN0cmVlKHRydWUpLnNlYXJjaCgkKG9wdGlvbnMudG9TZWFyY2hFbGVtZW50KS52YWwoKSk7XG4gICAgICB9KTtcblxuICAgICAgJChvcHRpb25zLmZyb21DbGVhckVsZW1lbnQpLmNsaWNrKGUgPT4ge1xuICAgICAgICAkKG9wdGlvbnMuZnJvbVNlYXJjaEVsZW1lbnQpLnZhbCgnJykuY2hhbmdlKCkuZm9jdXMoKTtcbiAgICAgIH0pO1xuXG4gICAgICAkKG9wdGlvbnMudG9DbGVhckVsZW1lbnQpLmNsaWNrKGUgPT4ge1xuICAgICAgICAkKG9wdGlvbnMudG9TZWFyY2hFbGVtZW50KS52YWwoJycpLmNoYW5nZSgpLmZvY3VzKCk7XG4gICAgICB9KTtcblxuICAgICAgZmlsbFRyZWUodG9MaXN0LCBvcHRpb25zLnRvVHJlZUVsZW1lbnQpO1xuICAgICAgZmlsbFRyZWUoZnJvbUxpc3QsIG9wdGlvbnMuZnJvbVRyZWVFbGVtZW50KTtcblxuICAgICAgJChvcHRpb25zLmFkZEJ1dHRvbkVsZW1lbnQpLmNsaWNrKCgpPT57bW92ZVRyZWVTbGljZShmcm9tTGlzdCwgdG9MaXN0LCBvcHRpb25zKTt9KTtcbiAgICAgICQob3B0aW9ucy5yZW1vdmVCdXR0b25FbGVtZW50KS5jbGljaygoKT0+e21vdmVUcmVlU2xpY2UodG9MaXN0LCBmcm9tTGlzdCwgb3B0aW9ucyk7fSk7XG4gICAgICAkKG9wdGlvbnMuYWRkQWxsQnV0dG9uRWxlbWVudCkuY2xpY2soKCk9Pnttb3ZlQWxsRW50cmllcyhmcm9tTGlzdCwgdG9MaXN0LCBvcHRpb25zKTt9KTtcbiAgICAgICQob3B0aW9ucy5yZW1vdmVBbGxCdXR0b25FbGVtZW50KS5jbGljaygoKT0+e21vdmVBbGxFbnRyaWVzKHRvTGlzdCwgZnJvbUxpc3QsIG9wdGlvbnMpO30pO1xuICAgIH0ob3B0aW9ucyk7XG4gIH07XG5cbiAgJC5mbi50cmVlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciBzZXR0aW5ncyA9ICQuZXh0ZW5kKHt9LCAkLmZuLnRyZWUuZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIHJldHVybiBUcmVlKHNldHRpbmdzKTtcbiAgfTtcblxuICAkLmZuLnRyZWUuZGVmYXVsdHMgPSB7XG4gICAgZGF0YUZyb206IFtdLFxuICAgIGRhdGFUbzogW10sXG4gICAgZnJvbVRyZWVFbGVtZW50OicjanN0cmVlJyxcbiAgICBmcm9tU2VhcmNoRWxlbWVudDonI3NlYXJjaCcsXG4gICAgZnJvbUNsZWFyRWxlbWVudDonI2NsZWFyJyxcbiAgICBhZGRCdXR0b25FbGVtZW50OicjYWRkJyxcbiAgICBhZGRBbGxCdXR0b25FbGVtZW50OicjYWRkLWFsbCcsXG4gICAgdG9UcmVlRWxlbWVudDonI2pzdHJlZTInLFxuICAgIHRvU2VhcmNoRWxlbWVudDonI3NlYXJjaDInLFxuICAgIHRvQ2xlYXJFbGVtZW50OicjY2xlYXIyJyxcbiAgICByZW1vdmVCdXR0b25FbGVtZW50OicjcmVtb3ZlJyxcbiAgICByZW1vdmVBbGxCdXR0b25FbGVtZW50OicjcmVtb3ZlLWFsbCdcbiAgfTtcblxufSkoalF1ZXJ5KTtcbiJdfQ==
