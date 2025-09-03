import { Game } from "./game.js";
window.addEventListener("load", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    if (!ctx) {
        throw new Error("Canvas context not found!");
    }
    const game = new Game(ctx);
    game.start();
    document.getElementById("resetBtn")?.addEventListener("click", () => game.resetGame());
});
