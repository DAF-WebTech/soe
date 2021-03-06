if (typeof csv == "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';
}

var results = Papa.parse(
	csv,
	{
		skipEmptyLines: true,
		dynamicTyping: true
	}
);


var headData = results.data[0];
var data = results.data.slice(1);

//////////////////////////////////////////////////////////////////

var head = ["Protected Areas"];
for (var i = 2; i < headData.length; i +=3) {
	var year = headData[i].split(" ")[0];
	head.push(year);
}
var table = [head];
data.forEach(function(record) {
	if (record[0] == "All")
		return;

	var row = [record[0]];
	for (var i = 2; i < record.length; i +=3) {
		row.push(record[i]);
	}
	table.push(row);
});

// convert to html
var htmlTable = tableToHtml(table.transpose(), false);
var heading = "Cumulated number of each protected area";
print(String.format(regionInfoTemplate, "queensland", heading, 0, htmlTable.thead, htmlTable.tbody, 
	null, null, null, "<p class=table-note>Data as at 30 June for years 2018–2020; previous years are based on calendar."));

var chartData = [];
var chartTable = table.transpose();
for (var i = 0; i < chartTable[0].length; ++i) {
	chartTable[0][i] = {label: chartTable[0][i], type: i == 0 ? "string" : "number"};	
};

var options = getDefaultColumnChartOptions();	
options.vAxis.title = "Number of protected areas";
options.colors = thirteenChartColors;
options.isStacked = true;


chartData.push({type: "column", options: options, data: chartTable});

//////////////////////////////////////////////////////////////////
head[0] = "Year";
table = [head];
data.forEach(function(record) {
	if (record[0] != "All")
		return;

	var row = [record[1]];
	for (var i = 3; i < record.length; i +=3) {
		row.push(record[i]);
	}
	table.push(row);
});
// convert to html
htmlTable = tableToHtml(table.transpose(), false);
heading = "Cumulated extent of all protected areas";
print(String.format(regionInfoTemplate, "queensland", heading, 1, htmlTable.thead, htmlTable.tbody,
	null, null, null, "<p class=table-note>Data as at 30 June for years 2018–2020; previous years are based on calendar."));


chartTable = table.transpose();
options.vAxis.title = "Hectares";
options.vAxis.format = "short"; 

chartData.push({type: "column", options: options, data: chartTable});

//////////////////////////////////////////////////////////////////////////

print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>");
