import { hexToRgba } from "../../utils/hex_to_rgba.js";
import { shadeColor } from "../../utils/shade_color.js";

export class Cell
{
  private x: number = 0;
  private y: number = 0;

  public preview: string | null = null;
  public hover_color: string | null = null;

  constructor(
    private ctx: CanvasRenderingContext2D,
    public size: number,
    public filled: boolean = false,
    public base_color: string = "#EC7928"
  ) {}

  public setPosition( x: number, y: number )
  {
    this.x = x;
    this.y = y;
  }

  private drawFace( points: [number, number][], color: string ) 
  {
    const ctx = this.ctx;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo( points[0][0], points[0][1] );
    points.slice( 1 ).forEach( ( [px, py] ) => ctx.lineTo( px, py ) );
    ctx.closePath();
    ctx.fill();
  };

  public render()
  {
    const ctx = this.ctx;
    const x = this.x;
    const y = this.y;
    const s = this.size;
    const inset = s * 0.15;

    if ( (this.filled || this.hover_color) && !this.preview )
    {
      const color = this.hover_color ? this.hover_color : this.base_color;

      ctx.fillStyle = color;
      ctx.fillRect( x + inset, y + inset, s - 2 * inset, s - 2 * inset );

      ctx.strokeStyle = shadeColor( color, -5 );
      ctx.lineWidth = 2;
      ctx.strokeRect( x + inset, y + inset, s - 2 * inset, s - 2 * inset );

      this.drawFace(
        [
          [x, y],
          [x + s, y],
          [x + s - inset, y + inset],
          [x + inset, y + inset],
        ],
        shadeColor( color, +40 )
      );

      this.drawFace(
        [
          [x + inset, y + s - inset],
          [x + s - inset, y + s - inset],
          [x + s, y + s],
          [x, y + s],
        ],
        shadeColor( color, -40 )
      );

      this.drawFace(
        [
          [x, y],
          [x + inset, y + inset],
          [x + inset, y + s - inset],
          [x, y + s],
        ],
        shadeColor( color, +10 )
      );

      this.drawFace(
        [
          [x + s, y],
          [x + s, y + s],
          [x + s - inset, y + s - inset],
          [x + s - inset, y + inset],
        ],
        shadeColor( color, -10 )
      );
    }

    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    ctx.strokeRect( x, y, s, s );

    if ( this.preview && !this.filled )
    {
      this.ctx.fillStyle = hexToRgba( this.preview, 0.4 );
      this.ctx.fillRect( this.x, this.y, this.size, this.size );
    }
  }
}
