class Card {
  constructor(name, location, size){
    this.name = name;
    this.x = location.x;
    this.y = location.y;
    this.width = size.width * 0.6;
    this.height = size.height * 0.6;
    this.radians = 0;
    this.animation = null;
    this.animCallback = null;
  };
  
  bindAnimation(animation, callback){
    this.animation = animation;
    
    if(callback){
      this.animCallback = callback;
    } else {
      this.animCallback = null;
    }
  };
  
  cancelAnimation(){
    delete this.animation;
    this.animation = null;
  };
  
  endAnimation(){
    this.cancelAnimation();
    if(this.animCallback){
      this.animCallback();
      this.animCallback = null;
    }
  }
  
  readyToAnimate(){
    return this.animation === null;
  }
  
  update(currentTime){
    if(this.animation){
      this.animation.update(currentTime);
      this.animation.copyVals(this);
      
      if(this.animation.complete){
        this.endAnimation();
      }
    }
  };
}