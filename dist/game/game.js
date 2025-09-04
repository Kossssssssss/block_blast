import { Button } from "../components/button.js";
import { ScreenManager, Screens } from "../screen_manager.js";
import { Board } from "./board/board.js";
import { SmartPieceFactory } from "./piece/smart_piece_factory.js";
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
        this.loop_id = null;
        this.handleMouseDown = (e) => {
            this.exit_btn.handleMouseDown(e.offsetX, e.offsetY);
        };
        this.handleMouseUp = (e) => {
            this.exit_btn.handleMouseUp(e.offsetX, e.offsetY);
        };
        this.loop = () => {
            this.render();
            this.loop_id = requestAnimationFrame(this.loop);
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
        this.initEvents();
        this.createExitButton();
        this.createBoard();
        this.generatePieces();
    }
    start() {
        this.is_game_over = false;
        this.loop_id = requestAnimationFrame(this.loop);
    }
    createExitButton() {
        this.exit_btn = new Button(this.ctx, 20, 20, 120, 40, "EXIT", () => ScreenManager.show(Screens.MENU), {
            fill_color: "#e74c3c",
            border_width: 0,
            radius: 8,
            text_color: "#fff",
            shadow_color: "rgba(0,0,0,0.4)",
            shadow_blur: 6,
            shadow_offset_x: 2,
            shadow_offset_y: 2,
            font: "bold 20px Arial"
        });
    }
    createBoard() {
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
    }
    initEvents() {
        const canvas = this.ctx.canvas;
        canvas.addEventListener("mousedown", this.onMouseDown);
        canvas.addEventListener("mousemove", this.onMouseMove);
        canvas.addEventListener("mouseup", this.onMouseUp);
        canvas.addEventListener("mousedown", this.handleMouseDown);
        canvas.addEventListener("mouseup", this.handleMouseUp);
        canvas.addEventListener("touchstart", this.onTouchStart, { passive: false });
        canvas.addEventListener("touchmove", this.onTouchMove, { passive: false });
        canvas.addEventListener("touchend", this.onTouchEnd);
    }
    removeEvents() {
        const canvas = this.ctx.canvas;
        canvas.removeEventListener("mousedown", this.onMouseDown);
        canvas.removeEventListener("mousemove", this.onMouseMove);
        canvas.removeEventListener("mouseup", this.onMouseUp);
        canvas.removeEventListener("mousedown", this.handleMouseDown);
        canvas.removeEventListener("mouseup", this.handleMouseUp);
        canvas.removeEventListener("touchstart", this.onTouchStart);
        canvas.removeEventListener("touchmove", this.onTouchMove);
        canvas.removeEventListener("touchend", this.onTouchEnd);
    }
    destroy() {
        this.is_game_over = true;
        cancelAnimationFrame(this.loop_id);
        this.loop_id = null;
        this.removeEvents();
        this.held_piece = null;
        this.pieces = [];
        this.board = null;
    }
    renderExitBtn() {
        this.exit_btn.render();
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
        this.renderExitBtn();
        this.board.clearPreview();
        if (this.held_piece) {
            const preview_x = this.held_piece.draw_x;
            const preview_y = this.held_piece.draw_y;
            const row = Math.round((preview_y - this.board_y) / this.board.cell_size);
            const col = Math.round((preview_x - this.board_x) / this.board.cell_size);
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
            this.held_piece.setDrawPos(this.mouse_x - piece_width_px / 2, this.mouse_y - piece_height_px / 2 - 130, this.board.cell_size);
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
        const smartFactory = new SmartPieceFactory(this.board);
        const pieces = smartFactory.pickPieces();
        if (!pieces) {
            console.warn("⚠️ SmartPieceFactory: not found 3 pieces, shuffle board");
            this.board.reset();
            this.generatePieces();
            return;
        }
        this.pieces = pieces;
        this.layoutPieces();
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
