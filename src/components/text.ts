export class Text
{
  constructor(
    private ctx: CanvasRenderingContext2D,
    private x: number,
    private y: number,
    private text: string,
    private font_size: number = 32,
    private color: string = "#fff",
    private align: CanvasTextAlign = "center"
  ) {}

  public render()
  {
    const ctx = this.ctx;

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.font = `bold ${this.font_size}px Arial`;
    ctx.textAlign = this.align;
    ctx.textBaseline = "middle";
    ctx.fillText( this.text, this.x, this.y );
    ctx.restore();
  }
}
