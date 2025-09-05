import { Piece } from "./piece.js";
import { PieceFactory } from "./piece_factory.js";
import { PIECE_COLORS } from "../../utils/colors.js";
export class SmartPieceFactory {
    constructor(board) {
        this.board = board;
    }
    pickPieces() {
        const fake_board = this.board.clone();
        const result = [];
        for (let k = 0; k < 3; k++) {
            let candidates = [];
            for (const shape of PieceFactory.shapes) {
                const piece = new Piece(shape, PIECE_COLORS[Math.floor(Math.random() * PIECE_COLORS.length)]);
                for (let row = 0; row < fake_board.rows; row++) {
                    for (let col = 0; col < fake_board.cols; col++) {
                        if (fake_board.canPlacePiece(piece, row, col)) {
                            const clone = fake_board.clone();
                            clone.placePiece(piece, row, col);
                            const cleared = clone.clearFullLines();
                            const cleared_count = cleared.rows + cleared.cols;
                            const score = this.evaluatePiece(fake_board, piece) + cleared_count * 100;
                            candidates.push({ piece, score, row, col });
                        }
                    }
                }
            }
            if (candidates.length === 0)
                return null;
            candidates.sort((a, b) => b.score - a.score);
            const top_7 = candidates.slice(0, 7);
            const best = top_7[Math.floor(Math.random() * top_7.length)];
            fake_board.placePiece(best.piece, best.row, best.col);
            fake_board.clearFullLines();
            result.push(best.piece);
        }
        return result;
    }
    evaluatePiece(board, piece) {
        const blocks = piece.getBlocksCount();
        let score = blocks <= 4 ? blocks * 10 : blocks * 5;
        for (let row = 0; row < board.rows; row++) {
            for (let col = 0; col < board.cols; col++) {
                if (board.canPlacePiece(piece, row, col)) {
                    let bonus = 0;
                    const clone = board.clone();
                    clone.placePiece(piece, row, col);
                    const cleared = clone.clearFullLines();
                    const cleared_count = cleared.rows + cleared.cols;
                    if (cleared_count > 0)
                        bonus += cleared_count * 50;
                    for (let r = 0; r < board.rows; r++) {
                        const row_cells = board.getGrid()[r];
                        const empty = row_cells.filter(c => !c.filled).length;
                        if (empty === 1)
                            bonus += 10;
                    }
                    for (let c = 0; c < board.cols; c++) {
                        let empty = 0;
                        for (let r = 0; r < board.rows; r++) {
                            if (!board.getGrid()[r][c].filled) {
                                empty++;
                            }
                        }
                        if (empty === 1)
                            bonus += 10;
                    }
                    score = Math.max(score, bonus + piece.getWidth() * piece.getHeight());
                }
            }
        }
        score += Math.random() * 30;
        return score;
    }
}
