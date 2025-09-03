import { Cell } from "./cell.js";

export class Piece
{
  public draw_x = 0;
  public draw_y = 0;
  public draw_size = 0;

  public slot_x = 0;
  public slot_y = 0;
  public slot_size = 0;

  constructor( public shape: number[][], public color: string = "#e67e22" ) {}

  public setSlot( x: number, y: number, size: number )
  {
    this.draw_x = x;
    this.draw_y = y;
    this.draw_size = size;

    this.slot_x = x;
    this.slot_y = y;
    this.slot_size = size;
  }

  public setDrawPos( x: number, y: number, size: number )
  {
    this.draw_x = x;
    this.draw_y = y;
    this.draw_size = size;
  }

  public resetToSlot() {
    this.draw_x = this.slot_x;
    this.draw_y = this.slot_y;
    this.draw_size = this.slot_size;
  }

  public render( ctx: CanvasRenderingContext2D )
  {
    for ( let r = 0; r < this.shape.length; r++ )
    {
      for ( let c = 0; c < this.shape[r].length; c++ )
      {
        if ( this.shape[r][c] === 1 )
        {
          const cell = new Cell( ctx, this.draw_size, true, this.color );
          cell.setPosition( this.draw_x + c * this.draw_size, this.draw_y + r * this.draw_size );
          cell.render();
        }
      }
    }
  }

  public hitTest( x: number, y: number ): boolean
  {
    const width = this.getWidth() * this.draw_size;
    const height = this.getHeight() * this.draw_size;
    return (
      x >= this.draw_x &&
      x <= this.draw_x + width &&
      y >= this.draw_y &&
      y <= this.draw_y + height
    );
  }

  public getWidth() { return this.shape[0].length; }
  public getHeight() { return this.shape.length; }
}
