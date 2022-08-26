import loadable from '@loadable/component';

export default function lazyComp(CompFn: () => Promise<any>, options?: any) {
  const LoadableComponent = loadable(CompFn, options);
  return (props: any) => <LoadableComponent {...props} />;
}
