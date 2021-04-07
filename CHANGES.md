# Change log

## Version 0.1.1

- Bugfix: Player cursor movement behaved strangely on iOS. Now the
  cursor moves with CSS transition instead of animation.

- Bugfix: on some iOS devices sound did not come out before some audio
  was played from the description box first. Now Audio Context is
  "warmed up" automatically when the player starts.

- Bugfix: On iOS user-select would sometimes make moving sounds
  difficult. Disable user-select everywhere.

- Make player cursor wider in portrait mode.
