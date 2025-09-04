import { IButtonOptions } from "../types/button.interface";

export class Button
{
  private is_pressed = false;

  private current_scale = 1;  
  private target_scale = 1;     
  private animation_speed = 0.2; 

  constructor(
    private ctx: CanvasRenderingContext2D,
    private x: number,
    private y: number,
    private w: number,
    private h: number,
    private label: string,
    private onClick: () => void,
    private options: IButtonOptions,
  ) {}

  public render()
  {
    const ctx = this.ctx;
    const s = this.options;

    this.current_scale += ( this.target_scale - this.current_scale ) * this.animation_speed;

    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;

    ctx.save();
    ctx.translate( cx, cy );
    ctx.scale( this.current_scale, this.current_scale );
    ctx.translate( -cx, -cy );

    ctx.shadowColor = s.shadow_color ?? "transparent";
    ctx.shadowBlur = s.shadow_blur ?? 0;
    ctx.shadowOffsetX = s.shadow_offset_x ?? 0;
    ctx.shadowOffsetY = s.shadow_offset_y ?? 0;

    ctx.fillStyle = s.fill_color;

    const radius = s.radius ?? 10;

    ctx.beginPath();
    ctx.moveTo( this.x + radius, this.y );
    ctx.lineTo( this.x + this.w - radius, this.y );
    ctx.arcTo( this.x + this.w, this.y, this.x + this.w, this.y + radius, radius );
    ctx.lineTo( this.x + this.w, this.y + this.h - radius );
    ctx.arcTo( this.x + this.w, this.y + this.h, this.x + this.w - radius, this.y + this.h, radius );
    ctx.lineTo( this.x + radius, this.y + this.h );
    ctx.arcTo( this.x, this.y + this.h, this.x, this.y + this.h - radius, radius );
    ctx.lineTo( this.x, this.y + radius );
    ctx.arcTo( this.x, this.y, this.x + radius, this.y, radius );
    ctx.closePath();

    ctx.fill();

    if ( s.border_width && s.border_width > 0 )
    {
      ctx.strokeStyle = s.border_color ?? "#000";
      ctx.lineWidth = s.border_width;
      ctx.stroke();
    }

    ctx.shadowColor = "transparent";
    ctx.fillStyle = s.text_color ?? "#fff";
    ctx.font = s.font ?? "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText( this.label, this.x + this.w / 2, this.y + this.h / 2 );

    ctx.restore();
  }

  public handleMouseDown( offset_x: number, offset_y: number )
  {
    if ( this.contains( offset_x, offset_y ) )
    {
      this.is_pressed = true;
      this.target_scale = 0.95; 
    }
  }

  public handleMouseUp( offset_x: number, offset_y: number )
  {
    if ( this.is_pressed && this.contains( offset_x, offset_y ) )
    {
      this.onClick();
    }
    this.is_pressed = false;
    this.target_scale = 1;
  }

  private contains( offset_x: number, offset_y: number ): boolean
  {
    return (
      offset_x >= this.x &&
      offset_x <= this.x + this.w &&
      offset_y >= this.y &&
      offset_y <= this.y + this.h
    );
  }
}
