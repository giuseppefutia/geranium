import { SimplifiedPaper } from './simplified-paper.model';

export interface PapersPerTopics {
    url: string;
    label: string;
    occ: number;
    style: object;
}

export class Author {
    constructor(
        public id: string,
        public name: string,
        public url: string,
        public department: string,
        public topics: string[],
        public imageUrl: string,
        public numberOfPapers: number,
        public papersPerTopics: PapersPerTopics[]
    ) {}
}

export class ExpandedAuthor extends Author {
    constructor(
        id: string,
        name: string,
        url: string,
        department: string,
        topics: string[],
        imageUrl: string,
        numberOfPapers: number,
        papersPerTopics: PapersPerTopics[],
        public papers: SimplifiedPaper[]
    ) {
        super(id, name, url, department, topics, imageUrl, numberOfPapers, papersPerTopics);
    }
}
