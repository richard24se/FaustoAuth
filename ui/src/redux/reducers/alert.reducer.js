import { alertConstants } from '../constants';

export function alert(state = {}, action) {
  switch (action.type) {
    case alertConstants.SUCCESS:
      return {
        type: 'alert-success',
        message: action.message,
        has_error: false
      };
    case alertConstants.ERROR:
      return {
        type: 'alert-danger',
        message: action.message,
        has_error: true
      };
    case alertConstants.LOADING:
      return {
        message: action.message,
        loading: true
      };
    case alertConstants.CLEAR:
      return {};
    default:
      return state
  }
}