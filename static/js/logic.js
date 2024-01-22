let myMap = L.map("map", {
  center: [47.11, -101.29],
  zoom: 3.5
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(url).then(function(data) {
  console.log(data);

  // Loop over each earthquake feature
  data.features.forEach(function(feature) {
    // Extract the coordinates and magnitude
    let coordinates = feature.geometry.coordinates;
    let magnitude = feature.properties.mag;

    // Check if coordinates and magnitude are valid numbers
    if (!coordinates || coordinates.length !== 3 || isNaN(magnitude)) {
      console.warn('Invalid data for earthquake:', feature);
      return; // Skip this iteration
    }

    let longitude = coordinates[0];
    let latitude = coordinates[1];
    let depth = coordinates[2];

    // Define marker size based on magnitude (ensure it's always a sensible size)
    let markerSize = Math.max(10 * Math.sqrt(magnitude));

    // Define a color based on the earthquake depth
    let depthColor = getColor(depth);

    // Create a marker and add it to the map
    let quakeMarker = L.circleMarker([latitude, longitude], {
      color: depthColor,
      fillColor: depthColor,
      fillOpacity: 0.75,
      radius: markerSize
    }).bindPopup("<h1>" + feature.properties.title + "</h1>");

    quakeMarker.addTo(myMap);
  });

  // Add a legend to the map
let legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
  let div = L.DomUtil.create('div', 'info legend'),
      depthLevels = [0, 10, 30, 50, 70, 90],
      labels = ['<strong>Depth</strong>'];

  div.style.backgroundColor = 'white';
  div.style.padding = '6px';
  div.style.border = '1px solid #ccc';

  // Add min & max
  for (let i = 0; i < depthLevels.length; i++) {
    let from = depthLevels[i];
    let to = depthLevels[i + 1];

    labels.push(
      '<i style="background:' + getColor(from + 1) + '; width:18px; height:18px; float:left; opacity:0.7; margin-right:5px;"></i> ' +
      from + (to ? '&ndash;' + to : '+') + ' km');
  }

  div.innerHTML = labels.join('<br style="clear:both;">');
  return div;
};

// Function to determine color based on depth
function getColor(d) {
  return d > 90 ? 'darkred' :
         d > 70 ? 'red' : // Assuming 'lightred' should be 'red'
         d > 50 ? 'orange' :
         d > 30 ? 'yellow' :
         d > 10 ? 'lightgreen' :
                  'green';
}

legend.addTo(myMap);})