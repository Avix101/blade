//Construct the main game window (the canvas)
const GameWindow = (props) => {
  return (
    <canvas id="viewport" width={props.width} height={props.height}></canvas>
  );
};

const renderGame = (width, height) => {
  ReactDOM.render(
    <GameWindow width={width} height={height} />,
    document.querySelector("#main")
  );
  
  //Hook up viewport (display canvas) to JS code
  viewport = document.querySelector("#viewport");
  viewCtx = viewport.getContext('2d');
};