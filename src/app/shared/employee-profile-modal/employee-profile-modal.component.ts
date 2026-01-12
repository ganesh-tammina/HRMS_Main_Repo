import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { Candidate } from 'src/app/services/pre-onboarding.service';

@Component({
  selector: 'app-employee-profile-modal',
  templateUrl: './employee-profile-modal.component.html',
  styleUrls: ['./employee-profile-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class EmployeeProfileModalComponent implements OnInit {

  @Input() selectedEmployee: any;
  selectedObeject: any
  constructor(private modalCtrl: ModalController) { }
  ngOnInit() {
    this.selectedObeject = this.selectedEmployee
    console.log('Employee data in profile modal ganesh:', this.selectedEmployee);

  }


// 🛠️ Function to extract initials from the full name

getInitials(fullName: string): string {
  if (!fullName) {
    return '??';
  }

  // Split the name by spaces and filter out empty strings
  const nameParts = fullName.trim().split(/\s+/).filter(part => part.length > 0);

  if (nameParts.length === 0) {
    return '??';
  }

  let initials = '';

  if (nameParts.length === 1) {
    // Use the first two letters if only one word is provided
    initials = nameParts[0].substring(0, 2);
  } else {
    // Use the first letter of the first and last word
    const firstInitial = nameParts[0].charAt(0);
    const lastInitial = nameParts[nameParts.length - 1].charAt(0);
    initials = firstInitial + lastInitial;
  }

  return initials.toUpperCase();
}

// 🎨 Optional: Function to generate a dynamic background color
getAvatarColor(name: string): string {
  // Implement a simple hash function here to return a color based on the name
  // For now, return a fixed color or implement logic like below:
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#00bcd4', '#009688'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}





  close() {
    this.modalCtrl.dismiss();
  } 

}
