import { Component, OnInit, Input } from '@angular/core';
import { Journal } from '../../model/journal.model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-journal-detail',
  templateUrl: './journal-detail.component.html',
  styleUrls: ['./journal-detail.component.scss'],
})
export class JournalDetailComponent implements OnInit {
  @Input() selectedJournal: Journal;
  isLoading = false;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  }

  onClose() {
    this.modalCtrl.dismiss();
  }
}
