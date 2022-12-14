import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery();

  console.log("data", data);
  let body = null;

  // data loading
  if (fetching) {
    body = null;
    //user not logged in
  } else if (!data?.me) {
    body = (
      <div>
        <NextLink href="/login">
          <Link color={"white"} mr={2}>
            login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link color={"white"}>register</Link>
        </NextLink>
      </div>
    );
    // user is logged in
  } else {
    body = (
      <Flex>
        <Box color={"white"} mr={2}>
          {data.me.username}
        </Box>
        <Button
          variant="link"
          onClick={() => {
            logout({});
          }}
          isLoading={logoutFetching}
        >
          logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex bg="black" p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
