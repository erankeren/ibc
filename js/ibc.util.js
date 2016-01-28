function trimString(s) {
  var l=0, r=s.length -1;
  while(l < s.length && s[l] == ' ') l++;
  while(r > l && s[r] == ' ') r-=1;
  return s.substring(l, r+1);
}

function compareObjects(o1, o2) {
  var k = '';
  for(k in o1) if(o1[k] != o2[k]) return false;
  for(k in o2) if(o1[k] != o2[k]) return false;
  return true;
}

function itemExists(haystack, needle) {
  for(var i=0; i<haystack.length; i++) if(compareObjects(haystack[i], needle)) return true;
  return false;
}

function searchFor(toSearch, objects) {
  var results = [];
  toSearch = trimString(toSearch); // trim it
  for(var i=0; i<objects.length; i++) {
	for(var key in objects[i]) {
	  var str = objects[i][key];
	  if(str.toLowerCase().indexOf(toSearch.toLowerCase())!=-1) {
		if(!itemExists(results, objects[i])) results.push(objects[i]);
	  }
	}
  }
  return results;
}

function isEmpty(str) {
	return (!str || 0 === str.length);
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function jq( myid ) {

	return "#" + myid.replace( /(:|\.|\[|\]|,)/g, "\\$1" );

}

function createRandomDivId() {
	var temp = Math.random().toString(36);
	var res = "id-" + temp.substring(6);
	return res;
};