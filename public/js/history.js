var areas = {
    "Tromsø"      : [69.680, 18.95],
    "Bodø"        : [67.28, 14.405],
    "Narvik"      : [68.438, 17.427],
    "Alta"        : [69.971, 23.303],
    "Nord-Troms"  : [69.929, 20.999],
    "Harstad"     : [68.798, 16.541],
    "Lakselv"     : [70.051, 24.971],
    "Mo i Rana"   : [66.313, 14.142]
};

function toggleGPSInput(checkbox) {
  if (checkbox.checked){
    $('#gps-input').css('margin-top', '10px');
    $('#gps-input').css('display', 'flex');
    document.getElementById("area").disabled = true;
    $('#checkbox-nilu').attr('disabled', true);
  	$('#checkbox-nilu').attr('checked', false);
    $('#nilu-label').css('color', '#bfbfbf');
  } else {
    $('#gps-input').hide();
    $('#nilu-label').css('color', 'black');
    document.getElementById("area").disabled = false;
  	$('#checkbox-nilu').attr('disabled', false);
  }
}

function clearCharts() {
  $("#nilu-data").hide()
  $("#nilu-title").hide()
  $("#student-data").hide()
  $("#student-title").hide()
}

function getCoordinates() {
  var areaObject = document.getElementById('area');
  if (areaObject.disabled == true) {
    var latitude = document.getElementById('latitude').value;
    var longitude = document.getElementById('longitude').value;
    coordinates = [latitude, longitude]
    radius = document.getElementById('radius').value;
  } 
  else {
    area = areaObject.value
    coordinates = areas[area]
  }
}

function drawMap() {
  return newMap(mapid, coordinates);
}

function createDatestring() {
  var now = new Date()
  var to = now  ;
  var from = new Date();
  var selectedTime = $('input[name=time]:checked').val()
  switch(selectedTime) {
    case "hour":
      from.setHours(now.getHours()-1);
      break;
    case "24hour":
      from.setDate(now.getDate()-1);
      break;
    case "week":
      from.setDate(now.getDate()-7);
      break;
    case "month":
      from.setMonth(now.getMonth()-1);
      break;
    case "custom":
      from = new Date($('#from').val())
      to = new Date($('#to').val())
      break;
  }

  return "from=" + from.toJSON() + "&to=" + to.toJSON()
}