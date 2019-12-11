import { Component, OnInit, Input } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Paper } from '../../model/paper.model';
import { ResultsService } from '../../services/results.service';
import { ModelService } from '../../model/model.service';
import { SimplifiedAuthor } from 'src/app/model/simplified-author.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-paper-detail',
  templateUrl: './paper-detail.page.html',
  styleUrls: ['./paper-detail.page.scss']
})
export class PaperDetailPage implements OnInit {
  selectedPaper: Paper;
  isLoaded = false;

  constructor(
    private resultsService: ResultsService,
    private navCtrl: NavController,
    private dataModel: ModelService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('paperID')) {
        this.resultsService
          .getPaperFromURI(this.dataModel.paperID2URI(paramMap.get('paperID')))
          .subscribe(p => {
            this.selectedPaper = this.dataModel.getPaperDetails();
            this.isLoaded = true;
          });
      } else {
        this.navCtrl.navigateBack(['/', 'search']);
      }
    });
  }

  onAuthorChipClick(author: SimplifiedAuthor) {
    this.navCtrl.navigateForward(['/', 'results', 'author', author.id]);
  }

  onIRISDetails() {
    if (this.isLoaded) {
      window.open(this.dataModel.getIRISUrl(this.selectedPaper), '_blank');
    }
  }

  onTopicChipClick(topic: string) {
    this.navCtrl.navigateForward(['/', 'results', 'tabs', 'papers', topic]);
  }

  onBackClick() {
    this.navCtrl.back();
  }

  onCloseClick() {
    this.navCtrl.navigateRoot(['/', 'results', 'tabs', 'papers', this.dataModel.searchTopic.label]);
  }
}
