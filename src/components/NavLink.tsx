import { PopoverButton } from '@headlessui/react';
import Link from 'next/link';
import React from 'react';

type Props = {
  item: NavItem;
  pathname: string;
  popoverButton?: boolean;
};

const NavLink = ({ item, pathname, popoverButton }: Props) => {
  const NavBody = () => (
    <div
      className={`nav__item ${
        pathname.includes(item.link) && 'bg-defaultBlue-300 text-white'
      }`}
    >
      {<item.icon className="w-5 h-5" />}
      <p className="ml-2 font-regular">{item.title}</p>
    </div>
  );
  return popoverButton ? (
    <PopoverButton as={Link} href={item.link}>
      <NavBody />
    </PopoverButton>
  ) : (
    <Link href={item.link}>
      <NavBody />
    </Link>
  );
};

export default NavLink;
