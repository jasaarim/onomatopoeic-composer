# Onomatopoeia

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

The testing is done with Cypress.  To run the tests you should have the app running `localhost:8000` and then run

```
$ npm run test
```

## Building

To place the static app on a server, first run

```
$ npm run build
```

The stand-alone app is now in the folder `build`.
