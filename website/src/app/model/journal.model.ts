export class Journal {
    constructor(
        public id: string,
        public name: string,
        public ISSN: string,
        public imageUrl: string,
        public topics: string[]
    ) { }
}