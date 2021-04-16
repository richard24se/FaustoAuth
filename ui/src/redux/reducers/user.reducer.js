import { userConstants } from '../constants';

let permissions = JSON.parse(localStorage.getItem('permissions'));
let credentials = JSON.parse(localStorage.getItem('credentials'));
const initialPermissions = permissions ? permissions : [];
const initialCredentials = credentials ? credentials : {};
const initialValid = credentials ? true : false

export function user(state = { credentials: initialCredentials, permissions: initialPermissions, is_valid: initialValid }, action) {
  switch (action.type) {
    case userConstants.SAVE_USER_INFO:
      return {
        ...action.information, is_valid: true
      };
    case userConstants.CLEAN_USER_INFO:
      return {
        permissions: [],
        credentials: {},
        is_valid: false
      };
    default:
      return state
  }
}