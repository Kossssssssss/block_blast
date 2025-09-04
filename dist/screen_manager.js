import { Game } from "./game/game.js";
import { Menu } from "./menu/menu.js";
export var Screens;
(function (Screens) {
    Screens["MENU"] = "menu";
    Screens["GAME"] = "game";
})(Screens || (Screens = {}));
export class ScreenManager {
    static register(name, canvas) {
        this.screens[name] = canvas;
        canvas.style.display = "none";
        this.instances[name] = null;
    }
    static show(name) {
        if (!this.screens[name]) {
            console.warn(`Screen "${name}" не зареєстрований!`);
            return;
        }
        if (this.current && this.instances[this.current]) {
            this.instances[this.current].destroy();
            this.instances[this.current] = null;
        }
        Object.values(this.screens).forEach((c) => (c.style.display = "none"));
        this.screens[name].style.display = "block";
        this.current = name;
        const ctx = this.screens[name].getContext("2d");
        if (!ctx)
            return;
        switch (name) {
            case Screens.MENU:
                this.instances[name] = new Menu(ctx);
                break;
            case Screens.GAME:
                this.instances[name] = new Game(ctx);
                break;
        }
        this.instances[name].start();
    }
    static getCurrent() {
        return this.current;
    }
}
ScreenManager.screens = {};
ScreenManager.instances = {};
ScreenManager.current = null;
