import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import routes from '@/routes/index';
import ChildrenView from '@/routes/childrenView';
import Layout from '@/components/Layout';

const App: React.FC = () => {
  return (
    <Layout />
    // <Router>
    //   <div>
    //     <ul>
    //       <li>
    //         <Link to='/tacos'>Tacos</Link>
    //       </li>
    //       <li>
    //         <Link to='/sandwiches'>Sandwiches</Link>
    //       </li>
    //     </ul>
    //     <ChildrenView routes={routes} />
    //   </div>
    // </Router>
  );
};

export default App;
