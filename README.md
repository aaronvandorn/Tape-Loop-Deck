# Tape Loop Deck

A virtual tape loop player that runs entirely in the browser (Web Audio API).

- **Deck:** upload sounds and each becomes a tape loop. Loop the clip at its own length, or pad it with silence to a set tape length and drag the clip to where it should start. Varispeed, reverse, and spinning reels.
- **Scenes:** built-in sets (Studio demo, Nature, Microhouse, Empty deck), all synthesized in the browser. Save your current set as a named scene and recall it later; saved scenes, audio included, are kept in your browser.
- **Mixer:** a performance console with one strip per tape: gain, 3-band EQ with sweepable mid, an effects bus (tape drive, echo, reverb), tape speed, balance, volume fader, mute and solo.
- **MIDI:** every major control is mappable. Each strip gets its own MIDI channel with a default CC layout, and MIDI learn remaps anything. Needs a browser with Web MIDI (Chrome, Edge, Opera).
- **Save & export:** projects save as a .json file with the audio included. Export the mix as WAV or MP3, or a MIDI file with one track per tape.
- Dark and light themes.

Nothing is uploaded; all audio stays in your browser.

## Discobot guest

Tape Loop Deck can be a unit in the rack of [Discobot](https://iw978599.github.io/discobot/), a browser sequencer and drum machine. In Discobot choose **Project → Add Guest Instrument** and paste `https://aaronvandorn.github.io/Tape-Loop-Deck/`. The unit should read **Connected**. Then:

- **Play All** starts every tape from the top on Discobot's first beat, and **Stop All** stops them. The deck's own play button is hidden while it is hosted. The tapes keep their own speeds, so Discobot's tempo changes leave them alone.
- The mix goes into Discobot's mixer instead of the page's speakers, played a fixed amount early (currently 120 ms) so it lands on the beat after Discobot holds it back.
- Discobot saves the deck's settings with its project: mixer, tape placement, speed and reverse, master volume. **The audio itself is not saved there**, because Discobot keeps at most 100,000 characters per guest. When the project is opened again, settings go back onto loaded tapes with the same names (the demo tapes, or sounds you add again). Use **Save project** for a file that includes the audio.

Opened on its own, the deck is unchanged. To try a local copy, serve the folder (`python -m http.server 8000`) and add `http://localhost:8000/` as a guest.
