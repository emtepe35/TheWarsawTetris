import { shapelist } from "./players";

export class Tetris {
    width: number;
    height: number;
    scene: HTMLElement | null;

    game_started: boolean = false;
    game_interval: number = 0;
    game_iter: number = 0;
    game_paused: boolean = false;
    game_speed: number = 300;
    game_score: number = 0;
    game_level: number = 1;
    game_toNextLevel: number = 0;

    t: number = 0;

    stats: number[] = [0, 0, 0, 0, 0, 0, 0];

    fields_array: Block[][] = [[]];
    blocks_array: { exists: boolean, rgb: string, type: number, rotation: number }[][] = [[]];
    colors: string[] = ['#e0ff5a', '#4564f1', '#f87bbd'];

    actual: { color: string, shape: number, rotation: number } = { color: this.colors[2], shape: 5, rotation: 0 };
    last: xy[] = [{ x: 0, y: 0, color: this.colors[0] }];
    lastcenter: { x: number, y: number } = { x: 0, y: 0 };
    x_drop = 4;

    next_shape: number = 0;
    next_rotation: number = 0;
    moveBlocked: boolean = false;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.scene = document.getElementById("game");
        this.fillBlocksArr();
        this.renderScene();
        this.updateScoreAndLevel()
    }
    fillBlocksArr() {
        for (let x = 0; x < this.width; x++) {
            this.blocks_array[x] = []
            for (let y = 0; y < this.height; y++) {
                this.blocks_array[x][y] = { exists: false, rgb: '#005300', type: -1, rotation: -1 };
            }
        }
    }

    anim = () => {
        setTimeout(() => {
            requestAnimationFrame(this.anim);
        }, 1000 / 60)

    }

    //renders a scene based on array
    renderScene() {
        if (this.scene) { this.scene.innerHTML = ''; }
        for (let x = 0; x < this.width; x++) {
            this.fields_array[x] = []
            for (let y = 0; y < this.height; y++) {
                let block_data = this.blocks_array[x][y]
                let block = new Block(x, y, block_data.rgb)
                this.fields_array[x][y] = block;
                if (this.scene) {
                    this.scene.appendChild(block.getBlock())
                }
            }
        }
    }

    //starts game
    play() {
        this.game_started = true;
        this.randomizeColor();
        this.randomizeShape();
        this.game_interval = setInterval(this.draw, this.game_speed);
        const audio = document.querySelector("audio") as HTMLAudioElement;
        audio.volume = 1;
        audio.play();
    }
    addPoints(quantity: number) {
        this.game_score += quantity;
    }

    draw = () => {
        this.moveBlocked = false;
        let klocek: { x: number, y: number }[] = []
        shapelist[this.actual.shape].shape[this.actual.rotation].map(item => {
            klocek.push({ x: this.x_drop + item.x, y: this.game_iter + item.y })
        })
        this.updateNextImg()
        let free_blocks = this.drawKlocek(klocek)
        if (klocek.length == free_blocks) {
            this.pushShapeDown()
        } else {
            this.moveBlocked = true;
            this.freezeShape()
        }
        this.updateScoreAndLevel();
        this.checkLevel();
        this.renderScene();
        this.checkLose();
    }
    drawKlocek(klocek: { x: number, y: number }[]) {
        let toAdd: number = 0;
        klocek.map(item => {
            if (item.y <= 19 && item.y >= 0) {
                let el = this.blocks_array[item.x][item.y]
                if (el.type == -1) { toAdd++ }
            } else if (item.y < 0) {
                let el = this.blocks_array[item.x][item.y + (-1 * item.y)]
                this.game_iter += (-1 * item.y)
                if (el.type == -1) { toAdd++ }
            }
        });
        return toAdd;
    }
    updateNextImg() {
        let img = document.getElementById('nextblock') as HTMLImageElement
        img.src = `./img/${this.next_shape}.png`;
        let degree = String(90 * this.next_rotation);
        img.style.transform = `rotate(${degree}deg)`
    }
    updateScoreAndLevel() {
        let level = String(this.game_level);
        let score = String(this.game_score);
        for (let zeros = 0; zeros < 2 - level.length; zeros++) {
            level = '0' + level
        }
        for (let zeros = 0; zeros < 10 - score.length; zeros++) {
            score = '0' + score
        }
        let leveltext = document.getElementById('leveltext') as HTMLElement;
        let scoretext = document.getElementById('scoretext') as HTMLElement;
        leveltext.innerText = level;
        scoretext.innerText = score;

        let statbars = document.getElementById('statbars') as HTMLElement;
        statbars.innerHTML = '';
        this.stats.map(height => {
            let div = document.createElement('div');
            div.id = 'bar';
            div.style.height = String(height) + '%';
            statbars.appendChild(div);
        })
    }
    checkLevel(): void {
        if (this.game_toNextLevel > 10) {
            this.game_toNextLevel -= 10;
            this.game_level++;
            this.addPoints(100);
            this.game_speed = this.game_speed - (10 - this.game_level) * this.game_level;
            this.updateSpeed();
        }
    }
    updateSpeed() {
        clearInterval(this.game_interval)
        this.game_interval = setInterval(this.draw, this.game_speed)
    }
    pushShapeDown() {
        this.clear();
        this.placeNew(this.x_drop, this.game_iter, this.actual.color, this.actual.shape)
        this.game_iter++;
    }
    freezeShape() {
        this.x_drop = 4;
        this.actual.rotation = 0;
        this.game_iter = 0;
        this.addPoints(6);
        this.randomizeColor()
        this.last.map(item => {
            this.blocks_array[item.x][item.y].type = 1;
            this.blocks_array[item.x][item.y].rgb = this.actual.color;
        })
        this.last = [{ x: 0, y: 0, color: this.actual.color }]
        this.randomizeColor();
        this.stats[this.actual.shape]++;
        this.actual.shape = this.next_shape;
        this.actual.rotation = this.next_rotation;
        this.next_shape = this.randomizeShape()
        this.next_rotation = this.randomizeRotation()
        this.checkLine();
    }
    randomizeRotation() {
        let max = shapelist[this.next_shape].revs - 1;
        return this.getRandomInt(0, max);
    }
    randomizeColor() {
        this.actual.color = this.colors[this.getRandomInt(0, 3)]
    }
    randomizeShape() {
        return this.getRandomInt(0, 7)
    }
    checkLose() {
        if (this.blocks_array[4][0].type == 1 || this.blocks_array[4][1].type == 1) {
            this.switchPause();
            this.game_started = false;
        }
    }

    getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
    }

    //Clears last block in move
    clear() {
        this.last.map(item => {
            let el = this.blocks_array[item.x][item.y];
            if (el.exists && el.type == -1) {
                el.exists = false;
                el.rgb = '#005300';
            }
        })
        this.last = []
    }
    //clears color of floating blocks back to green
    clearColor() {
        this.blocks_array.map(x => {
            x.map(y => {
                if (y.exists && y.type == -1) {
                    y.exists = false;
                    y.rgb = '#005300';
                }
            })
        })
    }
    //Place new block
    placeNew(x: number, y: number, rgb: string, shape: number) {
        let shp = shapelist[shape].shape[this.actual.rotation];
        shp.map(shp => {
            this.blocks_array[x + shp.x][y + shp.y] = { exists: true, rgb: rgb, type: -1, rotation: -1 };
            this.last.push({ x: x + shp.x, y: y + shp.y, color: rgb })
        })
        this.lastcenter = { x: x, y: y }
    }
    checkLine(): void {
        let lines = this.getHorizontalLines();
        let toRemove: number[] = []
        lines.map(line => {
            let full = this.checkLineFull(line);
            if (full) { toRemove.push(lines.indexOf(line)) }
        })
        this.clearLine(lines, toRemove)
    }
    getHorizontalLines(): block[][] {
        let horizontalLines = []
        for (let y = 0; y <= 19; y++) {
            let line: block[] = []
            this.blocks_array.map(item => {
                line.push(item[y])
            })
            horizontalLines.push(line)
        }
        return horizontalLines
    }
    checkLineFull(line: block[]): boolean {
        let full = true;
        line.map(block => {
            if (block.type != 1) { full = false }
        })
        return full;
    }
    clearLine(lines: block[][], toRemove: number[]) {
        toRemove.forEach(element => {
            this.addPoints(50);
            this.game_toNextLevel++;
            lines[element].forEach(element => {
                element.exists = false;
                element.type = -1;
                element.rgb = '#005300';
            });
            setTimeout(() => {
                for (let i = element - 1; i > 1; i--) {
                    setTimeout(() => {
                        let copy = lines[i];
                        for (let x = 0; x < lines[i + 1].length; x++) {
                            lines[i + 1][x].rgb = copy[x].rgb;
                            lines[i + 1][x].type = copy[x].type;
                            lines[i + 1][x].exists = copy[x].exists;
                        }
                    }, 50)
                }
            }, 50)
        });

    }
    //Keyboard event
    keyboard(e: KeyboardEvent) {
        let actions = {
            ArrowLeft: () => { this.moveLeft() },
            ArrowRight: () => { this.moveRight() },
            ArrowDown: () => { this.speedUp() },
            ArrowUp: () => { this.rotate() },
            Enter: () => { this.startGame() },
            Escape: () => { this.switchPause() },
            Shift: () => { this.switchMusic() },
        }
        let key = e.key as keyof typeof actions
        if (actions.hasOwnProperty(key)) { actions[key](); }
    }


    //Moving functions
    moveLeft() {
        if (this.x_drop > 0 && !this.game_paused && !this.moveBlocked) {
            if (this.checkSide(-1)) {
                this.x_drop--;
                this.horizontalRefresh()
            }
        }
    }
    moveRight() {
        if (this.x_drop < 9 && !this.game_paused && !this.moveBlocked) {
            if (this.checkSide(1)) {
                this.x_drop++;
                this.horizontalRefresh()
            }
        }
    }
    speedUp() {
        if (!this.moveBlocked && this.last.length > 3) {
            let distance: number[] = []
            this.last.map(item => {
                let found = false;
                let count = 0;
                while (!found) {
                    if (item.y + count <= 19) {
                        let type = this.blocks_array[item.x][item.y + count].type
                        if (type == -1) {
                            count++
                        } else {
                            found = true;
                        }
                    } else {
                        found = true;
                    }
                }
                distance.push(count)
            })
            distance.sort(function (a, b) { return a - b });
            if (distance.length > 0) {
                for (let i = 0; i < this.last.length; i++) {
                    this.last[i].y += distance[0] - 1
                }
            }
            this.clearColor();
            this.freezeShape();
        }
    }
    rotate() {
        if (!this.moveBlocked) {
            if (shapelist[this.actual.shape].revs - 1 > this.actual.rotation) {
                if (this.checkRotate(this.actual.rotation + 1)) {
                    this.actual.rotation++;
                }
            } else {
                if (this.checkRotate(0)) {
                    this.actual.rotation = 0;
                }
            }
            this.horizontalRefresh()
        }
    }
    startGame() {
        if (!this.game_started) {
            this.game_started = false;
            this.game_interval = 0;
            this.game_iter = 0;
            this.game_paused = false;
            this.game_speed = 300;
            this.game_score = 0;
            this.game_level = 1;
            this.game_toNextLevel = 0;
            this.stats = [0, 0, 0, 0, 0, 0, 0];
            this.fillBlocksArr();
            this.play();
        }
    }
    switchMusic() {
        const audio = document.querySelector("audio") as HTMLAudioElement;
        if (!audio.paused) {
            audio.pause();
        } else {
            audio.play();
        }
    }
    checkRotate(rot: number) {
        let klocek: { x: number, y: number }[] = []
        let move_possible = true;
        shapelist[this.actual.shape].shape[rot].map(item => {
            klocek.push({ x: this.x_drop + item.x, y: this.game_iter + item.y })
        })
        klocek.forEach(item => {
            if (item.x < 0 || item.x > 9 || item.y > 19 || item.y < 0) {
                move_possible = false;
            } else if (this.blocks_array[item.x][item.y].type == 1) {
                move_possible = false;
            }
        });
        return move_possible
    }

    switchPause() {
        if (this.game_started) {
            if (this.game_paused) {
                this.game_interval = setInterval(this.draw, this.game_speed);
                this.game_paused = false;
            } else {
                this.game_paused = true;
                clearInterval(this.game_interval)
            }
        }
    }

    checkSide(offset: number) {
        let found = false
        this.last.map(item => {
            if (item.x + offset >= 0 && item.x + offset <= 9) {
                try {
                    if (this.blocks_array[item.x + offset][item.y].type != -1) { found = true }
                } catch (err) { }

            } else {
                found = true;
            }
        })

        return !found

    }

    horizontalRefresh() {
        this.clear();
        this.placeNew(this.x_drop, this.lastcenter.y, this.actual.color, this.actual.shape);
        this.renderScene();
    }

}


export class Block {
    id: string;
    rgb: string;
    constructor(x: number, y: number, rgb: string) {
        this.id = "block" + String(x) + '-' + String(y);
        this.rgb = rgb;
    }
    getBlock() {
        let block = document.createElement("div");
        block.className = 'block';
        block.id = this.id;
        block.style.backgroundColor = this.rgb;
        return block;
    }
}


interface xy {
    x: number;
    y: number;
    color: string;
}

interface block {
    exists: boolean,
    rgb: string,
    type: number,
    rotation: number
}