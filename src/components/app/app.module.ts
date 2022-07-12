// system and external components (imports)
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';

// pipes (declarations)
//import { KeysPipe } from './logged-in/user-cards/user-cards.component';

// devextreme modules (imports)
import {
  DxPopupModule, DxResponsiveBoxModule, DxTooltipModule, DxScrollViewModule, DxPopoverModule,
  DxTextBoxModule, DxTextAreaModule, DxMenuModule, DxSelectBoxModule, DxCheckBoxModule,
  DxContextMenuModule, DxProgressBarModule, DxNumberBoxModule, DxFormModule,
  DxDateBoxModule, DxDataGridModule, DxHtmlEditorModule, DxChartModule
} from "devextreme-angular";
import { GoogleLoginProvider, SocialLoginModule } from '@abacritt/angularx-social-login';


// components for non authorized part (declarations)
import { NonLoggedInComponent } from "./non-logged-in/non-logged-in.component";
import { NonLoggedInHeaderComponent } from "./non-logged-in/header/non-logged-in.header.component";
import { NonLoggedInBodyAndFooterComponent } from "./non-logged-in/body-and-footer/non-logged-in.body-and-footer.component";
import { GuideComponent } from './non-logged-in/guide/guide.component';

// components for authorized part (declarations)
import { LoggedInComponent } from "./logged-in/logged-in.component";
import { BodyComponent } from "./logged-in/body/body.component";
import { HeaderComponent } from "./logged-in/header/header.component";
import { FooterAuthorizedComponent } from './logged-in/footer/footer.component';
import { FeedbackComponent } from './logged-in/header/feedback/feedback.component';
import { TasksNumberByIntervalComponent } from './logged-in/body/menu/menu.component';
import { TasksComponent } from './logged-in/body/tasks/tasks.component';
import { CalendarComponent } from './logged-in/body/calendar/calendar.component';

import { UserCardsComponent } from './logged-in/user-cards/user-cards.component';
import { UserNotificationsComponent } from './logged-in/header/notifications/user-notifications.component';

import { PlantComponent } from './logged-in/body/plant/plant.component';
import { AccountSettingsComponent } from "./logged-in/header/settings/account/settings-account.component";

import { ProfileComponent } from "./logged-in/header/settings/profile/profile.component";

import { WidgetsComponent } from './logged-in/body/widgets/widgets.component';
import { TimerComponent } from './logged-in/body/timer/timer.component';
import { ChatComponent } from './logged-in/body/widgets/chat/chat.component';

// components for team authentication (declarations)
import { AdminAuthenticationFormComponent } from "./admin-authentication-form.component.ts/admin-authentication-form.component";

// sorana toolbox (declarations)
import { SoranaPopupComponent } from './sorana-toolbox/sorana-popup/sorana-popup.component';
import { SoranaSimplePopupComponent } from './sorana-toolbox/sorana-simple-popup/sorana-simple-popup.component';
import { SoranaToastNotificationComponent } from './sorana-toolbox/sorana-toast-notification/sorana-toast-notification.component';

// popups (declarations)
import { PopupRegisterFormComponent } from "./popup/form/register/popup.register.component";
import { PopupLoginFormComponent } from "./popup/form/login/popup.login.component";
import { PopupTermsAndConditionsFormComponent } from "./popup/form/register/terms-and-conditions/popup.tac.component";
import { PopupRegisterResultComponent } from "./popup/form/register/register-result/popup.register-result.component";
import { PopupCreatePlantComponent } from "./popup/create/plant/popup.create.plant.component";
import { PopupHistoryPlantComponent } from "./popup/read/plant/popup.history.plant.component";
import { PopupQuoteComponent } from "./popup/read/quote/popup.quote.component";
import { EditTimeZonePopupComponent } from './popup/edit/edit-time-zone-popup/edit-time-zone-popup.component';

// other (declarations)
import { TokenInterceptor } from "../../services/token.interceptor";
import { JwtModule } from "@auth0/angular-jwt";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { Constants } from "../constants";

// services (providers)
import { AuthenticationService } from "../../services/api/authentication.service";
import { UserService } from "../../services/api/user.service";
import { TaskService } from "../../services/api/task.service";
import { FileService } from 'src/services/api/file.service';
import { PlantService } from "../../services/api/plant.service";
import { QuoteService } from "../../services/api/quote.service";
import { AccountService } from "../../services/api/account.service";
import { UserDetailsService } from "../../services/api/user-details.service";
import { GoogleIntegrationService } from 'src/services/api/google-integration.service';
import { UserNotificationService } from 'src/services/api/user-notification.service';
import { SessionService } from 'src/services/api/session.service';
import { SystemMaintenanceService } from 'src/services/api/system-maintenance.service';

