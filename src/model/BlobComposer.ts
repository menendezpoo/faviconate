export class BlobComposer{

    private data: Uint8ClampedArray = new Uint8ClampedArray(0);

    getBlob(): Blob{
        return new Blob([this.data.buffer]);
    }

    async writeBlob(blob: Blob){
        this.writeBuffer(await blob.arrayBuffer());
    }

    writeBuffer(buff: ArrayBuffer){
        this.writeUint8Clamped(new Uint8ClampedArray(buff));
    }

    writeUint8Clamped(arr: Uint8ClampedArray){
        const data = new Uint8ClampedArray(this.data.length + arr.length);
        data.set(this.data, 0);
        data.set(arr, this.data.length);
        this.data = data;
    }

    writeInt32LE(n: number){
        this.writeUint8Clamped(new Uint8ClampedArray([
            (n & 0xff),
            (n & 0xff00) >>> 8,
            (n & 0xff0000) >>> 16,
            (n & 0xff000000) >>> 24,
        ]));
    }

    writeInt16LE(n: number){
        this.writeUint8Clamped(new Uint8ClampedArray([
            (n & 0xff),
            (n & 0xff00) >>> 8,
        ]));
    }

}