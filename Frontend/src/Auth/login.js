"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Login() {
  const { data: session, status } = useSession();
  console.log("Session:", session);
  const loading = status === "loading";

  return (
    <>
      {loading && <h2>Loading...</h2>}
      {!loading && !session && (
        <>
          Not Signed In <br />
          <button onClick={() => signIn()}>Sign In</button>
          <pre>User is not logged in.</pre>
        </>
      )}
      {!loading && session && (
        <>
          Signed in as {session.user.email} <br />
          <button onClick={() => signOut()}>Sign Out</button>
          {session.accessToken && (
            <pre>User has access token</pre>
          )}
        </>
      )}
    </>
  );
}
