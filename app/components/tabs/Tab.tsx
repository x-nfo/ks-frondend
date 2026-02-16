import { NavLink, useMatches, useResolvedPath } from 'react-router';
import type { To } from 'react-router';

type IconElement = React.SVGProps<SVGSVGElement> & {
  title?: string;
  titleId?: string;
};

export type TabProps = {
  Icon: React.FC<IconElement>;
  text: string;
  to: To;
};

export function Tab({ Icon, text, to }: TabProps) {
  const resolved = useResolvedPath(to);
  const matches = useMatches();
  const isActive = matches.find((m) => m.pathname === resolved.pathname);

  return (
    <li className={isActive ? `cursor-default` : `cursor-pointer`}>
      <NavLink
        to={to}
        className={({ isActive }) => `group w-full gap-x-2 max-w-[12rem] inline-flex items-center justify-center sm:justify-start px-1 py-4 border-b-2 font-medium text-sm transition-colors duration-300 ${isActive
          ? 'text-karima-brand border-karima-brand'
          : 'border-transparent text-gray-500 hover:text-karima-brand hover:border-karima-base'
          }`}
      >
        <Icon
          className={`w-5 h-5 transition-colors duration-300 ${isActive
            ? 'text-karima-brand'
            : 'text-gray-400 group-hover:text-karima-brand'
            }`}
        />
        <p className="hidden sm:block">{text}</p>
      </NavLink>
    </li>
  );
}
