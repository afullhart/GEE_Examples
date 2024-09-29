//Downloads 1 year of daily precipitation time series from prism daily
//The for loop allows one time series to be exported per station.

var point_fc = ee.FeatureCollection('projects/ee-andrewfullhart/assets/station_points');
var prism_ic = ee.ImageCollection('OREGONSTATE/PRISM/AN81d');

var start_year = 2019;
var end_year = 2020;
var start = ee.Date.fromYMD(start_year, 12, 31);
var end = ee.Date.fromYMD(end_year, 12, 31);
var prism_ic = prism_ic.filterDate(start, end);

var point_list = point_fc.toList(999);

for (var i = 0; i < point_list.size().getInfo(); i++){

  var pt = ee.Feature(point_list.get(i)).geometry();
  var pt_str = ee.Feature(point_list.get(i)).get('stationID').getInfo();
  var prop_list = prism_ic.getRegion(pt, 500);

  function props_fn(props){
    var props = ee.List(props);
    return ee.Feature(null, {'date':props.get(0), 'precip':props.get(4), 'tmax':props.get(7), 'tmin':props.get(6)});
  }
  
  var table_fc = ee.FeatureCollection(prop_list.slice(1).map(props_fn));

  Export.table.toDrive({
    collection: table_fc,
    selectors: ['date', 'precip', 'tmax', 'tmin'],
    folder: 'GEE_Downloads',
    description: 'prism_tseries_download_' + pt_str
  });
}
