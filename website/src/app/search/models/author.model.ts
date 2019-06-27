import { SimplifiedPaper } from './simplified-paper.model';

export class Author {
    constructor(
        public id: string,
        public name: string,
        public department: string,
        public topics: string[],
        public imageUrl: string,
        public numberOfPapers: number
    ) {}
}

export class ExpandedAuthor extends Author {
    constructor(
        id: string,
        name: string,
        department: string,
        topics: string[],
        imageUrl: string,
        numberOfPapers: number,
        public papers: SimplifiedPaper[]
    ) {
        super(id, name, department, topics, imageUrl, numberOfPapers);
    }
}
