export enum POST_VIDEO_VALIDATION_REQUIREMENTS {
  /** The maximum duration of a video in seconds */
  POST_VIDEO_MAX_DURATION = 120,

  /**  The minimum duration of a video in seconds */
  POST_VIDEO_MIN_DURATION = 3,

  /** The maximum size of a video in bytes (512MB) */
  POST_VIDEO_MAX_SIZE = 536870912,

  /** The minimum size of a video in bytes (75KB) */
  POST_VIDEO_MIN_SIZE = 76800,

  /** The maximum width of a video in pixels */
  POST_VIDEO_MAX_WIDTH = 1920,

  /** The minimum width of a video in pixels */
  POST_VIDEO_MIN_WIDTH = 600,

  /** The maximum height of a video in pixels*/
  POST_VIDEO_MAX_HEIGHT = 1920,

  /** The minimum height of a video in pixels */
  POST_VIDEO_MIN_HEIGHT = 315,

  /** The maximum aspect ratio of a video in pixels */
  POST_VIDEO_MAX_ASPECT_RATIO = 16 / 9,

  /** The minimum aspect ratio of a video in pixels */
  POST_VIDEO_MIN_ASPECT_RATIO = 9 / 16,

  /** The maximum number of videos allowed on a post */
  POST_VIDEO_MAX_ALLOWED_NUMBER_ON_A_POST = 1,
}

export enum IMAGE_VALIDATION_ERRORS {
  WRONG_FILE_FORMAT = 'All uploaded photos <b>must be %imageFormats% file format</b>.',
  RESOLUTION_TOO_SMALL = 'The image <b>must be at least %imageSize%</b> tall and wide.',
  RESOLUTION_TOO_LARGE = 'The image <b>must be less than %imageSize%</b> tall and wide.',
  ASPECT_RATIO_NOT_IN_LIMITS = 'The image aspect ratio <b>must be within the range of %min_aspect_ratio% to %max_aspect_ratio%</b>.',
  DUPLICATE = "Some of the media items you've uploaded are duplicates. To avoid repetition, these duplicates will not be included.",
}

export enum VIDEO_VALIDATION_ERRORS {
  WIDTH_TOO_LARGE = 'The video width is too large. The maximum allowed width is %maxWidth%px.',
  WIDTH_TOO_SMALL = 'The video width is too small. The minimum allowed width is %minWidth%px.',
  HEIGHT_TOO_LARGE = 'The video height is too large. The maximum allowed height is %maxHeight%px.',
  HEIGHT_TOO_SMALL = 'The video height is too small. The minimum allowed height is %minHeight%px.',
  ASPECT_RATIO_TOO_BIG = 'The video aspect ratio is too big. The maximum allowed aspect ratio is %maxAspectRatio%.',
  ASPECT_RATIO_TOO_SMALL = 'The video aspect ratio is too small. The minimum allowed aspect ratio is %minAspectRatio%.',
}
