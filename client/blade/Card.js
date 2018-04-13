class Card {
  constructor(name, sortValue, location, size){
    this.name = name;
    this.sortValue = sortValue;
    this.x = location.x;
    this.y = location.y;
    this.width = size.width * 0.6;
    this.height = size.height * 0.6;
    this.radians = 0;
    this.revealed = false;
    this.animation = null;
    this.hueRotate = 0;
    this.originalLocation = location;
    //this.queuedAnimations = [];
    this.animCallback = null;
    this.sealed = false;
  };
  
  bindAnimation(animation, callback, seal){
    
    if(seal){
      this.sealed = seal;
    }
    
    this.animation = animation;
    this.animation.bind(new Date().getTime());
    
    if(callback){
      this.animCallback = callback;
    } else {
      this.animCallback = null;
    }
  };
  
  /*queueAnimation(animation, params, callback){
    this.queuedAnimations.push({animation, callback});
  };
  
  nextAnimation(){
    if (this.queuedAnimations.length > 0){
      const queued = this.queuedAnimations[0];
      const animation = queued.animation.apply(this, queued.params);
      this.bindAnimation(animation, queued.callback);
      this.queuedAnimations.splice(0, 1);
    }
  };
  
  clearQueue(){
    this.queuedAnimations = [];
  };*/
  
  isRevealed(){
    return this.revealed;
  };
  
  flip(){
    this.revealed = !this.revealed;
  };
  
  cancelAnimation(){
    delete this.animation;
    this.animation = null;
  };
  
  endAnimation(){
    this.cancelAnimation();
    if(this.animCallback){
      this.animCallback(this);
    }
  };
  
  readyToAnimate(){
    return this.animation === null;
  };
  
  reveal(name){
    this.name = name;
  };
  
  flipImage(){
    this.radians = (this.radians + Math.PI) % (2 * Math.PI);
  }
  
  update(currentTime){
    if(this.animation){
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