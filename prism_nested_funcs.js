//Downloads long-term monthly prism precipitation for locations in point_fc
//The nested functions allow multiple sets of iterators, like with nested for loops
//The first output table is not organized in a readable way. Second table is.

var point_fc = ee.FeatureCollection('projects/ee-andrewfullhart/assets/station_points');
var prism_ic = ee.ImageCollection('OREGONSTATE/PRISM/AN81m');

var start_year = 1990;
var end_year = 2019;
var start = ee.Date.fromYMD(start_year, 1, 1);
var end = ee.Date.fromYMD(end_year+1, 1, 1);
var prism_ic = prism_ic.filterDate(start, end);

var month_list = ee.List([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

function month_fn(mo){
  var mo_str = ee.String(mo);
  var month_ic = prism_ic.filter(ee.Filter.calendarRange(mo, mo, 'month'));
  var mean_im = month_ic.select('ppt').reduce(ee.Reducer.mean());
  var sample_fc = mean_im.sampleRegions(point_fc);
  function point_fn(pt_ft){
    return ee.Feature(null, {'stationID':pt_ft.get('stationID'), 'month':mo, 'accm':pt_ft.get('ppt_mean')});
  }
  return ee.FeatureCollection(sample_fc.map(point_fn));
}

var month_fc = ee.FeatureCollection(month_list.map(month_fn)).flatten();

Export.table.toDrive({
  collection: month_fc,
  selectors: ['stationID', 'month', 'accm'],
  folder: 'GEE_Downloads',
  description:'prism_nested_funcs_disorganized',
});

function organize_fn(pt_ft){
  var pt_fc = month_fc.filter(ee.Filter.eq('stationID', pt_ft.get('stationID')));
  var mo_list = pt_fc.reduceColumns(ee.Reducer.toList(), ['month']).get('list');
  var mo_str_list = ee.List(mo_list).map(function(mo){return ee.String(mo);});
  var accm_list = pt_fc.reduceColumns(ee.Reducer.toList(), ['accm']).get('list');
  var prop_dict = ee.Dictionary.fromLists(mo_str_list, accm_list);
  var prop_dict = prop_dict.set('stationID', pt_ft.get('stationID'));
  return ee.Feature(null, prop_dict);
}

var out_fc = ee.FeatureCollection(point_fc.map(organize_fn));

Export.table.toDrive({
  collection: out_fc,
  selectors: ['stationID', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  folder: 'GEE_Downloads',
  description:'prism_nested_funcs_organized',
});

