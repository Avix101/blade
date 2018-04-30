//An effect object holds info about an effect and its current state
class Effect {
  constructor(image, location, frameDetails){
    this.image = image;
    this.x = location.x;
    this.y = location.y;
    this.frame = 0;
    this.frameWidth = frameDetails.width;
    this.frameHeight = frameDetails.height;
    this.animation = null;
    this.animCallback = null;
    this.opacity = 1;
    this.radians = 0;
    this.hueRotate = 0;
  }
  
  //Animations can be bound to an effect, in which case the effect will animate when updated
  bindAnimation(animation, callback, seal){
    
    if(seal){
      this.sealed = seal;
    }
    
    //Start the animation at the time of bind
    this.animation = animation;
    this.animation.bind(new Date().getTime());
    
    //If the animation comes with a callback, set the callback
    if(callback){
      this.animCallback = callback;
    } else {
      this.animCallback = null;
    }
  };
  
  //Cancel an effect's animation
  cancelAnimation(){
    delete this.animation;
    this.animation = null;
  };
  
  //End the effect's animation (same as cancel, but calls the animation callback)
  endAnimation(){
    this.cancelAnimation();
    if(this.animCallback){
      this.animCallback(this);
    }
  };
  
  //Determine if the effect is ready to animate
  readyToAnimate(){
    return this.animation === null;
  };
  
  //Visually flip the effect 180 degrees
  flipImage(){
    this.radians = (this.radians + Math.PI) % (2 * Math.PI);
  }
  
  //Update the effect based on its current animation
  update(currentTime){
    if(this.animation){
      //Update the animation and copy over the new values
      this.animation.update(currentTime);
      this.animation.copyVals(this);
      
      if(this.animation.complete){
        this.endAnimation();
        return true;
      }
      
      return this.animation.ready();
    }
    return this.animation !== null;
  };
}