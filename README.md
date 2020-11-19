# Sound word explorer

Multitrack player for pieces of audio that have their own descriptive
word.

## Running tests

Testing is done with [Cypress](https://www.cypress.io/).  The tests
are located in `cypress/integration` and require that the app is
served from `http://localhost:8000` (for example, running `python -m
http.server` at the root of the repository).  The tests can be run,
for example, with `npx cypress run` or in the GUI with `npx cypress
open`.

## Deploying

To serve the app, there needs to be a `sounds.json` file and that
contains relative paths to audio files.
