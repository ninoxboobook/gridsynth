let backgroundDesktop;
let backgroundTablet;
let backgroundMobile;


function drawVisual(instrument, volumeHistory) {
    let volume = instrument.getLevelAtTime(Tone.now());
    volumeHistory.push(volume);
    beginShape();
    for (var i = 0; i < 360; i++) {
        let r = map(volumeHistory[i], 0, 1, 200, 350);
        let x = r * cos(i);
        let y = r * sin(i);

        vertex(x, y);
    }

    endShape();

    if (volumeHistory.length > 360) {
        volumeHistory.splice(0, 1);
    }
}

function preload() {
    backgroundDesktop = loadImage('/assets/gridsynth-bg-desktop.png');
    backgroundTablet = loadImage('/assets/gridsynth-bg-tablet.png');
    backgroundMobile = loadImage('/assets/gridsynth-bg-mobile.png');
}

function setup() {
    var canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("p5-wrapper");
    angleMode(DEGREES);
    frameRate(30);
}

let coalVolumeHistory = [];
let windVolumeHistory = [];
let gasVolumeHistory = [];
let hydroVolumeHistory = [];
let solarVolumeHistory = [];
let batteryVolumeHistory = [];

function draw() {

    setBackground();
    stroke(255);
    noFill();
    strokeJoin(ROUND);
    strokeWeight(2);
    translate(width / 2, height / 2);
    
    drawVisual(coal, coalVolumeHistory);
    drawVisual(wind, windVolumeHistory);
    drawVisual(gas, gasVolumeHistory);
    // drawVisual(hydro, hydroVolumeHistory);
    drawVisual(solar, solarVolumeHistory);
    // drawVisual(battery, batteryVolumeHistory);

}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function setBackground() {
    if (windowWidth < 480) {
        background(backgroundMobile);
    } else if (windowWidth >= 480 && windowWidth < 768) {
        background(backgroundTablet);
    } else {
        background(backgroundDesktop);
    }
}