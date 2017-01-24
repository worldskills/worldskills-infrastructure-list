angular.module('ilApp')
  .filter('customWSFilter', function () {
  return function(items, props) {
    var out = [];
    var path = props['objPath'].split(".");
    var matchPath = props['matchPath'] ? props['matchPath'].split('.') : null;

    var itemPointer = null;
    var matchPointer = null;

    if (angular.isArray(path) && angular.isArray(items)) {
      items.forEach(function(item){

        //path pointers
        itemPointer = item;
        matchPointer = item;

        //initialize itemPointer
        for (var i = 0; i < path.length; i++) {
          itemPointer = itemPointer[path[i]];
        }

        //initialize matchPointer - if needed
        if(matchPath !== null) {
          for (var i = 0; i < matchPath.length; i++) {
            matchPointer = matchPointer[matchPath[i]];
          }
        }

        if(itemPointer.toString().toLowerCase().indexOf(props['query'].toLowerCase()) !== -1){
          //if matchpatch checking exist, check for a match in path
          if(matchPath !== null){
            //only if pointer matches the query
            if(matchPointer === props['match']) out.push(item);
          }
          else out.push(item);
        }

      });
    }

    return out;
  };
});
