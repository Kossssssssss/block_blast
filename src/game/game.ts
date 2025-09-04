import { AudioClips } from "../audio/audio_constants.js";
import { audioController } from "../audio/audio_controller.js";
import { Button } from "../components/button.js";
import { Text } from "../components/text.js";
import { ScreenManager, Screens } from "../screen_manager.js";
import { IScreen } from "../types/screen.interface.js";
import { Board } from "./board/board.js";
import { Piece } from "./piece/piece.js";
import { SmartPieceFactory } from "./piece/smart_piece_factory.js";

export class Game implements IScreen
{
  private board!: Board;

  private board_x!: number;
  private board_y!: number;

  private pieces: Piece[] = [];
  private held_piece: Piece | null = null;

  private mouse_x = 0;
  private mouse_y = 0;

  private line_clears: number = 0;

  private is_game_over = false;
  private loop_id: number | null = null;

  private score:         number = 0; 
  private display_score: number = 0; 
  // private score_speed:   number = 1000; 

  private exit_btn!: Button;

  constructor( private ctx: CanvasRenderingContext2D )
  {
    this.initEvents();
    this.createExitButton();
    this.createBoard();
    this.generatePieces();
  }

  start()
  {
    this.is_game_over = false;
    this.loop_id = requestAnimationFrame( this.loop );
  }

  private createExitButton()
  {
    this.exit_btn = new Button(
      this.ctx,
      20,
      20,
      120,
      40,
      "EXIT",
      () => ScreenManager.show( Screens.MENU ),
      {
        fill_color: "#e74c3c",
        border_width: 0,
        radius: 8,
        text_color: "#fff",
        shadow_color: "rgba(0,0,0,0.4)",
        shadow_blur: 6,
        shadow_offset_x: 2,
        shadow_offset_y: 2,
        font: "bold 20px Arial"
      }
    );
  }

  private createBoard()
  {
    const board_size = 8;

    const max_board_width = this.ctx.canvas.width * 0.9;
    const max_board_height = this.ctx.canvas.height * 0.45;

    const board_width = Math.min( max_board_width, max_board_height );

    const cell_size = Math.floor( board_width / board_size );

    const final_board_width = cell_size * board_size;
    const final_board_height = cell_size * board_size;

    this.board_x = ( this.ctx.canvas.width - final_board_width ) / 2;
    this.board_y = ( this.ctx.canvas.height - final_board_height ) / 2.5;

    this.board = new Board( this.ctx, board_size, board_size, cell_size );
  }

  private handleMouseDown = ( e: MouseEvent ) =>
  {
    this.exit_btn.handleMouseDown( e.offsetX, e.offsetY );
  };

  private handleMouseUp = ( e: MouseEvent ) =>
  {
    this.exit_btn.handleMouseUp( e.offsetX, e.offsetY );
  };

  private handleTouchStart = ( e: TouchEvent ) =>
  {
    e.preventDefault();

    const rect = this.ctx.canvas.getBoundingClientRect();
    const touch = e.touches[0];

    const offset_x = touch.clientX - rect.left;
    const offset_y = touch.clientY - rect.top;

    this.exit_btn.handleMouseDown( offset_x, offset_y );
  };

  private handleTouchEnd = ( e: TouchEvent ) =>
  {
    e.preventDefault();

    const rect = this.ctx.canvas.getBoundingClientRect();
    const touch = e.changedTouches[0];

    const offset_x = touch.clientX - rect.left;
    const offset_y = touch.clientY - rect.top;

    this.exit_btn.handleMouseUp( offset_x, offset_y );
  };

  private initEvents()
  {
    const canvas = this.ctx.canvas;
    canvas.addEventListener( "mousedown", this.onMouseDown );
    canvas.addEventListener( "mousemove", this.onMouseMove );
    canvas.addEventListener( "mouseup", this.onMouseUp );

    canvas.addEventListener( "mousedown", this.handleMouseDown );
    canvas.addEventListener( "mouseup", this.handleMouseUp );

    canvas.addEventListener( "touchstart", this.handleTouchStart );
    canvas.addEventListener( "touchend", this.handleTouchEnd );

    canvas.addEventListener( "touchstart", this.onTouchStart, { passive: false } );
    canvas.addEventListener( "touchmove", this.onTouchMove, { passive: false } );
    canvas.addEventListener( "touchend", this.onTouchEnd );
  }

