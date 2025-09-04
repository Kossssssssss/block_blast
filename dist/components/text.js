export class Text {
    constructor(ctx, x, y, text, font_size = 32, color = "#fff", align = "center") {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.text = text;
        this.font_size = font_size;
        this.color = color;
        this.align = align;
    }
    render() {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.font_size}px Arial`;
        ctx.textAlign = this.align;
        ctx.textBaseline = "middle";
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}
