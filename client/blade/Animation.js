class Animation {
  constructor(logistics){
    const time = new Date().getTime();
    this.startTime = time;
    this.currentTime = time;
    this.begin = logistics.begin;
    this.timeToFinish = logistics.timeToFinish;
    this.propsBegin = logistics.propsBegin;
    this.propsEnd = logistics.propsEnd;
    this.propsCurrent = {};
    this.complete = false;
    
    const propKeys = Object.keys(this.propsBegin);
    for(let i = 0; i < propKeys.length; i++){
      const key = propKeys[i];
      this.propsCurrent[key] = this.propsBegin[key];
    }
  };
  
  update(currentTime){
    const timeElapsed = currentTime - this.currentTime;
    const timeSinceStart = currentTime - this.startTime;
    this.currentTime += timeElapsed;
    
    if(timeSinceStart < this.begin){
      return;
    }
    
    let ratio = (timeSinceStart - this.begin) / this.timeToFinish;
    
    if(ratio > 1){
      ratio = 1;
    }
    
    const propKeys = Object.keys(this.propsCurrent);
    for(let i = 0; i < propKeys.length; i++){
      const key = propKeys[i];
      
      this.propsCurrent[key] = lerp(this.propsBegin[key], this.propsEnd[key], ratio);
    }
    
    if(ratio >= 1){
      this.complete = true;
    }
  };
  
  copyVals(obj){
    const keys = Object.keys(this.propsCurrent);
    for(let i = 0; i < keys.length; i++){
      const key = keys[i];
      obj[key] = this.propsCurrent[key];
    }
  }
};