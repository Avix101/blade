//A card object holds location and animation related data
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
    this.animCallback = null;
    this.sealed = false;
    this.opacity = 1;
  };
  
  //Animations can be bound to a card, in which case the card will animate when updated
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
  
  //Determine if the card is revealed
  isRevealed(){
    return this.revealed;
  };
  
  //Toggle whether or not the card is revealed
  flip(){
    this.revealed = !this.revealed;
  };
  
  //Cancel a card's animation
  cancelAnimation(){
    delete this.animation;
    this.animation = null;
  };
  
  //End the card's animation (same as cancel, but calls the animation callback)
  endAnimation(){
    this.cancelAnimation();
    if(this.animCallback){
      this.animCallback(this);
    }
  };
  
  //Determine if the card is ready to animate
  readyToAnimate(){
    return this.animation === null;
  };
  
  //Reveal the card's true name
  reveal(name){
    this.name = name;
  };
  
  //Visually flip the card 180 degrees
  flipImage(){
    this.radians = (this.radians + Math.PI) % (2 * Math.PI);
  }
  
  //Update the card based on its current animation
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