import {Color} from "../hui/helpers/Color";

export class ImageAdjustService {

    static brightness(data: Uint8ClampedArray, delta: number){
        for(let i = 0; i < data.length; i+=4){
            data[i] = Math.max(Math.min(data[i] + delta, 255), 0);
            data[i + 1] = Math.max(Math.min(data[i + 1] + delta, 255), 0);
            data[i + 2] = Math.max(Math.min(data[i + 2] + delta, 255), 0);
        }
    }

    static contrast(data: Uint8ClampedArray, delta: number){
        const factor = (259 * (delta + 255)) / (255 * (259 - delta));
        const limit = 128;

        for(let i = 0; i < data.length; i+=4){
            data[i] = Math.max(Math.min(factor * (data[i] - limit) + limit, 255), 0);
            data[i + 1] = Math.max(Math.min(factor * (data[i + 1] - limit) + limit, 255), 0);
            data[i + 2] = Math.max(Math.min(factor * (data[i + 2] - limit) + limit, 255), 0);
        }
    }

    /**
     * Dithers the image in place
     */
    static dither(data: Uint8ClampedArray, width: number, height: number, palette: Color[], kernelIndex: number = 1, serpentine:boolean = true) {
        // http://www.tannerhelland.com/4660/dithering-eleven-algorithms-source-code/
        const kernels: {[name:string]:number[][]} = {
            FloydSteinberg: [
                [7 / 16, 1, 0],
                [3 / 16, -1, 1],
                [5 / 16, 0, 1],
                [1 / 16, 1, 1]
            ],
            FalseFloydSteinberg: [
                [3 / 8, 1, 0],
                [3 / 8, 0, 1],
                [2 / 8, 1, 1]
            ],
            Stucki: [
                [8 / 42, 1, 0],
                [4 / 42, 2, 0],
                [2 / 42, -2, 1],
                [4 / 42, -1, 1],
                [8 / 42, 0, 1],
                [4 / 42, 1, 1],
                [2 / 42, 2, 1],
                [1 / 42, -2, 2],
                [2 / 42, -1, 2],
                [4 / 42, 0, 2],
                [2 / 42, 1, 2],
                [1 / 42, 2, 2]
            ],
            Atkinson: [
                [1 / 8, 1, 0],
                [1 / 8, 2, 0],
                [1 / 8, -1, 1],
                [1 / 8, 0, 1],
                [1 / 8, 1, 1],
                [1 / 8, 0, 2]
            ],
            Jarvis: [			// Jarvis, Judice, and Ninke / JJN?
                [7 / 48, 1, 0],
                [5 / 48, 2, 0],
                [3 / 48, -2, 1],
                [5 / 48, -1, 1],
                [7 / 48, 0, 1],
                [5 / 48, 1, 1],
                [3 / 48, 2, 1],
                [1 / 48, -2, 2],
                [3 / 48, -1, 2],
                [5 / 48, 0, 2],
                [3 / 48, 1, 2],
                [1 / 48, 2, 2]
            ],
            Burkes: [
                [8 / 32, 1, 0],
                [4 / 32, 2, 0],
                [2 / 32, -2, 1],
                [4 / 32, -1, 1],
                [8 / 32, 0, 1],
                [4 / 32, 1, 1],
                [2 / 32, 2, 1],
            ],
            Sierra: [
                [5 / 32, 1, 0],
                [3 / 32, 2, 0],
                [2 / 32, -2, 1],
                [4 / 32, -1, 1],
                [5 / 32, 0, 1],
                [4 / 32, 1, 1],
                [2 / 32, 2, 1],
                [2 / 32, -1, 2],
                [3 / 32, 0, 2],
                [2 / 32, 1, 2],
            ],
            TwoSierra: [
                [4 / 16, 1, 0],
                [3 / 16, 2, 0],
                [1 / 16, -2, 1],
                [2 / 16, -1, 1],
                [3 / 16, 0, 1],
                [2 / 16, 1, 1],
                [1 / 16, 2, 1],
            ],
            SierraLite: [
                [2 / 4, 1, 0],
                [1 / 4, -1, 1],
                [1 / 4, 0, 1],
            ],
        };
        const names = [
            "FloydSteinberg",
            "FalseFloydSteinberg",
            "Stucki",
            "Atkinson",
            "Jarvis",
            "Burkes",
            "Sierra",
            "TwoSierra",
            "SierraLite"
        ];

        if (kernelIndex < 0 || kernelIndex > names.length - 1) {
            throw 'Unknown dithering kernel: ' + kernelIndex;
        }

        const nearestBuffer = new Map<number, Color>();
        const nearest = (r: number, g: number, b: number): Color => {

            const originInt =
                (255 << 24)	|	// alpha
                (b  << 16)	|	// blue
                (g  <<  8)	|	// green
                r;

            if (nearestBuffer.has(originInt)){
                return nearestBuffer.get(originInt)!;
            }

            let min = {
                distance: Number.MAX_SAFE_INTEGER,
                color: Color.white
            };

            for(const color of palette){
                const distance = Math.sqrt(
                    Math.pow(r - color.r, 2) +
                    Math.pow(g - color.g, 2) +
                    Math.pow(b - color.b, 2)
                );
                if (distance < min.distance){
                    min = {distance, color};
                }
            }

            nearestBuffer.set(originInt, min.color);

            return min.color;
        };
        const getPixel = (x: number, y: number): [number, number, number] => {
            const i = width * 4 * y + x * 4;
            return [data[i], data[i+1], data[i+2]];
        };
        const setPixel = (x: number, y: number, r: number, g: number, b: number) => {
            const i = width * 4 * y + x * 4;
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
        }

        let kernel: number[][] = kernels[names[kernelIndex]];

        let dir = serpentine ? -1 : 1;

        for (let y = 0; y < height; y++) {
            dir *= serpentine ? -1 : 1;

            for (let x = (dir == 1 ? 0 : width - 1), xend = (dir == 1 ? width : 0); x !== xend; x += dir) {

                // Image pixel
                const [r1, g1, b1] = getPixel(x, y);

                // Reduced pixel
                const [r2, g2, b2] = nearest(r1, g1, b1).tupleInt8;

                setPixel(x, y, r2, g2, b2);

                // Component distance
                let er = r1 - r2;
                let eg = g1 - g2;
                let eb = b1 - b2;

                for (let i = (dir == 1 ? 0 : kernel.length - 1), end = (dir == 1 ? kernel.length : 0); i !== end; i += dir) {
                    let x1 = kernel[i][1] * dir;
                    let y1 = kernel[i][2];

                    if (x1 + x >= 0 && x1 + x < width && y1 + y >= 0 && y1 + y < height) {
                        let d = kernel[i][0];

                        const [r3, g3, b3] = getPixel(x + x1, y +  y1);

                        let r4 = Math.max(0, Math.min(255, r3 + er * d));
                        let g4 = Math.max(0, Math.min(255, g3 + eg * d));
                        let b4 = Math.max(0, Math.min(255, b3 + eb * d));

                        setPixel(x + x1, y + y1, r4, g4, b4);
                    }
                }
            }
        }

    }

}