/**
 * Animation Controller to handle playback controls (start, pause, resume, speed adjustment).
 */
export class AnimationController {
  constructor(animationTarget) {
    this.animationTarget = animationTarget
    this.animatable = null // Stores the running animation instance
    this.isPaused = false
    this.speed = 1 // Default animation speed
  }

  /**
   * Starts or restarts the animation.
   */
  play() {
    if (!this.animationTarget || !this.animationTarget.animations.length) return

    if (this.animatable) {
      this.animatable.restart()
    } else {
      let length = this.animationTarget.animations[0]._keys.length
      this.animatable = this.animationTarget
        .getScene()
        .beginAnimation(this.animationTarget, 0, length, true, this.speed)
    }
  }

  /**
   * Pauses the animation.
   */
  pause() {
    if (this.animatable) {
      this.animatable.pause()
      this.isPaused = true
    }
  }

  /**
   * Resumes the animation if paused.
   */
  resume() {
    if (this.animatable && this.isPaused) {
      this.animatable.restart()
      this.isPaused = false
    }
  }

  /**
   * Adjusts the animation speed.
   */
  setSpeed(speed) {
    this.speed = speed
    if (this.animatable) {
      this.animatable.speedRatio = speed
    }
  }

  /**
   * Stops the animation.
   */
  stop() {
    if (this.animatable) {
      this.animatable.stop()
      this.animatable = null
    }
  }

  /**
   * Disposes of the animation controller.
   */
  reset() {
    if (this.animatable) {
      this.animatable.stop()
      this.animatable = null
    }

    if (this.animationTarget) {
      // Remove animations from the camera
      this.animationTarget.animations = []
    }

    this.animationTarget = null
  }
}
