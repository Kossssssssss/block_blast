import { Piece } from "./piece.js";
import { PIECE_COLORS } from "./utils/colors.js";

export class PieceFactory
{
  static shapes: number[][][] = [
    // 3×1 і 1×3
    [[1, 1, 1]],
    [[1],[1],[1]],

    // 4×1 і 1×4
    [[1,1,1,1]],
    [[1],[1],[1],[1]],

    // L-подібні
    [
      [1,0],
      [1,0],
      [1,1],
    ],
    [
      [0,1],
      [0,1],
      [1,1],
    ],

    // T-подібна
    [
      [1,1,1],
      [0,1,0]
    ],

    // плюс
    [
      [0,1,0],
      [1,1,1],
      [0,1,0]
    ],

    // зигзаги
    [
      [1,1,0],
      [0,1,1]
    ],
    [
      [0,1,1],
      [1,1,0]
    ]
  ];

  static randomPiece(): Piece
  {
    const shape = this.shapes[Math.floor( Math.random() * this.shapes.length )];
    const color = PIECE_COLORS[Math.floor( Math.random() * PIECE_COLORS.length )];
    return new Piece( shape, color );
  }
}
