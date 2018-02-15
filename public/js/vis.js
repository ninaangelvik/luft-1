// // Create new map that we can add data points to. 
function newMap(id, coordinates) {
  var data = [{
          type: 'scattermapbox',
      }];
      layout = {
        dragmode: 'zoom',
        mapbox: {
          center: {
            lat: coordinates[0],
            lon: coordinates[1]
          },
          domain: {
            x: [0, 1],
            y: [0, 1]
          },
          style: 'dark',
          zoom: 10
        },
        margin: {
          r: 0,
          t: 0,
          b: 0,
          l: 0,
          pad: 0
        },
        showlegend: false
     };

    Plotly.setPlotConfig({
      mapboxAccessToken: 'pk.eyJ1IjoiZmp1a3N0YWQiLCJhIjoiY2l2Mnh3azRvMDBrYTJ5bnYxcDAzZ3Z0biJ9.RHb5ENfbmzN65gjiB-L_wg'
    })

    Plotly.newPlot(id, data, layout);
}

function addToMap(map, area, customGPS, provider, component, datestring, coordinates) {
    var areaUri = encodeURIComponent(area);
    var url = ""
    var size = 0;

    if (provider == "nilu") {
      url = getHistoricalUrl(area, datestring, component)
      size = 10
    } else {
      url = getStudentUrl(area, customGPS, datestring)
      size = 3
    }
   
    Plotly.d3.csv(url, function(err, rows){
      if ( rows.length == 0 ) {
        return; 
      }
      function unpack(rows, key) {
          return rows.map(function(row) { return row[key]; });
      }
      console.log(rows)

      scl = [[10, 'rgb(150,0,90)'],[2.5, 'rgb(0, 0, 200)']];

      var dataPmTen = {
          type: 'scattermapbox',
          mode: 'markers',
          text: unpack(rows, 'pmTen'),
          lon: unpack(rows, 'longitude'),
          lat: unpack(rows, 'latitude'),
          marker: {
            color: 'rgb(150,0,90)',
            cmin: 0,
            cmax: 1.4,
            reversescale: true,
            opacity: 0.5,
            size: size,
          },
          name: 'PM10'
      }

      var dataPmTwoFive = {
          type: 'scattermapbox',
          mode: 'markers',
          text: unpack(rows, 'pmTwoFive'),
          lon: unpack(rows, 'longitude'),
          lat: unpack(rows, 'latitude'),
          marker: {
            color: 'rgb(0, 0, 200)',
            cmin: 0,
            cmax: 1.4,
            reversescale: true,
            opacity: 0.5,
            size: size,
          },
          name: 'PM2.5'
      }

      data = [dataPmTen, dataPmTwoFive]

      layout = {
        dragmode: 'zoom',
        mapbox: {
          center: {
            lat: coordinates[0],
            lon: coordinates[1]
          },
          domain: {
            x: [0, 1],
            y: [0, 1]
          },
          style: 'dark',
          zoom: 10
        },
        margin: {
          r: 0,
          t: 0,
          b: 0,
          l: 0,
          pad: 0
        },
        showlegend: true
     };

    Plotly.plot('mapid', data, layout);
  });
}

function barChartStudent(area, customGPS, datestring) {
  var dates = datestring.split("&")

  var start = moment(dates[0].split("=")[1])
  var end = moment(dates[1].split("=")[1])

  var duration = moment.duration(end.diff(start))
  var timespan = duration.asHours()
  
  var url = getStudentUrl(area, customGPS, datestring)
  Plotly.d3.csv(url, function(err, rows){
    if ( rows.length == 0 ) {
      document.getElementById("chart-dust").innerHTML = "Ingen data tilgjengelig";
      return; 
    }
    
    var groupedBy = rows.groupByTime('timestamp', timespan)
    var averagePmTen = calculateAvg(groupedBy, "pmTen")
    var averagePmTwoFive = calculateAvg(groupedBy, "pmTwoFive")
    var averageTemperature = calculateAvg(groupedBy, "temperature")
    var averageHumidity = calculateAvg(groupedBy, "humidity")

    function unpack(rows) {
      return Object.keys(rows).map(function(key){ return rows[key][0]; });
    }
  
    var pm10 = {
      type: "scatter",
      mode: "lines+markers",
      name: 'PM10',
      x: Object.keys(averagePmTen),
      y: unpack(averagePmTen),
      line: {color: '#17BECF'}
    }


    var pm25 = {
      type: "scatter",
      mode: "lines+markers",
      name: 'PM2.5',
      x: Object.keys(averagePmTwoFive),
      y: unpack(averagePmTwoFive),
      line: {color: '#7F7F7F'}
    }

    var dataDust = [pm10,pm25];
    var layoutDust = {
      title: 'Støvkonsentrasjon',
      height: 500,
      width: 600,
      yaxis: {title: '\u03BC'+"g/m3"},      
    };

    Plotly.newPlot('chart-dust', dataDust, layoutDust);

    var temperature = {
      type: "scatter",
      mode: "lines+markers",
      name: "Temperatur",
      x: Object.keys(averageTemperature),
      y: unpack(averageTemperature),
      line: {color: '#17BECF'}
    }

    var dataTemperature = [temperature];
    var layoutTemperature = {
      title: 'Temperatur',
      height: 500,
      width: 600,
      yaxis: {title: "Celcius"},
    };

    Plotly.newPlot('chart-temperature', dataTemperature, layoutTemperature);

    var humidity = {
      type: "scatter",
      mode: "lines+markers",
      name: "Luftfuktighet",
      x: Object.keys(averageHumidity),
      y: unpack(averageHumidity),
      line: {color: '#17BECF'}
    }

    var dataHumidity = [humidity];
    var layoutHumidity = {
      title: 'Luftfuktighet',
      height: 500,
      width: 600,
      yaxis: {title: "%"},      
    };

    Plotly.newPlot('chart-humidity', dataHumidity, layoutHumidity);
  })
}

