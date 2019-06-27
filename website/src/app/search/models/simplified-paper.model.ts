import { SimplifiedAuthor } from './simplified-author.model';
import { Topic } from './topic.model';

export class SimplifiedPaper {
  constructor(
    public id: string,
    public title: string,
    public authors: SimplifiedAuthor[],
    public topics: Topic[],
    public publicationDate: Date,
    public imageUrl: string
  ) {}
}
