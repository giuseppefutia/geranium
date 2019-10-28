import { Component, OnInit, Input } from '@angular/core';
import { Paper } from '../../model/paper.model';
import { ModalController, NavController } from '@ionic/angular';
import { SimplifiedAuthor } from '../../model/simplified-author.model';
import { ResultsService } from '../../services/results.service';
import { ModelService } from 'src/app/model/model.service';
import { AuthorDetailComponent } from '../author-detail/author-detail.component';

@Component({
  selector: 'app-paper-detail',
  templateUrl: './paper-detail.component.html',
  styleUrls: ['./paper-detail.component.scss']
})
export class PaperDetailComponent implements OnInit {
  @Input() selectedPaperId: string;
  selectedPaper: Paper;
  isLoaded = false;

  constructor(
    private modalCtrl: ModalController,
    private resultsService: ResultsService,
    private navCtrl: NavController,
    private dataModel: ModelService
  ) {}

  ngOnInit() {
    this.resultsService
      .getPaperFromURI(this.dataModel.paperID2URI(this.selectedPaperId))
      .subscribe(p => {
        this.selectedPaper = this.dataModel.getPaperDetails();
        this.isLoaded = true;
      });
  }

  onAuthorChipClick(author: SimplifiedAuthor) {
    this.modalCtrl
      .create({
        component: AuthorDetailComponent,
        componentProps: {
          selectedAuthorURI: author.url,
          selectedTopicLabel: this.dataModel.searchTopicToString()
        }
      })
      .then(modalEl => {
        modalEl.present();
      });
  }

  onIRISDetails() {
    if (this.isLoaded) {
      window.open(this.dataModel.getIRISUrl(this.selectedPaper), '_blank');
    }
  }

  onTopicChipClick(topic: string) {
    this.navCtrl.navigateForward(['/', 'results', 'tabs', 'papers', topic]);
    this.onClose();
  }

  onClose() {
    this.modalCtrl.dismiss(null, 'close');
  }
}
