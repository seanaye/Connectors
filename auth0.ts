export function getAuth0Client({
  clientId,
  clientSecret,
}: {
  clientId?: string;
  clientSecret?: string;
}) {
  if (!clientId || !clientSecret) {
    throw new Error(
      `Could not initialize auth0 client, env vars not set. ${JSON.stringify({
        clientId,
        clientSecret,
      })}`
    );
  }
  const getAccessToken = async () => {
    // get token to access auth0 management api
    const tokenRes = await fetch("https://coparse.auth0.com/oauth/token", {
      headers: { "content-type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        audience: "https://coparse.auth0.com/api/v2/",
        grant_type: "client_credentials",
      }),
    });

    const { access_token } = await tokenRes.json();
    return access_token;
  };

  // cache access token
  let accessToken = "";

  const authedFetch = async <T = Record<string, any>>(
    url: string,
    opts?: RequestInit
  ): Promise<{ data: T; res: Response }> => {
    if (!accessToken) {
      accessToken = await getAccessToken();
    }
    // build authentication header
    const headers = {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    };
    const newOpts = Object.assign(opts || {}, { headers });
    const res = await fetch(url, newOpts);
    if (res.status === 401) {
      // refresh access token
      accessToken = await getAccessToken();
      // retry request
      return await authedFetch(url, opts);
    }
    const body = await res.json();
    return { res, data: body as T };
  };

  const baseUrl = "https://coparse.auth0.com/api/v2";

  // object structure should reflect https://auth0.com/docs/api/management/v2#!/Users/get_user_roles
  return {
    users: {
      // get a users roles
      roles: (id: string) => {
        //https://auth0.com/docs/api/management/v2#!/Users/get_user_roles
        return authedFetch<{ id: string; name: string; description: string }[]>(
          `${baseUrl}/users/${id}/roles`
        );
      },
      addRoles: ({ id, roles }: { id: string; roles: string[] }) => {
        //https://auth0.com/docs/api/management/v2#!/Users/post_user_roles
        return authedFetch<null>(`${baseUrl}/users/${id}/roles`, {
          method: "POST",
          body: JSON.stringify({ roles }),
        });
      },
      //https://auth0.com/docs/api/management/v2#!/Users/delete_user_roles
      deleteRoles: ({ id, roles }: { id: string; roles: string[] }) => {
        return authedFetch(`${baseUrl}/users/${id}/roles`, {
          method: "DELETE",
          body: JSON.stringify({ roles }),
        });
      },
    },
  };
}

export type Auth0Client = ReturnType<typeof getAuth0Client>;
