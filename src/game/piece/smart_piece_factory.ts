import { Board } from "../board/board.js";
import { Piece } from "./piece.js";
import { PieceFactory } from "./piece_factory.js";
import { PIECE_COLORS } from "../../utils/colors.js";

export class SmartPieceFactory
{
  constructor( private board: Board ) {}

  pickPieces(): Piece[] | null
  {
    const fake_board = this.board.clone();
    const scored: { piece: Piece; score: number }[] = [];

    for ( const shape of PieceFactory.shapes )
    {
      const piece = new Piece(
        shape,
        PIECE_COLORS[Math.floor( Math.random() * PIECE_COLORS.length )]
      );
      const score = this.evaluatePiece( fake_board, piece );
      scored.push( { piece, score } );
    }

    scored.sort( ( a, b ) => b.score - a.score );

    const result: Piece[] = [];
    for ( const { piece } of scored )
    {
      const pos = fake_board.findPlacementFor( piece );
      if ( pos )
      {
        fake_board.placePiece( piece, pos.row, pos.col );
        result.push( piece );
      }
      if ( result.length === 3 ) break;
    }

    if ( result.length < 3 )
    {
      return null;
    }

    return result;
  }

  private evaluatePiece( board: Board, piece: Piece ): number
  {
    let score = piece.getWidth() * piece.getHeight();

    for ( let row = 0; row < board.rows; row++ )
    {
      for ( let col = 0; col < board.cols; col++ )
      {
        if ( board.canPlacePiece( piece, row, col ) )
        {
          let bonus = 0;

          const clone = board.clone();
          clone.placePiece( piece, row, col );
          const cleared = clone.clearFullLines();
          const cleared_count = cleared.rows + cleared.cols;

          if ( cleared_count > 0 ) bonus += cleared_count * 50;

          for ( let r = 0; r < board.rows; r++ )
          {
            const row_cells = board.getGrid()[r];
            const empty = row_cells.filter( c => !c.filled ).length;
            if ( empty === 1 ) bonus += 10;
          }

          for ( let c = 0; c < board.cols; c++ )
          {
            let empty = 0;
            for ( let r = 0; r < board.rows; r++ )
            {
              if ( !board.getGrid()[r][c].filled )
              {
                empty++;
              }
            }
            if ( empty === 1 ) bonus += 10;
          }

          score = Math.max( score, bonus + piece.getWidth() * piece.getHeight() );
        }
      }
    }
    return score;
  }
}
