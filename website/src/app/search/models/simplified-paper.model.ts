import { SimplifiedAuthor } from './simplified-author.model';

export class SimplifiedPaper {
  constructor(
    public id: string,
    public title: string,
    public authors: SimplifiedAuthor[],
    public journals: string[],
    public publicationDate: Date
  ) {}
}