  private removeEvents()
  {
    const canvas = this.ctx.canvas;
    canvas.removeEventListener( "mousedown", this.onMouseDown );
    canvas.removeEventListener( "mousemove", this.onMouseMove );
    canvas.removeEventListener( "mouseup", this.onMouseUp );

    canvas.removeEventListener( "mousedown", this.handleMouseDown );
    canvas.removeEventListener( "mouseup", this.handleMouseUp );

    canvas.removeEventListener( "touchstart", this.handleTouchStart );
    canvas.removeEventListener( "touchend", this.handleTouchEnd );

    canvas.removeEventListener( "touchstart", this.onTouchStart );
    canvas.removeEventListener( "touchmove", this.onTouchMove );
    canvas.removeEventListener( "touchend", this.onTouchEnd );
  }

  public destroy()
  {
    this.is_game_over = true;

    cancelAnimationFrame( this.loop_id! );
    this.loop_id = null;

    this.removeEvents();

    this.held_piece = null;
    this.pieces = [];
    this.board = null as any;
  }

  private renderExitBtn()
  {
    this.exit_btn.render();
  }

  private gameOver()
  {
    audioController.playSound( AudioClips.LOSE );
    this.is_game_over = true;

    const font_size = Math.min( 36, Math.floor( this.ctx.canvas.width * 0.07 ) );

    const game_over_text = new Text(
      this.ctx,
      this.ctx.canvas.width / 2, 
      this.ctx.canvas.height / 2,
      `GAME OVER\nScore: ${this.score}`,
      font_size,
      "white",
      "center"
    );

    this.ctx.save();
    this.ctx.fillStyle = "rgba(0,0,0,0.7)";
    this.ctx.fillRect( 0, 0, this.ctx.canvas.width, this.ctx.canvas.height );

    game_over_text.render();
    this.ctx.restore();

    setTimeout( () => this.resetGame(), 2000 );
  }

  private loop = () =>
  {
    this.render();
    this.loop_id = requestAnimationFrame( this.loop );
  };

  private render()
  {
    if ( this.is_game_over ) return; 

    this.ctx.clearRect( 0, 0, this.ctx.canvas.width, this.ctx.canvas.height );

    if ( this.display_score < this.score )
    {
      const diff = this.score - this.display_score;

      const base_increment = 1 / 60;

      const increment = Math.min( diff, Math.max( 0.1, diff * base_increment ) );

      this.display_score += increment;

      if ( this.display_score > this.score )
      {
        this.display_score = this.score;
      }
    }
    this.renderScore();
    this.renderExitBtn();

    this.board.clearPreview();

    if ( this.held_piece )
    {
      const preview_x = this.held_piece.draw_x;
      const preview_y = this.held_piece.draw_y;

      const row = Math.round( ( preview_y - this.board_y ) / this.board.cell_size );
      const col = Math.round( ( preview_x - this.board_x ) / this.board.cell_size );

      if ( this.board.canPlacePiece( this.held_piece, row, col ) )
      {
        this.board.previewPiece( this.held_piece, row, col );
      }
    }

    this.ctx.save();
    this.ctx.translate( this.board_x, this.board_y );
    this.board.render();
    this.ctx.restore();

    this.renderPieces();

    if ( this.held_piece )
    {
      const piece_width_px = this.held_piece.getWidth() * this.board.cell_size;
      const piece_height_px = this.held_piece.getHeight() * this.board.cell_size;

      this.held_piece.setDrawPos(
        this.mouse_x - piece_width_px / 2,
        this.mouse_y - piece_height_px / 2 - 130,
        this.board.cell_size
      );

      this.held_piece.render( this.ctx );
    }
  }

  public resetGame()
  {
    this.is_game_over = false;
    this.score = 0;
    this.display_score = 0;
    this.line_clears = 0;

    const board_size = 8;

    const max_board_width = this.ctx.canvas.width * 0.9;
    const max_board_height = this.ctx.canvas.height * 0.45;

    const board_width = Math.min( max_board_width, max_board_height );

    const cell_size = Math.floor( board_width / board_size );

    const final_board_width = cell_size * board_size;
    const final_board_height = cell_size * board_size;

    this.board_x = ( this.ctx.canvas.width - final_board_width ) / 2;
    this.board_y = ( this.ctx.canvas.height - final_board_height ) / 2.5;

    this.board = new Board( this.ctx, board_size, board_size, cell_size );

    this.generatePieces();
  }

