import * as FullStory from '@fullstory/browser';
import type { AppEvent, User } from '../types';
import { ENVIRONMENT, FULL_STORY_ORG_ID } from '../utils/environment';

class AnalyticsService {

  init() {
    this.fullStoryInit();
    this.amplitudeInit();
  }

  setUser(user: User): void {
    this.fullStorySetUser(user);
    this.amplitudeSetUser(user);
  }

  event<T>(appEvent: AppEvent, data: T) {
    this.fullStoryEvent<T>(appEvent, data);
  }

  private fullStorySetUser(user: User) {
    FullStory.identify(user.id, {
      email: user.email,
      role: user.role,
    });
  }

  private fullStoryInit() {
    FullStory.init({
      orgId: FULL_STORY_ORG_ID,
      devMode: ENVIRONMENT !== 'production',
    });
  }

  private amplitudeSetUser(user: User) {
    //  amplitude.identify({id: user})
  }

  private amplitudeInit() {
    // amplitude.init(import.meta.env.VITE_AMPLITUDE_KEY as string);
  }

  private fullStoryEvent<T>(event: AppEvent, data: T) {
    FullStory.event(event, data);
  }
}

export default new AnalyticsService();