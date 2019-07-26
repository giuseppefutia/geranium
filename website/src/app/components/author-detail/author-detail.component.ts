import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ExpandedAuthor } from '../../model/author.model';
import { ResultsService } from 'src/app/services/results.service';

@Component({
  selector: 'app-author-detail',
  templateUrl: './author-detail.component.html',
  styleUrls: ['./author-detail.component.scss'],
})
export class AuthorDetailComponent implements OnInit {
  // Input defined in authors.page.ts
  @Input() selectedAuthorURI: string;
  @Input() selectedTopicLabel: string;
  isLoading = false;

  constructor(private modalCtrl: ModalController, private resultsService: ResultsService) {
    this.isLoading = true;
  }

  ngOnInit() {
    this.resultsService
      .getAuthorFromURIandTopic(this.selectedAuthorURI,
                                this.selectedTopicLabel)
      .subscribe(author => {
          this.isLoading = false;
          console.log(author);
      });
    this.isLoading = false;
  }

  onClose() {
    this.modalCtrl.dismiss();
  }
}