  private renderScore()
  {
    this.ctx.save();
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "bold 40px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `Score: ${Math.floor( this.display_score )}`,
      this.ctx.canvas.width / 2,
      this.board_y - 40
    );
    this.ctx.restore();
  }

  private renderPieces()
  {
    this.pieces.forEach( piece =>
    {
      if ( piece !== this.held_piece )
      {
        piece.render( this.ctx );
      }
    } );
  }

  private generatePieces()
  {
    const smartFactory = new SmartPieceFactory( this.board );
    const pieces = smartFactory.pickPieces();

    if( !pieces )
    {
      console.warn( "⚠️ SmartPieceFactory: not found 3 pieces, shuffle board" );

      this.board.reset();
      this.generatePieces();
      return;
    }

    this.pieces = pieces;
    this.layoutPieces();
  }

  private layoutPieces()
  {
    const piece_size = this.board.cell_size / 2;
    const start_y = this.board_y + this.board.rows * this.board.cell_size + 60;

    const inner_gap = 40;
    const total_width = this.pieces.reduce(
      ( sum, p ) => sum + p.getWidth() * piece_size,
      0
    );
    const all_width = total_width + inner_gap * ( this.pieces.length - 1 );
    let current_x = ( this.ctx.canvas.width - all_width ) / 2;

    this.pieces.forEach( ( piece ) =>
    {
      piece.setSlot( current_x, start_y, piece_size );
      current_x += piece.getWidth() * piece_size + inner_gap;
    } );
  }

  private onMouseDown = ( e: MouseEvent ) =>
  {
    const { offsetX, offsetY } = e;

    for ( let p of this.pieces )
    {
      if ( p.hitTest( offsetX, offsetY ) )
      {
        this.held_piece = p;
        this.mouse_x = offsetX;
        this.mouse_y = offsetY;

        const piece_size = p.getWidth() * p.getHeight();
        console.log('piece_size', piece_size);
        if ( piece_size <= 4 )
        {
          audioController.playSound( AudioClips.PICK_SMALL );
        } else
        {
          audioController.playSound( AudioClips.PICK_BIG );
        }

        break;
      }
    }
  };

  private onMouseMove = ( e: MouseEvent ) =>
  {
    this.mouse_x = e.offsetX;
    this.mouse_y = e.offsetY;
  };

  private onMouseUp = ( e: MouseEvent ) =>
  {
    if ( !this.held_piece ) return;

    const row = Math.round( ( this.held_piece.draw_y - this.board_y ) / this.board.cell_size );
    const col = Math.round( ( this.held_piece.draw_x - this.board_x ) / this.board.cell_size );

    if ( this.board.placePiece( this.held_piece, row, col ) )
    {
      const piece_size = this.held_piece.getWidth() * this.held_piece.getHeight();
      if ( piece_size <= 4 )
      {
        audioController.playSound( AudioClips.PUT_SMALL );
      } else
      {
        audioController.playSound( AudioClips.PUT_BIG );
      }

      const cleared = this.board.clearFullLines();
      const lines_cleared = cleared.rows + cleared.cols;
      this.pieces = this.pieces.filter( p => p !== this.held_piece );

      const piece_blocks = this.held_piece.getBlocksCount();
      this.score += piece_blocks;

      this.held_piece = null;

      if ( lines_cleared > 0 )
      {
        if ( lines_cleared === 1 )
        {
          audioController.playSound( AudioClips.COMBO3 );
        } else
        {
          audioController.playSound( AudioClips.COMBO2 );
        }

        this.line_clears += lines_cleared;
        this.score += lines_cleared * ( this.line_clears * 10 );
      }

      if ( this.pieces.length === 0 )
      {
        this.generatePieces();
      }

      let canPlace = false;
      for ( let p of this.pieces )
      {
        if ( this.board.canPlaceAny( p ) )
        {
          canPlace = true;
          break;
        }
      }

      if ( !canPlace )
      {
        setTimeout( () => this.gameOver(), 1000 );
      }
    } else
    {
      audioController.playSound( AudioClips.DROP );

      this.held_piece.resetToSlot();
      this.held_piece = null;
    }
  };

  private getTouchPos( e: TouchEvent )
  {
    const rect = this.ctx.canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return {
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top
    };
  }

  private onTouchStart = ( e: TouchEvent ) =>
  {
    e.preventDefault();
    const pos = this.getTouchPos( e );
    this.onMouseDown( { offsetX: pos.offsetX, offsetY: pos.offsetY } as MouseEvent );
  };

  private onTouchMove = ( e: TouchEvent ) =>
  {
    e.preventDefault();
    const pos = this.getTouchPos( e );
    this.onMouseMove( { offsetX: pos.offsetX, offsetY: pos.offsetY } as MouseEvent );
  };

  private onTouchEnd = ( e: TouchEvent ) =>
  {
    e.preventDefault();
    const pos = this.getTouchPos( e );
    this.onMouseUp( { offsetX: pos.offsetX, offsetY: pos.offsetY } as MouseEvent );
  };
}
