function CurrentGeneration(generationValues) {
    this.value;
    this.timeIndex = 0;
    this.display = function () {
        this.value = generationValues[this.timeIndex];
        if (this.timeIndex < generationValues.length - 1) {
            this.timeIndex++;
        } else {
            this.timeIndex = 0;
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

let displayLoop = new Tone.Loop((time) => {
    console.log(coalCurrentGeneration.timeIndex);
    coalCurrentGeneration.display();
    windCurrentGeneration.display();
    gasCurrentGeneration.display();
    hydroCurrentGeneration.display();
    solarCurrentGeneration.display();
    batteryCurrentGeneration.display();
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

function setup() {
    var canvas = createCanvas(document.documentElement.clientWidth, document.documentElement.clientHeight);
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
    clear();
    stroke('rgba(255,255,255, 0.5)');
    fill('rgba(255,255,255, 0.1)');
    strokeJoin(ROUND);
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
    resizeCanvas(document.documentElement.clientWidth, document.documentElement.clientHeight);
}
