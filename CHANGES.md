# Change log

## Version 0.4.2

- Fullscreen toggle

## Version 0.4.1

- Position and duration as input fields

- Position and duration to the query string

## Version 0.4.0

- Save sounds in the player to the query string

## Version 0.3.0

- Build with esbuild.

- Discard shadow DOM.

## Version 0.2.1

- Migrate to Web components.  Still somewhat rough code, more
  improvements to come.

## Version 0.2.0

- Migrate to TypeScript.  The code is rough now, improvements will
  follow.

## Version 0.1.1

- Bugfix: Player cursor movement behaved strangely on iOS. Now the
  cursor moves with CSS transition instead of animation.

- Bugfix: on some iOS devices sound did not come out before some audio
  was played from the description box first. Now Audio Context is
  "warmed up" automatically when the player starts.

- Bugfix: On iOS user-select would sometimes make moving sounds
  difficult. Disable user-select everywhere.

- Make player cursor wider in portrait mode.
