import React from 'react';
import { Link } from 'react-router-dom';
import ChildrenView from '../routes/childrenView';

const Tacos: React.FC<RouteProps> = ({ routes }) => {
  return (
    <div>
      <h2>Tacos</h2>
      <ul>
        <li>
          <Link to='/tacos/bus'>Bus</Link>
        </li>
        <li>
          <Link to='/tacos/cart'>Cart</Link>
        </li>
      </ul>
      <ChildrenView routes={routes} />
    </div>
  );
};

export default Tacos;
