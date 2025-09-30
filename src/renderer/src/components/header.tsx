'use client'
import { Navbar, NavbarBrand } from '@heroui/react'
import logo from '@renderer/assets/logo.png'
import { Link } from 'react-router'

export default function Header() {
  return (
    <Navbar
      className="bg-transparent"
      classNames={{ base: 'border-1 border-gray-100', wrapper: 'max-w-4xl px-0 sm:px-4' }}
    >
      <Link to="/">
        <NavbarBrand className="gap-2">
          {/* <Icon icon="kh:logo-dark" className="!size-8" /> */}
          <img src={logo} alt="Logo" className="w-16" />
          <p className="font-bold text-inherit">Primary Aldosteronism</p>
        </NavbarBrand>
      </Link>
      {/* <NavbarContent justify="end">
                <NavbarItem className="hidden lg:flex">
                    <Button color="primary" variant="flat">Login</Button>
                </NavbarItem>
            </NavbarContent> */}
    </Navbar>
  )
}
