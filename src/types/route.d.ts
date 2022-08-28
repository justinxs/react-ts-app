/// <reference types="react" />

interface RouteProps {
  routes?: RouteList;
  [prop: string]: any;
}

interface RouteItem {
  path: string;
  exact?: boolean;
  component: React.FC<RouteProps>;
  routes?: RouteList;
}

type RouteList = RouteItem[];
