import { ScreenManager, Screens } from "./screen_manager.js";

window.addEventListener( "load", () =>
{
  const game_canvas = document.getElementById( "gameCanvas" ) as HTMLCanvasElement;
  const game_ctx = game_canvas.getContext( "2d" );

  const menu_canvas = document.getElementById( "menuCanvas" ) as HTMLCanvasElement;
  const menu_ctx = menu_canvas.getContext( "2d" );

  ScreenManager.register( Screens.MENU, menu_canvas );
  ScreenManager.register( Screens.GAME, game_canvas );

  function resizeCanvas()
  {
    game_canvas.width = window.innerWidth;
    game_canvas.height = window.innerHeight;

    menu_canvas.width = window.innerWidth;
    menu_canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener( "resize", resizeCanvas );

  if ( !game_ctx || !menu_ctx )
  {
    throw new Error( "Canvas context not found!" );
  }

  ScreenManager.show( Screens.MENU );
} );


