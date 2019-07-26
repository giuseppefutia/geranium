import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { ExpandedAuthor } from '../../model/author.model';
import { ResultsService } from 'src/app/services/results.service';
import { ModelService } from 'src/app/model/model.service';
import { PaperDetailComponent } from '../paper-detail/paper-detail.component';

@Component({
  selector: 'app-author-detail',
  templateUrl: './author-detail.component.html',
  styleUrls: ['./author-detail.component.scss']
})
export class AuthorDetailComponent implements OnInit {
  // Input defined in authors.page.ts
  @Input() selectedAuthorURI: string;
  @Input() selectedTopicLabel: string;
  selectedAuthor: ExpandedAuthor; // This is read by the HTML page
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private resultsService: ResultsService,
    private dataModel: ModelService,
    private navCtrl: NavController
  ) {
    this.isLoading = true;
  }

  ngOnInit() {
    this.resultsService
      .getAuthorFromURIandTopic(this.selectedAuthorURI, this.selectedTopicLabel)
      .subscribe(author => {
        this.isLoading = false;
        this.selectedAuthor = this.dataModel.getAuthorDetails();
      });
  }

  onTopicChipClick(topicLabel: string) {
    this.navCtrl.navigateForward([
      '/',
      'results',
      'tabs',
      'papers',
      topicLabel
    ]);
    this.onClose();
  }

  onPaperDetails(paperId: string) {
    this.modalCtrl.create({
      component: PaperDetailComponent,
      componentProps: { selecedPaperId: paperId }
    }).then(modalEl => {
      modalEl.present();
    });
  }

  onClose() {
    this.modalCtrl.dismiss();
  }
}
