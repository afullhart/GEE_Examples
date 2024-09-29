//Downloads long-term monthly prism precipitation for locations in point_fc
//The output table is not very readable.

var point_fc = ee.FeatureCollection('projects/ee-andrewfullhart/assets/station_points');
var prism_ic = ee.ImageCollection('OREGONSTATE/PRISM/AN81m');

var start_year = 1990;
var end_year = 2019;
var start = ee.Date.fromYMD(start_year, 1, 1);
var end = ee.Date.fromYMD(end_year+1, 1, 1);
var prism_ic = prism_ic.filterDate(start, end);

var month_list = ee.List([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

function month_fn(mo){
  var month_ic = prism_ic.filter(ee.Filter.calendarRange(mo, mo, 'month'));
  var mean_im = month_ic.select('ppt').reduce(ee.Reducer.mean());
  var sample_fc = mean_im.sampleRegions(point_fc);
  var sample_list = sample_fc.reduceColumns(ee.Reducer.toList(), ['ppt_mean']);
  return ee.Feature(null, {month: sample_list});
}

var out_fc = ee.FeatureCollection(month_list.map(month_fn));

Export.table.toDrive({
  collection: out_fc,
  selectors: ['month'],
  folder: 'GEE_Downloads',
  description:'prism_no_loop',
});

