import { Game } from "./game/game.js";
import { Menu } from "./menu/menu.js";
import { IScreen } from "./types/screen.interface.js";

export enum Screens
{
  MENU = "menu",
  GAME = "game",
}

export class ScreenManager
{
  private static screens: Record<string, HTMLCanvasElement> = {};
  private static instances: Record<string, IScreen | null> = {};
  private static current: string | null = null;

  static register( name: Screens, canvas: HTMLCanvasElement )
  {
    this.screens[name] = canvas;
    canvas.style.display = "none";
    this.instances[name] = null;
  }

  static show( name: Screens )
  {
    if ( !this.screens[name] )
    {
      console.warn( `Screen "${name}" не зареєстрований!` );
      return;
    }

    if ( this.current && this.instances[this.current] )
    {
      console.log('destroy', this.current, this.instances[this.current]);
      this.instances[this.current]!.destroy();
      this.instances[this.current] = null;
    }

    Object.values( this.screens ).forEach( ( c ) => ( c.style.display = "none" ) );

    this.screens[name].style.display = "block";
    this.current = name;

    const ctx = this.screens[name].getContext( "2d" );
    if ( !ctx ) return;

    switch ( name )
    {
      case Screens.MENU:
        this.instances[name] = new Menu( ctx );
        break;
      case Screens.GAME:
        this.instances[name] = new Game( ctx );
        break;
    }

    this.instances[name]!.start();
  }

  static getCurrent(): string | null
  {
    return this.current;
  }
}
