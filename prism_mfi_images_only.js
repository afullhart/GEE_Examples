//Modified Fournier Index
//The js code editor will show a visualization. 
//No image is exported/no task unless export function is uncommented

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
  return mean_im;
}

var month_ic = ee.ImageCollection(month_list.map(month_fn));
var annual_im = month_ic.sum();

function squared_fn(mo_im){
  var sqr_im = mo_im.multiply(mo_im);
  return sqr_im;  
}

var sqr_ic = month_ic.map(squared_fn);
var sqrsum_im = sqr_ic.sum();
var mfi_im = sqrsum_im.divide(annual_im);
Map.addLayer(mfi_im, null, 'mfi');

//Export.image.toDrive({
//  image:mfi_im, 
//  description:'prism_mfi',
//  folder:'GEE_Downloads',
//  scale:2000,
//  maxPixels:1e9
//});