import { DeviceDetectorService } from 'ngx-device-detector';
import { SocialAuthServiceConfig } from '@abacritt/angularx-social-login';

import { NavigationTransferService } from 'src/services/navigation-transfer.service';

// helpers (providers)
import { TaskHelper } from 'src/services/helpers/task.helper';
import { DateTimeHelper } from 'src/services/helpers/date-time.helper';
import { PlantExperienceHelper } from 'src/services/helpers/plant-experience.helper';

// hubs (providers)
import { PlantHub } from 'src/services/hubs/plant.hub';
import { TaskHub } from 'src/services/hubs/task.hub';
import { SessionHub } from 'src/services/hubs/session.hub';
import { TimerHub } from 'src/services/hubs/timer.hub';
import { UserDetailsHub } from 'src/services/hubs/user-details.hub';
import { AuthorizationHub } from 'src/services/hubs/authorization.hub';
import { ChatHub } from 'src/services/hubs/chat.hub';
import { UserNotificationHub } from 'src/services/hubs/user-notification.hub';

export function tokenGetter() {
  let authorizationToken = localStorage.getItem(Constants.jwtTokenName);
  if (!authorizationToken) {
    authorizationToken = sessionStorage.getItem(Constants.jwtTokenName);
  }

  return authorizationToken;
}

const routes: Routes = [
  { path: 'planner', component: BodyComponent },
  { path: 'friends', component: UserCardsComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    //KeysPipe,

    NonLoggedInComponent,
    NonLoggedInHeaderComponent,
    NonLoggedInBodyAndFooterComponent,
    GuideComponent,

    SoranaPopupComponent,
    SoranaSimplePopupComponent,
    SoranaToastNotificationComponent,

    LoggedInComponent,
    BodyComponent,
    HeaderComponent,
    FooterAuthorizedComponent,
    FeedbackComponent,
    TasksNumberByIntervalComponent,
    TasksComponent,
    CalendarComponent,
    PlantComponent,
    AccountSettingsComponent,
    ProfileComponent,

    UserCardsComponent,
    UserNotificationsComponent,

    WidgetsComponent,
    TimerComponent,
    ChatComponent,

    PopupRegisterFormComponent,
    PopupLoginFormComponent,
    PopupRegisterFormComponent,
    PopupRegisterResultComponent,
    PopupTermsAndConditionsFormComponent,
    PopupCreatePlantComponent,
    PopupHistoryPlantComponent,
    PopupQuoteComponent,

    EditTimeZonePopupComponent,

    AdminAuthenticationFormComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,

    DxResponsiveBoxModule,
    DxPopupModule,
    DxTooltipModule,
    DxScrollViewModule,
    DxMenuModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxContextMenuModule,
    DxPopoverModule,
    DxTextAreaModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxFormModule,
    DxDateBoxModule,
    DxProgressBarModule,
    DxDataGridModule,
    DxHtmlEditorModule,
    DxChartModule,

    SocialLoginModule,

    RouterModule.forRoot(routes),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: [Constants.apiUrl],
        disallowedRoutes: []
      }
    }),

    FontAwesomeModule,
  ],
  providers: [
    UserService,
    AuthenticationService,
    TaskService,
    FileService,
    PlantService,
    QuoteService,
    AccountService,
    UserDetailsService,
    GoogleIntegrationService,
    UserNotificationService,
    SessionService,
    SystemMaintenanceService,

    DeviceDetectorService,

    NavigationTransferService,

    TaskHelper,
    DateTimeHelper,
    PlantExperienceHelper,

    PlantHub,
    TaskHub,
    SessionHub,
    TimerHub,
    ChatHub,
    UserDetailsHub,
    AuthorizationHub,
    UserNotificationHub,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '410162245864-629o6emd4j9hlgfhr4l5fhfd76n5eg90.apps.googleusercontent.com',
              {
                scope: 'https://www.googleapis.com/auth/calendar',
                plugin_name: 'serenitytask_oauth',
                access_type: 'offline',
                prompt: 'consent'
              }
            )
          }
        ]
      } as SocialAuthServiceConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
