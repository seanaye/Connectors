import {
  GetOrganizationsResponse,
  GetUsersByIdResponse,
  PatchUsersByIdBody,
  PatchOrganizationsByIdBody,
  PostOrganizationsBody
} from "./auth0.types.ts";
import { buildResponse, ReturnValue, validateArgs } from "./_utils.ts";

export function getAuth0Client(args: {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  accessTokenUrl: string;
  audience: string;
}) {
  const {
    clientId,
    clientSecret,
    baseUrl,
    accessTokenUrl,
    audience,
  } = validateArgs(args);

  const getAccessToken = async () => {
    // get token to access auth0 management api
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      audience,
      grant_type: "client_credentials",
    });
    const tokenRes = await fetch(accessTokenUrl, {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      method: "POST",
      body,
    });

    const { access_token: accessToken } = await tokenRes.json();
    return accessToken;
  };

  // cache access token
  let accessToken = "";

  const authedFetch = async <T = Record<string, any>>(
    url: string,
    opts?: RequestInit
  ): Promise<ReturnValue<T>> => {
    if (!accessToken) {
      accessToken = await getAccessToken();
    }
    // build authentication header
    const headers = {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    };
    const newOpts = Object.assign(opts || {}, { headers });
    const res = await fetch(`${baseUrl}${url}`, newOpts);
    if (res.status === 401) {
      // refresh access token
      accessToken = await getAccessToken();
      // retry request
      return await authedFetch(url, opts);
    }
    return await buildResponse<T>(res);
  };

  // object structure should reflect https://auth0.com/docs/api/management/v2#!/Users/get_user_roles
  return {
    users: {
      get: ({ id }: { id: string }) => {
        return authedFetch<GetUsersByIdResponse>(`/users/${id}`);
      },
      // get a users roles
      roles: ({ id }: { id: string }) => {
        //https://auth0.com/docs/api/management/v2#!/Users/get_user_roles
        return authedFetch<{ id: string; name: string; description: string }[]>(
          `/users/${id}/roles`
        );
      },
      addRoles: ({ id, roles }: { id: string; roles: string[] }) => {
        //https://auth0.com/docs/api/management/v2#!/Users/post_user_roles
        return authedFetch<null>(`/users/${id}/roles`, {
          method: "POST",
          body: JSON.stringify({ roles }),
        });
      },
      //https://auth0.com/docs/api/management/v2#!/Users/delete_user_roles
      deleteRoles: ({ id, roles }: { id: string; roles: string[] }) => {
        return authedFetch<null>(`/users/${id}/roles`, {
          method: "DELETE",
          body: JSON.stringify({ roles }),
        });
      },
      update: ({
        id,
        updateBody,
      }: {
        id: string;
        updateBody: PatchUsersByIdBody;
      }) => {
        return authedFetch(`/users/${id}`, {
          method: "PATCH",
          body: JSON.stringify(updateBody),
        });
      },
    },
    organizations: {
      create: (body: PostOrganizationsBody) => authedFetch<PostOrganizationsBody & { id: string }>(`/organizations`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
      get: ({ id }: { id: string }) => {
        return authedFetch<GetOrganizationsResponse>(`/organizations/${id}`);
      },
      getMany: ({ from, take }: { from?: string; take?: number }) => {
        // TODO use the query params
        // https://auth0.com/docs/api/management/v2#!/Organizations/get_organizations
        return authedFetch<GetOrganizationsResponse[]>(`/organizations`);
      },
      addMembers: ({
        orgId,
        members,
      }: {
        orgId: string;
        members: string[];
      }) => {
        return authedFetch(`/organizations/${orgId}/members`, {
          method: "POST",
          body: JSON.stringify({
            members,
          }),
        });
      },
      update: ({
        orgId,
        body
      }: {
        orgId: string;
        body: PatchOrganizationsByIdBody
      }) => {
        const data = JSON.stringify(body)
        return authedFetch<GetOrganizationsResponse>(`/organizations/${orgId}`, {
          method: "PATCH",
          body: data
        })
      }
    },
  };
}

export type Auth0Client = ReturnType<typeof getAuth0Client>;
