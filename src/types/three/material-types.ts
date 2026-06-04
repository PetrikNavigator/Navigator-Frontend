/** Vertical spacing between storeys, in world units (meters). */
export const FLOOR_HEIGHT = 10;

/** Default corridor half-width, in meters, used when a room has no
 *  corridor link of its own. Keeps a freshly-created room from
 *  hugging the corridor centerline. */
export const CORRIDOR_HALF_DEFAULT = 1.25;

/** Multiplier applied to non-highlighted objects' opacity when the
 *  scene is in "edit focus" mode (dimOthers). 0.12 keeps spatial
 *  context faintly visible without competing with the editing
 *  target for attention. */
export const DIM_OPACITY = 0.12;