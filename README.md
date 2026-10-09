# Tape Loop Deck

A virtual tape loop player that runs entirely in the browser (Web Audio API).

- **Deck:** upload sounds and each becomes a tape loop. Loop the clip at its own length, or pad it with silence to a set tape length and drag the clip to where it should start. Varispeed, reverse, and spinning reels.
- **Mixer:** a performance console with one strip per tape: gain, 3-band EQ with sweepable mid, an effects bus (tape drive, echo, reverb), tape speed, balance, volume fader, mute and solo.
- **MIDI:** every major control is mappable. Each strip gets its own MIDI channel with a default CC layout, and MIDI learn remaps anything. Needs a browser with Web MIDI (Chrome, Edge, Opera).
- **Save & export:** projects save as a .json file with the audio included. Export the mix as WAV or MP3, or a MIDI file with one track per tape.
- Dark and light themes.

Nothing is uploaded; all audio stays in your browser.
