import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

const globalErrorHandler = (error, isFatal) => {
  console.error('Global error handler:', {error, isFatal});
};

ErrorUtils.setGlobalHandler(globalErrorHandler);

AppRegistry.registerComponent(appName, () => App);
