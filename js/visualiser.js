let backgroundDesktop;
let backgroundTablet;
let backgroundMobile;

// let generationDataSources = [];

// function createGenerationLoops(generationDataSources) {

// }

function CurrentGeneration(generationValues) {
    this.value;
    this.timeIndex = 0;
    this.display = function () {
        this.value = generationValues[this.timeIndex];
        console.log(this.value);
        if (this.timeIndex < generationValues.length - 1) {
            this.timeIndex++;
            console.log(this.timeIndex);
        } else {
            this.timeIndex = 0;
            console.log(this.timeIndex);
        }
    }
}

let coalCurrentGeneration = new CurrentGeneration(coalGeneration);
let windCurrentGeneration = new CurrentGeneration(windGeneration);
let gasCurrentGeneration = new CurrentGeneration(gasGeneration);
let hydroCurrentGeneration = new CurrentGeneration(hydroGeneration);
let solarCurrentGeneration = new CurrentGeneration(solarGeneration);
let batteryCurrentGeneration = new CurrentGeneration(batteryGeneration);
let totalCurrentGeneration = new CurrentGeneration(totalGeneration);
let maxGeneration = totalGeneration.reduce(function (a, b) {
    return Math.max(a, b);
});

let coalGenerationLoop = new Tone.Loop((time) => {
    coalCurrentGeneration.display();
}, "4n").start(0);

let windGenerationLoop = new Tone.Loop((time) => {
    windCurrentGeneration.display();
}, "4n").start(0);

let gasGenerationLoop = new Tone.Loop((time) => {
    gasCurrentGeneration.display();
}, "4n").start(0);

let hydroGenerationLoop = new Tone.Loop((time) => {
    hydroCurrentGeneration.display();
}, "4n").start(0);

let solarGenerationLoop = new Tone.Loop((time) => {
    solarCurrentGeneration.display();
}, "4n").start(0);

let batteryGenerationLoop = new Tone.Loop((time) => {
    batteryCurrentGeneration.display();
}, "4n").start(0);

let totalGenerationLoop = new Tone.Loop((time) => {
    totalCurrentGeneration.display();
}, "4n").start(0);


function drawVisual(generationHistory, currentGeneration) {
    let generation = currentGeneration.value;
    generationHistory.push(generation);

    beginShape();
    for (var i = 0; i < 360; i++) {
        let r = map(generationHistory[i], 0, maxGeneration, 200, 400);
        let x = r * cos(i);
        let y = r * sin(i);

        vertex(x, y);
    }

    endShape();

    if (generationHistory.length > 360) {
        generationHistory.splice(0, 1);
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

let coalGenerationHistory = [];
let windGenerationHistory = [];
let gasGenerationHistory = [];
let hydroGenerationHistory = [];
let solarGenerationHistory = [];
let batteryGenerationHistory = [];
let totalGenerationHistory = [];

function draw() {

    setBackground();
    stroke('rgba(255,255,255, 0.5)');
    fill('rgba(255,255,255, 0.1)');
    // noFill();
    strokeJoin(ROUND);
    // strokeWeight(2);
    translate(width / 2, height / 2);

    drawVisual(coalGenerationHistory, coalCurrentGeneration);
    drawVisual(windGenerationHistory, windCurrentGeneration);
    drawVisual(gasGenerationHistory, gasCurrentGeneration);
    drawVisual(hydroGenerationHistory, hydroCurrentGeneration);
    drawVisual(solarGenerationHistory, solarCurrentGeneration);
    drawVisual(batteryGenerationHistory, batteryCurrentGeneration);
    drawVisual(totalGenerationHistory, totalCurrentGeneration);

    erase();
    ellipse(0, 0, 402);
    noErase();

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


// let coalVolumeHistory = [];
// let windVolumeHistory = [];
// let gasVolumeHistory = [];
// let hydroVolumeHistory = [];
// let solarVolumeHistory = [];
// let batteryVolumeHistory = [];

// function drawVisual(instrument, volumeHistory) {
//     // let volume = instrument.getLevelAtTime(Tone.now());
//     let volume = instrument.volume.value;
//     volumeHistory.push(volume);
//     // let generation;
//     // generationHistory.push(generation);
//     beginShape();
//     for (var i = 0; i < 360; i++) {
//         let r = map(volumeHistory[i], -30, -9, 200, 350);
//         let x = r * cos(i);
//         let y = r * sin(i);

//         vertex(x, y);
//     }

//     endShape();

//     if (volumeHistory.length > 360) {
//         volumeHistory.splice(0, 1);
//     }
// }

// drawVisual(coal, coalVolumeHistory);
// drawVisual(wind, windVolumeHistory);
// drawVisual(gas, gasVolumeHistory);
// // drawVisual(hydro, hydroVolumeHistory);
// drawVisual(solar, solarVolumeHistory);
// drawVisual(battery, batteryVolumeHistory);