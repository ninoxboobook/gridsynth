# gridsynth

## What does the energy grid sound like?

Gridsynth is a proof of concept/art project inspired by the generative music of Brian Eno.

Gridsynth takes energy grid data from the [National Electricity Market](https://aemo.com.au/en/energy-systems/electricity/national-electricity-market-nem/data-nem) and turns it into a replayable song that also tells a story about energy demand and supply. That is, by listening to a gridsynth-generated song, we can also understand a little bit about what was going on with the electricity grid at a particular point in time.

[Listen to gridsynth](http://rihanari.es/gridsynth/) (best with headphones)

Gridsynth uses Tone.js and p5.js. 

You can find more information on how the song 'Victorian Energy Grid - June 11, 2021' was created down below.
## Building gridsynth
### Time
Each note you hear played by gridsynth corresponds to a five minute interval. For this proof of concept, the data source is 24 hours on the Victorian electricity grid (specifically, starting at midnight on June 11, 2021).
### Tempo
The tempo (speed) of the song is determined by the scheduled demand in MW. So, as energy demand on the grid increases, the song speeds up; as it decreases, the song slows down. This allows you to hear how energy demand ramps up to periods of peak demand throughout the day.
### Instruments
Each fuel/generation source is assigned its own unique instrument.

* Coal generation is represented by a sine-wave oscillator with a long attack, creating a note that sounds a little like a "whomp".
* Wind generation is represented by a sine-wave oscillator passed through a ping-pong delay, creating a note that has a cascading echo which introduces some interesting syncopation.
* Gas generation is represented by a frequency-modulated synth that is passed through a chorus, creating a note that is quite sharp and tinny.
* Hydro generation is represented by a sampler that plays a piano sample that is also passed through a chorus.
* Solar generation is represented by a sampler that plays a cello sample.
* Battery generation is represented by a sampler that plays a French horn sample.
### Volume
The volume of each instrument is determined by the proportion of total scheduled and semi-scheduled demand that a generation source represents at a given time.

For instance, if coal generation represents 50% of the total scheduled and semi-scheduled demand at 11:15AM, the volume in decibels of the 11:15AM note will be 50% of gridsynth's volume range in decibels (this is currently slightly inaccurate, since decibels are logarithmic and me no math good).

In this way, you can hear the fuel mix of the energy grid.
### Melody
The pitch of each note for each instrument is generated by an algorithm that takes the generation in MW of a specific generation source at a given time, adds some noise, and then converts the fourth decimal of the natural logarithm of that number into a pitch from a scale designated by me.

There's not a lot of rhyme or reason behind this algorithm other than it creates a nice sense of randomness while maintaining replicability (e.g. the same data set will generate the same song).

The octave of each note is determined by taking the generation in MW of a specific generation source at a given time and comparing it to the maximum generation in MW of that specific generation source. For instance, if hydro generation at 3:00PM is 80% of the highest hydro generation value, the octave assigned will be the equivalent of the fourth octave on an 88-key piano.

In this way, you can hear the peaks and troughs of generation of each generation source.

I have purposely offset the melody of each instrument by a 16th note, firstly to create a little more rhythmic interest, and secondly because as the song continues to loop, the melodies will gradually fall out of sync, creating new harmonies (see 'Music for Airports' by Brian Eno). It's not purely correct from a data representation point of view, but hey, that's art.
### Bass line
The bass line is generated by the spot price trend. It is represented by a sampler that plays a Tibetan singing bowl. If the spot price is trending up, the bass line plays a note higher than the note it previously played; if the spot price is trending down, the bass line plays a note lower than the note it previously played. It the spot price trend is level, it plays the same note.
### Visualiser
Finally, the gridsynth visualiser is painting a continuously updating graph of fuel mix (the inner circles) and total scheduled and semi-scheduled generation (the outermost circle). This information is already represented in the music; I just think it looks neat.
### The future
My hope is to be able to access some of NEMweb APIs, or at least introduce some more data sets so you can hear the difference between, say, a summer day in SA, or a spring day in NSW.

And if you've gotten this far in this wall of text, thank you for coming to my TED Talk.
