# Tape Loop Deck

A virtual tape loop player that runs entirely in the browser (Web Audio API).

- **Deck:** upload sounds and each becomes a tape loop. Loop the clip at its own length, or pad it with silence to a set tape length and drag the clip to where it should start. Varispeed, reverse, and spinning reels.
- **Scenes:** built-in sets (Studio demo, Nature, Microhouse, Empty deck), all synthesized in the browser. Save your current set as a named scene and recall it later; saved scenes, audio included, are kept in your browser.
- **Mixer:** a performance console with one strip per tape: gain, 3-band EQ with sweepable mid, an effects bus (tape drive, echo, reverb), tape speed, balance, volume fader, mute and solo.
- **MIDI:** every major control is mappable. Each strip gets its own MIDI channel with a default CC layout, and MIDI learn remaps anything. Needs a browser with Web MIDI (Chrome, Edge, Opera).
- **Capture:** record bar-exact clips straight from Logic Rhythm, Boolean Melody Machine, Choir and Pocket Grains running in other tabs. See [Capture from apps](#capture-from-apps).
- **Save & export:** projects save as a .json file with the audio included. Export the mix as WAV or MP3, or a MIDI file with one track per tape.
- Dark and light themes.

Nothing is uploaded; all audio stays in your browser.

## Capture from apps

Tape Loop Deck can record clips straight from Logic Rhythm, Boolean Melody Machine, Choir and Pocket Grains.

1. Open the deck and one or more of those apps in tabs or windows of the **same browser**.
2. Press play in the app. In the deck's **Capture from** bar (under the scenes), pick the app and a length (1 to 16 bars).
3. Press **Grab last N bars** to take the bars that have just played, or **Record next N bars** to record from the next bar line. While it records, the button turns into **Cancel**.

Each clip arrives as a new tape that loops at exactly its length, cut on the app's own bar lines, so a 4-bar clip of a 120 bpm pattern is exactly 8.000 seconds and loops seamlessly. It is named after the app, its bar count and its tempo, and saves with the project like any other tape.

- While the deck is open, each app keeps the last 48 seconds of its own sound, so you can grab after the fact. If the app has only just started, Grab gives you the full bars it has so far and says so.
- Clips are recorded from each app's own output, before the speakers, so other tabs' sound never leaks in.
- It works between tabs of one browser on one computer, not across computers.

How it works: the shared `jam-clips.js` module (embedded in every app between `JAM-CLIPS` markers) talks over a BroadcastChannel. The apps record through an AudioWorklet that counts audio frames, and the bar lines come from each app's own clock in the same frames, which is why clips are sample-exact.

## Discobot guest

Tape Loop Deck can be a unit in the rack of [Discobot](https://iw978599.github.io/discobot/), a browser sequencer and drum machine. In Discobot choose **Project → Add Guest Instrument** and paste `https://aaronvandorn.github.io/Tape-Loop-Deck/`. The unit should read **Connected**. Then:

- **Play All** starts every tape from the top on Discobot's first beat, and **Stop All** stops them. The deck's own play button is hidden while it is hosted. The tapes keep their own speeds, so Discobot's tempo changes leave them alone.
- The mix goes into Discobot's mixer instead of the page's speakers, played a fixed amount early (currently 120 ms) so it lands on the beat after Discobot holds it back.
- Discobot saves the deck's settings with its project: mixer, tape placement, speed and reverse, master volume. **The audio itself is not saved there**, because Discobot keeps at most 100,000 characters per guest. When the project is opened again, settings go back onto loaded tapes with the same names (the demo tapes, or sounds you add again). Use **Save project** for a file that includes the audio.

Opened on its own, the deck is unchanged. To try a local copy, serve the folder (`python -m http.server 8000`) and add `http://localhost:8000/` as a guest.
