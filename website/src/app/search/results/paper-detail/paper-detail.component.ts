import { Component, OnInit, Input } from '@angular/core';
import { Paper } from '../../models/paper.model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-paper-detail',
  templateUrl: './paper-detail.component.html',
  styleUrls: ['./paper-detail.component.scss'],
})
export class PaperDetailComponent implements OnInit {
  @Input() selectedPaper: Paper;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  onClose() {
    this.modalCtrl.dismiss(null, 'close');
  }

}
