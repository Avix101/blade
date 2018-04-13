//The animation class bundles a collection of properties to change over a set period of time
//It also updates its state if given a timestamp
class Animation {
  //Build the animation using the given data
  constructor(logistics, holdReadyStatus){
    const time = 0;
    this.startTime = 0;
    this.currentTime = time;
    this.begin = logistics.begin;
    this.timeToFinish = logistics.timeToFinish;
    this.propsBegin = logistics.propsBegin;
    this.propsEnd = logistics.propsEnd;
    this.propsCurrent = {};
    this.complete = false;
    this.holdReadyStatus = holdReadyStatus
    
    const propKeys = Object.keys(this.propsBegin);
    for(let i = 0; i < propKeys.length; i++){
      const key = propKeys[i];
      this.propsCurrent[key] = this.propsBegin[key];
    }
  };
  
  //Binding an animation sets it's starting time to the current time and begins the animation
  bind(currentTime){
    this.startTime = currentTime;
    this.currentTime = currentTime;
  }
  
  //Animations use the current time to update its current status
  update(currentTime){
    const timeElapsed = currentTime - this.currentTime;
    const timeSinceStart = currentTime - this.startTime;
    this.currentTime += timeElapsed;
    
    //Don't update if the animation is finished
    if(timeSinceStart < this.begin){
      return;
    }
    
    //Calcualte the ratio between start and finish
    let ratio = (timeSinceStart - this.begin) / this.timeToFinish;
    
    //The ratio should never be greater than 1
    if(ratio > 1){
      ratio = 1;
    }
    
    //Update all properties to reflect the current stage of the animation (using lerp)
    const propKeys = Object.keys(this.propsCurrent);
    for(let i = 0; i < propKeys.length; i++){
      const key = propKeys[i];
      
      this.propsCurrent[key] = lerp(this.propsBegin[key], this.propsEnd[key], ratio);
    }
    
    //If the animation has reached its end, complete it
    if(ratio >= 1){
      this.complete = true;
    }
  }
  
  //Determine if the animation is ready
  ready(){
    return this.holdReadyStatus;
  }
  
  //Copy the values calculated by the animation into a given object
  copyVals(obj){
    const keys = Object.keys(this.propsCurrent);
    for(let i = 0; i < keys.length; i++){
      const key = keys[i];
      obj[key] = this.propsCurrent[key];
    }
  }
};