# Onomatopoeic Composer

An app to browse, listen to, and compose with onomatopoeia.


## Adding words and audio

Sound descriptions and audio files are located in `data/descriptions`
and `data/audio`.  The description files should be named like
`sound.txt` and if there is a corresponding audio that should have the
name `sound.mp3`.  To use the contents of these data directories run

```
$ npm run index-sounds
```

## Running locally

To run locally, a http server should point to files in the folder
`public` (this contains symbolic links to the data and code).  To use
Python to serve at `localhost:8000`, run

```
$ npm run server
```


## Testing

The testing is done with Cypress.  To run the tests you should have
the app running `localhost:8000` and then run

```
$ npm run test
```

## Building

To place the static app on a server, first run

```
$ npm run build
```

The stand-alone app is now in the folder `build`.


## Usage

### Player cursor

The player cursor can be positioned by clicking on the player tracks.
Or by first pressing the play button and then the pause button.

### Sound add button (+)

Pressing the sound add button adds the sound to the track in which the
last audio ends first.  The sound is added to the position where the
cursor is.

### Dragging sounds

Sounds can be dragged and dropped from the sound menu to the player,
from a player track to another, or removed from the player. The
dragging starts once a red border appears around a sound.

### Adding sounds on top of each other

If a sound in the player overlaps with another, the moved sound will
be moved after the one below it.  If it still overlaps with another
sound, it will be moved after that and the process is repeated until
there is a good position for it.

### Making the composition longer

By default, the composition is 20 seconds long.  It is automatically
made longer if a sound reaches over the end.

### Keyboard controls

When a sound in the player has a focus, it can be moved with arrow
keys.  Otherwise, the cursor is moved with left and right arrow keys.
Up and down arrow keys change the focus in the sound menu.  When a
sound in the sound menu has the focus, pressing enter with add the
sound to the player and pressing space will play the sample (if the
sample is available).  When a sound in the player has the focus,
pressing enter will remove the sound.
