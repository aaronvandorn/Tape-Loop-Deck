# Tape Loop Deck

A virtual tape loop player that runs entirely in the browser (Web Audio API).

- **Deck:** upload sounds and each becomes a tape loop. Loop the clip at its own length, or pad it with silence to a set tape length and drag the clip to where it should start. Varispeed, reverse, and spinning reels.
- **Scenes:** built-in sets (Studio demo, Nature, Microhouse, Empty deck), all synthesized in the browser. Save your current set as a named scene and recall it later; saved scenes, audio included, are kept in your browser.
- **Patterns:** store which tapes play, and their levels, on pads A–H, then switch between them on the next grid line or chain them to change after set counts of bars or seconds. See [Patterns and transitions](#patterns-and-transitions).
- **Deck Link:** Axis Stack can pick any tape and play a copy of it in time with the deck, through its XY effects. See [Tapes in Axis Stack](#tapes-in-axis-stack).
- **Mixer:** a performance console with one strip per tape: gain, 3-band EQ with sweepable mid, an effects bus (tape drive, echo, reverb), tape speed, balance, volume fader, mute and solo.
- **MIDI:** every major control is mappable. Each strip gets its own MIDI channel with a default CC layout, and MIDI learn remaps anything. Needs a browser with Web MIDI (Chrome, Edge, Opera).
- **Capture:** record bar-exact clips straight from Logic Rhythm, Boolean Melody Machine, Choir, Pocket Grains, Pocket Mouse and Padfield running in other tabs. See [Capture from apps](#capture-from-apps).
- **Save & export:** projects save as a .json file with the audio included. Export the mix as WAV or MP3, or a MIDI file with one track per tape.
- Dark and light themes.

Nothing is uploaded; all audio stays in your browser.

## Patterns and transitions

The **Patterns** bar on the Deck tab holds eight patterns, A–H. A pattern is a snapshot of the deck: which tapes play (mute) and each tape's volume.

- **Store:** set the deck how you want it and tap an empty pad, or press **Store** and then a pad to overwrite it. **Clear** then a pad empties it. Double-click a pad to name it.
- **Switch on the fly:** tap a stored pad. While the deck plays, the switch waits for the next grid line set under **Switch** (right away, ¼ bar up to 16 bars); the pad's light blinks until it lands. Stopped, it switches straight away.
- **Grid:** bars of **BPM** × **Beats/bar**, counted from the moment you press play, or plain **Seconds**. **From tapes** picks a tempo that makes the longest tape a whole number of bars.
- **Fade:** cut, or ramp the levels over ¼ bar up to 8 bars (or seconds).
- **Chain:** add steps (a pattern and how many bars or seconds it lasts) and turn **Chain** on. Play starts at step 1; each step hands over to the next exactly on time. **At the end** loops the chain or stays on the last pattern. Tapping a pad while the chain runs jumps to that pattern's step; tapping one that isn't in the chain turns the chain off.
- Switches are scheduled on the audio clock just ahead of the line, so they land on the sample.
- **MIDI:** patterns A–H are notes 36–43 on channel 16 and Chain on/off is CC 23, all remappable with MIDI learn or the MIDI map.
- Patterns, grid and chain save with projects and saved scenes. The **Microhouse** scene comes with four patterns and a chain to try.

## Tapes in Axis Stack

Open the deck and [Axis Stack](https://aaronvandorn.github.io/Axis-Stack/) in tabs of the same browser. In Axis Stack choose **Source → Deck** and pick a tape. Axis Stack gets the tape's loop once and plays its own copy locked to the deck's playback (within a millisecond or so), through its axis chains, while the deck keeps playing the tape as usual. The tape's card on the deck shows **↗ Axis Stack** while it's in use.

The copy follows the deck: it starts and stops with it, follows the tape's speed, picks up edits (trim, reverse, placement), and goes quiet while the deck has the tape muted, including pattern switches, which reach Axis Stack a moment early so both change on the same line.

This uses the shared `deck-link.js` module (embedded between `DECK-LINK` markers in both apps), a BroadcastChannel on the shared clock. Same browser and same site only.

## Capture from apps

Tape Loop Deck can record clips straight from Logic Rhythm, Boolean Melody Machine, Choir, Pocket Grains, Pocket Mouse and Padfield (Finger Drums, while its click is running). Axis Stack is listed too but has no bar grid, so use its own Export bar for it.

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
