import { combineReducers } from 'redux';

import { authentication } from './authentication.reducer';
import { users } from './users.reducer';
import { alert } from './alert.reducer';
import { fotch } from "./fotch.reducer";

const rootReducer = combineReducers({
  authentication,
  users,
  alert,
  fotch
});

export default rootReducer;