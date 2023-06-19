# Onomatopoeic Composer

Make compositions with short audio samples. Try a [demo with Finnish
sounds](https://s7i.fi/ääninen).

This repository does not contain sounds for the app.

## Configuration

The folder `public` contains all assets that will be copied to the
build as such.  There are some files that the app needs but are not
part of this repository.

### Audio files

The folder `public/audio` should contain mp3 audio samples. Each audio
file should have a single-word name in lower-case characters and the
extension `.mp3`.

### Description files

The folder `public/descriptions` should contain short textual
descriptions for all sounds.  Each description file should have the
same single-word name as the audio file and the extension `.txt`. Each
sound should at least have a description file but it doesn't need to
have the audio file.

### Indexing sounds

Once there is content in folders `public/audio` and
`public/descriptions`, these can be indexed by running

```
$ npm run index-sounds
```

This creates a file `public/sounds.json`.

### Localization

There is a file `public/config.json` that can be used for
localization.  In the `languages` array we can add strings of language
appreviations for the supported languages. For instance, to add
Finnish support, set

```
"languages": [
  "fi"
]
```

Currently there is only one element that will have localization: the
instructions that can be displayed with a button.  The default
instructions are in the file `public/info.txt`.  For the Finnish
instructions, create another file `public/info-fi.txt`.  This file
will then be used if the user's browser is using Finnish language.

## Development

The app is using esbuild for building.  For a development build run

```
$ npm run dev
```

This first checks the typing and linting, copies the `public`
directory contents to `build` directory, and then builds the
application there.  This also watches for changes in the source files
and automatically reloads the app when something has changed.  To
apply changes in `public` directory contents the build step needs to
be run again.

## Building for production

The production build is made with

```
$ npm run build
```

This works like the development build but it minifies the output and
doesn't watch for the changes in source files.

## Testing

This app uses Cypress and only for end-to-end testing.  To develop the
tests you can run

```
$ npx cypress open
```

There should be Cypress binary installed for the same version that is
listed in `package.json`.

To only run the tests:

```
$ npm run test
```

## Directory `src`

Besides the assets in folder `public`, the app is contained in
TypeScript, CSS, and HTML files in folder `src`.  The app uses Web
Components in the form of autonomous custom elements that are defined
by the files in folder `src/components/`.  Depending on a component,
they may import CSS files from `src/style/` and static HTML from
`src/templates/`.

Folder `src/events/` is legacy from the earlier iterations of this
app.  At the time, all components lived practically in the same
namespace and the hierarchical structure was only shown in the DOM.
The modules in `src/events/` contain interactions that haven't been
migrated into the components.
