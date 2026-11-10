const scale = ['G', 'B', 'C', 'D', 'E'];
// ['G', 'B', 'D', 'F#', 'A'];
// ['F','A','C','Eb','G'];

const bassLineScale = ['C1', 'E1', 'F1', 'G1', 'A1', 'C2'];

const octaves = ['2', '3', '4'];

const noteLengths = ['1n', '2n', '4n'];

const loopLengths = ['1m', '2m', '3m', '4m'];

// Each five minute interval of data is one step (a quarter note) of the song

const stepsPerHour = 12; // Five minute intervals in an hour
const stepsPerBar = 3; // Steps covered by one note of the bass line

// Datasets
// Each dataset is one day of grid data for one region, stored as a JSON file in the data folder.
// data/index.json lists the datasets that are available. See scripts/fetch-data.js for how they are created.

const dataPath = 'data/';

async function getJson(file) {
    const response = await fetch(dataPath + file);
    if (!response.ok) {
        throw new Error('Could not load ' + dataPath + file + ' (' + response.status + ')');
    }
    return response.json();
}

async function getDatasetList() {
    return getJson('index.json');
}

async function getDataset(file) {
    return getJson(file);
}
