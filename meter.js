// Maximum transmit power
function onInit() {
  NRF.setTxPower(4);
}

var counter = 0;
var lastpulse = Date.now();
var pulsetime = 0;

// energy variable will be actual kWh * 1000 in order for BTHome to parse to 3 decimal places
var energy = 0;

// power variable will be actual watts * 100 in order for BTHome to parse to 2 decimal places
var power = 0;

// change this to match your meter - e.g. 1000 imp / kWh
var imp = 1000;

// Update BLE advertising
function update()   {
	NRF.setAdvertising([
		[
		//BTHome header
		0x02,0x01,0x06,
		
		//Local Name = Puck
		0x05,0x09, 0x50,0x75,0x63,0x6B,
		
		
		0x0E,	//length (14)
		0x16,	//Service Data - 16-bit UUID
		
		//BTHome Data -->
		0xD2, 0xFC,	//UUID
		
		//BTHome Device Information
		0x40,
		
		//Battery payload
		0x01, Puck.getBatteryPercentage(),
		
		//Energy payload
		0x0A, energy,energy>>8,energy>>16,
		
		//Power payload
		0x0B, power,power>>8,power>>16,
		//BTHome Data <--
		]
	]); 
}

// Baseline 10s update
setInterval(function() {
  update();
}, 10000);

// Calculate live wattage
function rate() {
  pulsetime = Date.now() - lastpulse;
  power = (360000000000 / imp) / pulsetime;
  power = Number(power.toFixed(0));
  lastpulse = Date.now();
  energy = counter * (1000 / imp);
  energy = Number(energy.toFixed(0));
}

// Set up pin states
D1.write(0);
pinMode(D2,"input_pullup");

// Watch for pin changes
setWatch(function(e) {
 counter++;
 rate();
 //digitalPulse(LED1,1,1);
}, D2, { repeat:true, edge:"falling" });
