// Initialize led
function circle_status(id, value) {
  var circle_1 = document.getElementById(id);
  circle_1.classList.remove('red', 'grey');

  if (value == 1) {
      circle_1.classList.add('red');
  } else {
      circle_1.classList.add('grey');
  }
}

function doCircle(state, arrayDB) {
  var circle = null;
  if (state == 0) {
      var circles = document.querySelectorAll('[id^="ledC_"]');
      for (var i = 0; i < circles.length; i++) {
          circle_status(circles[i].id, 0);
      }
  } else {
      for (var i = 0; i < arrayDB.length; i++) {
          circle_status('ledC_' + (i + 1), arrayDB[i]);
      }
  }
}
doCircle(0);

// Create Temp Gauge
var gaugetempin = new RadialGauge({
  renderTo: 'gauge-temperaturein',
  width: 350,
  height: 350,
  minValue: 0,
  maxValue: 40,
  units: "Temperature Interieur (C)",
  vertical: true,
  colorValueBoxRect: "#D3D3D3",
  colorValueBoxRectEnd: "#81aafc",
  colorValueBoxBackground: "#F5F5F5",
  colorTitle: "#0a0a0a",
  colorUnits: "#0a0a0a",
  colorNumbers: "#0a0a0a",
  valueInt: 2,
  highlights: [
      { "from": 0, "to": 20, "color": "#374eab" },
      { "from": 20, "to": 26, "color": "#778ce0" },
      { "from": 26, "to": 40, "color": "#ffc209" }
  ],
  majorTicks: ["0", "5", "10", "15", "20", "25", "30", "35", "40"],
  minorTicks: 8,
  minorTicks: 8,
  strokeTicks: true,
  colorPlate: "#fff",
  colorNeedle: "#1632a1",
  colorNeedleEnd: "#5575f2",
  needleWidth: 3,
  needleCircleSize: 10,
  animationDuration: 1500,
  animationRule: "linear"
}).draw();

//create Gauge temp out
var gaugetempout = new RadialGauge({
  renderTo: 'gauge-temperatureout',
  width: 350,
  height: 350,
  minValue: 0,
  maxValue: 50,
  units: "Temperature Exterieur (C)",
  vertical: true,
  colorValueBoxRect: "#D3D3D3",
  colorValueBoxRectEnd: "#81aafc",
  colorValueBoxBackground: "#F5F5F5",
  colorTitle: "#0a0a0a",
  colorUnits: "#0a0a0a",
  colorNumbers: "#0a0a0a",
  valueInt: 2,
  highlights: [
    { "from": 0, "to": 17, "color": "#374eab" },
    { "from": 17, "to": 30, "color": "#778ce0" },
    { "from": 30, "to": 50, "color": "#ffc209" }
],
  majorTicks: ["0", "5", "10", "15", "20", "25", "30", "35", "40", "45", "50"],
  minorTicks: 8,
  minorTicks: 8,
  strokeTicks: true,
  colorPlate: "#fff",
  colorNeedle: "#1632a1",
  colorNeedleEnd: "#5575f2",
  needleWidth: 3,
  needleCircleSize: 10,
  animationDuration: 1500,
  animationRule: "linear"
}).draw();

// create Gauge Tension
var gaugetens = new RadialGauge({
  renderTo: 'gauge-tension',
  width: 350,
  height: 350,
  units: "Tension (V)",
  minValue: 0,
  maxValue: 80,
  colorValueBoxRect: "#D3D3D3",
  colorValueBoxRectEnd: "#81aafc",
  colorValueBoxBackground: "#f4f4f4",
  valueInt: 2,
  colorTitle: "#0a0a0a",
  colorUnits: "#0a0a0a",
  colorNumbers: "#0a0a0a",
  highlights: [
    { "from": 0, "to": 30, "color": "#374eab" },
    { "from": 30, "to": 60, "color": "#778ce0" },
    { "from": 60, "to": 80, "color": "#ffc209" }
],
  majorTicks: ["0", "10", "20", "30", "40", "50", "60", "70", "80"],
  minorTicks: 8,
  strokeTicks: true,
  colorPlate: "#fff",
  colorNeedle: "#1632a1",
  colorNeedleEnd: "#5575f2",
  needleWidth: 3,
  needleCircleSize: 10,
  animationDuration: 1500,
  animationRule: "linear"
}).draw();

