import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

import { QuillModule } from 'ngx-quill';
import { importProvidersFrom } from '@angular/core';

// addIcons({
//   'checkmark-outline': checkmarkOutline,
//   'checkmark-circle': checkmarkCircle,
//   'alert-circle-outline': alertCircleOutline,
//   'calendar-outline': calendarOutline,
//   'list-outline': listOutline,
//   'chevron-back-outline': chevronBackOutline,
//   'chevron-forward-outline': chevronForwardOutline,
//   'close-outline': closeOutline,
//   'notifications-outline' :notificationsOutline,
//    'location': location,
//    'mail': mail,
//    'person-circle':personCircle,
//    'add-circle-outline': addCircleOutline,
//    'create-outline': createOutline,
//    'ellipsis-vertical-circle-outline': ellipsisVerticalCircleOutline,
//    'person-add-outline': personAddOutline,
//    'phone-portrait' : phonePortrait
// });
addIcons(allIcons);

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideHttpClient(),
    provideAnimations(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(QuillModule.forRoot())
  ],
});
