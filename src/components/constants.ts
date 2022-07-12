export class Constants {
  public static readonly jwtTokenName = 'serenityTask_authToken';

  public static readonly jwtAdminTokenName = 'serenityTask_adminAuthToken';

  public static readonly apiUrl = 'https://localhost:5001/';

  public static readonly storageUrl = 'https://storage.serenitytask.com/';

  public static readonly userStorageUrl = this.storageUrl + 'users/';

  public static readonly systemSoundsUrl = this.storageUrl + 'system/media/sounds/';

  public static readonly plantsUrl = this.storageUrl + 'system/media/pictures/plants/';

  public static readonly achievementsUrl = this.storageUrl + 'system/media/pictures/achievements/';

  public static readonly emailRegExValidation = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
}
