

export const displayMap = function(){

mapboxgl.accessToken = 'pk.eyJ1IjoiYWxpbWJvbGFyIiwiYSI6ImNrdDgyMjAzMzB4eDgyd3J3aHN1aTh4cnYifQ.GJLmTrMnl30rYdfHCKiYzQ';
var map = new mapboxgl.Map({
    container: 'map',
    // style: 'mapbox://styles/mapbox/streets-v11'
    style: 'mapbox://styles/alimbolar/ckt83a5091my819v1eik0f1qt',
    scrollZoom : false
    // center : [55.2568423,25.1850088],
    // zoom : 13,
    // interactive: false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc=>{
    // Create Marker
    const el=document.createElement('div');
    el.className = "marker";

    // Add Marker
    new mapboxgl.Marker({
        element : el,
        anchor : "bottom"
    }).setLngLat(loc.coordinates).addTo(map);

    // Add Popup

    new mapboxgl.Popup({
        offset: 30,
        closeOnClick:false,
        focusAfterOpen:false
    }).setLngLat(loc.coordinates).setHTML(`<p>${loc.day} - ${loc.description}</p>`).addTo(map);

    // Extend map bounds to inlude current locations
    bounds.extend(loc.coordinates);

})

map.fitBounds(bounds,
   {padding : {
    top:200,
    bottom : 150,
    left : 200,
    right : 200
} } );

}