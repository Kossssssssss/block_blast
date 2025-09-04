import { Button } from "../components/button.js";
import { Text } from "../components/text.js";
import { ScreenManager, Screens } from "../screen_manager.js";
export class Menu {
    constructor(ctx) {
        this.ctx = ctx;
        this.loop_id = null;
        this.loop = () => {
            this.render();
            this.loop_id = requestAnimationFrame(this.loop);
        };
        this.handleMouseDown = (e) => {
            this.start_btn.handleMouseDown(e.offsetX, e.offsetY);
        };
        this.handleMouseUp = (e) => {
            this.start_btn.handleMouseUp(e.offsetX, e.offsetY);
        };
        this.handleTouchStart = (e) => {
            e.preventDefault();
            const rect = this.ctx.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const offset_x = touch.clientX - rect.left;
            const offset_y = touch.clientY - rect.top;
            this.start_btn.handleMouseDown(offset_x, offset_y);
        };
        this.handleTouchEnd = (e) => {
            e.preventDefault();
            const rect = this.ctx.canvas.getBoundingClientRect();
            const touch = e.changedTouches[0];
            const offset_x = touch.clientX - rect.left;
            const offset_y = touch.clientY - rect.top;
            this.start_btn.handleMouseUp(offset_x, offset_y);
        };
        this.initEvents();
        this.createComponents();
    }
    createComponents() {
        const button_w = 200;
        const button_h = 60;
        const button_x = this.ctx.canvas.width / 2 - button_w / 2;
        const button_y = 350;
        this.start_btn = new Button(this.ctx, button_x, button_y, button_w, button_h, "START", () => ScreenManager.show(Screens.GAME), {
            fill_color: "#19C9A3",
            radius: 10,
            shadow_blur: 10,
            shadow_color: "#1860B2",
            shadow_offset_x: 2,
            shadow_offset_y: 2,
        });
        const title_x = this.ctx.canvas.width / 2;
        const title_y = 150;
        this.title = new Text(this.ctx, title_x, title_y, "BLOCK RUSH", 50, "white");
    }
    render() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = "#3498db";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.title.render();
        this.start_btn.render();
    }
    initEvents() {
        this.ctx.canvas.addEventListener("mousedown", this.handleMouseDown);
        this.ctx.canvas.addEventListener("mouseup", this.handleMouseUp);
        this.ctx.canvas.addEventListener("touchstart", this.handleTouchStart);
        this.ctx.canvas.addEventListener("touchend", this.handleTouchEnd);
    }
    removeEvents() {
        this.ctx.canvas.removeEventListener("mousedown", this.handleMouseDown);
        this.ctx.canvas.removeEventListener("mouseup", this.handleMouseUp);
        this.ctx.canvas.removeEventListener("touchstart", this.handleTouchStart);
        this.ctx.canvas.removeEventListener("touchend", this.handleTouchEnd);
    }
    destroy() {
        if (this.loop_id) {
            cancelAnimationFrame(this.loop_id);
            this.loop_id = null;
        }
        this.removeEvents(); // ✅ прибрали слухачі
        this.start_btn = null;
        this.title = null;
    }
    start() {
        this.loop_id = requestAnimationFrame(this.loop);
    }
}
