import { Paper } from './paper.model';

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
        public initials: string,
        public url: string,
        public department: string,
        public topics: string[],
        public imageUrl: string,
        public numberOfPapers: number,
        public papersPerTopics: PapersPerTopics[],
        public style: object
    ) {}
}

export class ExpandedAuthor extends Author {
    constructor(
        id: string,
        name: string,
        public initials: string,
        url: string,
        department: string,
        topics: string[],
        imageUrl: string,
        numberOfPapers: number,
        papersPerTopics: PapersPerTopics[],
        public papers: Paper[],
        public style: object
    ) {
        super(id, name, initials, url, department, topics, imageUrl, numberOfPapers, papersPerTopics, style);
    }
}
