import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-leave-modal',
  templateUrl: './leave-modal.component.html',
  styleUrls: ['./leave-modal.component.scss'],
  standalone: true,
  imports: [FormsModule]
})
export class LeaveModalComponent implements OnInit {
  sickLeaves: number = 0;
  paidLeaves: number = 0;
  marriageLeaves: number = 0;
  leaveData: any = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() saveLeaves = new EventEmitter<any>();

  ngOnInit() {
    // Load from localStorage if exists
    const savedData = localStorage.getItem('leaveData');
    if (savedData) {
      this.leaveData = JSON.parse(savedData);
    }
  }

  onSave() {
    const leaves = {
      sickLeaves: this.sickLeaves,
      paidLeaves: this.paidLeaves,
      marriageLeaves: this.marriageLeaves
    };
    this.saveLeaves.emit(leaves);
  }

  onClose() {
    this.closeModal.emit();
  }
}
