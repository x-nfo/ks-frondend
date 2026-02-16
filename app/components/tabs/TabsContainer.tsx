import type { ReactNode } from 'react';
import type { TabProps } from '~/components/tabs/Tab';
import { Tab } from './Tab';

export function TabsContainer({
  tabs,
  children,
}: {
  tabs: TabProps[];
  children: ReactNode | string;
}) {
  return (
    <>
      <div className="border-b border-karima-brand/10 mt-4">
        <ul className="gap-x-4 grid grid-cols-2 sm:grid-0 sm:flex sm:flex-wrap -mb-px text-sm font-medium text-center text-gray-500">
          {tabs.map((props) => (
            <Tab
              Icon={props.Icon}
              text={props.text}
              to={props.to}
              key={props.text}
            />
          ))}
        </ul>
      </div>
      {children}
    </>
  );
}
