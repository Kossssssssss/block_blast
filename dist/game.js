import { Board } from "./board.js";
import { PieceFactory } from "./piece_factory.js";
export class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.pieces = [];
        this.held_piece = null;
        this.mouse_x = 0;
        this.mouse_y = 0;
        this.score = 0;
        this.line_clears = 0;
        this.is_game_over = false;
        this.loop = () => {
            this.render();
            requestAnimationFrame(this.loop);
        };
        this.onMouseDown = (e) => {
            const { offsetX, offsetY } = e;
            for (let p of this.pieces) {
                if (p.hitTest(offsetX, offsetY)) {
                    this.held_piece = p;
                    this.mouse_x = offsetX;
                    this.mouse_y = offsetY;
                    break;
                }
            }
        };
        this.onMouseMove = (e) => {
            this.mouse_x = e.offsetX;
            this.mouse_y = e.offsetY;
        };
        this.onMouseUp = (e) => {
            if (!this.held_piece)
                return;
            const row = Math.round((this.held_piece.draw_y - this.board_y) / this.board.cell_size);
            const col = Math.round((this.held_piece.draw_x - this.board_x) / this.board.cell_size);
            if (this.board.placePiece(this.held_piece, row, col)) {
                const cleared = this.board.clearFullLines();
                const lines_cleared = cleared.rows + cleared.cols;
                this.pieces = this.pieces.filter(p => p !== this.held_piece);
                this.held_piece = null;
                if (lines_cleared > 0) {
                    this.line_clears += lines_cleared;
                    this.score += lines_cleared * (this.line_clears * 10);
                }
                if (this.pieces.length === 0) {
                    this.generatePieces();
                }
                let canPlace = false;
                for (let p of this.pieces) {
                    if (this.board.canPlaceAny(p)) {
                        canPlace = true;
                        break;
                    }
                }
                if (!canPlace) {
                    setTimeout(() => this.gameOver(), 1000);
                }
            }
            else {
                this.held_piece.resetToSlot();
                this.held_piece = null;
            }
        };
        this.onTouchStart = (e) => {
            e.preventDefault();
            const pos = this.getTouchPos(e);
            this.onMouseDown({ offsetX: pos.offsetX, offsetY: pos.offsetY });
        };
        this.onTouchMove = (e) => {
            e.preventDefault();
            const pos = this.getTouchPos(e);
            this.onMouseMove({ offsetX: pos.offsetX, offsetY: pos.offsetY });
        };
        this.onTouchEnd = (e) => {
            e.preventDefault();
            const pos = this.getTouchPos(e);
            this.onMouseUp({ offsetX: pos.offsetX, offsetY: pos.offsetY });
        };
        const board_size = 8;
        const max_board_width = this.ctx.canvas.width * 0.9;
        const max_board_height = this.ctx.canvas.height * 0.45;
        const board_width = Math.min(max_board_width, max_board_height);
        const cell_size = Math.floor(board_width / board_size);
        const final_board_width = cell_size * board_size;
        const final_board_height = cell_size * board_size;
        this.board_x = (this.ctx.canvas.width - final_board_width) / 2;
        this.board_y = (this.ctx.canvas.height - final_board_height) / 2.5;
        this.board = new Board(ctx, board_size, board_size, cell_size);
        this.generatePieces();
        const canvas = this.ctx.canvas;
        canvas.addEventListener("mousedown", this.onMouseDown);
        canvas.addEventListener("mousemove", this.onMouseMove);
        canvas.addEventListener("mouseup", this.onMouseUp);
        canvas.addEventListener("touchstart", this.onTouchStart, { passive: false });
        canvas.addEventListener("touchmove", this.onTouchMove, { passive: false });
        canvas.addEventListener("touchend", this.onTouchEnd);
    }
    start() {
        requestAnimationFrame(this.loop);
    }
    gameOver() {
        this.is_game_over = true;
        const msg = `GAME OVER\nScore: ${this.score}`;
        this.ctx.save();
        this.ctx.fillStyle = "rgba(0,0,0,0.7)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = "white";
        this.ctx.font = "bold 48px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText(msg, this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
        this.ctx.restore();
        setTimeout(() => this.resetGame(), 2000);
    }
    render() {
        if (this.is_game_over)
            return;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.renderScore();
        this.board.clearPreview();
        if (this.held_piece) {
            const piece_width_px = this.held_piece.getWidth() * this.board.cell_size;
            const piece_height_px = this.held_piece.getHeight() * this.board.cell_size;
            const center_x = this.mouse_x - piece_width_px / 2;
            const center_y = this.mouse_y - piece_height_px / 2 - this.board.cell_size * 0.6;
            const row = Math.round((center_y - this.board_y) / this.board.cell_size);
            const col = Math.round((center_x - this.board_x) / this.board.cell_size);
            if (this.board.canPlacePiece(this.held_piece, row, col)) {
                this.board.previewPiece(this.held_piece, row, col);
            }
        }
        this.ctx.save();
        this.ctx.translate(this.board_x, this.board_y);
        this.board.render();
        this.ctx.restore();
        this.renderPieces();
        if (this.held_piece) {
            const piece_width_px = this.held_piece.getWidth() * this.board.cell_size;
            const piece_height_px = this.held_piece.getHeight() * this.board.cell_size;
            this.held_piece.setDrawPos(this.mouse_x - piece_width_px / 2, this.mouse_y - piece_height_px / 2 - 30, this.board.cell_size);
            this.held_piece.render(this.ctx);
        }
    }
    resetGame() {
        this.is_game_over = false;
        this.score = 0;
        this.line_clears = 0;
        const board_size = 8;
        const max_board_width = this.ctx.canvas.width * 0.9;
        const max_board_height = this.ctx.canvas.height * 0.45;
        const board_width = Math.min(max_board_width, max_board_height);
        const cell_size = Math.floor(board_width / board_size);
        const final_board_width = cell_size * board_size;
        const final_board_height = cell_size * board_size;
        this.board_x = (this.ctx.canvas.width - final_board_width) / 2;
        this.board_y = (this.ctx.canvas.height - final_board_height) / 2.5;
        this.board = new Board(this.ctx, board_size, board_size, cell_size);
        this.generatePieces();
    }
    renderScore() {
        this.ctx.save();
        this.ctx.fillStyle = "#fff";
        this.ctx.font = "bold 40px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText(`Score: ${this.score}`, this.ctx.canvas.width / 2, this.board_y - 40);
        this.ctx.restore();
    }
    renderPieces() {
        this.pieces.forEach(piece => {
            if (piece !== this.held_piece) {
                piece.render(this.ctx);
            }
        });
    }
    generatePieces() {
        let attempts = 0;
        while (attempts < 200) {
            attempts++;
            const test_board = this.board.clone();
            const pieces = [];
            let success = true;
            for (let i = 0; i < 3; i++) {
                let piece;
                let placed = false;
                let tries = 0;
                do {
                    piece = PieceFactory.randomPiece();
                    tries++;
                    const pos = test_board.findPlacementFor(piece);
                    if (pos) {
                        test_board.placePiece(piece, pos.row, pos.col);
                        pieces.push(piece);
                        placed = true;
                        break;
                    }
                } while (tries < 50);
                if (!placed) {
                    success = false;
                    break;
                }
            }
            if (success) {
                this.pieces = pieces;
                this.layoutPieces();
                return;
            }
        }
        console.warn("Не знайшли комбінацію, очищаємо поле...");
        this.board.reset();
        this.generatePieces();
    }
    layoutPieces() {
        const piece_size = this.board.cell_size / 2;
        const start_y = this.board_y + this.board.rows * this.board.cell_size + 60;
        const inner_gap = 40;
        const total_width = this.pieces.reduce((sum, p) => sum + p.getWidth() * piece_size, 0);
        const all_width = total_width + inner_gap * (this.pieces.length - 1);
        let current_x = (this.ctx.canvas.width - all_width) / 2;
        this.pieces.forEach((piece) => {
            piece.setSlot(current_x, start_y, piece_size);
            current_x += piece.getWidth() * piece_size + inner_gap;
        });
    }
    getTouchPos(e) {
        const rect = this.ctx.canvas.getBoundingClientRect();
        const touch = e.touches[0] || e.changedTouches[0];
        return {
            offsetX: touch.clientX - rect.left,
            offsetY: touch.clientY - rect.top
        };
    }
}