function barChartNilu(area, component, datestring) {
  layoutColors = ['#17BECF', '#7F7F7F']

  var url = getHistoricalUrl(area, datestring, component)

  Plotly.d3.csv(url, function(err, rows){
    function unpack(rows, key) {
      return rows.map(function(row){ return row[key]; });
    }

    var stations = rows.groupBy("station")
    var keys = Object.keys(stations)

    var data = []
    for ( i = 0; i < keys.length; i++ ) {
      var trace = {
        type: "scatter",
        mode: "lines+markers",
        name: keys[i],
        x: unpack(stations[keys[i]], "to"),
        y: unpack(stations[keys[i]], "value"),
        line: {color: layoutColors[i]}
      }

      data.push(trace);
    };
    console.log(data)
       
    var layout = {
      title: component,
      height: 500,
      width: 600,
      yaxis: {title: '\u03BC'+"g/m3"},      
    };

    Plotly.newPlot('chart-'+ component, data, layout);

  })
   
}


function getHistoricalUrl(area, datestring, component) {
    area = encodeURIComponent(area);
    return "/historical?area=" + area + "&" + datestring + "&component=" + component
}

function getStudentUrl(area, customGPS, datestring, component) {
    area = encodeURIComponent(area);
    if (customGPS == true) {
        return "/student?within=" + area + "&" + datestring
    } else {
        return "/student?area=" + area + "&" + datestring
    }
}

Array.prototype.groupByTime = function(prop, timespan) {
    return this.reduce(function(groups, item) {
      var val;
      if (timespan <= 1) {val = item[prop].slice[0,16]}
      if (timespan <= 24) { val = item[prop].slice(0,13)}
      else if (timespan <= 744) { val = item[prop].slice(0,10) }
      else { val = item[prop].slice(0,7)}

      groups[val] = groups[val] || []
      groups[val].push(item)
      return groups
    }, {})
}

Array.prototype.groupBy = function(prop) {
    return this.reduce(function(groups, item) {
      var val = item[prop]; 
      groups[val] = groups[val] || []
      groups[val].push(item)
      return groups
    }, {})
}

function calculateAvg(groups, key) {
  var newGroups = {}
  for (var index in groups) {
    newGroups[index] = newGroups[index] || []
    newGroups[index].push(getAvg(groups[index].map(function(row) {return row[key]})))
  }
  return newGroups
}

function getAvg(values) {
  return String(values.reduce(function (p, c) {
    return Number(p) + Number(c);
  }) / values.length);
}

function clearVis(element, map) {
    $(element).html("")
    if (map != undefined) {
        map.remove();
    }
}

$(document).ready(function () {
    // Apply bootstrap style classes to markdown tags
    var markdownTags = $("div.markdown");

    // Tables need to have the table class in bootstrap
    $("table", markdownTags)
        .addClass("table")
        .addClass("table-responsive")
        .addClass("table-sm")
        .addClass("table-striped")
        .addClass("table-bordered");

    // Blockquote tags need to have the blockquote class in bootstrap
    $("blockquote", markdownTags)
        .addClass("blockquote");

    $(".wiki-helplink")
        .addClass("pull-right")
        .addClass("btn")
        .addClass("btn-link");
});