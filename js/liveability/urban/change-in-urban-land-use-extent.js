function getCheckBoxLabel(region) {

	switch (region) {
		case "SEQ NRM region":
			return "South East Queensland NRM region"
			
		case "NQ Dry Tropics NRM region":
			return "North Queensland Dry Tropics NRM region"

		default:
			return region
	}

}


if (typeof csv == "undefined")
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';

var results = Papa.parse(
	csv,
	{
		skipEmptyLines: true,
		dynamicTyping: true
	}
);

var dataHead = results.data.shift();
var data = results.data;

var totalQueenslandUrbanArea = data[2][13];
var currentYear = "2017"

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
var arrayTable = [["", "1999", currentYear]];
arrayTable.push(["Hectares", data[1][13], totalQueenslandUrbanArea]);

var heading = String.format("Urban area growth between 1999 and {0}*", currentYear);
var index = 0;
var region = "queensland";

var htmlTable = tableToHtml(arrayTable, false)
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody, null, null, null, 
	"<p class=table-note>*" + currentYear + " data is composed of regional data sourced at different times</p>"));

arrayTable[0][0] = "Year";
chart1 = arrayTable.transpose();
var columnChartOptions = getDefaultColumnChartOptions(1);
columnChartOptions.vAxis.format = "short";
columnChartOptions.vAxis.minValue = 0;
columnChartOptions.vAxis.title = "Hectares";
chartData = [{ type: "column", options: columnChartOptions, data: chart1 }];



//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// chart 2, queensland pie chart

var totalQueenslandArea = data[0][13];
var queenslandNonUrbanArea = totalQueenslandArea - totalQueenslandUrbanArea;

var arrayTable = [["", "Urban", "Non-Urban"]];
arrayTable.push(["Hectares", totalQueenslandUrbanArea, queenslandNonUrbanArea]);

var heading = String.format("Proportion of urban and non-urban areas as at {0}*", currentYear)

var htmlTable = tableToHtml(arrayTable, false)
var nb = String.format("<p class=table-note>*{0} data is composed of regional data sourced at different times</p>", currentYear)
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody, null, null, null, nb));

arrayTable[0][0] = "Year";
var chart2 = arrayTable.transpose();

var pieChartOptions = getDefaultPieChartOptions(2);
chartData.push({ type: "pie", options: pieChartOptions, data: chart2 });

//////////////////////////////////////////////////////////////////////

print("<div class=\"region-info region-queensland checkbox-panel\">\n");
print("<h3>Urban area growth by region</h3>\n");

var regions = dataHead.slice(1, dataHead.length - 1);
print("<ul id=regionCheckboxes>\n");
regions.forEach(function (r, i) {
	print(String.format("<li><input type=checkbox value=\"{0}\" id=checkbox_{0} {2} onchange=\"showHideChart(this)\" /><label for=checkbox_{0}>{1}</label>\n", r.toKebabCase(), getCheckBoxLabel(r), i == 0 ? "checked" : ""));
});
print("</ul></div>\n");

regions.forEach(function (region, i) {

	arrayTable = [["", "1999", data[3][i + 1]]];
	arrayTable.push(["Hectares", data[1][i + 1], data[2][i + 1]]);

	heading = String.format("Urban area growth between 1999 and {0} in {1}", data[3][i + 1], region);

	htmlTable = tableToHtml(arrayTable, false);

	// this chart is shown both for the checkbox selection queensland, and on each map region
	// once for queensland, and a subregion class for checkbox click
	print(String.format(regionInfoTemplate, "queensland", heading, index++, htmlTable.thead, htmlTable.tbody, null, "subregion-" + region.toKebabCase()));

	arrayTable[0][0] = "Year";
	arrayTable[0][2] = data[3][i + 1];
	var myChart = arrayTable.transpose();
	columnChartOptions = getDefaultColumnChartOptions(1);
	columnChartOptions.vAxis.minValue = 0;
	columnChartOptions.vAxis.format = "short";
	columnChartOptions.vAxis.title = "Hectares";
	columnChartOptions.hAxis.title = "Year";
		chartData.push({ type: "column", options: columnChartOptions, data: myChart });

	// second time for map region click
	print(String.format(regionInfoTemplate, region.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody, null));
	chartData.push({ type: "column", options: columnChartOptions, data: myChart });

	// two pie charts for each map region.

	// 1. Showing proportion of region area covered by Urban. 
	// Made up of two parts, first, Region Non Urban Area (Region area minus urban area) and second, Region Urban area.

	heading = String.format("Proportion of {0} made up of urban and non-urban areas in {1}", region, data[3][i + 1]);
	

	var regionUrbanArea = data[2][i + 1];
	var regionNonUrbanArea = data[0][i + 1] - regionUrbanArea;
	var arrayTable = [["", "Urban", "Non-Urban"]];
	arrayTable.push(["Hectares", regionUrbanArea, regionNonUrbanArea]);
	var htmlTable = tableToHtml(arrayTable, false)
	print(String.format(regionInfoTemplate, region.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody));
	
	arrayTable[0][0] = "Year";
	var pieChart = arrayTable.transpose();
	
	var pieChartOptions = getDefaultPieChartOptions(2);
	chartData.push({ type: "pie", options: pieChartOptions, data: pieChart });
		
	// 2. Showing proportion of region area covered by Urban. 
	// Made up of two parts, first, Queensland Non Urban Area (Queensland area minus region urban area) and second, Region Urban area.
	heading = String.format("Proportion of Queensland made up of urban area in {0} in {1}", region, data[3][i + 1]);
	var qldIndex = data[0].length - 1;
	var queenslandArea = data[0][qldIndex];
	var queenslandNonUrbanArea = queenslandArea - regionUrbanArea;
	
	arrayTable = [["", "Queensland urban", region + " urban"]];
	arrayTable.push(["Hectares", queenslandArea, regionUrbanArea]);
	htmlTable = tableToHtml(arrayTable, false)
	print(String.format(regionInfoTemplate, region.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody));
	
	arrayTable[0][0] = "Year";
	pieChart = arrayTable.transpose();
	
	chartData.push({ type: "pie", options: pieChartOptions, data: pieChart });
	



});



print("<script id=chartdata type=application/json>" + JSON.stringify(chartData) + "</" + "script>");
