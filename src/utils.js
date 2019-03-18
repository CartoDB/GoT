function deg2rad(deg) {
  return deg * (Math.PI/180);
}

export function getDistanceFromLngLatInKm(coords1, coords2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(coords2.lat - coords1.lat);
  var dLon = deg2rad(coords2.lng - coords1.lng); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(coords1.lat)) * Math.cos(deg2rad(coords2.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}
