"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Navbar,
  Collapse,
  Nav,
  NavItem,
  NavbarBrand,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Dropdown,
  Button,
} from "reactstrap";
import LogoWhite from "../../assets/images/logos/xtremelogowhite.svg";
import user1 from "../../assets/images/users/user1.jpg";

const Header = ({ showMobmenu }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const Handletoggle = () => {
    setIsOpen(!isOpen);
  };

  const { data: session, status } = useSession();
  console.log("Session:", session);
  const loading = status === "loading";

  return (
    <Navbar color="primary" dark expand="md">
      <div className="d-flex align-items-center">
        <NavbarBrand href="/" className="d-lg-none">
          <Image src={LogoWhite} alt="logo" />
        </NavbarBrand>
        <Button color="primary" className="d-lg-none" onClick={showMobmenu}>
          <i className="bi bi-list"></i>
        </Button>
      </div>
      <div className="hstack gap-2">
        <Button
          color="primary"
          size="sm"
          className="d-sm-block d-md-none"
          onClick={Handletoggle}
        >
          {isOpen ? (
            <i className="bi bi-x"></i>
          ) : (
            <i className="bi bi-three-dots-vertical"></i>
          )}
        </Button>
      </div>

      <Collapse navbar isOpen={isOpen}>
        <Nav className="me-auto" navbar>
        </Nav>
        <Dropdown isOpen={dropdownOpen} toggle={toggle}>
          <DropdownToggle color="primary">
            <div style={{ lineHeight: "0px" }}>
            {!loading && session && (
            <>
              <Image
                    src={session.user.image}
                    alt="profile"
                    className="rounded-circle"
                    width="30"
                    height="30"
                  />
            </>
            )}
            {!loading && !session && (
              <>
                  <Image
                    src={user1}
                    alt="profile"
                    className="rounded-circle"
                    width="30"
                    height="30"
                  />
              </>
            )}
              
            </div>
          </DropdownToggle>
          <DropdownMenu>
          {!loading && !session && (
            <>
            <DropdownItem onClick={() => signIn()}>Sign In</DropdownItem>
            </>
          )}
          {!loading && session && (
            <>
            <DropdownItem header>Info</DropdownItem>
            <DropdownItem><Link style={{ color: 'inherit', textDecoration: 'none' }} href="/profile">
            My Account
            </Link></DropdownItem>
            <DropdownItem divider />
            <DropdownItem onClick={() => signOut()}>Logout</DropdownItem>
            </>
          )}
          </DropdownMenu>
        </Dropdown>
      </Collapse>
    </Navbar>
  );
};

export default Header;
