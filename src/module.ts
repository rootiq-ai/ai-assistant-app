import { AppPlugin } from '@grafana/data';
import { App } from './components/App';
import { initSidebar } from './components/Sidebar';

// Initialize the floating sidebar when plugin loads
initSidebar();

// Export the plugin
export const plugin = new AppPlugin().setRootPage(App);
