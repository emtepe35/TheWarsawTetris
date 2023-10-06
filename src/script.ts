import { Tetris } from './tetris'

let tetris = new Tetris(10, 20);

let body: HTMLElement | null = document.getElementById("body")
if (body != null) {
    body.onkeydown = (e) => {
        tetris.keyboard(e)
    }
}

