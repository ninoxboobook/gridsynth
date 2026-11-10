function CurrentGeneration(generationValues) {
    this.value;
    this.timeIndex = 0;
    this.history = [];
    this.display = function () {
        this.value = generationValues[this.timeIndex];
        if (this.timeIndex < generationValues.length - 1) {
            this.timeIndex++;
        } else {
            this.timeIndex = 0;
        }
    }
}

// One CurrentGeneration for each generation source, plus one for total generation.
// These are replaced whenever a new dataset is loaded.

let currentGenerations = [];
let maxGeneration = 1;

function setVisualiserData(generationSources, totalGeneration) {
    currentGenerations = generationSources.concat([totalGeneration]).map((generationValues) => {
        return new CurrentGeneration(generationValues);
    });
    maxGeneration = totalGeneration.reduce(function (a, b) {
        return Math.max(a, b);
    });
}

let displayLoop = new Tone.Loop((time) => {
    currentGenerations.forEach((currentGeneration) => {
        currentGeneration.display();
    });
}, "4n").start(0);

function drawVisual(currentGeneration) {
    let generationHistory = currentGeneration.history;

    generationHistory.push(currentGeneration.value);

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

function draw() {
    clear();
    stroke('rgba(255,255,255, 0.5)');
    fill('rgba(255,255,255, 0.1)');
    strokeJoin(ROUND);
    translate(width / 2, height / 2);

    currentGenerations.forEach((currentGeneration) => {
        drawVisual(currentGeneration);
    });

    erase();
    ellipse(0, 0, 402);
    noErase();

}

function windowResized() {
    resizeCanvas(document.documentElement.clientWidth, document.documentElement.clientHeight);
}
