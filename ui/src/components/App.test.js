import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import App from './App';

const mockStore = configureStore([]);

describe('App', () => {
  it('renders without crashing', () => {
    const store = mockStore({
      fotch: {
        success: false,
        warning: false,
        error: false,
        processing: false,
        message: '',
      },
    });
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
  });
});
