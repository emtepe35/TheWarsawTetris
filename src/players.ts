interface playingBlock {
    revs: number;
    shape: { x: number, y: number }[][];
}

export class Player implements playingBlock {
    revs;
    shape;
    constructor(revs: number, shape: { x: number, y: number }[][]) {
        this.revs = revs;
        this.shape = shape;
    }
}
export let shapelist: Player[] = []

//Blocks

//  ■ □ ■ ■     ■
//              □
//              ■
//              ■
let long = new Player(2, [
    [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
    [{ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: -2 }],
])
shapelist.push(long)

//  ■           ■ ■     ■ □ ■       ■ 
//  ■ □ ■       □           ■       □
//              ■                 ■ ■ 

let leftEl = new Player(4, [
    [{ x: -1, y: -1 }, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }],
    [{ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 0, y: -1 }, { x: 1, y: -1 }],
    [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }],
    [{ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 1 }],
])
shapelist.push(leftEl)
//  ■ □ ■     ■ ■             ■      ■             
//  ■           □         ■ □ ■      □         
//              ■                    ■ ■
let rightEl = new Player(4, [
    [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }],
    [{ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 0, y: -1 }, { x: -1, y: -1 }],
    [{ x: 1, y: -1 }, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }],
    [{ x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }, { x: 0, y: -1 }],

])
shapelist.push(rightEl)
//  ■ ■
//  □ ■ 
let square = new Player(1, [[{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }]])
shapelist.push(square)
//    ■ ■    ■
//  ■ □      □ ■
//             ■
let rightZ = new Player(2, [
    [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    [{ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }]
])
shapelist.push(rightZ)
//  ■ ■       ■ 
//    □ ■   □ ■ 
//          ■ 
let leftZ = new Player(2, [
    [{ x: -1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }],
    [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }],
])
shapelist.push(leftZ)

//    ■     ■        ■  
//  ■ □ ■   □ ■    ■ □    ■ □ ■
//          ■        ■      ■
let mid = new Player(4,
    [
        [{ x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }],
        [{ x: 0, y: 1 }, { x: 0, y: 0 }, { x: -1, y: 0 }, { x: 0, y: -1 }],
        [{ x: 0, y: -1 }, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }],
        [{ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }],
    ])
shapelist.push(mid)