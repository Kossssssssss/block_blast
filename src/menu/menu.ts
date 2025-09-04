import { Button } from "../components/button.js";
import { Text } from "../components/text.js";
import { ScreenManager, Screens } from "../screen_manager.js";
import { IScreen } from "../types/screen.interface.js";

export class Menu implements IScreen
{
  private loop_id: number | null = null;

  private start_btn!: Button;
  private title!: Text;

  constructor(
    private ctx: CanvasRenderingContext2D,
  )
  {
    this.initEvents();
    this.createComponents();
  }

  private createComponents()
  {
    const button_w = 200;
    const button_h = 60;
    const button_x = this.ctx.canvas.width / 2 - button_w / 2;
    const button_y = 350;

    this.start_btn = new Button(
      this.ctx,
      button_x,
      button_y,
      button_w,
      button_h,
      "START",
      () => ScreenManager.show( Screens.GAME ),
      {
        fill_color: "#19C9A3",
        radius: 10,
        shadow_blur: 10,
        shadow_color: "#1860B2",
        shadow_offset_x: 2,
        shadow_offset_y: 2,
      }
    );

    const title_x = this.ctx.canvas.width / 2;
    const title_y = 150;

    this.title = new Text(
      this.ctx,
      title_x,
      title_y,
      "BLOCK RUSH",
      50,
      "white"
    );
  }

  private loop = () =>
  {
    this.render();
    this.loop_id = requestAnimationFrame( this.loop );
  };


  public render()
  {
    this.ctx.clearRect( 0, 0, this.ctx.canvas.width, this.ctx.canvas.height );

    this.ctx.fillStyle = "#3498db";
    this.ctx.fillRect( 0, 0, this.ctx.canvas.width, this.ctx.canvas.height );

    this.title.render();
    this.start_btn.render();
  }

  private handleMouseDown = ( e: MouseEvent ) =>
  {
    this.start_btn.handleMouseDown( e.offsetX, e.offsetY );
  };

  private handleMouseUp = ( e: MouseEvent ) =>
  {
    this.start_btn.handleMouseUp( e.offsetX, e.offsetY );
  };

  private initEvents()
  {
    this.ctx.canvas.addEventListener( "mousedown", this.handleMouseDown );
    this.ctx.canvas.addEventListener( "mouseup", this.handleMouseUp );
  }

  private removeEvents()
  {
    this.ctx.canvas.removeEventListener( "mousedown", this.handleMouseDown );
    this.ctx.canvas.removeEventListener( "mouseup", this.handleMouseUp );
  }

  public destroy()
  {
    if ( this.loop_id )
    {
      cancelAnimationFrame( this.loop_id );
      this.loop_id = null;
    }

    this.removeEvents(); // ✅ прибрали слухачі
    this.start_btn = null!;
    this.title = null!;
  }

  public start()
  {
    this.loop_id = requestAnimationFrame( this.loop );
  }
}
