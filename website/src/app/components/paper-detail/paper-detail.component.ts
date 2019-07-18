import { Component, OnInit, Input } from '@angular/core';
import { Paper } from '../../model/paper.model';
import { ModalController, NavController } from '@ionic/angular';
import { SimplifiedAuthor } from '../../model/simplified-author.model';
import { ResultsService } from '../../services/results.service';

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
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.selectedPaper = this.resultsService.getPaperFromId(
      this.selectedPaperId
    );
    this.isLoaded = true;
  }

  onAuthorChipClick(author: SimplifiedAuthor) {
    this.navCtrl.navigateForward(['/', 'results', 'tabs', 'authors', 'author', author.id]);
    this.onClose();
  }

  onTopicChipClick(topic: string) {
    this.resultsService.searchKey = topic;
    this.navCtrl.navigateForward(['/', 'results', 'tabs', 'papers', topic]);
    this.onClose();
  }

  onClose() {
    this.modalCtrl.dismiss(null, 'close');
  }
}
