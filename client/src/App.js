import React from "react";
import "./App.css";
import interact from "interactjs";

const numLeds = 5;

function Led({ ledX, ledY, ledNumber }) {
  return (
    <circle
      cx={ledX}
      cy={ledY}
      r="10"
      stroke="white"
      stroke-width="1"
      fill="rgba(255, 0, 0, 0.8)"
      className={"led" + ledNumber}
      id={"led" + ledNumber}

    />
  );
}

class FileInputOrImage extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLedMove = this.handleLedMove.bind(this);
    this.fileInput = React.createRef();
    let state = { localFileUrl: "" };

    for (let i = 0; i < numLeds; i++) {
      state["led" + i] = { x: 50 + i * 20, y: 50 };
    }
    this.state = state;
  }

  handleSubmit(event) {
    event.preventDefault();
    const imgUrl = URL.createObjectURL(this.fileInput.current.files[0]);
    this.setState({
      localFileUrl: imgUrl,
    });
  }

  handleLedMove(event) {
    const keyName = event.target.id
    this.setState({
      [keyName]: {
        x: this.state[keyName].x + event.dx,
        y: this.state[keyName].y + event.dy,
      },
    });
  }

  componentDidMount() {
    for (let i = 0; i < numLeds; i++) {
      interact(".led" + i).draggable({
        listeners: {
          start(event) {
            console.log(event.type, event.target);
          },
          move: this.handleLedMove,
        },
      });
    }
  }

  componentDidUpdate() {
    if (this.state && this.state.localFileUrl) {
      const DOMImage = new Image(640, 425);
      DOMImage.src = this.state.localFileUrl;
    }
  }

  render() {
    const style = {
      imgOverlayWrap: {
        position: "relative",
        display: "inline-block" /* <= shrinks container to image size */,
        transition: "transform 150ms ease-in-out",
      },
      imgOverlayWrapImg: {
        /* <= optional, for responsiveness */ display: "block",
        maxWidth: "100%",
        height: "auto",
      },
      imgOverlayWrapSvg: {
        position: "absolute",
        top: 0,
        left: 0,
      },
    };

    const leds = [...Array(numLeds).keys()].map((idx) => {
      return (
        <Led
          ledX={this.state["led" + idx].x}
          ledY={this.state["led" + idx].y}
          ledNumber={idx}
        />
      );
    });

    return this.state.localFileUrl.length ? (
      <div style={style.imgOverlayWrap}>
        <img
          width={1280}
          height={650}
          src={this.state ? this.state.localFileUrl : ""}
          alt="no image found"
          style={style.imgOverlayWrapImg}
        />
        <svg height="100%" width="100%" style={style.imgOverlayWrapSvg}>
          {leds}
        </svg>
      </div>
    ) : (
      <form onSubmit={this.handleSubmit}>
        <label>
          <p>
            {this.state.localFileUrl.length
              ? "Nice pic"
              : "Upload a file of your wall"}
          </p>
          <input type="file" ref={this.fileInput} />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    );
  }
}
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <FileInputOrImage />
      </header>
    </div>
  );
}

export default App;
