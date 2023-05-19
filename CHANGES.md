# Change log

## 0.4.3

- Enhance moving the player cursor with arrow keys

- Enhance moving player sounds with arrow keys

- Position and duration have 2 decimals in query string

## 0.4.2

- Fullscreen toggle

## 0.4.1

- Position and duration as input fields

- Position and duration to the query string

## 0.4.0

- Save sounds in the player to the query string

## 0.3.0

- Build with esbuild.

- Discard shadow DOM.

## 0.2.1

- Migrate to Web components.  Still somewhat rough code, more
  improvements to come.

## 0.2.0

- Migrate to TypeScript.  The code is rough now, improvements will
  follow.

## 0.1.1

- Bugfix: Player cursor movement behaved strangely on iOS. Now the
  cursor moves with CSS transition instead of animation.

- Bugfix: on some iOS devices sound did not come out before some audio
  was played from the description box first. Now Audio Context is
  "warmed up" automatically when the player starts.

- Bugfix: On iOS user-select would sometimes make moving sounds
  difficult. Disable user-select everywhere.

- Make player cursor wider in portrait mode.
