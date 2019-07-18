import { SimplifiedAuthor } from './simplified-author.model';
import { Topic } from './topic.model';

export class SimplifiedPaper {
  constructor(
    public id: string,
    public title: string,
    public authors: SimplifiedAuthor[],
    public topics: Topic[],
    public submittedDate: Date,
    public imageUrl: string
  ) {}
}
