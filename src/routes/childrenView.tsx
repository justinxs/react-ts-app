import React from 'react';
import { Switch } from 'react-router-dom';
import RouteWithSubRoutes from './routeWithSubRoutes';

const ChildrenView: React.FC<RouteProps> = ({ routes }) => {
  return (
    <Switch>
      {routes &&
        routes.map((route, i) => <RouteWithSubRoutes key={i} {...route} />)}
    </Switch>
  );
};

export default ChildrenView;
