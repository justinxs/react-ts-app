import React from 'react';
import { Route } from 'react-router-dom';

const RouteWithSubRoutes: React.FC<RouteItem> = (route) => {
  return (
    <Route
      path={route.path}
      exact={route.exact || false}
      render={(props) => (
        // pass the sub-routes down to keep nesting
        <route.component {...props} routes={route.routes} />
      )}
    />
  );
};
export default RouteWithSubRoutes;
