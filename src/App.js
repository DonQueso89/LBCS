import React from "react";
import "./App.css";
import interact from "interactjs";

const numLeds = 5;

function Led({ ledX, ledY, style }) {
  return (
    <svg height="100%" width="100%" style={style}>
      <circle
        cx={ledX}
        cy={ledY}
        r="10"
        stroke="white"
        stroke-width="1"
        fill="rgba(255, 0, 0, 0.8)"
        className="led"
      />
    </svg>
  );
}

class FileInputOrImage extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLedMove = this.handleLedMove.bind(this);
    this.fileInput = React.createRef();
    this.state = { ledX: 50, ledY: 50, localFileUrl: "" };
  }
  handleSubmit(event) {
    event.preventDefault();
    const imgUrl = URL.createObjectURL(this.fileInput.current.files[0]);
    this.setState({
      localFileUrl: imgUrl,
    });
  }

  handleLedMove(event) {
    this.setState({ ledX: this.state.ledX + event.dx });
    this.setState({ ledY: this.state.ledY + event.dy });
  }

  componentDidMount() {
    window.context = this.ctx;
    interact(".led").draggable({
      listeners: {
        start(event) {
          console.log(event.type, event.target);
        },
        move: this.handleLedMove,
      },
    });
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

    return this.state.localFileUrl.length ? (
      <div style={style.imgOverlayWrap}>
        <img
          width={1280}
          height={650}
          src={this.state ? this.state.localFileUrl : ""}
          alt="no image found"
          style={style.imgOverlayWrapImg}
        />
        <Led {...this.state} style={style.imgOverlayWrapSvg} />
      </div>
    ) : (
        <form onSubmit={this.handleSubmit}>
        <label>
          <p>{this.state ? "Nice pic" : "Upload a file of your wall"}</p>
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
