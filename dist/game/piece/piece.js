import { Cell } from "../board/cell.js";
export class Piece {
    constructor(shape, color = "#e67e22") {
        this.shape = shape;
        this.color = color;
        this.draw_x = 0;
        this.draw_y = 0;
        this.draw_size = 0;
        this.slot_x = 0;
        this.slot_y = 0;
        this.slot_size = 0;
    }
    setSlot(x, y, size) {
        this.draw_x = x;
        this.draw_y = y;
        this.draw_size = size;
        this.slot_x = x;
        this.slot_y = y;
        this.slot_size = size;
    }
    setDrawPos(x, y, size) {
        this.draw_x = x;
        this.draw_y = y;
        this.draw_size = size;
    }
    resetToSlot() {
        this.draw_x = this.slot_x;
        this.draw_y = this.slot_y;
        this.draw_size = this.slot_size;
    }
    render(ctx) {
        for (let r = 0; r < this.shape.length; r++) {
            for (let c = 0; c < this.shape[r].length; c++) {
                if (this.shape[r][c] === 1) {
                    const cell = new Cell(ctx, this.draw_size, true, this.color);
                    cell.setPosition(this.draw_x + c * this.draw_size, this.draw_y + r * this.draw_size);
                    cell.render();
                }
            }
        }
    }
    hitTest(x, y) {
        const width = this.getWidth() * this.draw_size;
        const height = this.getHeight() * this.draw_size;
        const padding = 20;
        return (x >= this.draw_x - padding &&
            x <= this.draw_x + width + padding &&
            y >= this.draw_y - padding &&
            y <= this.draw_y + height + padding);
    }
    getWidth() { return this.shape[0].length; }
    getHeight() { return this.shape.length; }
}
