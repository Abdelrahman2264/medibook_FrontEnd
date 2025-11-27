import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsComponent, FormsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the settings component', () => {
    expect(component).toBeTruthy();
  });

  it('should have general tab as default active tab', () => {
    expect(component.activeTab).toBe('general');
  });

  it('should change active tab when setActiveTab is called', () => {
    component.setActiveTab('account');
    expect(component.activeTab).toBe('account');

    component.setActiveTab('notifications');
    expect(component.activeTab).toBe('notifications');
  });

  it('should have all settings tabs', () => {
    expect(component.settingsTabs.length).toBe(5);
    expect(component.settingsTabs[0].id).toBe('general');
    expect(component.settingsTabs[1].id).toBe('account');
    expect(component.settingsTabs[2].id).toBe('notifications');
    expect(component.settingsTabs[3].id).toBe('privacy');
    expect(component.settingsTabs[4].id).toBe('appearance');
  });

  it('should have user profile data', () => {
    expect(component.userProfile.name).toBe('Dr. Ahmed Mohamed');
    expect(component.userProfile.email).toBe('ahmed.mohamed@hospital.com');
    expect(component.userProfile.specialty).toBe('General Surgery');
  });

  it('should have general settings with default values', () => {
    expect(component.settings.general.language).toBe('en');
    expect(component.settings.general.timezone).toBe('UTC+2');
    expect(component.settings.general.dateFormat).toBe('dd/MM/yyyy');
  });

  it('should have account settings', () => {
    expect(component.settings.account.username).toBe('drahmed2024');
    expect(component.settings.account.email).toBe('ahmed.mohamed@hospital.com');
  });

  it('should have notification settings', () => {
    expect(component.settings.notifications.emailNotifications).toBe(true);
    expect(component.settings.notifications.pushNotifications).toBe(true);
    expect(component.settings.notifications.smsNotifications).toBe(false);
  });

  it('should have privacy settings', () => {
    expect(component.settings.privacy.profileVisibility).toBe('public');
    expect(component.settings.privacy.showOnlineStatus).toBe(true);
  });

  it('should have appearance settings', () => {
    expect(component.settings.appearance.theme).toBe('light');
    expect(component.settings.appearance.fontSize).toBe('medium');
    expect(component.settings.appearance.direction).toBe('ltr');
  });

  // اختبار الدوال بدون spyOn
  it('should save general settings when method is called', () => {
    // حفظ القيمة الأصلية
    const originalConsoleLog = console.log;
    let loggedMessage = '';
    
    // استبدال console.log مؤقتاً
    console.log = (message: string) => {
      loggedMessage = message;
    };

    component.saveGeneralSettings();
    
    // التأكد أن الدالة تم تنفيذها
    expect(loggedMessage).toContain('General settings saved:');
    
    // إعادة console.log الأصلي
    console.log = originalConsoleLog;
  });

  it('should update user profile data', () => {
    const newName = 'Dr. Mohamed Ahmed';
    component.userProfile.name = newName;
    expect(component.userProfile.name).toBe(newName);
  });

  it('should update general settings', () => {
    component.settings.general.language = 'ar';
    expect(component.settings.general.language).toBe('ar');
  });

  it('should toggle notification settings', () => {
    const initialValue = component.settings.notifications.emailNotifications;
    component.settings.notifications.emailNotifications = !initialValue;
    expect(component.settings.notifications.emailNotifications).toBe(!initialValue);
  });

  it('should render settings title', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Settings');
  });

  it('should render all menu items', () => {
    const compiled = fixture.nativeElement;
    const menuItems = compiled.querySelectorAll('.menu-item');
    expect(menuItems.length).toBe(5);
  });

  it('should show general settings content when active', () => {
    component.activeTab = 'general';
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.tab-content h2').textContent).toContain('General Settings');
  });

  it('should show account settings content when active', () => {
    component.activeTab = 'account';
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.tab-content h2').textContent).toContain('Account Settings');
  });

  it('should respond to tab click events', () => {
    const compiled = fixture.nativeElement;
    const accountTab = compiled.querySelectorAll('.menu-item')[1];
    
    accountTab.click();
    fixture.detectChanges();

    expect(component.activeTab).toBe('account');
  });

  it('should have correct data types', () => {
    expect(typeof component.userProfile.name).toBe('string');
    expect(typeof component.settings.notifications.emailNotifications).toBe('boolean');
    expect(Array.isArray(component.settingsTabs)).toBe(true);
  });

  it('should have valid theme values', () => {
    const validThemes = ['light', 'dark', 'purple'];
    component.themes.forEach(theme => {
      expect(validThemes).toContain(theme.value);
    });
  });

  it('should have valid language values', () => {
    const validLanguages = ['en', 'ar'];
    component.languages.forEach(language => {
      expect(validLanguages).toContain(language.value);
    });
  });
});