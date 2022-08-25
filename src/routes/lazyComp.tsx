import React from 'react';
import loadable from '@loadable/component';
import { Spin } from 'antd';

const Loading: React.FC = () => <Spin size='large' />;

export default function lazyComp(CompFn: () => Promise<any>) {
  const LoadableComponent = loadable(CompFn, {
    fallback: <Loading />
  });
  return (props: any) => <LoadableComponent {...props} />;
}
