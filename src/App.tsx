import React from 'react';
import { BrowserRouter, Link } from 'react-router-dom';
import routes from '@/routes/index';
import ChildrenView from '@/routes/childrenView';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ChildrenView routes={routes} />
    </BrowserRouter>
  );
};

export default App;
