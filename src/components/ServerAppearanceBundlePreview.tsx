import React from "react";

let modelIdAlloc = 0;

export default class ServerAppearanceBundlePreview extends React.Component<{bundle?: ServerAppearanceBundle}> {
  private canvasRef = React.createRef<HTMLCanvasElement>();
  private modelCharacter: Character

  componentDidMount() {
    this.modelCharacter = CharacterCreate('Female3DCG', 'player', 'razorwings-technology-model-' + (modelIdAlloc++));
    this.drawBundle();
  }

  componentWillUnmount() {
    CharacterDelete(this.modelCharacter, true);
  }

  componentDidUpdate() {
    this.drawBundle();
  }

  private drawBundle() {
    const canvas = this.canvasRef.current;
    if (canvas) {
      const context2d = canvas.getContext("2d");
      context2d?.clearRect(0, 0, canvas.width, canvas.height);
      if (this.props.bundle) {
        try {
          this.modelCharacter.Appearance = this.props.bundle
            .map(it => ServerBundledItemToAppearanceItem(this.modelCharacter.AssetFamily, it))
            .filter(it => it);
          CommonDrawCanvasPrepare(this.modelCharacter);
          DrawCharacter(this.modelCharacter, 1000, 0, 1);
          if (this.modelCharacter.Canvas) {
            console.info("Drawing model character to canvas", this.modelCharacter.Canvas);
            context2d?.drawImage(this.modelCharacter.Canvas, 0, 0, canvas.width, canvas.height);
          }
        } catch (e) {
          console.error("Failed to draw bundle preview:", e);
          context2d?.fillText("Error rendering preview", 10, 20);
        }
      }
    }
  }

  render() {
    return (<>
      <div style={{ width: 100, height: 200, overflow: 'visible', position: 'relative' }}>
        <canvas ref={this.canvasRef} width={200} height={400} style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -70%)',
        }}></canvas>
      </div>
    </>);
  }
}
