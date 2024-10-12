import Link from 'next/link';
import React from 'react';

type Props = {
  item: NavItem;
  pathname: string;
};

const NavLink = ({ item, pathname }: Props) => {
  return (
    <Link href={item.link} key={item.link}>
      <div
        className={`nav__item ${
          pathname == item.link && 'bg-defaultBlue-300 text-white'
        }`}
      >
        {<item.icon className="w-5 h-5" />}
        <p className="ml-2 font-regular">{item.title}</p>
      </div>
    </Link>
  );
};

export default NavLink;