// Function to get current readings on the webpage when it loads for the first time
function getReadings() {
  fetch("http://192.168.171.147/data")
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
          var myObj = JSON.parse(this.responseText);
          console.log(myObj);
          var tempin = myObj.temperatureinter;
          var tempout = myObj.temperatureexterne;
          var tens = myObj.tension;
          gaugetempin.value = tempin;
          gaugetempout.value = tempout;
          gaugetens.value = tens;

          var db_1 = myObj.defFC;
          var db_2 = myObj.defClims;
          var db_3 = myObj.defSteg;
          var db_4 = myObj.defRed;
          const arrayDB = [db_1, db_2, db_3, db_4];

          doCircle(1, arrayDB);

          // Récupération des états (ajoute ces variables dans ton JSON côté serveur)
          var state_1 = myObj.etatFC;
          var state_2 = myObj.etatC1;
          var state_3 = myObj.etatC2;
          var state_4 = myObj.etatC3;
          const arrayState = [state_1, state_2, state_3, state_4];

          // Mettre à jour les LEDs d'état
          updateLedState(tempin, tempout);
          updateLed(tempin, tens);

      }
  };
  xhr.open("GET", "/readings", true);
  xhr.send();
}

if (!!window.EventSource) {
  var source = new EventSource('/events');

  source.addEventListener('open', function (e) {
      console.log("Events Connected");
  }, false);

  source.addEventListener('error', function (e) {
      if (e.target.readyState != EventSource.OPEN) {
          console.log("Events Disconnected");
      }
  }, false);

  source.addEventListener('message', function (e) {
      console.log("message", e.data);
  }, false);

  source.addEventListener('new_readings', function (e) {
      console.log("new_readings", e.data);
      var myObj = JSON.parse(e.data);
      console.log(myObj);
      gaugetempin.value = myObj.temperatureinter;
      gaugetempout.value = myObj.temperatureexterne;
      gaugetens.value = myObj.tension;

      var db_1 = myObj.defFC;
      var db_2 = myObj.defClims;
      var db_3 = myObj.defSteg;
      var db_4 = myObj.defRed;
      const arrayDB = [db_1, db_2, db_3, db_4];

      doCircle(1, arrayDB);

      // Les états des LEDs que tu souhaites contrôler
      var state_1 = myObj.etatFC;
      var state_2 = myObj.etatC1;
      var state_3 = myObj.etatC2;
      var state_4 = myObj.etatC3;
      const arrayState = [state_1, state_2, state_3, state_4];

      // Mettre à jour les LEDs d'état
      updateLedState(myObj.temperatureinter, myObj.temperatureexterne);
      updateLed(myObj.temperatureinter, myObj.tension);

  }, false);
}

// Function to reset Free Cooling
function resetEquip_FC() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/resetX", true);
  xhr.send();
}

// Function to reset Clims
function resetEquip_Clims() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/resetY", true);
  xhr.send();
}

// Function to reset Redresseur
function resetEquip_Red() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/resetZ", true);
  xhr.send();
}



function updateLed(tempin, tens) {
  var tempHighLed = document.getElementById("ledTempHigh");
  var tensionLowLed = document.getElementById("ledTensionLow");

  // Réinitialiser les couleurs
  tempHighLed.classList.remove('red', 'grey');
  tensionLowLed.classList.remove('red', 'grey');

  // Vérifier les conditions et appliquer la bonne classe
  if (tempin >= 26) {
      tempHighLed.classList.add('red');
  } else {
      tempHighLed.classList.add('grey');
  }

  if (tens <= 46) {
      tensionLowLed.classList.add('red');
  } else {
      tensionLowLed.classList.add('grey');
  }
}


function updateLedState(tempin, tempout) {
  // Réinitialisation des LEDs
  document.getElementById('ledState_1').classList.remove('green');
  document.getElementById('ledState_2').classList.remove('green');
  document.getElementById('ledState_3').classList.remove('green');
  document.getElementById('ledState_4').classList.remove('green');

  if (tempout <= 18) {
      document.getElementById('ledState_1').classList.add('green');
      document.getElementById('ledState_2').classList.add('green');
      document.getElementById('ledState_3').classList.add('grey');
      document.getElementById('ledState_4').classList.add('grey');
  }

  else if (tempin >= 18 && tempin < 22) {
      document.getElementById('ledState_2').classList.add('green');
      document.getElementById('ledState_1').classList.add('grey');
      document.getElementById('ledState_4').classList.add('grey');
      document.getElementById('ledState_3').classList.add('grey');
  }
   
  else if (tempin >= 22 && tempin < 24) {
      document.getElementById('ledState_1').classList.add('grey');
      document.getElementById('ledState_2').classList.add('green');
      document.getElementById('ledState_3').classList.add('green');
      document.getElementById('ledState_4').classList.add('grey');
     
  }

  else if (tempin >= 24 ) {
      document.getElementById('ledState_1').classList.add('grey');
      document.getElementById('ledState_2').classList.add('green');
      document.getElementById('ledState_3').classList.add('green');
      document.getElementById('ledState_4').classList.add('green');
  }
  else {
    document.getElementById('ledState_1').classList.add('grey');
    document.getElementById('ledState_2').classList.add('green');
    document.getElementById('ledState_3').classList.add('grey');
    document.getElementById('ledState_4').classList.add('grey');
}
}
// Appeler getReadings pour initialiser les valeurs
getReadings();
