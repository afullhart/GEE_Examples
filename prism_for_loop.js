//Downloads long-term monthly prism precipitation, tmax, tmin.
//The for loop allows one output table to be created per band.

var point_fc = ee.FeatureCollection('projects/ee-andrewfullhart/assets/station_points');
var prism_ic = ee.ImageCollection('OREGONSTATE/PRISM/AN81m');

var bands = ['ppt', 'tmax', 'tmin'];

var start_year = 1990;
var end_year = 2019;
var month_list = ee.List([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

var start = ee.Date.fromYMD(start_year, 1, 1);
var end = ee.Date.fromYMD(end_year+1, 1, 1);
var prism_ic = prism_ic.filterDate(start, end);

for (var i = 0; i < bands.length; i++){
  var band = bands[i];
  function month_fn(mo){
    var month_ic = prism_ic.filter(ee.Filter.calendarRange(mo, mo, 'month'));
    var mean_im = month_ic.select(band).reduce(ee.Reducer.mean());
    var sample_fc = mean_im.sampleRegions(point_fc);
    var sample_list = sample_fc.reduceColumns(ee.Reducer.toList(), [band + '_mean']);
    return ee.Feature(null, {month: sample_list});
  }

  var out_fc = ee.FeatureCollection(month_list.map(month_fn));
  
  Export.table.toDrive({
    collection: out_fc,
    selectors: ['month'],
    folder: 'GEE_Downloads',
    description:'prism_for_loop_' + band,
  });
}

