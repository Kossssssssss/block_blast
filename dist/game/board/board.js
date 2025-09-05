import { Cell } from "./cell.js";
export class Board {
    constructor(ctx, rows, cols, cell_size) {
        this.ctx = ctx;
        this.rows = rows;
        this.cols = cols;
        this.cell_size = cell_size;
        this.grid = [];
        this.generateInitialBoard();
    }
    reset() {
        this.generateInitialBoard();
    }
    generateInitialBoard() {
        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                row.push(new Cell(this.ctx, this.cell_size, false));
            }
            this.grid.push(row);
        }
        const total_cells = this.rows * this.cols;
        const max_filled = Math.floor(total_cells * 0.4);
        const all_positions = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                all_positions.push({ r, c });
            }
        }
        for (let i = all_positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [all_positions[i], all_positions[j]] = [all_positions[j], all_positions[i]];
        }
        for (let i = 0; i < max_filled; i++) {
            const { r, c } = all_positions[i];
            this.grid[r][c].filled = true;
        }
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (!this.grid[r][c].filled) {
                    let surrounded = true;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            if (dr === 0 && dc === 0)
                                continue;
                            const nr = r + dr;
                            const nc = c + dc;
                            if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                                if (!this.grid[nr][nc].filled) {
                                    surrounded = false;
                                    break;
                                }
                            }
                        }
                        if (!surrounded)
                            break;
                    }
                    if (surrounded) {
                        this.grid[r][c].filled = true;
                    }
                }
            }
        }
    }
    getGrid() {
        return this.grid;
    }
    canPlaceAny(piece) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.canPlacePiece(piece, r, c)) {
                    return true;
                }
            }
        }
        return false;
    }
    render() {
        this.renderBackground();
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c].setPosition(c * this.cell_size, r * this.cell_size);
                this.grid[r][c].render();
            }
        }
    }
    clearFullLines() {
        const full_rows = [];
        const full_cols = [];
        for (let r = 0; r < this.rows; r++) {
            if (this.grid[r].every(cell => cell.filled)) {
                full_rows.push(r);
            }
        }
        for (let c = 0; c < this.cols; c++) {
            let full = true;
            for (let r = 0; r < this.rows; r++) {
                if (!this.grid[r][c].filled) {
                    full = false;
                    break;
                }
            }
            if (full)
                full_cols.push(c);
        }
        for (let r of full_rows) {
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c].filled = false;
            }
        }
        for (let c of full_cols) {
            for (let r = 0; r < this.rows; r++) {
                this.grid[r][c].filled = false;
            }
        }
        return { rows: full_rows.length, cols: full_cols.length };
    }
    renderBackground() {
        const ctx = this.ctx;
        const width = this.cols * this.cell_size;
        const height = this.rows * this.cell_size;
        const x = 0;
        const y = 0;
        const outline = 6; // товщина рамки
        const radius = 10; // радіус кутів рамки
        const offset = 0; // зміщення тіні
        const outerX = x - outline;
        const outerY = y - outline;
        const outerW = width + outline * 2;
        const outerH = height + outline * 2;
        ctx.save();
        ctx.fillStyle = "#283C6F";
        ctx.beginPath();
        this.roundRect(ctx, outerX, outerY, outerW, outerH, radius);
        ctx.fill();
        ctx.fillStyle = "#4D61A0";
        ctx.beginPath();
        this.roundRect(ctx, outerX + offset, outerY + offset, outerW, outerH, radius);
        ctx.fill();
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, "#152448");
        gradient.addColorStop(1, "#101c38");
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
        ctx.restore();
    }
    roundRect(ctx, x, y, w, h, r) {
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
    }
    canPlacePiece(piece, row, col) {
        for (let r = 0; r < piece.getHeight(); r++) {
            for (let c = 0; c < piece.getWidth(); c++) {
                if (piece.shape[r][c] === 1) {
                    const br = row + r;
                    const bc = col + c;
                    if (br < 0 || br >= this.rows || bc < 0 || bc >= this.cols)
                        return false;
                    if (this.grid[br][bc].filled)
                        return false;
                }
            }
        }
        return true;
    }
    previewPiece(piece, row, col) {
        this.clearPreview();
        for (let r = 0; r < piece.getHeight(); r++) {
            for (let c = 0; c < piece.getWidth(); c++) {
                if (piece.shape[r][c] === 1) {
                    const br = row + r;
                    const bc = col + c;
                    if (br >= 0 && br < this.rows && bc >= 0 && bc < this.cols) {
                        this.grid[br][bc].hover_color = piece.color;
                        this.grid[br][bc].preview = piece.color;
                    }
                }
            }
        }
        for (let r = 0; r < this.rows; r++) {
            if (this.grid[r].every(cell => cell.filled || cell.hover_color)) {
                for (let c = 0; c < this.cols; c++) {
                    if (this.grid[r][c].filled) {
                        this.grid[r][c].hover_color = piece.color;
                    }
                }
            }
        }
        for (let c = 0; c < this.cols; c++) {
            let full = true;
            for (let r = 0; r < this.rows; r++) {
                if (!this.grid[r][c].filled && !this.grid[r][c].hover_color) {
                    full = false;
                    break;
                }
            }
            if (full) {
                for (let r = 0; r < this.rows; r++) {
                    if (this.grid[r][c].filled) {
                        this.grid[r][c].hover_color = piece.color;
                    }
                }
            }
        }
    }
    clearPreview() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c].hover_color = null;
                this.grid[r][c].preview = null;
            }
        }
    }
    placePiece(piece, row, col) {
        if (!this.canPlacePiece(piece, row, col))
            return false;
        for (let r = 0; r < piece.getHeight(); r++) {
            for (let c = 0; c < piece.getWidth(); c++) {
                if (piece.shape[r][c] === 1) {
                    const br = row + r;
                    const bc = col + c;
                    this.grid[br][bc].filled = true;
                    this.grid[br][bc].base_color = piece.color;
                }
            }
        }
        return true;
    }
    clone() {
        const new_board = new Board(this.ctx, this.rows, this.cols, this.cell_size);
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                new_board.grid[r][c].filled = this.grid[r][c].filled;
                new_board.grid[r][c].base_color = this.grid[r][c].base_color;
            }
        }
        return new_board;
    }
    findPlacementFor(piece) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.canPlacePiece(piece, r, c)) {
                    return { row: r, col: c };
                }
            }
        }
        return null;
    }
}
