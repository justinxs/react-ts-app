import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import routes from '@/routes/index';
import ChildrenView from '@/routes/childrenView';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to='/tacos'>Tacos</Link>
          </li>
          <li>
            <Link to='/sandwiches'>Sandwiches</Link>
          </li>
        </ul>
        <ChildrenView routes={routes} />
      </div>
    </Router>
  );
};

export default App;
