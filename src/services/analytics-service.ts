import * as FullStory from '@fullstory/browser';
import type { AppEvent, User } from '../types';
import { ENVIRONMENT, FULL_STORY_ORG_ID } from '../utils/environment';

class AnalyticsService {
  
  init() {
    this.fullStoryInit();
  }

  setUser(user: User): void {
    this.fullStorySetUser(user);
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
      devMode: ENVIRONMENT !== 'production' ,
    });
  }

  private fullStoryEvent<T>(event: AppEvent, data: T) {
    FullStory.event(event, data);
  }
}

export default new AnalyticsService();