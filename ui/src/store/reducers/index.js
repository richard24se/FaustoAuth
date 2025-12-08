import { combineReducers } from 'redux';

import { authentication } from './authentication.reducer';
import { user } from './user.reducer';
import { alert } from './alert.reducer';
import { fotch } from "./fotch.reducer";
import { noti } from './noti.reducer'
import { localstorage } from './localstorage.reducer';
import { app } from './app.reducer';
//custom reducers
import { customReducers } from '../../custom/redux'
const rootReducer = combineReducers({
  authentication,
  user,
  alert,
  fotch,
  notistack: noti,
  localstorage,
  app,
  ...customReducers
});

export default rootReducer;