import { SimplifiedAuthor } from './simplified-author.model';

export class SimplifiedPaper {
  constructor(
    public id: string,
    public title: string,
    public authors: SimplifiedAuthor[],
    public topics: string[],
    public publicationDate: Date,
    public imageUrl: string
  ) {}
}
